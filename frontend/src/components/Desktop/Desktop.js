import React from 'react';
import { useWindowContext, WINDOW_TYPES } from '../../context/WindowContext';
import Taskbar from '../taskbar/Taskbar';
import DesktopIcon from './DesktopIcon';
import './Desktop.css';

// Simple SVG icons for our windows
const AddBookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const ReadingIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1.5-1L8 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z"/>
  </svg>
);

const CollectionIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
  </svg>
);

const Desktop = ({ children }) => {
  // Use our window context to manage window states
  const { state } = useWindowContext();
  
  return (
    <div className="desktop">
      <div className="desktop-content">
        {/* Desktop Icons */}
        <div className="desktop-icons-container">
          <DesktopIcon 
            windowId={WINDOW_TYPES.ADD_RECORD}
            title="Add New Book"
            icon={<AddBookIcon />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.CURRENT_READING}
            title="Currently Reading"
            icon={<ReadingIcon />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.RECORD_LIST}
            title="Book Collection"
            icon={<CollectionIcon />}
          />
        </div>
        
        {/* This is where all window components will be rendered */}
        {children}
      </div>
      <Taskbar />
    </div>
  );
};

export default Desktop;