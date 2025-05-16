import React, { useState, useEffect, useMemo } from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';
import { fetchBookInfo } from '../../utils/googleBooksAPI';
import bookIcon from '../../assets/icons/book.svg';
import './CurrentReadingWindow.css';

const CurrentReadingWindow = ({ records, handleStatusChange = () => {}, openReviewForm = () => {} }) => {
  // Filter to show only books with "reading" status - memoized to prevent recreation on each render
  const currentlyReading = useMemo(() => {
    return records.filter(record => record.status === 'reading');
  }, [records]);
  
  // State to store book covers and fallback status
  const [bookCovers, setBookCovers] = useState({});
  const [useFallbacks, setUseFallbacks] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  
  // Function to mark a book as read and open the review form
  const handleMarkAsRead = (book) => {
    handleStatusChange(book._id, 'read');
    openReviewForm(book._id);
  };
  
  // Simplified effect to fetch book covers
  useEffect(() => {
    // Nothing to fetch if no books are being read
    if (currentlyReading.length === 0) return;
    
    // Create a list of book IDs that need covers fetched
    const idsToFetch = currentlyReading
      .filter(book => !bookCovers[book._id] && !useFallbacks[book._id])
      .map(book => ({
        id: book._id,
        title: book.title,
        author: book.author
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
        
        // Update the loading state first
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
    
  // Added missing dependencies to `useEffect`
  }, [currentlyReading, bookCovers, useFallbacks]);
  
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
                <div className="book-content">
                  <div className="book-cover-container">
                    {loadingStates[book._id] ? (
                      <div className="loading-cover">Loading...</div>
                    ) : bookCovers[book._id] ? (
                      <img 
                        src={bookCovers[book._id]} 
                        alt={`Cover of ${book.title}`} 
                        className="book-cover"
                        loading="lazy"
                      />
                    ) : useFallbacks[book._id] ? (
                      <img 
                        src={bookIcon} 
                        alt="Book icon" 
                        className="book-cover fallback"
                      />
                    ) : (
                      <div className="loading-cover">Loading...</div>
                    )}
                  </div>
                  <div className="book-info">
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