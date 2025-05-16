import React, { useState, useEffect, useCallback } from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES, useWindowContext } from '../../context/WindowContext';
import { getRecommendations } from '../../utils/recommendationsAPI';
import { fetchBookInfo, preloadBookCovers } from '../../utils/googleBooksAPI';
import bookIcon from '../../assets/icons/book.svg';
import './RecommendationsWindow.css';  // Import the dedicated CSS file

const RecommendationsWindow = ({ 
  records = [], 
  handleStatusChange = () => {}, 
  handleAddBookDirectly = () => {},
  handleAddBook = () => {} 
}) => {
  const [customRequest, setCustomRequest] = useState('');
  const [toReadRecommendation, setToReadRecommendation] = useState([]);
  const [historyRecommendations, setHistoryRecommendations] = useState([]);
  const [customRecommendations, setCustomRecommendations] = useState([]);
  const [loadingToRead, setLoadingToRead] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [toReadError, setToReadError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [customError, setCustomError] = useState(null);
  const [bookCovers, setBookCovers] = useState({});
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  
  // Access window context to check if the window is open
  const { state } = useWindowContext();
  const isWindowOpen = state.windows[WINDOW_TYPES.RECOMMENDATIONS].isOpen;

  // Filter records based on status
  const toReadList = records.filter(record => record.status === 'to-read');
  const readingHistory = records.filter(record => record.status === 'read')
    .map(record => ({
      ...record,
      rating: record.rating || 0,  // Ensure rating is defined
    }));

  // Load default recommendations when the component mounts or when records change
  useEffect(() => {
    // Only fetch recommendations when the window is actually open
    if (isWindowOpen) {
      // Only do the initial fetch if we haven't done it yet
      // or if records have changed after the window was opened
      if (!initialFetchDone) {
        fetchToReadRecommendation();
        fetchHistoryRecommendations();
        setInitialFetchDone(true);
      }
    } else {
      // Reset the initialFetchDone flag when window is closed
      // so we'll fetch fresh data next time the window opens
      setInitialFetchDone(false);
    }
  // Remove derived values from dependency array to prevent unnecessary re-renders
  }, [isWindowOpen, records, initialFetchDone]);
  
  // Define fetch functions with useCallback to avoid recreating them on every render
  const fetchToReadRecommendation = useCallback(async () => {
    if (toReadList.length === 0) {
      setToReadError('Your to-read list is empty. Add some books first!');
      return;
    }
    
    setLoadingToRead(true);
    setToReadError(null);
    
    try {
      const params = {
        type: 'to-read',
        count: 1,
        toReadList: toReadList.map(book => ({
          title: book.title,
          author: book.author,
          id: book._id,
        }))
      };
      
      const result = await getRecommendations(params);
      
      if (result.error) {
        setToReadError(result.error);
      } else {
        setToReadRecommendation(result);
        fetchBookCovers(result);
      }
    } catch (err) {
      setToReadError('Failed to get recommendations. Please try again.');
      console.error('Error fetching to-read recommendations:', err);
    }
    
    setLoadingToRead(false);
  }, [toReadList]);

  // Function to fetch recommendations based on reading history
  const fetchHistoryRecommendations = useCallback(async () => {
    if (readingHistory.length === 0) {
      setHistoryError('Your reading history is empty. Mark some books as read first!');
      return;
    }
    
    setLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const params = {
        type: 'based-on-history',
        count: 3,
        readingHistory: readingHistory.map(book => ({
          title: book.title,
          author: book.author,
          rating: book.rating,
          review: book.review,
        }))
      };
      
      const result = await getRecommendations(params);
      
      if (result.error) {
        setHistoryError(result.error);
      } else {
        setHistoryRecommendations(result);
        fetchBookCovers(result);
      }
    } catch (err) {
      setHistoryError('Failed to get recommendations. Please try again.');
      console.error('Error fetching history recommendations:', err);
    }
    
    setLoadingHistory(false);
  }, [readingHistory]);
  
  // Function to fetch custom recommendations
  const fetchCustomRecommendations = useCallback(async () => {
    if (!customRequest.trim()) {
      setCustomError('Please enter a request for custom recommendations.');
      return;
    }
    
    setLoadingCustom(true);
    setCustomError(null);
    
    try {
      const params = {
        type: 'custom',
        count: 3,
        customRequest: customRequest
      };
      
      const result = await getRecommendations(params);
      
      if (result.error) {
        setCustomError(result.error);
      } else {
        setCustomRecommendations(result);
        fetchBookCovers(result);
      }
    } catch (err) {
      setCustomError('Failed to get recommendations. Please try again.');
      console.error('Error fetching custom recommendations:', err);
    }
    
    setLoadingCustom(false);
  }, [customRequest]);
  
  // Function to fetch book covers - updated to use the improved system
  const fetchBookCovers = async (books) => {
    if (!books || books.length === 0) {
      console.log('No books provided to fetch covers for');
      return;
    }
    
    // Use the new preloadBookCovers function to throttle requests
    const booksArray = Array.isArray(books) ? books : [books];
    preloadBookCovers(booksArray);
    
    // For immediate UI feedback, start loading the first few covers directly
    // but limit the number of direct requests
    const priorityBooks = booksArray.slice(0, 2);
    
    for (const book of priorityBooks) {
      try {
        if (!book.title || !book.author) {
          console.warn('Book missing title or author:', book);
          continue;
        }
        
        const bookInfo = await fetchBookInfo(book.title, book.author);
        
        if (bookInfo.coverImage) {
          setBookCovers(prev => ({
            ...prev,
            [book.title]: bookInfo.coverImage
          }));
        }
      } catch (error) {
        console.error(`Error fetching priority cover for ${book.title}:`, error);
      }
    }
  };
  
  // Function to add a book to the "to read" list and replace it with a new recommendation
  const addToReadingList = (book, source, index = -1) => {
    // Create a book data object
    const bookData = {
      title: book.title,
      author: book.author,
      format: book.format || 'Unknown',
      notes: book.reason || '',
      status: 'to-read'
    };
    
    // Call the function to add the book directly
    handleAddBookDirectly(bookData);
    
    // Replace the recommendation with a new one based on the source
    replaceRecommendation(source, index);
  };
  
  // Function to fetch a replacement recommendation
  const replaceRecommendation = async (source, index) => {
    switch(source) {
      case 'to-read':
        // For to-read recommendations, just fetch a new one
        fetchToReadRecommendation();
        break;
        
      case 'history':
        // For history recommendations, we need to fetch a new one and update at the specific index
        await fetchReplacementHistoryRecommendation(index);
        break;
        
      case 'custom':
        // For custom recommendations, fetch a new one for the specific index
        await fetchReplacementCustomRecommendation(index);
        break;
        
      default:
        console.warn('Unknown recommendation source:', source);
    }
  };
  
  // Function to fetch a single replacement recommendation for history section
  const fetchReplacementHistoryRecommendation = async (index) => {
    if (readingHistory.length === 0) return;
    
    try {
      // Show loading state for this specific recommendation
      setHistoryRecommendations(prev => {
        const updated = [...prev];
        if (index >= 0 && index < updated.length) {
          updated[index] = { ...updated[index], isLoading: true };
        }
        return updated;
      });
      
      const params = {
        type: 'based-on-history',
        count: 1,
        readingHistory: readingHistory.map(book => ({
          title: book.title,
          author: book.author,
          rating: book.rating,
          review: book.review,
        })),
        // Add an exclusion list of books we already have as recommendations
        exclude: historyRecommendations.map(book => `${book.title} by ${book.author}`)
      };
      
      const result = await getRecommendations(params);
      
      if (result && result.length > 0) {
        // Update just this one recommendation
        setHistoryRecommendations(prev => {
          const updated = [...prev];
          if (index >= 0 && index < updated.length) {
            updated[index] = result[0];
          }
          return updated;
        });
        
        // Fetch cover for the new recommendation
        fetchBookCovers([result[0]]);
      }
    } catch (err) {
      console.error('Error fetching replacement history recommendation:', err);
    }
  };
  
  // Function to fetch a single replacement recommendation for custom section
  const fetchReplacementCustomRecommendation = async (index) => {
    if (!customRequest.trim()) return;
    
    try {
      // Show loading state for this specific recommendation
      setCustomRecommendations(prev => {
        const updated = [...prev];
        if (index >= 0 && index < updated.length) {
          updated[index] = { ...updated[index], isLoading: true };
        }
        return updated;
      });
      
      const params = {
        type: 'custom',
        count: 1,
        customRequest: customRequest,
        // Add an exclusion list of books we already have as recommendations
        exclude: customRecommendations.map(book => `${book.title} by ${book.author}`)
      };
      
      const result = await getRecommendations(params);
      
      if (result && result.length > 0) {
        // Update just this one recommendation
        setCustomRecommendations(prev => {
          const updated = [...prev];
          if (index >= 0 && index < updated.length) {
            updated[index] = result[0];
          }
          return updated;
        });
        
        // Fetch cover for the new recommendation
        fetchBookCovers([result[0]]);
      }
    } catch (err) {
      console.error('Error fetching replacement custom recommendation:', err);
    }
  };
  
  // Render a recommendation card
  const renderRecommendationCard = (book, source, index) => {
    // Handle loading state
    if (book.isLoading) {
      return (
        <div className="recommendation-card">
          <div className="loading-message">Finding a new recommendation...</div>
        </div>
      );
    }

    return (
      <div className="recommendation-card">
        <div className="book-cover-container">
          {bookCovers[book.title] ? (
            <img 
              src={bookCovers[book.title]}
              alt={`Cover of ${book.title}`}
              className="book-cover"
            />
          ) : (
            <img 
              src={bookIcon}
              alt="Book icon"
              className="book-cover fallback"
            />
          )}
        </div>
        
        <div className="book-info">
          <h4>{book.title}</h4>
          <p className="book-author">by {book.author}</p>
          <p className="recommendation-reason">{book.reason}</p>
          
          <button 
            className="win95-button small"
            onClick={() => addToReadingList(book, source, index)}
          >
            Add to Reading List
          </button>
        </div>
      </div>
    );
  };

  return (
    <Window id={WINDOW_TYPES.RECOMMENDATIONS} className="window-recommendations">
      <div className="recommendations-window">
        <h2>Book Recommendations</h2>
        
        <div className="recommendations-sections">
          {/* To-Read List Recommendations Section */}
          <div className="recommendation-section">
            <h1>From your to-read list</h1>
            
            {loadingToRead && (
              <div className="loading-message">Finding a book from your to-read list...</div>
            )}
            
            {toReadError && (
              <div className="error-message">{toReadError}</div>
            )}
            
            {!loadingToRead && !toReadError && toReadRecommendation.length > 0 && (
              <div className="recommendations-list to-read">
                {renderRecommendationCard(toReadRecommendation[0], 'to-read', 0)}
              </div>
            )}
            
            {!loadingToRead && !toReadError && toReadRecommendation.length === 0 && (
              <div className="empty-state">
                <p>No recommendations available from your to-read list.</p>
              </div>
            )}
          </div>
          
          {/* Reading History Recommendations Section */}
          <div className="recommendation-section">
            <h1>Based on your reading history</h1>
            
            {loadingHistory && (
              <div className="loading-message">Finding books based on your reading history...</div>
            )}
            
            {historyError && (
              <div className="error-message">{historyError}</div>
            )}
            
            {!loadingHistory && !historyError && historyRecommendations.length > 0 && (
              <div className="recommendations-list history">
                {historyRecommendations.map((book, index) => (
                  <div key={index}>
                    {renderRecommendationCard(book, 'history', index)}
                  </div>
                ))}
              </div>
            )}
            
            {!loadingHistory && !historyError && historyRecommendations.length === 0 && (
              <div className="empty-state">
                <p>No recommendations available based on your reading history.</p>
              </div>
            )}
          </div>
          
          {/* Custom Recommendations Section */}
          <div className="recommendation-section">
            <h1>Or, describe what you're looking for</h1>
            
            <div className="custom-request">
              <textarea
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                placeholder="E.g., 'Science fiction books with strong female protagonists' or 'Books similar to The Lord of the Rings'"
                rows={3}
              />
              
              <button 
                className="win95-button"
                onClick={fetchCustomRecommendations}
                disabled={loadingCustom}
              >
                {loadingCustom ? 'Getting Recommendations...' : 'Get Recommendations'}
              </button>
            </div>
            
            {customError && (
              <div className="error-message">{customError}</div>
            )}
            
            {loadingCustom && (
              <div className="loading-message">Finding custom recommendations...</div>
            )}
            
            {!loadingCustom && !customError && customRecommendations.length > 0 && (
              <div className="recommendations-list custom">
                <h3>Custom Recommendations</h3>
                {customRecommendations.map((book, index) => (
                  <div key={index}>
                    {renderRecommendationCard(book, 'custom', index)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Window>
  );
};

export default RecommendationsWindow;