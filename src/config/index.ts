import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || undefined,
  jwt_secret: process.env.JWT_SECRET || undefined,
  mongo_uri: process.env.MONGO_URI || undefined,
  pepper_hashing: process.env.PEPPER_HASHING || undefined,
  collections: {
    users: process.env.COLLECTION_USERS || undefined
  }
};

export default config;