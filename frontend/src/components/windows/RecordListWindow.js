import React from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';

const RecordListWindow = ({ 
  records, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  clearFilters,
  handleDelete,
  handleStatusChange,
  openReviewForm,
  renderStarRating
}) => {
  return (
    <Window id={WINDOW_TYPES.RECORD_LIST}>
      <div className="record-list-window">
        <h2>Book Collection</h2>
        
        {/* Search and filter controls */}
        <div className="search-filter-controls" style={{ backgroundColor: 'var(--green-4)' }}>
          <input
            type="text"
            placeholder="Search by title, author, notes, or format"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="to-read">To-Read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
            <option value="did-not-finish">Did Not Finish</option>
          </select>
          <button 
            className="win95-button" 
            onClick={clearFilters}
            style={{ 
              backgroundColor: 'var(--green-1)',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--green-3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--green-1)'}
          >
            Clear Filters
          </button>
        </div>
        
        {/* Book list */}
        <div className="book-records">
          {records.length === 0 ? (
            <div className="empty-state">
              <p>No books found.</p>
              {searchTerm || statusFilter ? (
                <p>Try changing your search or filter criteria.</p>
              ) : (
                <p>Add your first book to get started!</p>
              )}
            </div>
          ) : (
            <ul className="book-record-list">
              {records.map((record) => (
                <li key={record._id} className="book-record-item">
                  <div className="book-record-header">
                    <h3 className="book-title">{record.title}</h3>
                    <div className="book-record-controls">
                      <button 
                        className="win95-button small delete" 
                        onClick={() => handleDelete(record._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="book-author">by {record.author}</p>
                  <p className="book-format">Format: {record.format}</p>
                  {record.notes && <p className="book-notes">Notes: {record.notes}</p>}
                  
                  {/* Review display */}
                  {record.review && (
                    <div className="review-display">
                      <div className="star-rating-display">
                        Rating: <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}>
                          {renderStarRating(record.review.stars)}
                        </span>
                      </div>
                      {record.review.description && (
                        <div className="review-text">{record.review.description}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="book-status">
                    <div>

                      <select
                        className="status-dropdown"
                        value={record.status}
                        onChange={(e) => handleStatusChange(record._id, e.target.value)}
                      >
                        <option value="to-read">To Read</option>
                        <option value="reading">Currently Reading</option>
                        <option value="read">Read</option>
                      </select>
                    </div>
                    
                    {/* Add review button */}
                    {record.status === 'read' && !record.review && (
                      <button 
                        className="win95-button small" 
                        onClick={() => openReviewForm(record._id)}
                      >
                        Add Review
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Window>
  );
};

export default RecordListWindow;