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
        <div className="search-filter-controls">
          <input
            type="text"
            placeholder="Search by title, author, notes, or format"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <button className="win95-button" onClick={clearFilters}>Clear Filters</button>
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
                    <h3>{record.title}</h3>
                    <div className="book-record-controls">
                      <button 
                        className="win95-button small" 
                        onClick={() => handleDelete(record._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="book-author">by {record.author}</p>
                  <p className="book-format">Format: {record.format}</p>
                  {record.notes && <p className="book-notes">Notes: {record.notes}</p>}
                  
                  <div className="book-status">
                    <span>Status: {record.status}</span>
                    
                    {/* Show status dropdown only if record doesn't have a review */}
                    {!record.review && (
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(record._id, e.target.value)}
                        className="status-dropdown"
                      >
                        <option value="to-read">To-Read</option>
                        <option value="reading">Reading</option>
                        <option value="read">Read</option>
                        <option value="did-not-finish">Did Not Finish</option>
                      </select>
                    )}
                  </div>
                  
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
                  
                  {/* Add Review button for read records without reviews */}
                  {record.status === 'read' && !record.review && (
                    <button 
                      className="win95-button" 
                      onClick={() => openReviewForm(record._id)}
                    >
                      Add Review
                    </button>
                  )}
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