import { Link } from 'react-router-dom';

export default function Success() {
  return (
    <div className="container mt-3 mt-md-5 mb-5 px-3">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-7">
          <div className="card p-3 p-md-5 text-center" style={{borderColor: '#800000', borderWidth: '2px'}}>
            {/* Success Icon */}
            <div className="mb-3 mb-md-4">
              <div 
                style={{
                  width: '80px', 
                  height: '80px', 
                  background: '#28a745', 
                  borderRadius: '50%', 
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: 'white'
                }}
                className="d-md-none"
              >
                ✓
              </div>
              <div 
                style={{
                  width: '100px', 
                  height: '100px', 
                  background: '#28a745', 
                  borderRadius: '50%', 
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '50px',
                  color: 'white'
                }}
                className="d-none d-md-flex"
              >
                ✓
              </div>
            </div>

            {/* Success Message */}
            <h2 className="mb-3" style={{color: '#800000', fontSize: '1.5rem'}}>Application Submitted Successfully!</h2>
            <p className="lead mb-4">
              Thank you for your interest in joining <strong>Enactus UTAS</strong>.
            </p>
            
            <div className="alert alert-info" role="alert">
              <h5 className="alert-heading">What's Next?</h5>
              <p className="mb-0">
                Your application has been received and is under review. 
                We will contact you via email if you are selected for the next stage of the recruitment process.
              </p>
            </div>

            <div className="mt-4">
              <p className="text-muted mb-4">
                You can check your application status by logging into your account.
              </p>
              
              <Link 
                to="/" 
                className="btn btn-lg w-100 w-md-auto"
                style={{
                  backgroundColor: '#FFC107', 
                  color: 'black',
                  padding: '12px 30px',
                  fontWeight: '600'
                }}
              >
                Go to Login
              </Link>
            </div>

            <div className="mt-5 pt-4 border-top">
              <small className="text-muted">
                Need help? Contact us at <a href="" style={{color: '#800000'}}>+233506063217</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

