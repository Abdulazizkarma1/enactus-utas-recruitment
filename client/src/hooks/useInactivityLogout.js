import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for auto-logout on inactivity
 * @param {number} timeoutMinutes - Minutes of inactivity before logout
 * @param {function} onLogout - Callback function when logout is triggered
 */
export function useInactivityLogout(timeoutMinutes, onLogout) {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000; // Convert minutes to milliseconds

    const resetTimeout = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Call custom logout handler if provided
        if (onLogout) {
          onLogout();
        }
        
        // Navigate to login
        navigate('/');
        
        // Show message
        alert('You have been logged out due to inactivity.');
      }, timeoutMs);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Set initial timeout
    resetTimeout();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimeout, true);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [timeoutMinutes, navigate, onLogout]);
}



