// src/components/analytics/LongPressWrapper.jsx
import React, { useState, useRef } from 'react';
import './LongPressWrapper.css';

const LongPressWrapper = ({ children }) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const timerRef = useRef(null);

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => {
      setIsLongPressed(true);
    }, 600); // Long press threshold (600ms)
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
  };

  const closeOverlay = () => {
    setIsLongPressed(false);
  };

  return (
    <div
      data-testid="long-press-wrapper"
      className="long-press-wrapper"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isLongPressed && (
        <div className="lp-overlay" onClick={closeOverlay}>
          <div className="lp-highlight">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default LongPressWrapper;
