import React from 'react';
import './Icon.css';

/**
 * Icon component wrapper for VS Code Codicons
 * @param {string} name - The codicon name (e.g., 'book', 'star', 'add')
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const Icon = ({ name, className = '', style = {}, ...props }) => {
  return (
    <i 
      className={`codicon codicon-${name} ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Icon;
