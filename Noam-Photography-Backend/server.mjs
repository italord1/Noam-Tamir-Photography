import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

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
  const { fname, lname, email, subject, message } = req.body;

  
  // Configure Nodemailer
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
    text: `Name: ${fname} ${lname}\nEmail: ${email}\nMessage:\n${message}`,
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
// 📸 GOOGLE DRIVE PHOTOS ROUTES
// =============================

const API_KEY = process.env.GOOGLE_API_KEY;

// === Folder mapping for each photo category ===

let FOLDER_MAP = {};
try {
  if (process.env.FOLDER_MAP) {
    FOLDER_MAP = JSON.parse(process.env.FOLDER_MAP);
  }
} catch (err) {
  console.error('Error parsing FOLDER_MAP from .env:', err);
  FOLDER_MAP = {};
}

// ✅ Route to fetch photos from a specific category (folder)
app.get('/api/photos/:category', async (req, res) => {
  const category = req.params.category.toLowerCase();
  const folderId = FOLDER_MAP[category];

  if (!folderId) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,size)`
    );
    const data = await response.json();

    if (!data.files) {
      return res.status(404).json({ error: 'No files found in this folder' });
    }

    // Only include image files
    const images = data.files
      .filter((file) => file.mimeType && file.mimeType.startsWith('image/'))
      .map((file) => ({
        id: file.id,
        name: file.name,
        url: `https://lh5.googleusercontent.com/d/${file.id}`,
      }));

    res.json({ category, images });
  } catch (error) {
    console.error(`Error fetching photos for ${category}:`, error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

// ✅ Route to fetch photos from all categories at once
app.get('/api/photos', async (req, res) => {
  const allPhotos = [];

  try {
    for (const [category, folderId] of Object.entries(FOLDER_MAP)) {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,size)`
      );
      const data = await response.json();

      if (data.files) {
        const images = data.files
          .filter((file) => file.mimeType && file.mimeType.startsWith('image/'))
          .map((file) => ({
            category,
            id: file.id,
            name: file.name,
            url: `https://lh5.googleusercontent.com/d/${file.id}`,
          }));

        allPhotos.push(...images);
      }
    }

    res.json({ photos: allPhotos });
  } catch (error) {
    console.error('Error fetching all photos:', error);
    res.status(500).json({ error: 'Error fetching all photos' });
  }
});

// =============================
// 🚀 START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
