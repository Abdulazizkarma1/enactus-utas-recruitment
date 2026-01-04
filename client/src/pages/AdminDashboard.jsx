import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL, { getFileUrl } from '../config/api';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#800000', '#FFC107', '#28a745', '#dc3545', '#17a2b8', '#6c757d'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [voucherAmount, setVoucherAmount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Logout function
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  // Auto-logout after 30 minutes of inactivity (for admin)
  useInactivityLogout(30, () => {
    console.log('Admin logged out due to inactivity');
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch applicants and vouchers first (critical data)
        const [applicantsRes, vouchersRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/applicants`),
          axios.get(`${API_URL}/api/admin/vouchers`)
        ]);
        setApplicants(applicantsRes.data);
        setFilteredApplicants(applicantsRes.data);
        setVouchers(vouchersRes.data);
        
        // Fetch statistics separately (non-critical, can fail gracefully)
        try {
          const statsRes = await axios.get(`${API_URL}/api/admin/statistics`);
          console.log('Statistics loaded:', statsRes.data);
          setStatistics(statsRes.data);
        } catch (statsError) {
          console.error('Error fetching statistics:', statsError);
          // Don't block the dashboard if statistics fail
          // Calculate basic stats from loaded data
          const statusCounts = {};
          applicantsRes.data.forEach(app => {
            const status = app.status || 'submitted';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          setStatistics({
            applications: {
              total: applicantsRes.data.length,
              byStatus: {
                new: statusCounts['New'] || 0,
                draft: statusCounts['draft'] || 0,
                submitted: statusCounts['submitted'] || 0,
                interview: statusCounts['interview'] || 0,
                recruited: statusCounts['recruited'] || 0,
                declined: statusCounts['declined'] || 0
              },
              perDay: [],
              perMonth: []
            },
            vouchers: {
              total: vouchersRes.data.length,
              used: vouchersRes.data.filter(v => v.isUsed).length,
              available: vouchersRes.data.filter(v => !v.isUsed).length,
              usedPerDay: [],
              usedPerMonth: []
            }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading dashboard data: ' + (error.response?.data?.msg || error.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredApplicants(applicants);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = applicants.filter(app => {
      const name = (app.fullName || '').toLowerCase();
      const studentId = (app.user?.studentId || '').toLowerCase();
      const department = (app.department || '').toLowerCase();
      const email = (app.user?.email || '').toLowerCase();
      const status = (app.status || '').toLowerCase();
      
      return name.includes(term) || 
             studentId.includes(term) || 
             department.includes(term) ||
             email.includes(term) ||
             status.includes(term);
    });
    setFilteredApplicants(filtered);
  }, [searchTerm, applicants]);

  const generateVouchers = async () => {
    if (!voucherAmount || voucherAmount < 1) {
      alert('Please enter a valid number of vouchers');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/vouchers`, { amount: voucherAmount });
      alert(`Successfully generated ${res.data.length} voucher(s)!`);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert(error.response?.data?.msg || 'Error generating vouchers');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteVoucher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this voucher? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/admin/vouchers/${id}`);
      alert('Voucher deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert(error.response?.data?.msg || 'Error deleting voucher');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/status/${id}`, { status });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      alert(error.response?.data?.msg || 'Error updating status');
    }
  };

  const unusedVouchers = vouchers.filter(v => !v.isUsed);
  const usedVouchers = vouchers.filter(v => v.isUsed);

  // Prepare chart data
  const statusData = statistics ? [
    { name: 'New', value: statistics.applications.byStatus.new },
    { name: 'Draft', value: statistics.applications.byStatus.draft },
    { name: 'Submitted', value: statistics.applications.byStatus.submitted },
    { name: 'Interview', value: statistics.applications.byStatus.interview },
    { name: 'Recruited', value: statistics.applications.byStatus.recruited },
    { name: 'Declined', value: statistics.applications.byStatus.declined }
  ].filter(item => item.value > 0) : [];

  if (isLoading) {
    return (
      <div className="container-fluid px-2 px-md-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="bg-white border-bottom shadow-sm sticky-top" style={{zIndex: 1000}}>
        <div className="container-fluid px-3 px-md-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0" style={{color: '#800000', fontSize: '1.75rem', fontWeight: 'bold'}}>
                <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
              </h2>
              <small className="text-muted">Enactus UTAS Recruitment Management</small>
            </div>
            <button 
              className="btn btn-outline-danger"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex">
        {/* Sidebar Menu */}
        <div className="bg-light border-end" style={{width: '250px', minHeight: 'calc(100vh - 100px)'}}>
          <nav className="nav flex-column p-3">
            <button
              className={`nav-link text-start mb-2 rounded ${activeTab === 'dashboard' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{
                color: activeTab === 'dashboard' ? '#800000' : '#6c757d',
                fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
                border: 'none',
                padding: '12px 16px'
              }}
            >
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </button>
            <button
              className={`nav-link text-start mb-2 rounded ${activeTab === 'applicants' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setActiveTab('applicants')}
              style={{
                color: activeTab === 'applicants' ? '#800000' : '#6c757d',
                fontWeight: activeTab === 'applicants' ? 'bold' : 'normal',
                border: 'none',
                padding: '12px 16px'
              }}
            >
              <i className="bi bi-people me-2"></i>Applicants
              {applicants.length > 0 && (
                <span className="badge bg-primary ms-2">{applicants.length}</span>
              )}
            </button>
            <button
              className={`nav-link text-start mb-2 rounded ${activeTab === 'vouchers' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setActiveTab('vouchers')}
              style={{
                color: activeTab === 'vouchers' ? '#800000' : '#6c757d',
                fontWeight: activeTab === 'vouchers' ? 'bold' : 'normal',
                border: 'none',
                padding: '12px 16px'
              }}
            >
              <i className="bi bi-ticket-perforated me-2"></i>Vouchers
              {vouchers.length > 0 && (
                <span className="badge bg-warning ms-2">{vouchers.length}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 px-3 px-md-4 py-4" style={{minHeight: 'calc(100vh - 100px)'}}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Statistics Cards */}
              {statistics && (
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #800000 0%, #a00000 100%)', color: 'white'}}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-white-50 mb-1">Total Applications</h6>
                            <h2 className="mb-0 fw-bold">{statistics.applications.total}</h2>
                          </div>
                          <i className="bi bi-file-earmark-text" style={{fontSize: '2.5rem', opacity: 0.3}}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white'}}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-white-50 mb-1">Recruited</h6>
                            <h2 className="mb-0 fw-bold">{statistics.applications.byStatus.recruited}</h2>
                          </div>
                          <i className="bi bi-check-circle" style={{fontSize: '2.5rem', opacity: 0.3}}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #FFC107 0%, #ffca2c 100%)', color: 'white'}}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-white-50 mb-1">Interview Stage</h6>
                            <h2 className="mb-0 fw-bold">{statistics.applications.byStatus.interview}</h2>
                          </div>
                          <i className="bi bi-clock-history" style={{fontSize: '2.5rem', opacity: 0.3}}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', color: 'white'}}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="text-white-50 mb-1">Total Vouchers</h6>
                            <h2 className="mb-0 fw-bold">{statistics.vouchers.total}</h2>
                          </div>
                          <i className="bi bi-ticket-perforated" style={{fontSize: '2.5rem', opacity: 0.3}}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Section */}
              {statistics && (
                <div className="row g-3">
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{color: '#800000'}}>
                          <i className="bi bi-bar-chart me-2"></i>Applications by Status
                        </h5>
                      </div>
                      <div className="card-body">
                        {statusData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-muted py-5">No data available</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{color: '#800000'}}>
                          <i className="bi bi-graph-up me-2"></i>Applications (Last 30 Days)
                        </h5>
                      </div>
                      <div className="card-body">
                        {statistics.applications.perDay.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={statistics.applications.perDay.map(item => ({ date: item._id, count: item.count }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="count" stroke="#800000" strokeWidth={2} name="Applications" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-muted py-5">No data for the last 30 days</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{color: '#800000'}}>
                          <i className="bi bi-calendar-month me-2"></i>Applications (Last 12 Months)
                        </h5>
                      </div>
                      <div className="card-body">
                        {statistics.applications.perMonth.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statistics.applications.perMonth.map(item => ({ month: item._id, count: item.count }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#800000" name="Applications" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-muted py-5">No data for the last 12 months</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white border-bottom">
                        <h5 className="mb-0" style={{color: '#800000'}}>
                          <i className="bi bi-ticket-perforated me-2"></i>Voucher Usage (Last 30 Days)
                        </h5>
                      </div>
                      <div className="card-body">
                        {statistics.vouchers.usedPerDay.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={statistics.vouchers.usedPerDay.map(item => ({ date: item._id, count: item.count }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="count" stroke="#FFC107" strokeWidth={2} name="Vouchers Used" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-muted py-5">No voucher usage in the last 30 days</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applicants Tab */}
          {activeTab === 'applicants' && (
            <div>
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
                    <h4 className="mb-0" style={{color: '#800000', fontSize: '1.25rem'}}>
                      <i className="bi bi-people me-2"></i>Applicants ({filteredApplicants.length} of {applicants.length})
                    </h4>
                    <div className="input-group" style={{maxWidth: '400px'}}>
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, student ID, department, email, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setSearchTerm('')}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {filteredApplicants.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      {searchTerm ? 'No applicants found matching your search.' : 'No applicants yet.'}
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Student ID</th>
                            <th>Department</th>
                            <th>Teams</th>
                            <th>Files</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApplicants.map(app => (
                            <tr key={app._id}>
                              <td>
                                {app.profilePic ? (
                                  <img 
                                    src={getFileUrl(app.profilePic)} 
                                    alt="profile" 
                                    width="50" 
                                    height="50"
                                    style={{objectFit: 'cover', borderRadius: '50%'}}
                                  />
                                ) : (
                                  <div 
                                    style={{
                                      width: '50px', 
                                      height: '50px', 
                                      background: '#e9ecef', 
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#6c757d',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    No Photo
                                  </div>
                                )}
                              </td>
                              <td>
                                <strong>{app.fullName || 'N/A'}</strong>
                              </td>
                              <td>
                                <small>{app.user?.studentId || 'N/A'}</small>
                              </td>
                              <td>
                                <small>{app.department || 'N/A'}</small>
                              </td>
                              <td>
                                <small>
                                  <span className="badge bg-info">Field Work</span>
                                  {app.secondaryTeam && (
                                    <>
                                      <br />
                                      <span className="badge bg-warning mt-1">{app.secondaryTeam}</span>
                                    </>
                                  )}
                                </small>
                              </td>
                              <td>
                                {app.cv ? (
                                  <a 
                                    href={getFileUrl(app.cv)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-info"
                                  >
                                    <i className="bi bi-file-earmark-pdf me-1"></i>View CV
                                  </a>
                                ) : (
                                  <span className="text-muted small">No CV</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${
                                  app.status === 'recruited' ? 'bg-success' :
                                  app.status === 'interview' ? 'bg-warning' :
                                  app.status === 'declined' ? 'bg-danger' :
                                  'bg-secondary'
                                }`}>
                                  {app.status || 'submitted'}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      setSelectedApplicant(app);
                                      setShowDetailsModal(true);
                                    }}
                                    title="View full details"
                                  >
                                    <i className="bi bi-eye me-1"></i>Details
                                  </button>
                                  <a
                                    href={`${API_URL}/api/admin/pdf/${app._id}`}
                                    className="btn btn-sm btn-danger"
                                    download
                                    title="Download PDF summary"
                                  >
                                    <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                                  </a>
                                  <select 
                                    className="form-select form-select-sm"
                                    onChange={(e) => updateStatus(app._id, e.target.value)} 
                                    value={app.status || 'submitted'}
                                  >
                                    <option value="submitted">Submitted</option>
                                    <option value="interview">Pending Interview</option>
                                    <option value="recruited">Recruited</option>
                                    <option value="declined">Declined</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vouchers Tab */}
          {activeTab === 'vouchers' && (
            <div>
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                    <h4 className="mb-0" style={{color: '#800000', fontSize: '1.25rem'}}>
                      <i className="bi bi-ticket-perforated me-2"></i>Voucher Management
                    </h4>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        className="form-control"
                        style={{width: '100px', minWidth: '80px'}}
                        min="1"
                        max="100"
                        value={voucherAmount}
                        onChange={(e) => setVoucherAmount(parseInt(e.target.value) || 1)}
                        placeholder="Amount"
                      />
                      <button 
                        onClick={generateVouchers} 
                        className="btn btn-warning"
                        disabled={isGenerating}
                        style={{whiteSpace: 'nowrap'}}
                      >
                        {isGenerating ? 'Generating...' : 'Generate Vouchers'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {/* Voucher Statistics */}
                  <div className="row mb-3 g-2">
                    <div className="col-12 col-sm-4">
                      <div className="card bg-light h-100 border-0">
                        <div className="card-body text-center p-3">
                          <h6 className="text-muted mb-1 small">Total Vouchers</h6>
                          <h4 className="mb-0" style={{color: '#800000'}}>{vouchers.length}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-4">
                      <div className="card bg-success bg-opacity-10 h-100 border-0">
                        <div className="card-body text-center p-3">
                          <h6 className="text-muted mb-1 small">Available</h6>
                          <h4 className="mb-0 text-success">{unusedVouchers.length}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-4">
                      <div className="card bg-secondary bg-opacity-10 h-100 border-0">
                        <div className="card-body text-center p-3">
                          <h6 className="text-muted mb-1 small">Used</h6>
                          <h4 className="mb-0 text-secondary">{usedVouchers.length}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vouchers Table */}
                  <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Serial Number</th>
                          <th>PIN</th>
                          <th>Status</th>
                          <th>Used By</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vouchers.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-4">
                              No vouchers generated yet. Click "Generate Vouchers" to create some.
                            </td>
                          </tr>
                        ) : (
                          vouchers.map(voucher => (
                            <tr key={voucher._id} className={voucher.isUsed ? 'table-secondary' : ''}>
                              <td>
                                <strong style={{fontFamily: 'monospace', fontSize: '1.1em'}}>
                                  {voucher.serialNumber}
                                </strong>
                              </td>
                              <td>
                                <code style={{fontSize: '1.1em'}}>{voucher.pin}</code>
                              </td>
                              <td>
                                {voucher.isUsed ? (
                                  <span className="badge bg-secondary">Used</span>
                                ) : (
                                  <span className="badge bg-success">Available</span>
                                )}
                              </td>
                              <td>
                                {voucher.isUsed && voucher.usedBy ? (
                                  <small>
                                    {voucher.usedBy.studentId || voucher.usedBy.email}
                                  </small>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(voucher.createdAt).toLocaleDateString()}
                                </small>
                              </td>
                              <td>
                                {!voucher.isUsed && (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteVoucher(voucher._id)}
                                    title="Delete voucher"
                                  >
                                    <i className="bi bi-trash me-1"></i>Delete
                                  </button>
                                )}
                                {voucher.isUsed && (
                                  <span className="text-muted small">Cannot delete</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Details Modal */}
      {showDetailsModal && selectedApplicant && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-scrollable" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#800000', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Applicant Details: {selectedApplicant.fullName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    {selectedApplicant.profilePic ? (
                      <img 
                        src={getFileUrl(selectedApplicant.profilePic)} 
                        alt="Profile" 
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light rounded p-5">
                        <i className="bi bi-person-circle" style={{ fontSize: '5rem', color: '#ccc' }}></i>
                        <p className="text-muted mt-2">No Photo</p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <h6 style={{ color: '#800000' }}>Personal Information</h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Full Name:</strong></td>
                          <td>{selectedApplicant.fullName || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Student ID:</strong></td>
                          <td>{selectedApplicant.user?.studentId || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{selectedApplicant.user?.email || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Date of Birth:</strong></td>
                          <td>{selectedApplicant.dob ? new Date(selectedApplicant.dob).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Phone:</strong></td>
                          <td>{selectedApplicant.phone || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <hr />

                <h6 style={{ color: '#800000' }}>Academic Information</h6>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Department:</strong></td>
                      <td>{selectedApplicant.department || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Programme:</strong></td>
                      <td>{selectedApplicant.programme || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Hostel:</strong></td>
                      <td>{selectedApplicant.hostel || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>

                <hr />

                <h6 style={{ color: '#800000' }}>Team Selection</h6>
                <p>
                  <span className="badge bg-info me-2">Field Work Team (Mandatory)</span>
                  {selectedApplicant.secondaryTeam && (
                    <span className="badge bg-warning">{selectedApplicant.secondaryTeam}</span>
                  )}
                </p>

                <hr />

                <h6 style={{ color: '#800000' }}>Application Status</h6>
                <span className={`badge ${
                  selectedApplicant.status === 'recruited' ? 'bg-success' :
                  selectedApplicant.status === 'interview' ? 'bg-warning' :
                  selectedApplicant.status === 'declined' ? 'bg-danger' :
                  'bg-secondary'
                }`}>
                  {selectedApplicant.status || 'submitted'}
                </span>

                <hr />

                <h6 style={{ color: '#800000' }}>Essay: Why do you want to join Enactus UTAS?</h6>
                <div className="card bg-light p-3 mb-3">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {selectedApplicant.essayWhy || 'Not provided'}
                  </p>
                </div>

                <h6 style={{ color: '#800000' }}>Essay: What skills and experiences can you bring to Enactus UTAS?</h6>
                <div className="card bg-light p-3 mb-3">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {selectedApplicant.essaySkills || 'Not provided'}
                  </p>
                </div>

                <hr />

                <h6 style={{ color: '#800000' }}>Attachments</h6>
                <div className="d-flex gap-2">
                  {selectedApplicant.cv ? (
                    <a 
                      href={getFileUrl(selectedApplicant.cv)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-info"
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i>View CV
                    </a>
                  ) : (
                    <span className="text-muted">No CV uploaded</span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <a
                  href={`${API_URL}/api/admin/pdf/${selectedApplicant._id}`}
                  className="btn btn-danger"
                  download
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>Download PDF Summary
                </a>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
