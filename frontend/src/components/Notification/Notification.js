import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timer to automatically hide the notification after the specified duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Call onClose after animation completes
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Animation duration
    }, duration);

    // Clean up timer if component unmounts
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Early return if not visible
  if (!isVisible) return null;

  return (
    <div className={`notification notification-${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300); // Animation duration
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;