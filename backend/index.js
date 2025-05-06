const express = require('express');
const connectToDatabase = require('./db'); // Import the database connection function
const readingRecordsRouter = require('./routes/readingRecords'); //Import the reading records router for CRUD operations

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Test database connection
connectToDatabase().then(() => {
  console.log('Database connection successful');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Use reading records router
app.use('/api/reading-records', readingRecordsRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});