import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`🛡️  CyberShield Awareness Platform API is live!`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('🚪 HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10s if stuck
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start CyberShield server:', error.message);
    process.exit(1);
  }
};

startServer();
