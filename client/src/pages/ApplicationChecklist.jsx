import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationChecklist() {
  const [checkedItems, setCheckedItems] = useState({});
  const navigate = useNavigate();

  const checklistItems = [
    { id: 'info', text: 'Personal information ready (Full name, Student ID, Department, Hostel)' },
    { id: 'phone', text: 'Active phone number for WhatsApp communication' },
    { id: 'team', text: 'Decided on your secondary team preference' },
    { id: 'essay1', text: 'Prepared essay: "Why do you want to join Enactus?" (minimum 50 words)' },
    { id: 'essay2', text: 'Prepared essay: "What unique skills do you bring?" (minimum 50 words)' },
    { id: 'photo', text: 'Professional headshot photo ready (JPG or PNG, max 5MB)' },
    { id: 'cv', text: 'Updated CV/Resume in PDF format (max 10MB)' },
    { id: 'time', text: 'Set aside 15-20 minutes to complete the application' },
    { id: 'review', text: 'Ready to review all information before submission' }
  ];

  const handleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allChecked = checklistItems.every(item => checkedItems[item.id]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="container mt-3 mt-md-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="app-card p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div 
                style={{
                  width: '80px', 
                  height: '80px', 
                  background: 'linear-gradient(135deg, #800000 0%, #FFC107 100%)', 
                  borderRadius: '50%', 
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(128, 0, 0, 0.3)'
                }}
              >
                ✓
              </div>
              <h2 className="mb-2" style={{color: '#800000'}}>Application Preparation Checklist</h2>
              <p className="text-muted">
                Please review and check off each item before starting your application
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Progress</span>
                <span className="small fw-bold" style={{color: '#800000'}}>
                  {checkedCount} / {checklistItems.length} items checked
                </span>
              </div>
              <div className="progress" style={{height: '10px', borderRadius: '10px'}}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{
                    width: `${(checkedCount / checklistItems.length) * 100}%`,
                    backgroundColor: '#800000',
                    transition: 'width 0.5s ease'
                  }}
                ></div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="mb-4">
              {checklistItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="d-flex align-items-start mb-3 p-3 rounded"
                  style={{
                    background: checkedItems[item.id] ? '#f0f8f0' : '#f8f9fa',
                    border: checkedItems[item.id] ? '2px solid #28a745' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    transform: checkedItems[item.id] ? 'translateX(5px)' : 'translateX(0)'
                  }}
                >
                  <div className="form-check me-3" style={{minWidth: '30px'}}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={item.id}
                      checked={checkedItems[item.id] || false}
                      onChange={() => handleCheck(item.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: '#800000'
                      }}
                    />
                  </div>
                  <label 
                    htmlFor={item.id} 
                    className="flex-grow-1"
                    style={{
                      cursor: 'pointer',
                      textDecoration: checkedItems[item.id] ? 'line-through' : 'none',
                      color: checkedItems[item.id] ? '#6c757d' : '#333',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <strong>{index + 1}.</strong> {item.text}
                  </label>
                  {checkedItems[item.id] && (
                    <i className="bi bi-check-circle-fill text-success ms-2" style={{fontSize: '1.2rem'}}></i>
                  )}
                </div>
              ))}
            </div>

            {/* Information Box */}
            <div className="alert alert-info mb-4">
              <h6 className="alert-heading"><i className="bi bi-info-circle-fill me-2"></i>Important Notes</h6>
              <ul className="mb-0 small">
                <li>You can save your progress and return later to complete the application</li>
                <li>All fields marked with <span className="text-danger">*</span> are required</li>
                <li>Your application will be automatically saved as you fill it out</li>
                <li>Once submitted, you cannot edit your application</li>
                <li>Make sure all information is accurate before final submission</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-between">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
                }}
              >
                ← Back to Login
              </button>
              <button
                className="btn btn-enactus"
                onClick={() => {
                  sessionStorage.setItem('hasSeenChecklist', 'true');
                  navigate('/dashboard');
                }}
                disabled={!allChecked}
                style={{
                  opacity: allChecked ? 1 : 0.6,
                  cursor: allChecked ? 'pointer' : 'not-allowed'
                }}
              >
                {allChecked ? 'Start Application →' : `Complete Checklist (${checklistItems.length - checkedCount} remaining)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

