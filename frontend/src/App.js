import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);
  const [toReadList, setToReadList] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', format: '', notes: '' });

  // Fetch all reading records
  useEffect(() => {
    fetch('/api/reading-records')
      .then((response) => response.json())
      .then((data) => setRecords(data))
      .catch((error) => console.error('Error fetching records:', error));
  }, []);

  // Fetch to-read list
  useEffect(() => {
    fetch('/api/reading-records/to-read')
      .then((response) => response.json())
      .then((data) => setToReadList(data))
      .catch((error) => console.error('Error fetching to-read list:', error));
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/reading-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, status: formData.status || 'to-read' }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create record');
        }
        return response.json();
      })
      .then((newRecord) => {
        setRecords((prev) => [...prev, newRecord]);
        setFormData({ title: '', author: '', format: '', notes: '', status: '' });
      })
      .catch((error) => console.error('Error creating record:', error));
  };

  // Handle adding to to-read list
  const handleAddToRead = (e) => {
    e.preventDefault();
    fetch('/api/reading-records/to-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add to to-read list');
        }
        return response.json();
      })
      .then((newRecord) => {
        setToReadList((prev) => [...prev, newRecord]);
        setFormData({ title: '', author: '', format: '', notes: '' });
      })
      .catch((error) => console.error('Error adding to to-read list:', error));
  };

  // Handle record deletion
  const handleDelete = (id) => {
    fetch(`/api/reading-records/${id}`, { method: 'DELETE' })
      .then(() => setRecords((prev) => prev.filter((record) => record._id !== id)))
      .catch((error) => console.error('Error deleting record:', error));
  };

  // Handle marking a record as "to-read"
  const handleMarkToRead = (id) => {
    fetch(`/api/reading-records/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'to-read' }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update status');
        }
        return response.json();
      })
      .then((updatedRecord) => {
        setRecords((prev) =>
          prev.map((record) =>
            record._id === updatedRecord._id ? updatedRecord : record
          )
        );
      })
      .catch((error) => console.error('Error updating status:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Reading Tracker</h1>

        {/* Form for logging reading journeys */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Format"
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
            required
          />
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          ></textarea>
          <select
            value={formData.status || 'to-read'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="to-read">To-Read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
            <option value="did-not-finish">Did Not Finish</option>
          </select>
          <button type="submit">Add Record</button>
        </form>

        {/* Display reading records */}
        <ul>
          {records.map((record) => (
            <li key={record._id}>
              <strong>{record.title}</strong> by {record.author} ({record.format})
              <p>{record.notes}</p>
              <p>Status: {record.status}</p>
              {record.status !== 'to-read' && (
                <button onClick={() => handleMarkToRead(record._id)}>Mark as To-Read</button>
              )}
              <button onClick={() => handleDelete(record._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
