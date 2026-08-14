import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { connectRedis } from './config/redis.config';
import { setupSocketIO } from './socket';
import { LifecycleWorker } from './modules/chat/lifecycle.worker';
import { SparkWorker } from './modules/spark/spark.worker';

const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing Echo Backend Services...');

    // Connect to Database & Cache
    await connectDB();
    await connectRedis();

    // Create HTTP Server & Attach Socket.IO
    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CLIENT_URL,
        credentials: true
      }
    });

    // Initialize Socket.IO Handlers
    setupSocketIO(io);

    // Start Background Workers
    LifecycleWorker.start(io);
    SparkWorker.start(io);

    const server = httpServer.listen(env.PORT, () => {
      console.log(`📡 Echo Server & Socket.IO listening on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`🔗 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 ${signal} received. Gracefully shutting down...`);
      LifecycleWorker.stop();
      SparkWorker.stop();
      server.close(() => {
        console.log('HTTP server and Socket.IO closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Error during server startup:', error);
    process.exit(1);
  }
};

startServer();
