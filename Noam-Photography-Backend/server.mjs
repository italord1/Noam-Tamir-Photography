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

// Email route
app.post('/send-email', async (req, res) => {

  const { fname, lname, email, subject, message } = req.body;
  
  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Replace with your email
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

// API route to fetch photos from multiple Google Drive folders
const API_KEY = process.env.GOOGLE_API_KEY;
const FOLDER_IDS = process.env.FOLDER_IDS.split(',');

app.get('/api/photos', async (req, res) => {
  try {
    const allFiles = [];

    for (const folderId of FOLDER_IDS) {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,size)`
      );
      const data = await response.json();

      if (data.files) {
        allFiles.push(...data.files);
      }
    }

    res.json({ files: allFiles });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
