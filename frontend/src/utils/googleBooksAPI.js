import React from 'react';

// Cache for storing already fetched book information
const bookInfoCache = new Map();

// Default fallback icon path
export const FALLBACK_COVER_ICON = '/assets/icons/book.svg';

// Throttling configuration
const THROTTLE_DELAY = 1500; // Increased from 500ms to 1500ms between API calls
const MAX_RETRIES = 3; // Increased max retries
const MAX_CONCURRENT_REQUESTS = 2; // Limit concurrent requests
let lastRequestTime = 0;
const requestQueue = [];
let isProcessingQueue = false;
let activeRequests = 0; // Track active requests

// Keep track of which books are currently being fetched
const pendingRequests = new Map();

/**
 * Add a request to the throttled queue
 * @param {Function} requestFn - Function to execute the request
 * @param {string} requestId - Unique identifier for the request
 * @returns {Promise} - Promise that resolves with the request result
 */
const enqueueRequest = (requestFn, requestId) => {
  // If this request is already pending, return the existing promise
  if (pendingRequests.has(requestId)) {
    return pendingRequests.get(requestId);
  }
  
  const promise = new Promise((resolve, reject) => {
    requestQueue.push({ requestFn, resolve, reject, requestId });
    processQueue();
  });
  
  pendingRequests.set(requestId, promise);
  return promise;
};

/**
 * Process the request queue with throttling
 */
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) return;
  
  isProcessingQueue = true;
  
  // Implement throttling delay
  const now = Date.now();
  const timeToWait = Math.max(0, THROTTLE_DELAY - (now - lastRequestTime));
  
  setTimeout(async () => {
    // Process the next request
    const { requestFn, resolve, reject, requestId } = requestQueue.shift();
    lastRequestTime = Date.now();
    activeRequests++;
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      activeRequests--;
      pendingRequests.delete(requestId);
      
      isProcessingQueue = false;
      // Continue processing the queue if there are more requests
      if (requestQueue.length > 0) {
        processQueue();
      }
    }
  }, timeToWait);
};

/**
 * Fetches book information from Google Books API based on title and author
 * @param {string} title - The book title
 * @param {string} author - The book author (optional)
 * @param {number} timeoutMs - Timeout in milliseconds (default: 6000ms)
 * @param {number} retryCount - Current retry count (used internally)
 * @returns {Promise<object>} - Promise resolving to book data including cover image URL
 */
export const fetchBookInfo = async (title, author = '', timeoutMs = 6000, retryCount = 0) => {
  // Create a cache key based on title and author
  const cacheKey = `${title}-${author}`.toLowerCase();
  
  // Return cached data if available
  if (bookInfoCache.has(cacheKey)) {
    return bookInfoCache.get(cacheKey);
  }
  
  // The actual fetch operation to be queued
  const performFetch = async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timeout')), timeoutMs);
      });
      
      // Construct search query with title and optionally author
      const query = encodeURIComponent(`${title} ${author ? 'inauthor:' + author : ''}`);
      const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
      
      // Fetch with timeout
      const fetchPromise = fetch(apiUrl).then(response => {
        if (response.status === 429) {
          // Specific handling for rate limit exceeded
          console.warn('Google Books API rate limit exceeded. Will retry with backoff.');
          throw new Error('429 Rate limit exceeded');
        } else if (!response.ok) {
          throw new Error(`Google Books API error: ${response.status}`);
        }
        return response.json();
      });
      
      // Race between fetch and timeout
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      
      // If no results found
      if (!data.items || data.items.length === 0) {
        const result = {
          coverImage: null,
          error: 'No book information found',
          useFallback: true
        };
        bookInfoCache.set(cacheKey, result);
        return result;
      }
      
      const bookInfo = data.items[0].volumeInfo;
      
      // Extract cover image URL (different sizes available)
      const imageLinks = bookInfo.imageLinks || {};
      const coverImage = 
        imageLinks.thumbnail || 
        imageLinks.smallThumbnail || 
        null;
      
      const result = {
        title: bookInfo.title || title,
        author: bookInfo.authors?.join(', ') || author,
        description: bookInfo.description || '',
        coverImage,
        publishedDate: bookInfo.publishedDate || '',
        pageCount: bookInfo.pageCount || null,
        categories: bookInfo.categories || [],
        error: null,
        useFallback: !coverImage // Flag to use fallback if no cover image found
      };
      
      // Store in cache
      bookInfoCache.set(cacheKey, result);
      return result;
    } catch (error) {
      // Handle retries for certain errors
      const isRateLimitError = error.message.includes('429');
      const shouldRetry = retryCount < MAX_RETRIES && 
        (error.message.includes('timeout') || 
         isRateLimitError ||
         error.message.includes('network'));
      
      if (shouldRetry) {
        console.log(`Retrying fetch for "${title}" (Attempt ${retryCount + 1})...`);
        
        // Exponential backoff with longer delays for rate limit errors
        const baseDelay = isRateLimitError ? 3000 : 1000;
        const backoffDelay = baseDelay * Math.pow(2, retryCount);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return fetchBookInfo(title, author, timeoutMs, retryCount + 1);
      }
      
      console.error('Error fetching book info:', error);
      const result = {
        coverImage: null,
        error: 'Failed to fetch book information',
        useFallback: true
      };
      // Cache negative results too to prevent repeated failed requests
      bookInfoCache.set(cacheKey, result);
      return result;
    }
  };
  
  // Add the request to the throttled queue
  return enqueueRequest(performFetch, cacheKey);
};

/**
 * Preload covers for a batch of books
 * @param {Array} books - Array of book objects with title and author properties
 */
export const preloadBookCovers = (books) => {
  if (!books || books.length === 0) return;
  
  // Process in smaller chunks to not overwhelm the queue
  const chunk = books.slice(0, 5); // Reduced from 10 to 5 books per chunk
  
  // Add a small random delay to avoid synchronized requests
  setTimeout(() => {
    chunk.forEach(book => {
      if (book.title) {
        // Low priority - fire and forget
        fetchBookInfo(book.title, book.author)
          .catch(() => {/* Ignore errors */});
      }
    });
    
    // Schedule next chunk if needed with a much longer delay
    if (books.length > 5) {
      setTimeout(() => {
        preloadBookCovers(books.slice(5));
      }, THROTTLE_DELAY * 3); // Increased delay between chunks
    }
  }, Math.random() * 1000); // Add random initial delay up to 1 second
};

/**
 * Custom hook to fetch book cover image
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @returns {object} - Object containing loading state, cover image URL and error if any
 */
export const useBookCover = (title, author = '') => {
  const [bookCover, setBookCover] = React.useState({
    isLoading: true,
    coverImage: null,
    error: null,
    useFallback: false
  });

  React.useEffect(() => {
    let isMounted = true;
    
    const getBookCover = async () => {
      if (!title) {
        setBookCover({
          isLoading: false,
          coverImage: null,
          error: 'Book title is required',
          useFallback: true
        });
        return;
      }

      try {
        const bookInfo = await fetchBookInfo(title, author);
        if (isMounted) {
          setBookCover({
            isLoading: false,
            coverImage: bookInfo.coverImage,
            error: bookInfo.error,
            useFallback: bookInfo.useFallback
          });
        }
      } catch (error) {
        if (isMounted) {
          setBookCover({
            isLoading: false,
            coverImage: null,
            error: 'Failed to fetch book cover',
            useFallback: true
          });
        }
      }
    };

    getBookCover();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [title, author]);

  return bookCover;
};