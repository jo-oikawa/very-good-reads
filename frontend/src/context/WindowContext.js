import React, { createContext, useContext, useReducer } from 'react';

// Define window types
export const WINDOW_TYPES = {
  ADD_RECORD: 'add-record',
  CURRENT_READING: 'current-reading',
  RECORD_LIST: 'record-list',
  RECOMMENDATIONS: 'recommendations',
};

// Initial state for our windows
const initialState = {
  windows: {
    [WINDOW_TYPES.ADD_RECORD]: {
      id: WINDOW_TYPES.ADD_RECORD,
      title: 'Add New Book',
      isOpen: true,
      isMinimized: false,
      position: { x: 50, y: 50 },
      zIndex: 3,
    },
    [WINDOW_TYPES.CURRENT_READING]: {
      id: WINDOW_TYPES.CURRENT_READING,
      title: 'Currently Reading',
      isOpen: true,
      isMinimized: false,
      position: { x: 150, y: 100 },
      zIndex: 2,
    },
    [WINDOW_TYPES.RECORD_LIST]: {
      id: WINDOW_TYPES.RECORD_LIST,
      title: 'Book Collection',
      isOpen: true,
      isMinimized: false,
      position: { x: 250, y: 150 },
      zIndex: 1,
    },
    [WINDOW_TYPES.RECOMMENDATIONS]: {
      id: WINDOW_TYPES.RECOMMENDATIONS,
      title: 'Book Recommendations',
      isOpen: false, // Start closed initially
      isMinimized: false,
      position: { x: 350, y: 100 },
      zIndex: 0,
    },
  },
  activeWindowId: WINDOW_TYPES.ADD_RECORD, // Default active window
  highestZIndex: 3,
};

// Action types
const OPEN_WINDOW = 'OPEN_WINDOW';
const CLOSE_WINDOW = 'CLOSE_WINDOW';
const MINIMIZE_WINDOW = 'MINIMIZE_WINDOW';
const RESTORE_WINDOW = 'RESTORE_WINDOW';
const SET_ACTIVE_WINDOW = 'SET_ACTIVE_WINDOW';
const SET_WINDOW_POSITION = 'SET_WINDOW_POSITION';

// Reducer function for handling window state
function windowReducer(state, action) {
  switch (action.type) {
    case OPEN_WINDOW:
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            isOpen: true,
            isMinimized: false,
            zIndex: state.highestZIndex + 1, // Make sure it gets the highest z-index
          },
        },
        activeWindowId: action.payload.id,
        highestZIndex: state.highestZIndex + 1,
      };

    case CLOSE_WINDOW:
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            isOpen: false,
            isMinimized: false,
          },
        },
        activeWindowId: 
          state.activeWindowId === action.payload.id 
            ? getNextActiveWindowId(state.windows, action.payload.id) 
            : state.activeWindowId,
      };

    case MINIMIZE_WINDOW:
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            isMinimized: true,
          },
        },
        activeWindowId: 
          state.activeWindowId === action.payload.id 
            ? getNextActiveWindowId(state.windows, action.payload.id) 
            : state.activeWindowId,
      };

    case RESTORE_WINDOW:
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            isMinimized: false,
            zIndex: state.highestZIndex + 1,
          },
        },
        activeWindowId: action.payload.id,
        highestZIndex: state.highestZIndex + 1,
      };

    case SET_ACTIVE_WINDOW:
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            zIndex: state.highestZIndex + 1,
          },
        },
        activeWindowId: action.payload.id,
        highestZIndex: state.highestZIndex + 1,
      };

    case SET_WINDOW_POSITION:
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.payload.id]: {
            ...state.windows[action.payload.id],
            position: action.payload.position,
          },
        },
      };

    default:
      return state;
  }
}

// Helper function to find the next active window
function getNextActiveWindowId(windows, currentId) {
  // Find open, non-minimized windows
  const openWindows = Object.values(windows).filter(
    window => window.id !== currentId && window.isOpen && !window.isMinimized
  );

  // Sort by z-index (highest first)
  openWindows.sort((a, b) => b.zIndex - a.zIndex);

  // Return the ID of the window with the highest z-index, or null if none
  return openWindows.length > 0 ? openWindows[0].id : null;
}

// Create context
const WindowContext = createContext();

// Provider component
export function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  // Action creators
  const openWindow = (id) => {
    dispatch({ type: OPEN_WINDOW, payload: { id } });
  };

  const closeWindow = (id) => {
    dispatch({ type: CLOSE_WINDOW, payload: { id } });
  };

  const minimizeWindow = (id) => {
    dispatch({ type: MINIMIZE_WINDOW, payload: { id } });
  };

  const restoreWindow = (id) => {
    dispatch({ type: RESTORE_WINDOW, payload: { id } });
  };

  const setActiveWindow = (id) => {
    dispatch({ type: SET_ACTIVE_WINDOW, payload: { id } });
  };

  const setWindowPosition = (id, position) => {
    dispatch({ type: SET_WINDOW_POSITION, payload: { id, position } });
  };

  return (
    <WindowContext.Provider
      value={{
        state,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        setActiveWindow,
        setWindowPosition,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

// Custom hook for using the window context
export function useWindowContext() {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindowContext must be used within a WindowProvider');
  }
  return context;
}

export default WindowContext;