import React from 'react';
import { WINDOW_TYPES } from '../../context/WindowContext';
import Taskbar from '../taskbar/Taskbar';
import DesktopIcon from './DesktopIcon';
import Icon from '../Icon/Icon';
import './Desktop.css';

const Desktop = ({ children }) => {
  return (
    <div className="desktop">
      <div className="desktop-content">
        {/* Desktop Icons */}
        <div className="desktop-icons-container">
          <DesktopIcon 
            windowId={WINDOW_TYPES.ADD_RECORD}
            title="Add New"
            icon={<Icon name="new-file" />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.CURRENT_READING}
            title="Currently"
            icon={<Icon name="book" />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.RECORD_LIST}
            title="Collection"
            icon={<Icon name="library" />}
          />
          <DesktopIcon 
            windowId={WINDOW_TYPES.RECOMMENDATIONS}
            title="Recommended"
            icon={<Icon name="star-full" />}
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