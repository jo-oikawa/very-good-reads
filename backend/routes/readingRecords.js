// File for handling reading records CRUD operations

const express = require('express');
const { ObjectId } = require('mongodb'); // Ensure ObjectId is imported
const router = express.Router();
const connectToDatabase = require('../db');

// Create a new reading record
router.post('/', async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const record = req.body;

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

// Update a reading record
router.put('/:id', async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { id } = req.params; // Extract the record ID from the URL
    const updates = req.body; // Extract the updates from the request body

    console.log('ID:', id); // Log the ID
    console.log('Updates:', updates); // Log the updates

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) }, // Match the record by its ObjectId
            { $set: updates } // Apply the updates
        );

        console.log('Update Result:', result); // Log the result

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Record not found' });
        }

        res.status(200).send({ message: 'Record updated successfully' });
    } catch (err) {
        console.error('Error during update operation:', err); // Log the full error
        res.status(500).send({ error: 'Failed to update record' });
    }
});

// Delete a reading record
router.delete('/:id', async (req, res) => {
    const db = await connectToDatabase();
    const collection = db.collection('readingRecords');
    const { id } = req.params;

    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete record' });
    }
});

module.exports = router;