import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// =============================
// ✉️ EMAIL ROUTE
// =============================
app.post('/send-email', async (req, res) => {
  const { fname, lname, email, phone, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Contact Form Submission: ${subject}`,
    text: `Name: ${fname} ${lname}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// =============================
// 📸 GOOGLE DRIVE MEDIA ROUTES
// =============================

const API_KEY = process.env.GOOGLE_API_KEY;

// === Folder mapping from .env ===
let FOLDER_MAP = {};
try {
  if (process.env.FOLDER_MAP) {
    FOLDER_MAP = JSON.parse(process.env.FOLDER_MAP);
  }
} catch (err) {
  console.error('Error parsing FOLDER_MAP from .env:', err);
  FOLDER_MAP = {};
}

// === Caching Setup ===
const CACHE_FILE = './mediaCache.json';
let folderCache = {};

// Load cache from file (persistent between restarts)
if (fs.existsSync(CACHE_FILE)) {
  try {
    folderCache = JSON.parse(fs.readFileSync(CACHE_FILE));
    console.log('✅ Cache loaded from file');
  } catch (err) {
    console.error('⚠️ Error loading cache file:', err);
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(folderCache, null, 2));
}

async function fetchMediaFromDrive(folderId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,modifiedTime,size)`
  );
  const data = await response.json();
  return data.files || [];
}

// ✅ Route to fetch media from specific category
app.get('/api/media/:category', async (req, res) => {
  const category = req.params.category.toLowerCase();
  const folderId = FOLDER_MAP[category];

  if (!folderId) return res.status(404).json({ error: 'Category not found' });

  try {
    const newFiles = await fetchMediaFromDrive(folderId);
    const newHash = newFiles.map(f => ({ id: f.id, modifiedTime: f.modifiedTime }));

    const lastCache = folderCache[category];

    // 🔁 Compare new and old hash to detect changes
    const unchanged =
      lastCache &&
      JSON.stringify(lastCache.hash) === JSON.stringify(newHash);

    if (unchanged) {
      console.log(`♻️ Using cached data for category: ${category}`);
      return res.json(lastCache.data);
    }

    // If changed or no cache → rebuild data
    console.log(`🔄 Fetching new data for category: ${category}`);

    const images = newFiles
      .filter(f => f.mimeType?.startsWith('image/'))
      .map(f => ({
        id: f.id,
        name: f.name,
        type: 'image',
        url: `https://lh5.googleusercontent.com/d/${f.id}`,
      }));

    const videos = newFiles
      .filter(f => f.mimeType?.startsWith('video/'))
      .map(f => ({
        id: f.id,
        name: f.name,
        type: 'video',
        url: `https://drive.google.com/file/d/${f.id}/preview`,
      }));

    const result = { category, images, videos };

    folderCache[category] = {
      hash: newHash,
      data: result,
      updatedAt: new Date().toISOString(),
    };

    saveCache();

    res.json(result);
  } catch (error) {
    console.error(`❌ Error fetching media for ${category}:`, error);
    res.status(500).json({ error: 'Error fetching media' });
  }
});

// ✅ Route to fetch photos from all categories at once
app.get('/api/photos', async (req, res) => {
  try {
    const allPhotos = [];

    for (const [category, folderId] of Object.entries(FOLDER_MAP)) {
      const newFiles = await fetchMediaFromDrive(folderId);
      const newHash = newFiles.map(f => ({ id: f.id, modifiedTime: f.modifiedTime }));
      const lastCache = folderCache[category];

      const unchanged =
        lastCache &&
        JSON.stringify(lastCache.hash) === JSON.stringify(newHash);

      if (unchanged) {
        console.log(`♻️ Using cached data for category: ${category}`);
        allPhotos.push(
          ...lastCache.data.images.map(img => ({ ...img, category }))
        );
        continue;
      }

      console.log(`🔄 Fetching new data for category: ${category}`);

      const images = newFiles
        .filter(f => f.mimeType?.startsWith('image/'))
        .map(f => ({
          id: f.id,
          name: f.name,
          url: `https://lh5.googleusercontent.com/d/${f.id}`,
          category,
        }));

      folderCache[category] = {
        hash: newHash,
        data: { category, images, videos: [] },
        updatedAt: new Date().toISOString(),
      };

      allPhotos.push(...images);
    }

    saveCache();

    res.json({ photos: allPhotos });
  } catch (error) {
    console.error('❌ Error fetching all photos:', error);
    res.status(500).json({ error: 'Error fetching all photos' });
  }
});

// =============================
// 🚀 START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
