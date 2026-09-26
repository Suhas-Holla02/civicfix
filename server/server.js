import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { initDatabase, isUsingFallback } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permissive for local hackathon demo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for hackathon transparency
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/api/health')) {
      console.log(`[CivicFix API] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CivicFix AI-Powered Civic Complaint Management System',
    version: '1.0.0',
    sdgAlignment: ['SDG 11: Sustainable Cities', 'SDG 16: Strong Institutions'],
    databaseMode: isUsingFallback() ? 'Resilient Local Embedded Store (MySQL Offline)' : 'MySQL Production Mode',
    geminiConfigured: !!(config.geminiApiKey && config.geminiApiKey !== 'your_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize DB and launch server
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(config.port, () => {
      console.log('================================================================');
      console.log(` CivicFix Backend running at http://localhost:${config.port}`);
      console.log(` Database: ${isUsingFallback() ? 'Resilient Embedded Store (Zero-config)' : 'MySQL Connected'}`);
      console.log(` AI Provider: ${config.geminiApiKey ? 'Google Gemini API' : 'Rule-based Local Fallback NLP (Active)'}`);
      console.log('================================================================');
    });
  } catch (err) {
    console.error('[CivicFix Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
