import config from '.';
import mongoose from 'mongoose';

export const connnectDB = async () => {
  try {
    await mongoose.connect(config.mongo_uri as string);
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Error connecting the database -> ', err);
    process.exit(1);
  }
};