import React, { useState, useEffect, useMemo } from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';
import { fetchBookInfo } from '../../utils/googleBooksAPI';
import bookIcon from '../../assets/icons/book.svg';
import './RecordListWindow.css';

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
  // State to store book covers
  const [bookCovers, setBookCovers] = useState({});
  const [useFallbacks, setUseFallbacks] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(0);
  const recordsPerPage = 5;
  
  // Reset page when records change significantly
  useEffect(() => {
    setPage(0);
  }, [records.length, statusFilter, searchTerm]);
  
  // Memoize page calculations to avoid recalculating on every render
  const maxPages = useMemo(() => Math.ceil(records.length / recordsPerPage), [records.length, recordsPerPage]);
  
  // Memoize the current page records to avoid recreating the array on every render
  const currentPageRecords = useMemo(() => {
    const startIndex = page * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return records.slice(startIndex, endIndex);
  }, [records, page, recordsPerPage]);
  
  // Simple effect to fetch book covers for visible books
  useEffect(() => {
    // Nothing to fetch if no records
    if (currentPageRecords.length === 0) return;
    
    // Create a list of book IDs that need covers fetched
    const idsToFetch = currentPageRecords
      .filter(record => !bookCovers[record._id] && !useFallbacks[record._id])
      .map(record => ({
        id: record._id,
        title: record.title,
        author: record.author
      }));
    
    // If nothing to fetch, we're done
    if (idsToFetch.length === 0) return;
    
    // Create a ref to track if the component is still mounted
    let isMounted = true;
    
    // Update loading states for books being fetched
    const newLoadingStates = {};
    idsToFetch.forEach(({ id }) => {
      newLoadingStates[id] = true;
    });
    setLoadingStates(prev => ({...prev, ...newLoadingStates}));
    
    // Keep track of which requests are in progress
    const inProgress = {};
    
    // Function to fetch a single book cover
    const fetchCover = async (bookId, title, author) => {
      if (inProgress[bookId]) return;
      inProgress[bookId] = true;
      
      try {
        const bookInfo = await fetchBookInfo(title, author, 3000); // 3 second timeout
        
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        // Update loading state first
        setLoadingStates(prev => ({...prev, [bookId]: false}));
        
        if (bookInfo.useFallback) {
          // Use fallback icon
          setUseFallbacks(prev => ({...prev, [bookId]: true}));
        } else if (bookInfo.coverImage) {
          // We have a real cover image
          setBookCovers(prevCovers => ({...prevCovers, [bookId]: bookInfo.coverImage}));
        } else {
          // No cover found, use fallback
          setUseFallbacks(prev => ({...prev, [bookId]: true}));
        }
      } catch (error) {
        console.error(`Error fetching cover for ${title}:`, error);
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        // Update loading state and set fallback on error
        setLoadingStates(prev => ({...prev, [bookId]: false}));
        setUseFallbacks(prev => ({...prev, [bookId]: true}));
      }
    };
    
    // Fetch covers with a slight delay between each
    let delay = 0;
    idsToFetch.forEach(({ id, title, author }) => {
      setTimeout(() => {
        fetchCover(id, title, author);
      }, delay);
      delay += 250; // 250ms delay between requests
    });
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [currentPageRecords, bookCovers, useFallbacks]);

  return (
    <Window id={WINDOW_TYPES.RECORD_LIST} className="window-record-list">
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
            <>
              <ul className="book-record-list">
                {currentPageRecords.map((record) => (
                  <li key={record._id} className="book-record-item">
                    <div className="book-record-content">
                      <div className="book-cover-container">
                        {loadingStates[record._id] ? (
                          <div className="loading-cover">Loading...</div>
                        ) : bookCovers[record._id] ? (
                          <img 
                            src={bookCovers[record._id]} 
                            alt={`Cover of ${record.title}`} 
                            className="book-cover"
                            loading="lazy"
                          />
                        ) : useFallbacks[record._id] ? (
                          <img 
                            src={bookIcon} 
                            alt="Book icon" 
                            className="book-cover fallback"
                          />
                        ) : (
                          <div className="loading-cover">Loading...</div>
                        )}
                      </div>
                      
                      <div className="book-record-info">
                        <div className="book-record-header">
                          <h4>{record.title}</h4>
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination controls */}
              {records.length > recordsPerPage && (
                <div className="pagination-controls">
                  <button 
                    className="win95-button small" 
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page + 1} of {maxPages}
                  </span>
                  <button 
                    className="win95-button small" 
                    onClick={() => setPage(prev => Math.min(maxPages - 1, prev + 1))}
                    disabled={page >= maxPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Window>
  );
};

export default RecordListWindow;