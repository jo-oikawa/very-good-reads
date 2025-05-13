import React from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';

const CurrentReadingWindow = ({ records }) => {
  // Filter to show only books with "reading" status
  const currentlyReading = records.filter(record => record.status === 'reading');
  
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
                <h3>{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <div className="book-details">
                  <p><strong>Format:</strong> {book.format}</p>
                  {book.notes && <p className="book-notes">{book.notes}</p>}
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