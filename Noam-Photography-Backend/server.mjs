import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import fs from 'fs';

// =============================
// 🔐 ENV SETUP
// =============================

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

const GOOGLE_API_KEY = requireEnv('GOOGLE_API_KEY');
const EMAIL_USER = requireEnv('EMAIL_USER');
const EMAIL_PASS = requireEnv('EMAIL_PASS');

// Optional env vars
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 5 * 60 * 1000); // default: 5 minutes
const CACHE_FILE = process.env.CACHE_FILE || './mediaCache.json';

// =============================
// 🌍 CORS
// =============================

const DEFAULT_ORIGINS = [
  'https://noamphoto.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.json({ limit: '16kb' }));

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server tools / same-origin / curl requests with no Origin header.
      // CORS is not a security boundary, so API rate limiting is still required below.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

// =============================
// 🚦 RATE LIMITS
// =============================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many email requests, please try again later' },
});

const mediaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many media requests, please try again later' },
});

app.use(generalLimiter);
app.use('/api/media', mediaLimiter);
app.use('/api/photos', mediaLimiter);

// =============================
// ✉️ EMAIL CONFIG
// =============================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeField(value, maxLen) {
  if (typeof value !== 'string') return null;

  const cleaned = value.replace(/[\r\n\0]/g, '').trim();
  if (!cleaned || cleaned.length > maxLen) return null;

  return cleaned;
}

