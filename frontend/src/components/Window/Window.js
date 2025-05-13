import React, { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { useWindowContext } from '../../context/WindowContext';
import './Window.css';

const Window = ({ id, children, className }) => {
  const {
    state,
    setActiveWindow,
    minimizeWindow,
    closeWindow,
    setWindowPosition,
  } = useWindowContext();
  
  const windowData = state.windows[id];
  const isActive = state.activeWindowId === id;
  const nodeRef = useRef(null);

  // If window doesn't exist, render nothing
  if (!windowData || !windowData.isOpen || windowData.isMinimized) {
    return null;
  }

  // Handle drag stop - update window position
  const handleDragStop = (e, data) => {
    setWindowPosition(id, { x: data.x, y: data.y });
  };

  // Handle window header click - make window active
  const handleWindowHeaderClick = () => {
    if (!isActive) {
      setActiveWindow(id);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-header"
      defaultPosition={windowData.position}
      onStop={handleDragStop}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={`window ${isActive ? 'window-active' : ''} ${className || ''}`}
        style={{ zIndex: windowData.zIndex }}
        onClick={() => setActiveWindow(id)}
      >
        <div 
          className={`window-header ${isActive ? 'window-header-active' : ''}`}
          onClick={handleWindowHeaderClick}
        >
          <div className="window-title">{windowData.title}</div>
          <div className="window-controls">
            <button 
              className="window-control minimize-btn" 
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(id);
              }}
            >
              _
            </button>
            <button 
              className="window-control close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(id);
              }}
            >
              X
            </button>
          </div>
        </div>
        <div className="window-content">
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export default Window;