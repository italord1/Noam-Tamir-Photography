import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GOOGLE_API_KEY;
const FOLDER_ID = process.env.FOLDER_ID;

// Enable CORS for all origins
app.use(cors());

// API route to fetch photos from Google Drive
app.get('/api/photos', async (req, res) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,size)`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
