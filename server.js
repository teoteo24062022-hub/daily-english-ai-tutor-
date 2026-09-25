import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Runtime key cache (if provided via Web UI)
let runtimeApiKey = '';
const activeModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export function getActiveApiKey() {
  return runtimeApiKey || process.env.GEMINI_API_KEY || '';
}

// Config endpoints
app.get('/api/config', (req, res) => {
  const key = getActiveApiKey();
  res.json({
    hasEnvKey: Boolean(key),
    activeModel
  });
});

app.post('/api/config', (req, res) => {
  const { apiKey } = req.body || {};
  if (typeof apiKey === 'string') {
    runtimeApiKey = apiKey.trim();
    return res.json({ success: true, message: 'API key configured in runtime session' });
  }
  return res.status(400).json({ success: false, message: 'Invalid API key format' });
});

let serverInstance = null;

export function startServer(port = PORT) {
  return new Promise((resolve) => {
    serverInstance = app.listen(port, () => {
      resolve(serverInstance);
    });
  });
}

export function stopServer() {
  return new Promise((resolve, reject) => {
    if (serverInstance) {
      serverInstance.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Auto-start if executed directly
if (process.argv[1] === __filename) {
  startServer().then(() => {
    console.log(`Daily English AI Tutor running at http://localhost:${PORT}`);
  });
}

export default app;
