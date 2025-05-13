import React from 'react';
import { useWindowContext } from '../../context/WindowContext';
import './DesktopIcon.css';

const DesktopIcon = ({ windowId, title, icon }) => {
  const { state, openWindow, setActiveWindow } = useWindowContext();
  
  const handleIconClick = () => {
    const windowData = state.windows[windowId];
    
    if (!windowData.isOpen) {
      // If window is closed, open it
      openWindow(windowId);
    } else if (windowData.isMinimized) {
      // If window is minimized, restore it
      openWindow(windowId);
    } else {
      // If window is already open, just focus it
      setActiveWindow(windowId);
    }
  };
  
  return (
    <div className="desktop-icon" onClick={handleIconClick}>
      <div className="desktop-icon-image">
        {icon}
      </div>
      <div className="desktop-icon-label">
        {title}
      </div>
    </div>
  );
};

export default DesktopIcon;