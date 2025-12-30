import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ studentId: '', email: '', password: '', serial: '', pin: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.serial || !form.pin) {
      alert('Please enter voucher Serial Number and PIN');
      return;
    }
    if (!form.studentId) {
      alert('Please enter your Student ID');
      return;
    }
    if (!form.email || !form.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    if (!form.password || form.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registration Successful! Please Login.');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error registering. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-3 mt-md-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card p-3 p-md-4 mx-auto" style={{borderColor: '#800000', borderWidth: '2px'}}>
            <h3 className="text-center mb-3" style={{color: '#800000', fontSize: '1.5rem'}}>Enactus Recruitment</h3>
      <form onSubmit={handleSubmit}>
        <h5>1. Voucher Details</h5>
        <input className="form-control mb-2" placeholder="Serial Number" onChange={e => setForm({...form, serial: e.target.value})} required />
        <input className="form-control mb-3" placeholder="PIN" onChange={e => setForm({...form, pin: e.target.value})} required />
        
        <h5>2. Account Details</h5>
        <input className="form-control mb-2" placeholder="Student ID" onChange={e => setForm({...form, studentId: e.target.value})} required />
        <input className="form-control mb-2" type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
        <input className="form-control mb-3" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required />
        
        <button 
          className="btn w-100" 
          style={{backgroundColor: '#FFC107', color: 'black'}}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
        
        <div className="text-center mt-3">
          <small>
            Already have an account?{' '}
            <a href="/" style={{color: '#800000', textDecoration: 'none'}}>
              Login here
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