function validateContactBody(body) {
  const fname = sanitizeField(body.fname, 100);
  const lname = sanitizeField(body.lname, 100);
  const email = sanitizeField(body.email, 254);
  const phone = sanitizeField(body.phone, 30);
  const subject = sanitizeField(body.subject, 200);
  const message = sanitizeField(body.message, 5000);

  if (!fname || !lname || !email || !phone || !subject || !message) {
    return { error: 'Invalid or missing fields' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Invalid email address' };
  }

  return { fname, lname, email, phone, subject, message };
}

app.post('/send-email', emailLimiter, async (req, res) => {
  const validated = validateContactBody(req.body);

  if (validated.error) {
    return res.status(400).json({ error: validated.error });
  }

  const { fname, lname, email, phone, subject, message } = validated;

  const mailOptions = {
    from: EMAIL_USER,
    replyTo: email,
    to: EMAIL_USER,
    subject: `Contact Form Submission: ${subject}`,
    text: `Name: ${fname} ${lname}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ ok: true, message: 'Email sent successfully' });
  } catch (error) {
    // Do not expose internal error details to the client.
    console.error('Error sending email:', error.message);
    return res.status(500).json({ error: 'Error sending email' });
  }
});

// =============================
// 📸 GOOGLE DRIVE MEDIA CONFIG
// =============================

let FOLDER_MAP = {};

try {
  if (process.env.FOLDER_MAP) {
    FOLDER_MAP = JSON.parse(process.env.FOLDER_MAP);
  }
} catch (err) {
  console.error('Error parsing FOLDER_MAP from environment:', err.message);
  FOLDER_MAP = {};
}

if (!FOLDER_MAP || typeof FOLDER_MAP !== 'object' || Array.isArray(FOLDER_MAP)) {
  throw new Error('FOLDER_MAP must be a JSON object');
}

function isValidCategory(category) {
  return /^[a-z0-9_-]{1,50}$/.test(category);
}

function isValidDriveFolderId(folderId) {
  return typeof folderId === 'string' && /^[a-zA-Z0-9_-]{10,200}$/.test(folderId);
}

for (const [category, folderId] of Object.entries(FOLDER_MAP)) {
  if (!isValidCategory(category) || !isValidDriveFolderId(folderId)) {
    throw new Error(`Invalid FOLDER_MAP entry for category: ${category}`);
  }
}

let folderCache = {};
const refreshLocks = new Map();

if (fs.existsSync(CACHE_FILE)) {
  try {
    folderCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log('Cache loaded from file');
  } catch (err) {
    console.error('Error loading cache file:', err.message);
    folderCache = {};
  }
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(folderCache, null, 2));
  } catch (err) {
    console.error('Error saving cache file:', err.message);
  }
}

function isCacheFresh(category) {
  const cached = folderCache[category];
  if (!cached?.data || !cached?.updatedAt) return false;

  const ageMs = Date.now() - new Date(cached.updatedAt).getTime();
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs < CACHE_TTL_MS;
}

async function fetchMediaFromDrive(folderId) {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,size)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}`;

  const response = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const status = response.status;
    const reason = data?.error?.message || 'Unknown Google Drive API error';
    throw new Error(`Google Drive API failed with status ${status}: ${reason}`);
  }

  return Array.isArray(data.files) ? data.files : [];
}

function buildMediaResult(category, files) {
  const images = files
    .filter((file) => file.mimeType?.startsWith('image/'))
    .map((file) => ({
      id: file.id,
      name: file.name,
      type: 'image',
      url: `https://lh5.googleusercontent.com/d/${file.id}`,
    }));

  const videos = files
    .filter((file) => file.mimeType?.startsWith('video/'))
    .map((file) => ({
      id: file.id,
      name: file.name,
      type: 'video',
      url: `https://drive.google.com/file/d/${file.id}/preview`,
    }));

  return { category, images, videos };
}

async function refreshCategory(category) {
  if (refreshLocks.has(category)) {
    return refreshLocks.get(category);
  }

  const task = (async () => {
    const folderId = FOLDER_MAP[category];
    if (!folderId) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const files = await fetchMediaFromDrive(folderId);
    const hash = files.map((file) => ({
      id: file.id,
      modifiedTime: file.modifiedTime,
    }));

    const lastCache = folderCache[category];
    const unchanged = lastCache && JSON.stringify(lastCache.hash) === JSON.stringify(hash);

    if (unchanged && lastCache.data) {
      folderCache[category] = {
        ...lastCache,
        updatedAt: new Date().toISOString(),
      };
      saveCache();
      return folderCache[category].data;
    }

    const data = buildMediaResult(category, files);

    folderCache[category] = {
      hash,
      data,
      updatedAt: new Date().toISOString(),
    };

    saveCache();
    return data;
  })();

  refreshLocks.set(category, task);

  try {
    return await task;
  } finally {
    refreshLocks.delete(category);
  }
}

async function getCategoryMedia(category) {
  if (isCacheFresh(category)) {
    return folderCache[category].data;
  }

  return refreshCategory(category);
}

// =============================
// 📸 GOOGLE DRIVE MEDIA ROUTES
// =============================

app.get('/api/media/:category', async (req, res) => {
  const category = String(req.params.category || '').toLowerCase();

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  if (!FOLDER_MAP[category]) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const result = await getCategoryMedia(category);
    return res.json(result);
  } catch (error) {
    console.error(`Error fetching media for category "${category}":`, error.message);
    return res.status(error.statusCode || 500).json({ error: 'Error fetching media' });
  }
});

app.get('/api/photos', async (req, res) => {
  try {
    const allPhotos = [];

    for (const category of Object.keys(FOLDER_MAP)) {
      const categoryData = await getCategoryMedia(category);

      allPhotos.push(
        ...categoryData.images.map((image) => ({
          ...image,
          category,
        }))
      );
    }

    return res.json({ photos: allPhotos });
  } catch (error) {
    console.error('Error fetching all photos:', error.message);
    return res.status(500).json({ error: 'Error fetching all photos' });
  }
});

// =============================
// 🩺 HEALTH CHECK
// =============================

app.get('/health', (req, res) => {
  return res.json({
    ok: true,
    categories: Object.keys(FOLDER_MAP),
    cacheTtlMs: CACHE_TTL_MS,
  });
});

// =============================
// 🚀 START SERVER
// =============================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
