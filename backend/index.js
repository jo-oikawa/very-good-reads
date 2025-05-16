const express = require('express');
const connectToDatabase = require('./db'); // Import the database connection function
const readingRecordsRouter = require('./routes/readingRecords'); //Import the reading records router for CRUD operations

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001 to match frontend expectations

// Middleware to parse JSON
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Use reading records router
app.use('/api/reading-records', readingRecordsRouter);

// Connect to database and start server
connectToDatabase()
  .then(() => {
    console.log('Database connection successful');
    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    console.log('Server will start but may not function correctly without database connection.');
    
    // Still start server even if DB fails, so we can see error messages
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('WARNING: Database connection failed, API functionality will be limited');
    });
  });