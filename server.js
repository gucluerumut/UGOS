import dotenv from 'dotenv';
// Load default .env first, then override with .env.local if present
dotenv.config();
dotenv.config({ path: '.env.local', override: true });
import express from 'express';
import presign from './api/presign.js';
import list from './api/list.js';

const app = express();
app.use(express.json());

// Mount serverless-style handlers on Express routes
app.get('/api/presign', presign);
app.post('/api/presign', presign);
app.get('/api/list', list);

const PORT = process.env.API_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
  const envCheck = {
    AWS_REGION: !!process.env.AWS_REGION,
    S3_BUCKET: !!process.env.S3_BUCKET,
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    S3_ENDPOINT: !!process.env.S3_ENDPOINT
  };
  console.log('S3 env configured?', envCheck);
});