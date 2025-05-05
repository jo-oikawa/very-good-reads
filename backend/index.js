const express = require('express');
const connectToDatabase = require('./db'); // Import the database connection function

const app = express();
const PORT = process.env.PORT || 3000;

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});