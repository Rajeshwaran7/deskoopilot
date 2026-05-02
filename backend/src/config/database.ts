import mongoose from 'mongoose';
import { getConfig } from './env.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export async function connectDatabase() {
  const config = getConfig();
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(config.MONGO_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      retries++;
      if (retries >= MAX_RETRIES) {
        console.error('MongoDB connection failed after', MAX_RETRIES, 'retries', error);
        process.exit(1);
      }
      console.warn(`MongoDB connection attempt ${retries} failed. Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}
