import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [voucherAmount, setVoucherAmount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/applicants`);
        setApplicants(res.data);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
    };
    
    const fetchVouchers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/vouchers`);
        setVouchers(res.data);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }
    };

    fetchApplicants();
    fetchVouchers();
  }, [refreshTrigger]);

  const generateVouchers = async () => {
    if (!voucherAmount || voucherAmount < 1) {
      alert('Please enter a valid number of vouchers');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/vouchers`, { amount: voucherAmount });
      alert(`Successfully generated ${res.data.length} voucher(s)!`);
      setRefreshTrigger(prev => prev + 1); // Refresh to show new vouchers
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
      setRefreshTrigger(prev => prev + 1); // Refresh to update list
    } catch (error) {
      alert(error.response?.data?.msg || 'Error deleting voucher');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/status/${id}`, { status });
      setRefreshTrigger(prev => prev + 1); // Refresh list
    } catch (error) {
      alert(error.response?.data?.msg || 'Error updating status');
    }
  };

  const unusedVouchers = vouchers.filter(v => !v.isUsed);
  const usedVouchers = vouchers.filter(v => v.isUsed);

  return (
    <div className="container-fluid px-2 px-md-3">
      <h2 className="my-3" style={{color: '#800000', fontSize: '1.5rem'}}>Admin Dashboard</h2>
      
      {/* Voucher Management Section */}
      <div className="card mb-4 p-3 p-md-4" style={{borderColor: '#800000', borderWidth: '2px'}}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <h4 className="mb-0" style={{color: '#800000', fontSize: '1.25rem'}}>Voucher Management</h4>
          <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
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
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Voucher Statistics */}
        <div className="row mb-3 g-2">
          <div className="col-12 col-sm-4">
            <div className="card bg-light h-100">
              <div className="card-body text-center p-3">
                <h6 className="text-muted mb-1 small">Total Vouchers</h6>
                <h4 className="mb-0" style={{color: '#800000'}}>{vouchers.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card bg-success bg-opacity-10 h-100">
              <div className="card-body text-center p-3">
                <h6 className="text-muted mb-1 small">Available</h6>
                <h4 className="mb-0 text-success">{unusedVouchers.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card bg-secondary bg-opacity-10 h-100">
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
                          🗑️ Delete
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

      {/* Applicants Section */}
      <div className="card p-3 p-md-4" style={{borderColor: '#800000', borderWidth: '2px'}}>
        <h4 className="mb-3" style={{color: '#800000', fontSize: '1.25rem'}}>Applicants ({applicants.length})</h4>
        {applicants.length === 0 ? (
          <div className="text-center text-muted py-4">
            No applicants yet.
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(app => (
                  <tr key={app._id}>
                    <td>
                      {app.profilePic ? (
                        <img 
                          src={`${API_URL}/${app.profilePic}`} 
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
                            color: '#6c757d'
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
                          href={`${API_URL}/${app.cv}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-info"
                        >
                          📄 View CV
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
