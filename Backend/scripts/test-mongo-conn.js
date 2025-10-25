import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set in environment. Please set it in .env before running this script.');
  process.exit(2);
}

(async () => {
  try {
    await mongoose.connect(uri, { connectTimeoutMS: 10000 });
    console.log('MongoDB connection successful');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:');
    console.error(err.message || err);
    process.exit(1);
  }
})();
