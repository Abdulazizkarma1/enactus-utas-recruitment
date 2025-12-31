import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      alert('Please enter your Student ID/Email and Password');
      return;
    }

    setIsLoading(true);
    try {
      // Try as studentId first, then email
      const loginData = form.identifier.includes('@') 
        ? { email: form.identifier.trim(), password: form.password }
        : { studentId: form.identifier.trim(), password: form.password };
      
      const res = await axios.post(`${API_URL}/api/auth/login`, loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Show success message
      alert('✅ Successfully logged in!');
      
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Error logging in';
      
      if (err.response) {
        // Server responded with error
        errorMsg = err.response.data?.msg || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response
        errorMsg = 'Cannot connect to server. Please check your connection and try again.';
        console.error('API URL:', API_URL);
      } else {
        // Something else happened
        errorMsg = err.message || 'An unexpected error occurred';
      }
      
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{minHeight: '80vh'}}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card p-3 p-md-4 mx-auto" style={{borderColor: '#800000', borderWidth: '2px'}}>
            <h3 className="text-center mb-3" style={{color: '#800000', fontSize: '1.5rem'}}>Enactus Recruitment</h3>
            <p className="text-center text-muted small mb-4">Login with Student ID or Email</p>

            <form onSubmit={handleSubmit}>
              <input 
                className="form-control mb-2" 
                placeholder="Student ID or Email" 
                value={form.identifier}
                onChange={e => setForm({...form, identifier: e.target.value})} 
                required 
                disabled={isLoading}
              />
              <input 
                className="form-control mb-3" 
                type="password" 
                placeholder="Password" 
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
                disabled={isLoading}
              />
              
              <button 
                className="btn w-100 mb-2" 
                style={{backgroundColor: '#FFC107', color: 'black'}}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              
              <div className="text-center">
                <small>
                  Don't have an account?{' '}
                  <a href="/register" style={{color: '#800000', textDecoration: 'none'}}>
                    Register here
                  </a>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

