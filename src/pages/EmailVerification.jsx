import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authService } from '../services/authService';
import '../css/EmailVerification.css';

const EmailVerification = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your account…');
  const [resendEmail, setResendEmail] = useState(email);
  const [resendStatus, setResendStatus] = useState('idle'); // idle, loading, success, error
  const [resendMessage, setResendMessage] = useState('');
  
  const navigate = useNavigate();
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;
    
    const verifyToken = async () => {
      try {
        if (!token) {
          setStatus('error');
          setMessage('This verification link is missing a token. Open the link from your email or use “Resend verification” on the login page.');
          return;
        }

        verificationStarted.current = true;
        const response = await authService.verifyEmail(token, email);
        setStatus('success');
        setMessage(response.message || 'Your account has been verified successfully.');
        
        // Automatic redirect after success
        setTimeout(() => {
          navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'This link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token, email, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendStatus('error');
      setResendMessage('Please enter your email address.');
      return;
    }

    setResendStatus('loading');
    try {
      const response = await authService.resendVerification(resendEmail);
      setResendStatus('success');
      setResendMessage(response.message || 'Verification email resent successfully.');
    } catch (error) {
      setResendStatus('error');
      setResendMessage(error.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        {status === 'loading' && (
          <>
            <div className="verification-icon loading verification-icon--spinner">
              <FaSpinner className="ev-spin" aria-hidden />
            </div>
            <h2>Verifying your account…</h2>
            <p>Please wait while we confirm your email link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verification-icon success">
              <FaCheckCircle aria-hidden />
            </div>
            <h2>Account verified</h2>
            <p>{message}</p>
            <div className="verification-actions">
              <Link to="/login" className="btn-verify-primary">Go to Login</Link>
              <Link to="/" className="btn-verify-secondary">Go to Home</Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verification-icon error">
              <FaTimesCircle aria-hidden />
            </div>
            <h2>Couldn&apos;t verify</h2>
            <p>{message}</p>
            
            <div className="resend-section">
              <form onSubmit={handleResend} className="resend-form">
                <label htmlFor="resendEmail">Email Address</label>
                <input
                  type="email"
                  id="resendEmail"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  disabled={resendStatus === 'loading'}
                />
                <button 
                  type="submit" 
                  className="btn-verify-primary" 
                  disabled={resendStatus === 'loading'}
                  style={{ width: '100%' }}
                >
                  {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
              
              {resendMessage && (
                <p style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.9rem', 
                  color: resendStatus === 'success' ? '#2e7d32' : '#d32f2f',
                  fontWeight: '600'
                }}>
                  {resendMessage}
                </p>
              )}
            </div>
            
            <div className="verification-actions" style={{ marginTop: '2rem' }}>
              <Link to="/login" className="btn-verify-secondary">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
