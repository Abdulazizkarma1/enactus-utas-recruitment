import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function PrivateRoute({ children, requireAdmin = false }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr || userStr === 'null') {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsChecking(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'admin');
    } catch (error) {
      console.error('Error parsing user data:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="container d-flex align-items-center justify-content-center" style={{minHeight: '80vh'}}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirect to dashboard if admin route but not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

