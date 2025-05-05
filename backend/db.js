const { MongoClient } = require('mongodb');

const uri = process.env.COSMOS_DB_CONNECTION_STRING; // Store in .env file
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to Azure Cosmos DB!");
    return client.db("your-database-name"); // Replace with your database name
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;