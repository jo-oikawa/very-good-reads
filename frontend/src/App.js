import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', format: '', notes: '' });

  // Fetch all reading records
  useEffect(() => {
    fetch('/api/reading-records')
      .then((response) => response.json())
      .then((data) => setRecords(data))
      .catch((error) => console.error('Error fetching records:', error));
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/reading-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create record');
        }
        return response.json();
      })
      .then((newRecord) => {
        if (newRecord && newRecord._id) { // Ensure the record has an ID
          setRecords((prev) => [...prev, newRecord]); // Add the complete record to the list
        } else {
          console.error('Incomplete record received:', newRecord);
        }
        setFormData({ title: '', author: '', format: '', notes: '' }); // Reset the form
      })
      .catch((error) => console.error('Error creating record:', error));
  };

  // Handle record deletion
  const handleDelete = (id) => {
    fetch(`/api/reading-records/${id}`, { method: 'DELETE' })
      .then(() => setRecords((prev) => prev.filter((record) => record._id !== id)))
      .catch((error) => console.error('Error deleting record:', error));
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
          <button type="submit">Add Record</button>
        </form>

        {/* Display reading records */}
        <ul>
          {records.map((record) => (
            <li key={record._id}>
              <strong>{record.title}</strong> by {record.author} ({record.format})
              <p>{record.notes}</p>
              <button onClick={() => handleDelete(record._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
