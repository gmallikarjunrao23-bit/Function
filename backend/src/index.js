require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB, disconnectDB } = require('./utils/db');

const workspaceRoutes = require('./routes/workspace');
const ticketRoutes = require('./routes/tickets');
const analysisRoutes = require('./routes/analysis');
const digestRoutes = require('./routes/digest');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/digests', digestRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('TicketAI backend running on port ' + PORT);
  });
}

start();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});
