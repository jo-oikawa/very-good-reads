// File for handling reading records CRUD operations

const express = require('express');
const { ObjectId } = require('mongodb'); // Ensure ObjectId is imported
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const connectToDatabase = require('../db');

// Valid status values
const VALID_STATUSES = ['to-read', 'reading', 'read', 'did-not-finish'];

// Validation middleware for ObjectId parameters
const validateObjectId = (paramName) => {
  return param(paramName).custom((value) => {
    if (!ObjectId.isValid(value)) {
      throw new Error('Invalid record ID format');
    }
    return true;
  });
};

// Common validation rules for reading records
const recordValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
  body('author').optional().trim().isLength({ max: 200 }).withMessage('Author must be under 200 characters'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status value'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create a new reading record
router.post('/', [
    body('title').trim().notEmpty().isLength({ max: 500 }).withMessage('Title is required and must be under 500 characters'),
    body('author').optional().trim().isLength({ max: 200 }).withMessage('Author must be under 200 characters'),
    body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status value'),
], handleValidationErrors, async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const now = new Date().toISOString();
    
    // Only allow specific fields to prevent injection of arbitrary data
    const { title, author, status, rating, notes, isbn } = req.body;
    const record = { 
        title,
        author: author || '',
        status: status || 'to-read',
        rating: rating || null,
        notes: notes || '',
        isbn: isbn || '',
        createdAt: now,
        updatedAt: now
    };

    try {
        const result = await collection.insertOne(record);
        const newRecord = await collection.findOne({ _id: result.insertedId });
        res.status(201).send(newRecord);
    } catch (err) {
        res.status(500).send({ error: 'Failed to create record' });
    }
});

// Read all reading records
router.get('/', async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');

    try {
        const records = await collection.find({}).toArray();
        res.status(200).send(records);
    } catch (err) {
        res.status(500).send({ error: 'Failed to fetch records' });
    }
});

// Get records with a specific status (to-read, reading, read)
router.get('/:status', async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { status } = req.params;
    
    // Validate status parameter
    const validStatuses = ['to-read', 'reading', 'read', 'did-not-finish'];
    if (!validStatuses.includes(status)) {
        return res.status(400).send({ error: 'Invalid status parameter' });
    }

    try {
        const records = await collection.find({ status }).toArray();
        res.status(200).send(records);
    } catch (err) {
        res.status(500).send({ error: `Failed to fetch ${status} records` });
    }
});

// Update a reading record
router.put('/:id', [
    validateObjectId('id'),
    ...recordValidation
], handleValidationErrors, async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { id } = req.params;
    
    // Only allow specific fields to be updated
    const allowedUpdates = ['title', 'author', 'status', 'rating', 'notes', 'isbn'];
    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }
    updates.updatedAt = new Date().toISOString();

    if (process.env.NODE_ENV !== 'production') {
        console.log('ID:', id);
        console.log('Updates:', updates);
    }

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (process.env.NODE_ENV !== 'production') {
            console.log('Update Result:', result);
        }

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Record not found' });
        }

        res.status(200).send({ message: 'Record updated successfully' });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error during update operation:', err);
        }
        res.status(500).send({ error: 'Failed to update record' });
    }
});

// Update the status of a reading record (e.g., mark as "to-read")
router.put('/:id/status', [
    validateObjectId('id'),
    body('status').notEmpty().isIn(VALID_STATUSES).withMessage('Invalid status value')
], handleValidationErrors, async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Record not found' });
        }

        const updatedRecord = await collection.findOne({ _id: new ObjectId(id) });
        res.status(200).send(updatedRecord);
    } catch (err) {
        res.status(500).send({ error: 'Failed to update status' });
    }
});

// Delete a reading record
router.delete('/:id', [
    validateObjectId('id')
], handleValidationErrors, async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { id } = req.params;

    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Record not found' });
        }
        res.status(200).send({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete record' });
    }
});

// Add support for reviews

// Add a review to a reading record
router.post('/:id/review', [
    validateObjectId('id'),
    body('text').optional().trim().isLength({ max: 5000 }).withMessage('Review must be under 5000 characters'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], handleValidationErrors, async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { id } = req.params;
    
    // Only allow specific review fields
    const { text, rating } = req.body;
    const review = { text: text || '', rating: rating || null, createdAt: new Date().toISOString() };

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { review, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Record not found' });
        }

        const updatedRecord = await collection.findOne({ _id: new ObjectId(id) });
        res.status(200).send(updatedRecord);
    } catch (err) {
        res.status(500).send({ error: 'Failed to add review' });
    }
});

module.exports = router;