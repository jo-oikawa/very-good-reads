import React from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';
import './CurrentReadingWindow.css';

const CurrentReadingWindow = ({ records, handleStatusChange = () => {}, openReviewForm = () => {} }) => {
  // Filter to show only books with "reading" status
  const currentlyReading = records.filter(record => record.status === 'reading');
  
  // Function to mark a book as read and open the review form
  const handleMarkAsRead = (book) => {
    handleStatusChange(book._id, 'read');
    openReviewForm(book._id);
  };
  
  return (
    <Window id={WINDOW_TYPES.CURRENT_READING}>
      <div className="current-reading-window">
        <h2>Currently Reading</h2>
        
        {currentlyReading.length === 0 ? (
          <div className="empty-state">
            <p>You are not currently reading any books.</p>
            <p>Add a book with "Reading" status to see it here.</p>
          </div>
        ) : (
          <div className="reading-books">
            {currentlyReading.map(book => (
              <div key={book._id} className="reading-book-card">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <div className="book-details">
                  <p className="book-format">Format: {book.format}</p>
                  {book.notes && <p className="book-notes">{book.notes}</p>}
                </div>
                <div className="book-actions">
                  <button 
                    className="win95-button small"
                    onClick={() => handleMarkAsRead(book)}
                  >
                    Mark as Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Window>
  );
};

export default CurrentReadingWindow;