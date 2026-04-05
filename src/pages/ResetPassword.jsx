import React, { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/authContextCore';
import '../css/ForgotPassword.css'

const validatePassword = (password) => String(password || '').length >= 6

export default function ResetPassword() {
  const navigate = useNavigate()
  const { login } = useAuth();
  const { token } = useParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const canSubmit = useMemo(() => {
    if (!token) return false
    if (!validatePassword(password)) return false
    if (password !== confirm) return false
    return true
  }, [confirm, password, token])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Invalid reset link')
      return
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await authService.resetPassword({ token, password })
      const jwt = result?.token || ''
      const role = result?.role || 'user'
      login(jwt);
      setDone(true)
      navigate(role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-overlay" />
        <div className="auth-branding">
          <div className="auth-logo">
            <span>LiveStock Pro</span>
          </div>
          <div className="auth-quote">
            <h2>Reset Password</h2>
            <p>Choose a strong password to secure your account.</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          {!done ? (
            <>
              <div className="auth-header">
                <h1>Set New Password</h1>
                <p>Enter your new password below.</p>
              </div>

              <form className="auth-form" onSubmit={onSubmit}>
                <div className={`form-group ${error ? 'error' : ''}`}>
                  <label htmlFor="rp-password">New Password</label>
                  <div className="input-wrapper">
                    <input
                      id="rp-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                    />
                    <div className="input-focus-border" />
                  </div>
                </div>

                <div className={`form-group ${error ? 'error' : ''}`}>
                  <label htmlFor="rp-confirm">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      id="rp-confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <div className="input-focus-border" />
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading || !canSubmit}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="auth-footer">
                <Link to="/login" className="back-link">Back to Login</Link>
              </div>
            </>
          ) : (
            <div className="success-container">
              <h2>Password updated</h2>
              <p>You can continue to your account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
