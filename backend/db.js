require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.COSMOS_DB_CONNECTION_STRING;

if (!uri) {
  console.error("Error: COSMOS_DB_CONNECTION_STRING is not defined in the environment variables.");
  process.exit(1); // Exit the process if the connection string is missing
}

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to Azure Cosmos DB!");
    return client.db("very-good-reads-db"); // Replace with your database name
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;