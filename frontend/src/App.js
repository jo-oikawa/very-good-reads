import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [records, setRecords] = useState([]);
  const [toReadList, setToReadList] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', format: '', notes: '' });
  // Add state for review form
  const [reviewForm, setReviewForm] = useState({ recordId: null, stars: 0, description: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

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

        // Check if the new record has "read" status to show review form immediately
        if (newRecord.status === 'read') {
          setReviewForm({ recordId: newRecord._id, stars: 0, description: '' });
          setShowReviewForm(true);
        }

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

  // Handle changing the status of a record to any value
  const handleStatusChange = (id, newStatus) => {
    fetch(`/api/reading-records/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
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

        // If status is changed to "read", show review form
        if (newStatus === 'read') {
          setReviewForm({ recordId: id, stars: 0, description: '' });
          setShowReviewForm(true);
        }
      })
      .catch((error) => console.error('Error updating status:', error));
  };

  // Handle submitting a review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const { recordId, stars, description } = reviewForm;

    fetch(`/api/reading-records/${recordId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars, description }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add review');
        }
        return response.json();
      })
      .then((updatedRecord) => {
        setRecords((prev) =>
          prev.map((record) =>
            record._id === updatedRecord._id ? updatedRecord : record
          )
        );
        setShowReviewForm(false);
        setReviewForm({ recordId: null, stars: 0, description: '' });
      })
      .catch((error) => console.error('Error adding review:', error));
  };

  // Handle star rating change
  const handleStarRatingChange = (value) => {
    setReviewForm({ ...reviewForm, stars: value });
  };

  // Render star rating display
  const renderStarRating = (rating) => {
    return `★`.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '') + `☆`.repeat(5 - Math.ceil(rating));
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

        {/* Review form modal */}
        {showReviewForm && (
          <div className="review-form-modal">
            <div className="review-form-content">
              <h2>Add Your Review</h2>
              <form onSubmit={handleReviewSubmit}>
                <div className="star-rating">
                  <p>Rate this book:</p>
                  <div className="stars">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={reviewForm.stars >= star ? 'active' : ''}
                        onClick={() => handleStarRatingChange(star)}
                      >
                        {star % 1 ? '½' : '★'}
                      </button>
                    ))}
                  </div>
                  <p>Your rating: {reviewForm.stars} stars</p>
                </div>
                <textarea
                  placeholder="Write your review..."
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                ></textarea>
                <div className="form-buttons">
                  <button type="submit">Submit Review</button>
                  <button 
                    type="button" 
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Display reading records */}
        <ul>
          {records.map((record) => (
            <li key={record._id}>
              <strong>{record.title}</strong> by {record.author} ({record.format})
              <p>{record.notes}</p>
              <p>Status: {record.status}</p>
              
              {/* Display star rating if review exists */}
              {record.review && (
                <div className="review-display">
                  <p className="star-rating-display">
                    Rating: {renderStarRating(record.review.stars)} ({record.review.stars})
                  </p>
                  {record.review.description && (
                    <p className="review-text">{record.review.description}</p>
                  )}
                </div>
              )}
              
              {/* Show status dropdown only if record doesn't have a review */}
              {!record.review && (
                <select
                  value={record.status}
                  onChange={(e) => handleStatusChange(record._id, e.target.value)}
                >
                  <option value="to-read">To-Read</option>
                  <option value="reading">Reading</option>
                  <option value="read">Read</option>
                  <option value="did-not-finish">Did Not Finish</option>
                </select>
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
