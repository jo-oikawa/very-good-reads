require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI is not defined in the environment variables.");
  process.exit(1); // Exit the process if the connection string is missing
}

// Log the connection string (excluding sensitive credentials)
console.log("Connecting to MongoDB with URI:", uri.replace(/:\/\/.*@/, "://<credentials-hidden>@"));

const client = new MongoClient(uri, {
  maxPoolSize: 10, // Enable connection pooling
});

async function connectToDatabase() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB!");
    return client.db("very-good-reads-db"); // Replace with your database name
  } catch (err) {
    console.error("Failed to connect to database:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      reason: err.reason,
    });
    throw err; // Propagate the error instead of exiting the process
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log("Closing database connection...");
  await client.close();
  process.exit(0);
});

module.exports = connectToDatabase;