import React, { useState, useEffect } from 'react';
import './App.css';
import { WindowProvider } from './context/WindowContext';
import Desktop from './components/Desktop/Desktop';
import AddRecordWindow from './components/windows/AddRecordWindow';
import CurrentReadingWindow from './components/windows/CurrentReadingWindow';
import RecordListWindow from './components/windows/RecordListWindow';
// Import the star SVG
import { ReactComponent as StarIcon } from './assets/icons/star.svg';

function App() {
  const [records, setRecords] = useState([]);
  const [toReadList, setToReadList] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', format: '', notes: '' });
  // Add state for review form
  const [reviewForm, setReviewForm] = useState({ recordId: null, stars: 0, description: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // Open review form for a specific record
  const openReviewForm = (recordId) => {
    setReviewForm({ recordId, stars: 0, description: '' });
    setShowReviewForm(true);
  };

  // Handle star rating change
  const handleStarRatingChange = (value) => {
    setReviewForm({ ...reviewForm, stars: value });
  };

  // Render star rating display
  const renderStarRating = (rating) => {
    // Create an array of 5 elements and map through them
    return Array(5).fill(0).map((_, i) => {
      // For each position, check if we should render a filled star, half star, or empty star
      if (i < Math.floor(rating)) {
        return <StarIcon key={i} className="star filled" />;
      } else if (i === Math.floor(rating) && rating % 1) {
        return <StarIcon key={i} className="star half" />;
      } else {
        return <StarIcon key={i} className="star empty" />;
      }
    });
  };

  // Get filtered records based on search term and status filter
  const getFilteredRecords = () => {
    // If no search term and no status filter, return all records
    if (!searchTerm && !statusFilter) {
      return records;
    }

    return records.filter(record => {
      // Check if record matches status filter (if any)
      const matchesStatus = !statusFilter || record.status === statusFilter;
      
      // Check if record matches search term (if any)
      const matchesSearch = !searchTerm || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.format && record.format.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Return true only if both conditions are met
      return matchesStatus && matchesSearch;
    });
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const filteredRecords = getFilteredRecords();

  return (
    <WindowProvider>
      <div className="App">
        <Desktop>
          {/* Add Record Window */}
          <AddRecordWindow 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
          />
          
          {/* Current Reading Window */}
          <CurrentReadingWindow 
            records={records} 
            handleStatusChange={handleStatusChange} 
            openReviewForm={openReviewForm}
          />
          
          {/* Record List Window */}
          <RecordListWindow 
            records={filteredRecords}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            clearFilters={clearFilters}
            handleDelete={handleDelete}
            handleStatusChange={handleStatusChange}
            openReviewForm={openReviewForm}
            renderStarRating={renderStarRating}
          />
        </Desktop>
        
        {/* Review form modal */}
        {showReviewForm && (
          <div className="review-form-modal">
            <div className="review-form-content">
              <h2>Add Review</h2>
              <form onSubmit={handleReviewSubmit}>
                <div className="star-rating">
                  <p>Rate "{records.find(record => record._id === reviewForm.recordId)?.title || 'this book'}":</p>
                  <div className="stars">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={reviewForm.stars >= star ? 'active' : ''}
                        onClick={() => handleStarRatingChange(star)}
                      >
                        <StarIcon className="star-icon" />
                      </button>
                    ))}
                  </div>
                  <p>{reviewForm.stars} stars</p>
                </div>
                <textarea
                  placeholder="Write your review..."
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                ></textarea>
                <div className="form-buttons">
                  <button type="submit" className="win95-button">Add Review</button>
                  <button 
                    type="button" 
                    className="win95-button delete"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WindowProvider>
  );
}

export default App;
