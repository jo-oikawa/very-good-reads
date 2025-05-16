import React from 'react';
import { useWindowContext, WINDOW_TYPES } from '../../context/WindowContext';
import Taskbar from '../taskbar/Taskbar';
import DesktopIcon from './DesktopIcon';
import './Desktop.css';

// Import SVG icons
import { ReactComponent as AddBookIcon } from '../../assets/icons/New.svg';
import { ReactComponent as ReadingIcon } from '../../assets/icons/Currently.svg';
import { ReactComponent as CollectionIcon } from '../../assets/icons/Collection.svg';
import { ReactComponent as RecommendationsIcon } from '../../assets/icons/Recommended.svg';

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
            title="Add New"
            icon={<AddBookIcon />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.CURRENT_READING}
            title="Currently"
            icon={<ReadingIcon />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.RECORD_LIST}
            title="Collection"
            icon={<CollectionIcon />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.RECOMMENDATIONS}
            title="Recommended"
            icon={<RecommendationsIcon />}
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