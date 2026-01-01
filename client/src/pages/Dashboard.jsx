import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import API_URL from '../config/api';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const userStr = localStorage.getItem('user');
  const user = userStr && userStr !== 'null' ? JSON.parse(userStr) : null;
  const navigate = useNavigate();
  const [appData, setAppData] = useState({
    fullName: '', hostel: '', department: '', programme: '', dob: '', phone: '',
    secondaryTeam: '', essayWhy: '', essaySkills: '', terms: false
  });
  const [files, setFiles] = useState({ profilePic: null, cv: null });
  const [status, setStatus] = useState('New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const dataLoadedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const appDataRef = useRef(appData);
  const filesRef = useRef(files);
  const userIdRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    appDataRef.current = appData;
  }, [appData]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Auto-save draft functionality - using refs to avoid dependency issues
  const saveDraft = useCallback(async () => {
    const currentAppData = appDataRef.current;
    const currentFiles = filesRef.current;
    const currentStatus = status;
    
    if (!user || currentStatus === 'submitted' || currentStatus === 'recruited' || currentStatus === 'declined') return;
    
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      if (currentAppData.fullName) formData.append('fullName', currentAppData.fullName);
      if (currentAppData.hostel) formData.append('hostel', currentAppData.hostel);
      if (currentAppData.department) formData.append('department', currentAppData.department);
      if (currentAppData.programme) formData.append('programme', currentAppData.programme);
      if (currentAppData.dob) formData.append('dob', currentAppData.dob);
      if (currentAppData.phone) formData.append('phone', currentAppData.phone);
      if (currentAppData.secondaryTeam) formData.append('secondaryTeam', currentAppData.secondaryTeam);
      if (currentAppData.essayWhy) formData.append('essayWhy', currentAppData.essayWhy);
      if (currentAppData.essaySkills) formData.append('essaySkills', currentAppData.essaySkills);
      
      if (currentFiles.profilePic) formData.append('profilePic', currentFiles.profilePic);
      if (currentFiles.cv) formData.append('cv', currentFiles.cv);

      await axios.post(`${API_URL}/api/application/draft`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Ensure status remains 'draft' or 'New' to keep form editable
      if (currentStatus !== 'draft' && currentStatus !== 'New') {
        setStatus('draft');
      }
      
      // Update application state if it doesn't exist yet
      setApplication(prev => prev || { status: 'draft' });
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [user, status]);

  // Debounced auto-save - only triggers on actual changes, not on every render
  useEffect(() => {
    if (!user || status === 'submitted' || status === 'recruited' || status === 'declined') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      return;
    }
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout - only save if there's actual content
    saveTimeoutRef.current = setTimeout(() => {
      const currentData = appDataRef.current;
      if (currentData.fullName || currentData.department || currentData.essayWhy) {
        saveDraft();
      }
      saveTimeoutRef.current = null;
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [appData, files, status, user, saveDraft]);

  // Load application data - only once on mount
  useEffect(() => {
    if (user && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      axios.get(`${API_URL}/api/application/${user.id}`)
        .then(res => {
          if(res.data) {
            const appStatus = res.data.status || 'New';
            setApplication(res.data);
            setStatus(appStatus); // Set status immediately - this determines form vs dashboard
            
            // Only set form data if status is 'New' or 'draft' (editable)
            // If submitted, don't load form data - user should see dashboard
            if (appStatus === 'New' || appStatus === 'draft') {
              setAppData(prev => {
                // Only update if current data is empty (initial state)
                if (!prev.fullName && !prev.department && !prev.essayWhy) {
                  return {
                    fullName: res.data.fullName || '',
                    hostel: res.data.hostel || '',
                    department: res.data.department || '',
                    programme: res.data.programme || '',
                    dob: res.data.dob || '',
                    phone: res.data.phone || '',
                    secondaryTeam: res.data.secondaryTeam || '',
                    essayWhy: res.data.essayWhy || '',
                    essaySkills: res.data.essaySkills || '',
                    terms: false // Not submitted yet
                  };
                }
                return prev; // Keep existing data if user has typed something
              });
            }
            // If status is submitted/recruited/declined/interview, don't set form data
            // User will see read-only dashboard
          } else {
            // No application exists, check if user has seen checklist
            const hasSeenChecklist = sessionStorage.getItem('hasSeenChecklist');
            if (!hasSeenChecklist) {
              navigate('/checklist');
              return;
            }
            // No application, status remains 'New'
            setStatus('New');
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching application:', err);
          setIsLoading(false);
          // On error, assume new application
          setStatus('New');
        });
    } else if (!user) {
      dataLoadedRef.current = false;
    }
  }, [user, navigate]);

  // Auto-logout after 5 minutes of inactivity (for regular users)
  useInactivityLogout(5, () => {
    console.log('User logged out due to inactivity');
  });

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    if (!appData.fullName || appData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!appData.department || appData.department.trim().length < 2) {
      newErrors.department = 'Department is required';
    }
    if (!appData.hostel || appData.hostel.trim().length < 2) {
      newErrors.hostel = 'Hostel/Residence is required';
    }
    if (appData.phone && appData.phone.length > 0) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(appData.phone) || appData.phone.length < 10) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!appData.secondaryTeam) {
      newErrors.secondaryTeam = 'Please select a secondary team';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateStep3 = () => {
    const newErrors = {};
    const whyWords = countWords(appData.essayWhy);
    const skillsWords = countWords(appData.essaySkills);
    
    if (!appData.essayWhy || appData.essayWhy.trim().length < 50) {
      newErrors.essayWhy = 'Please write at least 50 characters';
    } else if (whyWords < 50) {
      newErrors.essayWhy = `Please write at least 50 words (currently ${whyWords} words)`;
    }
    
    if (!appData.essaySkills || appData.essaySkills.trim().length < 50) {
      newErrors.essaySkills = 'Please write at least 50 characters';
    } else if (skillsWords < 50) {
      newErrors.essaySkills = `Please write at least 50 words (currently ${skillsWords} words)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!files.profilePic) {
      newErrors.profilePic = 'Profile picture is required';
    } else {
      const fileSize = files.profilePic.size / 1024 / 1024; // MB
      if (fileSize > 5) {
        newErrors.profilePic = 'Profile picture must be less than 5MB';
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(files.profilePic.type)) {
        newErrors.profilePic = 'Profile picture must be JPG or PNG format';
      }
    }
    
    if (!files.cv) {
      newErrors.cv = 'CV/Resume is required';
    } else {
      const fileSize = files.cv.size / 1024 / 1024; // MB
      if (fileSize > 10) {
        newErrors.cv = 'CV must be less than 10MB';
      }
      if (files.cv.type !== 'application/pdf') {
        newErrors.cv = 'CV must be in PDF format';
      }
    }
    
    if (!appData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepChange = (newStep) => {
    let isValid = true;
    if (newStep > step) {
      // Validate current step before moving forward
      if (step === 1) isValid = validateStep1();
      else if (step === 2) isValid = validateStep2();
      else if (step === 3) isValid = validateStep3();
      
      if (!isValid) {
        alert('Please fix the errors before continuing');
        return;
      }
    }
    setErrors({}); // Clear errors when moving
    setStep(newStep);
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    if (!user || !user.id) {
      alert('You must be logged in to submit. Please login again.');
      navigate('/');
      return;
    }

    // Final validation
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      setStep(4); // Go to final step to show errors
      alert('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('fullName', appData.fullName.trim());
      formData.append('hostel', appData.hostel.trim());
      formData.append('department', appData.department.trim());
      formData.append('programme', (appData.programme || '').trim());
      formData.append('dob', appData.dob || '');
      formData.append('phone', (appData.phone || '').trim());
      formData.append('secondaryTeam', appData.secondaryTeam);
      formData.append('essayWhy', appData.essayWhy.trim());
      formData.append('essaySkills', appData.essaySkills.trim());
      
      if (files.profilePic) {
        formData.append('profilePic', files.profilePic);
      }
      if (files.cv) {
        formData.append('cv', files.cv);
      }

      // Show processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await axios.post(`${API_URL}/api/application/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if submission was successful
      if (response.data && response.data.msg) {
        // Additional delay before redirect for smooth transition
        await new Promise(resolve => setTimeout(resolve, 800));
        navigate('/success');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Submission error:', err);
      let errorMsg = 'Error submitting application. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMsg = err.response.data?.msg || `Server error: ${err.response.status}`;
        if (err.response.status === 400) {
          errorMsg = err.response.data?.msg || 'Please check all required fields are filled correctly.';
        }
      } else if (err.request) {
        // Request made but no response
        errorMsg = 'Cannot connect to server. Please check your connection and try again.';
        console.error('API URL:', API_URL);
      } else {
        // Something else happened
        errorMsg = err.message || 'An unexpected error occurred';
      }
      
      alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  const getStepClass = (s) => `step-circle ${step >= s ? 'active' : ''}`;

  const getStatusBadge = (status) => {
    const badges = {
      'submitted': { class: 'bg-info', text: 'Submitted' },
      'interview': { class: 'bg-warning', text: 'Pending Interview' },
      'recruited': { class: 'bg-success', text: 'Recruited' },
      'declined': { class: 'bg-danger', text: 'Declined' }
    };
    return badges[status] || { class: 'bg-secondary', text: status || 'New' };
  };

  const getStatusMessage = (status) => {
    const messages = {
      'submitted': 'Your application has been received and is under review. We will contact you via email if you are selected for the next stage.',
      'interview': 'Congratulations! Your application has been moved to the interview stage. We will contact you soon with interview details.',
      'recruited': 'Congratulations! You have been officially recruited into Enactus CKT-UTAS. Welcome to the team!',
      'declined': 'Thank you for your interest in joining Enactus CKT-UTAS. Unfortunately, we are not proceeding with your application at this time.'
    };
    return messages[status] || 'Your application is being processed.';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // If application is submitted, show dashboard view (only for submitted/recruited/declined statuses)
  // Keep form editable for 'New' and 'draft' statuses
  // Check status first - if submitted, show dashboard regardless of application state
  if (status === 'submitted' || status === 'recruited' || status === 'declined' || status === 'interview') {
    const statusBadge = getStatusBadge(status);
    
    return (
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-11">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
              <div style={{width:'50px', height:'50px', background:'#800000', borderRadius:'50%', marginRight:'15px'}}></div>
              <div className="flex-grow-1">
                <h3 className="m-0 fw-bold" style={{color:'#800000'}}>Enactus CKT-UTAS</h3>
                <small className="text-muted">2025 Recruitment Portal</small>
              </div>
              <div>
                <span className={`badge ${statusBadge.class} fs-6 px-3 py-2`}>
                  {statusBadge.text}
                </span>
              </div>
            </div>

            {/* Status Alert */}
            <div className={`alert alert-${status === 'recruited' ? 'success' : status === 'declined' ? 'danger' : 'info'} mb-4`}>
              <h5 className="alert-heading">Application Status</h5>
              <p className="mb-0">{getStatusMessage(status)}</p>
            </div>

            {/* Application Details Card */}
            <div className="app-card">
              <div className="p-5">
                <h4 className="mb-4" style={{color: '#800000'}}>Your Application Details</h4>
                
                {/* Profile Section */}
                <div className="row mb-4">
                  <div className="col-12 col-md-3 text-center mb-3 mb-md-0">
                    {application?.profilePic ? (
                      <img 
                        src={`${API_URL}/${application?.profilePic}`} 
                        alt="Profile" 
                        className="img-fluid rounded-circle"
                        style={{width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #800000'}}
                      />
                    ) : (
                      <div 
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: '120px', 
                          height: '120px', 
                          background: '#e9ecef', 
                          border: '3px solid #800000',
                          color: '#6c757d',
                          fontSize: '0.9rem'
                        }}
                      >
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-9">
                    <h5 className="mb-3">{application?.fullName || 'N/A'}</h5>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <strong>Student ID:</strong> {user?.studentId || 'N/A'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Department:</strong> {application?.department || 'N/A'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Hostel/Residence:</strong> {application?.hostel || 'N/A'}
                      </div>
                      <div className="col-md-6 mb-2">
                        <strong>Phone:</strong> {application?.phone || 'N/A'}
                      </div>
                      {application?.programme && (
                        <div className="col-md-6 mb-2">
                          <strong>Programme:</strong> {application?.programme}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Team Selection */}
                <div className="mb-4">
                  <h5 style={{color: '#800000'}}>Team Selection</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge bg-primary fs-6 px-3 py-2">Field Work Team (Mandatory)</span>
                    {application?.secondaryTeam && (
                      <span className="badge bg-warning fs-6 px-3 py-2">{application?.secondaryTeam}</span>
                    )}
                  </div>
                </div>

                <hr />

                {/* Essays */}
                <div className="mb-4">
                  <h5 style={{color: '#800000'}}>Why do you want to join Enactus CKT-UTAS?</h5>
                  <p className="text-muted" style={{whiteSpace: 'pre-wrap', lineHeight: '1.8'}}>
                    {application?.essayWhy || 'N/A'}
                  </p>
                </div>

                <div className="mb-4">
                  <h5 style={{color: '#800000'}}>What unique skills do you bring?</h5>
                  <p className="text-muted" style={{whiteSpace: 'pre-wrap', lineHeight: '1.8'}}>
                    {application?.essaySkills || 'N/A'}
                  </p>
                </div>

                <hr />

                {/* Files */}
                <div className="mb-4">
                  <h5 style={{color: '#800000'}}>Uploaded Documents</h5>
                  <div className="d-flex gap-3">
                    {application?.cv ? (
                      <a 
                        href={`${API_URL}/${application?.cv}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        📄 View CV
                      </a>
                    ) : (
                      <span className="text-muted">No CV uploaded</span>
                    )}
                  </div>
                </div>

                {/* Submission Date */}
                {application?.createdAt && (
                  <div className="text-muted small">
                    <strong>Submitted on:</strong> {new Date(application?.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="text-center mt-4">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // If no application or draft, show form
  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-md-11">
          
          <div className="d-flex align-items-center mb-4">
             <div style={{width:'50px', height:'50px', background:'#800000', borderRadius:'50%', marginRight:'15px'}}></div>
             <div>
                <h3 className="m-0 fw-bold" style={{color:'#800000'}}>Enactus CKT-UTAS</h3>
                <small className="text-muted">2025 Recruitment Portal</small>
             </div>
          </div>

          <div className="app-card">
            <div className="step-indicator">
              <div className="text-center">
                <div className={getStepClass(1)}>1</div>
                <div className="step-label">Personal</div>
              </div>
              <div className="text-center">
                <div className={getStepClass(2)}>2</div>
                <div className="step-label">Teams</div>
              </div>
              <div className="text-center">
                <div className={getStepClass(3)}>3</div>
                <div className="step-label">Essays</div>
              </div>
              <div className="text-center">
                <div className={getStepClass(4)}>4</div>
                <div className="step-label">Finish</div>
              </div>
            </div>

            <div className="p-3 p-md-5">
              {/* Auto-save indicator */}
              {status !== 'submitted' && status !== 'recruited' && status !== 'declined' && (
                <div className="d-flex justify-content-end mb-3">
                  {isSaving ? (
                    <small className="text-muted">
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Saving...
                    </small>
                  ) : lastSaved ? (
                    <small className="text-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Saved {lastSaved.toLocaleTimeString()}
                    </small>
                  ) : (
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Auto-save enabled
                    </small>
                  )}
                </div>
              )}
              
              {step === 1 && (
                <div className="animate-fade-in animate-slide-in">
                  <h4 className="mb-4" style={{color: '#800000'}}>Let's get to know you</h4>
                  
                  <div className="alert alert-info mb-4">
                    <h6 className="alert-heading"><i className="bi bi-info-circle-fill me-2"></i>Personal Information Guide</h6>
                    <p className="mb-0 small">Please provide accurate information as it appears on your official documents. This information will be used for identification and communication purposes.</p>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                        <FormField 
                            label="Full Name" 
                            value={appData.fullName} 
                            onChange={e => {
                              setAppData({...appData, fullName: e.target.value});
                              if (errors.fullName) setErrors({...errors, fullName: null});
                            }}
                            tooltipText="Enter your name exactly as it appears on your Student ID."
                            required
                            error={errors.fullName}
                            guideText="Use your full legal name as it appears on official documents"
                        />
                    </div>
                    <div className="col-md-6">
                        <FormField 
                            label="Phone Number" 
                            type="tel"
                            value={appData.phone} 
                            onChange={e => {
                              setAppData({...appData, phone: e.target.value});
                              if (errors.phone) setErrors({...errors, phone: null});
                            }}
                            tooltipText="We use this to add you to the WhatsApp platform if recruited."
                            error={errors.phone}
                            guideText="Include country code if applicable (e.g., +233 for Ghana)"
                        />
                    </div>
                    <div className="col-md-6">
                        <FormField 
                            label="Department" 
                            value={appData.department} 
                            onChange={e => {
                              setAppData({...appData, department: e.target.value});
                              if (errors.department) setErrors({...errors, department: null});
                            }}
                            tooltipText="Knowing your department helps us assign field projects relevant to your studies."
                            required
                            error={errors.department}
                            guideText="Enter your academic department (e.g., Computer Science, Business Administration)"
                        />
                    </div>
                    <div className="col-md-6">
                        <FormField 
                            label="Hostel / Residence" 
                            value={appData.hostel} 
                            onChange={e => {
                              setAppData({...appData, hostel: e.target.value});
                              if (errors.hostel) setErrors({...errors, hostel: null});
                            }}
                            tooltipText="Required for arranging transportation during field work."
                            required
                            error={errors.hostel}
                            guideText="Enter your hostel name or residential address"
                        />
                    </div>
                  </div>
                  <div className="text-end mt-4">
                    <button 
                      className="btn btn-enactus" 
                      onClick={() => handleStepChange(2)}
                    >
                      Save & Continue &rarr;
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in animate-slide-in">
                   <h4 className="mb-4" style={{color: '#800000'}}>Select your Role</h4>
                   
                   <div className="alert alert-warning border-start border-4 border-warning mb-4">
                      <strong><i className="bi bi-exclamation-triangle-fill me-2"></i>Important:</strong> All members are automatically part of the 
                      <span className="text-decoration-underline ms-1 fw-bold">Field Work Team</span>. This is mandatory for all Enactus members.
                   </div>

                   <div className="alert alert-info mb-4">
                     <h6 className="alert-heading"><i className="bi bi-lightbulb-fill me-2"></i>Team Selection Guide</h6>
                     <ul className="mb-0 small">
                       <li><strong>IT Team:</strong> Handles technology, website development, and digital solutions</li>
                       <li><strong>Presentation Team:</strong> Creates and delivers pitches, presentations, and public speaking</li>
                       <li><strong>Scripting Team:</strong> Writes content, proposals, and documentation</li>
                       <li><strong>Research Team:</strong> Conducts market research, data analysis, and feasibility studies</li>
                     </ul>
                     <p className="mb-0 mt-2 small"><strong>Tip:</strong> Choose the team that best matches your skills and interests!</p>
                   </div>

                   <FormField 
                      label="Select Your Secondary Team"
                      options={['IT Team', 'Presentation Team', 'Scripting Team', 'Research Team']}
                      value={appData.secondaryTeam}
                      onChange={e => {
                        setAppData({...appData, secondaryTeam: e.target.value});
                        if (errors.secondaryTeam) setErrors({...errors, secondaryTeam: null});
                      }}
                      tooltipText="This is your specialized unit. IT handles tech, Scripting handles content, Presentation handles pitching, Research handles data."
                      required
                      error={errors.secondaryTeam}
                      guideText="This team will be your primary focus area in addition to mandatory field work"
                   />

                   <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-5">
                      <button className="btn btn-light order-2 order-md-1" onClick={() => handleStepChange(1)}>&larr; Back</button>
                      <button className="btn btn-enactus order-1 order-md-2" onClick={() => handleStepChange(3)} style={{flex: '1', maxWidth: '100%'}}>Continue &rarr;</button>
                   </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in animate-slide-in">
                  <h4 className="mb-4" style={{color: '#800000'}}>Make your case</h4>
                  
                  <div className="alert alert-info mb-4">
                    <h6 className="alert-heading"><i className="bi bi-pencil-fill me-2"></i>Essay Writing Guide</h6>
                    <p className="mb-2 small"><strong>Minimum Requirement:</strong> 50 words per essay</p>
                    <p className="mb-0 small"><strong>Tips for great essays:</strong></p>
                    <ul className="mb-0 small">
                      <li>Be specific and authentic - share real experiences and motivations</li>
                      <li>Show passion for social impact and community development</li>
                      <li>Provide concrete examples rather than generic statements</li>
                      <li>Proofread for grammar and clarity</li>
                    </ul>
                  </div>
                  
                  <FormField 
                    label="Why do you want to join Enactus CKT-UTAS?"
                    rows={6}
                    value={appData.essayWhy}
                    onChange={e => {
                      setAppData({...appData, essayWhy: e.target.value});
                      if (errors.essayWhy) setErrors({...errors, essayWhy: null});
                    }}
                    tooltipText="We are looking for passion for social impact. Tell us about a problem you want to solve."
                    required
                    minWords={50}
                    maxChars={1000}
                    error={errors.essayWhy}
                    guideText="Share your motivation, what draws you to Enactus, and what social problems you're passionate about solving"
                    placeholder="Tell us about your passion for social entrepreneurship and community impact..."
                  />

                  <FormField 
                    label="What unique skills do you bring?"
                    rows={6}
                    value={appData.essaySkills}
                    onChange={e => {
                      setAppData({...appData, essaySkills: e.target.value});
                      if (errors.essaySkills) setErrors({...errors, essaySkills: null});
                    }}
                    tooltipText="E.g., Graphic design, public speaking, farming experience, coding, sewing, etc. Please explain in few words for us to understand you better"
                    required
                    minWords={50}
                    maxChars={1000}
                    error={errors.essaySkills}
                    guideText="List your skills, experiences, and talents. Be specific - mention tools you know, projects you've done, or experiences that make you unique"
                    placeholder="Describe your skills, experiences, and what makes you a valuable team member..."
                  />

                  <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-5">
                      <button className="btn btn-light order-2 order-md-1" onClick={() => handleStepChange(2)}>&larr; Back</button>
                      <button className="btn btn-enactus order-1 order-md-2" onClick={() => handleStepChange(4)} style={{flex: '1', maxWidth: '100%'}}>Continue &rarr;</button>
                   </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-fade-in animate-slide-in">
                  <h4 className="mb-4" style={{color: '#800000'}}>Final Steps</h4>
                  
                  <div className="alert alert-warning mb-4">
                    <h6 className="alert-heading"><i className="bi bi-file-earmark-check-fill me-2"></i>Document Upload Requirements</h6>
                    <ul className="mb-0 small">
                      <li><strong>Profile Picture:</strong> JPG or PNG format, max 5MB, clear headshot</li>
                      <li><strong>CV/Resume:</strong> PDF format only, max 10MB</li>
                      <li>Both documents are <strong>required</strong> to submit your application</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4 p-4" style={{background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc'}}>
                    <FormField 
                        label="Upload Profile Picture"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={e => {
                          const file = e.target.files[0];
                          setFiles({...files, profilePic: file});
                          if (errors.profilePic) setErrors({...errors, profilePic: null});
                        }}
                        tooltipText="A clear headshot. This will be used for your ID card if selected."
                        required
                        error={errors.profilePic}
                        guideText="Upload a professional headshot photo (JPG or PNG, max 5MB)"
                    />
                    {files.profilePic && (
                      <div className="alert alert-success py-2 px-3 mt-2">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Selected: {files.profilePic.name} ({(files.profilePic.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                    
                    <FormField 
                        label="Upload CV / Resume (PDF)"
                        type="file"
                        accept="application/pdf"
                        onChange={e => {
                          const file = e.target.files[0];
                          setFiles({...files, cv: file});
                          if (errors.cv) setErrors({...errors, cv: null});
                        }}
                        tooltipText="Include any leadership roles, volunteer work, or technical skills."
                        required
                        error={errors.cv}
                        guideText="Upload your CV/Resume in PDF format (max 10MB). Include relevant experience, skills, and achievements"
                    />
                    {files.cv && (
                      <div className="alert alert-success py-2 px-3 mt-2">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Selected: {files.cv.name} ({(files.cv.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>

                  <div className={`form-check mb-4 ${errors.terms ? 'border border-danger rounded p-3' : ''}`}>
                    <input 
                      className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`} 
                      type="checkbox" 
                      id="terms" 
                      onChange={e => {
                        setAppData({...appData, terms: e.target.checked});
                        if (errors.terms) setErrors({...errors, terms: null});
                      }}
                      checked={appData.terms}
                    />
                    <label className="form-check-label" htmlFor="terms">
                      I agree to the <span style={{color: '#800000', cursor:'pointer'}}>Terms and Conditions</span> and confirm all information is accurate.
                    </label>
                    {errors.terms && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {errors.terms}
                      </div>
                    )}
                  </div>

                  <div className="alert alert-info">
                    <strong><i className="bi bi-info-circle-fill me-2"></i>Before submitting:</strong>
                    <ul className="mb-0 mt-2 small">
                      <li>Review all information for accuracy</li>
                      <li>Ensure all required fields are completed</li>
                      <li>Verify your documents are uploaded correctly</li>
                      <li>Once submitted, you cannot edit your application</li>
                    </ul>
                  </div>

                  <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-5">
                      <button className="btn btn-light order-2 order-md-1" onClick={() => handleStepChange(3)} disabled={isSubmitting}>&larr; Back</button>
                      <button 
                        className="btn btn-enactus order-1 order-md-2" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{flex: '1', maxWidth: '100%'}}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
