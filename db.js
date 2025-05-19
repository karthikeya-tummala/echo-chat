import mongoose from 'mongoose';
import logger from "./logging.js";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/socket-chat';

export default async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
  
  mongoose.connection.on('disconnected', () => {
    logger.error('MongoDB disconnected! Attempting to reconnect...');
  });
  
  mongoose.connection.on('error', err => {
    logger.error('MongoDB connection error:', err);
  });
}
