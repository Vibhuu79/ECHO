import mongoose from 'mongoose';
import { env } from './env.config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});
