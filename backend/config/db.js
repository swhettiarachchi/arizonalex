const mongoose = require('mongoose');
const seedDB = require('../scripts/seed');

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      console.log('⚠️ No MONGODB_URI found. Starting In-Memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          launchTimeoutMS: 60000, // 60 seconds
        },
        binary: {
          version: '7.0.5', // Try a slightly older stable version which might be smaller/faster
        }
      });
      dbUri = mongoServer.getUri();

      const conn = await mongoose.connect(dbUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);

      // Seed the database
      console.log('🌱 Seeding in-memory database...');
      await seedDB(dbUri, false);
      return;
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
