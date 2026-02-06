const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectToDatabase = require('./db'); // Import the database connection function
const readingRecordsRouter = require('./routes/readingRecords'); //Import the reading records router for CRUD operations

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001 to match frontend expectations

// Security middleware - adds various HTTP headers
app.use(helmet());

// Rate limiting - protect against brute force and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware to parse JSON with size limit
app.use(express.json({ limit: '10kb' }));

// CORS middleware - restrict to specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL // Allow configurable frontend URL in production
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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