require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;

// Simple in-memory fallback that mimics a minimal MongoDB collection API
let memoryDBInstance;
function createMemoryDB() {
  console.warn("MONGODB_URI not set. Using in-memory database fallback for development.");
  if (memoryDBInstance) return memoryDBInstance;
  const collections = new Map();

  function getCollection(name) {
    if (!collections.has(name)) {
      collections.set(name, new Map());
    }
    const store = collections.get(name);

    function matchesQuery(doc, query) {
      // Very basic query matcher: supports equality on top-level fields
      return Object.keys(query || {}).every((key) => doc[key] === query[key]);
    }

    return {
      async insertOne(doc) {
        const _id = doc._id ? new ObjectId(doc._id) : new ObjectId();
        const record = { ...doc, _id };
        store.set(_id.toString(), record);
        return { insertedId: _id };
      },
      async findOne(filter) {
        if (filter && filter._id) {
          return store.get(filter._id.toString()) || null;
        }
        // fallback linear search
        for (const value of store.values()) {
          if (matchesQuery(value, filter)) return value;
        }
        return null;
      },
      find(query) {
        return {
          async toArray() {
            const all = Array.from(store.values());
            if (!query || Object.keys(query).length === 0) return all;
            return all.filter((doc) => matchesQuery(doc, query));
          },
        };
      },
      async updateOne(filter, update) {
        if (!filter || !filter._id) return { matchedCount: 0, modifiedCount: 0 };
        const key = filter._id.toString();
        const existing = store.get(key);
        if (!existing) return { matchedCount: 0, modifiedCount: 0 };
        const set = (update && update.$set) || {};
        const updated = { ...existing, ...set };
        store.set(key, updated);
        return { matchedCount: 1, modifiedCount: 1 };
      },
      async deleteOne(filter) {
        if (!filter || !filter._id) return { deletedCount: 0 };
        const key = filter._id.toString();
        const existed = store.delete(key);
        return { deletedCount: existed ? 1 : 0 };
      },
    };
  }

  memoryDBInstance = {
    collection: getCollection,
  };
  return memoryDBInstance;
}

let client;

async function connectToDatabase() {
  if (!uri) {
    // Use memory DB in development if no URI
    return createMemoryDB();
  }

  // Log the connection string (excluding sensitive credentials)
  console.log("Connecting to MongoDB with URI:", uri.replace(/:\/\/.*@/, "://<credentials-hidden>@"));

  client = new MongoClient(uri, { maxPoolSize: 10 });

  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB!");
    return client.db("very-good-reads-db");
  } catch (err) {
    console.error("Failed to connect to database:", err.message);
    // Only log detailed error info in development
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        reason: err.reason,
      });
    }
    // Fall back to memory DB so the app remains usable locally
    return createMemoryDB();
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client) {
    console.log("Closing database connection...");
    await client.close();
  }
  process.exit(0);
});

module.exports = connectToDatabase;