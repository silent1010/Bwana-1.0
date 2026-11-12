import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Kubernetes & Docker Health Check probe
app.get(['/api/v1/health', '/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'bwana-app',
    region: process.env.AWS_REGION || 'af-south-1',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    instanceId: process.env.HOSTNAME || 'task-fargate-local',
  });
});

// Serve built static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Bwana production server listening on http://0.0.0.0:${port}`);
});
