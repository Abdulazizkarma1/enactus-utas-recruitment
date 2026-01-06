import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config/api';

export default function Register() {
  const [step, setStep] = useState(1); // Step 1: Voucher validation, Step 2: Account creation
  const [voucherData, setVoucherData] = useState({ serial: '', pin: '' });
  const [accountData, setAccountData] = useState({ studentId: '', email: '', password: '', confirmPassword: '' });
  const [isValidating, setIsValidating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [voucherValid, setVoucherValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Step 1: Validate Voucher
  const handleVoucherValidation = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!voucherData.serial || !voucherData.pin) {
      setErrors({ voucher: 'Please enter both Serial Number and PIN' });
      return;
    }

    setIsValidating(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/validate-voucher`, voucherData);
      if (response.data.valid) {
        setVoucherValid(true);
        setSuccessMessage('✅ Voucher validated successfully! You can now create your account.');
        // Wait a moment to show success message, then proceed to step 2
        setTimeout(() => {
          setStep(2);
        }, 1500);
      }
    } catch (err) {
      setErrors({ voucher: err.response?.data?.msg || 'Invalid voucher. Please check your Serial Number and PIN.' });
      setVoucherValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 2: Create Account
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    // Validation
    const newErrors = {};
    
    if (!accountData.studentId) {
      newErrors.studentId = 'Student ID is required';
    } else if (!/^\d{11}$/.test(accountData.studentId.trim())) {
      newErrors.studentId = 'Student ID must be exactly 11 digits';
    }

    if (!accountData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!accountData.password) {
      newErrors.password = 'Password is required';
    } else if (accountData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (accountData.password !== accountData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsRegistering(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        ...voucherData,
        ...accountData
      });
      
      // Store student ID for pre-population in application form
      localStorage.setItem('registeredStudentId', accountData.studentId.trim());
      
      setSuccessMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setErrors({ register: err.response?.data?.msg || 'Error registering. Please check your details and try again.' });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container mt-3 mt-md-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card p-4 p-md-5 mx-auto shadow-sm" style={{borderColor: '#800000', borderWidth: '2px'}}>
            {/* Header */}
            <div className="text-center mb-4">
              <div style={{width:'60px', height:'60px', background:'#800000', borderRadius:'50%', margin:'0 auto 15px'}}></div>
              <h3 className="mb-2" style={{color: '#800000', fontSize: '1.75rem', fontWeight: 'bold'}}>Enactus UTAS</h3>
              <p className="text-muted mb-0">2026 Recruitment Portal</p>
            </div>

            {/* Step Indicator */}
            <div className="d-flex justify-content-between mb-4">
              <div className="text-center flex-fill">
                <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 1 ? 'bg-success' : 'bg-secondary'} text-white`} 
                     style={{width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold'}}>
                  {voucherValid ? '✓' : '1'}
                </div>
                <div className="mt-2 small">Voucher</div>
              </div>
              <div className="flex-fill d-flex align-items-center px-2">
                <div className={`w-100 ${step >= 2 ? 'bg-success' : 'bg-secondary'}`} style={{height: '3px'}}></div>
              </div>
              <div className="text-center flex-fill">
                <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 2 ? 'bg-success' : 'bg-secondary'} text-white`} 
                     style={{width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold'}}>
                  2
                </div>
                <div className="mt-2 small">Account</div>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMessage}
                <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
              </div>
            )}

            {/* Error Message */}
            {errors.voucher && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errors.voucher}
              </div>
            )}
            {errors.register && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errors.register}
              </div>
            )}

            {/* Step 1: Voucher Validation */}
            {step === 1 && (
              <form onSubmit={handleVoucherValidation}>
                <div className="alert alert-info border-start border-4 border-info mb-4">
                  <h6 className="alert-heading"><i className="bi bi-info-circle-fill me-2"></i>Step 1: Validate Your Voucher</h6>
                  <p className="mb-0 small">Enter your voucher Serial Number and PIN to verify your eligibility. You'll need a valid voucher to proceed with registration.</p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Serial Number <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.voucher ? 'is-invalid' : ''}`}
                    placeholder="Enter voucher serial number"
                    value={voucherData.serial}
                    onChange={e => setVoucherData({...voucherData, serial: e.target.value})}
                    disabled={isValidating}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">PIN <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.voucher ? 'is-invalid' : ''}`}
                    placeholder="Enter voucher PIN"
                    value={voucherData.pin}
                    onChange={e => setVoucherData({...voucherData, pin: e.target.value})}
                    disabled={isValidating}
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="btn w-100 btn-lg" 
                  style={{backgroundColor: '#800000', color: 'white'}}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Validating Voucher...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Validate Voucher
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Account Creation */}
            {step === 2 && (
              <form onSubmit={handleRegister}>
                <div className="alert alert-success border-start border-4 border-success mb-4">
                  <h6 className="alert-heading"><i className="bi bi-check-circle-fill me-2"></i>Step 2: Create Your Account</h6>
                  <p className="mb-0 small">Your voucher has been validated! Now create your account with your Student ID, email, and password. This information will be used to log in and access your application.</p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Student ID <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.studentId ? 'is-invalid' : ''}`}
                    placeholder="Enter your 11-digit Student ID"
                    value={accountData.studentId}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setAccountData({...accountData, studentId: value});
                      if (errors.studentId) setErrors({...errors, studentId: null});
                    }}
                    disabled={isRegistering}
                    required
                    maxLength={11}
                  />
                  {errors.studentId && <div className="invalid-feedback">{errors.studentId}</div>}
                  <small className="text-muted">Must be exactly 11 digits</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Email Address <span className="text-danger">*</span></label>
                  <input 
                    type="email" 
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter your email address"
                    value={accountData.email}
                    onChange={e => {
                      setAccountData({...accountData, email: e.target.value});
                      if (errors.email) setErrors({...errors, email: null});
                    }}
                    disabled={isRegistering}
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Password <span className="text-danger">*</span></label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Create a password (min. 8 characters)"
                    value={accountData.password}
                    onChange={e => {
                      setAccountData({...accountData, password: e.target.value});
                      if (errors.password) setErrors({...errors, password: null});
                    }}
                    disabled={isRegistering}
                    required
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  <small className="text-muted">Must be at least 8 characters long</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Confirm Password <span className="text-danger">*</span></label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirm your password"
                    value={accountData.confirmPassword}
                    onChange={e => {
                      setAccountData({...accountData, confirmPassword: e.target.value});
                      if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                    }}
                    disabled={isRegistering}
                    required
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setStep(1)}
                    disabled={isRegistering}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back
                  </button>
                  <button 
                    type="submit"
                    className="btn flex-fill btn-lg" 
                    style={{backgroundColor: '#800000', color: 'white'}}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Already have an account?{' '}
                <Link to="/" style={{color: '#800000', textDecoration: 'none', fontWeight: 'bold'}}>
                  Login here
                </Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}