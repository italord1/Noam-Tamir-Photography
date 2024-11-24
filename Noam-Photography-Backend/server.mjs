import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GOOGLE_API_KEY;
const FOLDER_IDS = process.env.FOLDER_IDS.split(','); // Multiple folder IDs, comma-separated in .env

// Enable CORS for all origins
app.use(cors());

// API route to fetch photos from multiple Google Drive folders
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
    console.log(res)

    res.json({ files: allFiles });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

