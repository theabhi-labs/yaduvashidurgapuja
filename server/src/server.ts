import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import { initSocket } from './socket';
import { logger } from './utils/logger';
import { ensureAllUsersHaveUsernames } from './utils/usernameHelper';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Ensure all existing users have usernames
  try {
    const backfilledCount = await ensureAllUsersHaveUsernames();
    if (backfilledCount > 0) {
      logger.info(`[Migration] Auto-assigned usernames for ${backfilledCount} existing users.`);
    }
  } catch (err: any) {
    logger.warn(`[Migration] Username auto-migration warning: ${err.message}`);
  }

  // Create HTTP server and attach Socket.io
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  const server = httpServer.listen(ENV.PORT, () => {
    logger.info(`========================================================`);
    logger.info(` Durga Puja Kapoori Pur Memory Archive Backend Started`);
    logger.info(` Server Port    : ${ENV.PORT}`);
    logger.info(` Environment    : ${ENV.NODE_ENV}`);
    logger.info(` Client URL     : ${ENV.CLIENT_URL}`);
    logger.info(` Health Check   : http://localhost:${ENV.PORT}/api/health`);
    logger.info(`========================================================`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('Server process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();

