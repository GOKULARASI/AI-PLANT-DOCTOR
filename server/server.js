import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initGemini } from './src/config/gemini.js';
import { initEmail } from './src/config/email.js';

const PORT = process.env.PORT || 5000;

// ─── Initialize Services & Start Server ──────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize AI
    initGemini();

    // Initialize Email
    initEmail();

    // Start Express
    const server = app.listen(PORT, () => {
      console.log(`\n🌿 PlantSense AI Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use by another process.`);
        console.error(`👉 Stop the process using port ${PORT} or set a different PORT in .env\n`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
