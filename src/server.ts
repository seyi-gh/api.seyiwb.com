import app from './app';
import config from './config';
import mongoose from 'mongoose';
import { connnectDB } from './config/database';
import { connectRateLimiterStore, disconnectRateLimiterStore } from './middlewares/rateLimiter';

async function main() {
  await connnectDB();
  await connectRateLimiterStore();
  
  const server = app.listen(config.port, () => {
    console.log(`Server is running in http://localhost:${config.port}`);
  });

  //! Improve the saving data and the shutdown process
  const gracefulShutdown = async (signal: NodeJS.Signals) => {
    console.log(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await mongoose.connection.close();
      await disconnectRateLimiterStore();
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

main().catch((error) => {
  console.error('Failed to start server -> ', error);
  process.exit(1);
});