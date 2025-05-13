import React, { useState, useEffect, useRef } from 'react';
import { useWindowContext } from '../../context/WindowContext';
import StartMenu from './StartMenu';
import './Taskbar.css';

const Taskbar = () => {
  const { state, restoreWindow } = useWindowContext();
  const { windows } = state;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const startButtonRef = useRef(null);

  // Get all windows that are minimized but still open
  const minimizedWindows = Object.values(windows).filter(
    (window) => window.isOpen && window.isMinimized
  );
  
  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Toggle start menu
  const toggleStartMenu = () => {
    setStartMenuOpen(prevState => !prevState);
  };

  // Close start menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startMenuOpen && startButtonRef.current && 
          !startButtonRef.current.contains(event.target)) {
        setStartMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [startMenuOpen]);

  return (
    <div className="taskbar">
      <div className="start-button" ref={startButtonRef}>
        <button 
          className={`start-button-inner ${startMenuOpen ? 'active' : ''}`}
          onClick={toggleStartMenu}
        >
          Very Good Reads
        </button>
        <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} />
      </div>
      <div className="taskbar-buttons">
        {/* Map through minimized windows and create buttons for them */}
        {minimizedWindows.map((window) => (
          <button
            key={window.id}
            className="taskbar-button"
            onClick={() => restoreWindow(window.id)}
          >
            {window.title}
          </button>
        ))}
      </div>
      <div className="taskbar-tray">
        <div className="taskbar-time">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;