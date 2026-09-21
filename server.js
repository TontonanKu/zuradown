import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/pinterest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files (HTML, CSS, JS) from the root directory
app.use(express.static(__dirname));

// Map the Vercel API endpoint
app.get('/api/pinterest', async (req, res) => {
    // Vercel serverless function expects (req, res) exactly like Express
    await handler(req, res);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`ZuraDown Local Server is running at http://localhost:${PORT}`);
});
