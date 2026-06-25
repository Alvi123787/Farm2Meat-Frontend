import React, { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/authContextCore'
import '../css/ResetPassword.css'

const validatePassword = (password) => String(password || '').length >= 6

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const getPasswordStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '' }
  if (pwd.length < 6) return { level: 1, label: 'Too short', color: '#e53e3e' }
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNum = /[0-9]/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  const score = [pwd.length >= 8, hasUpper, hasNum, hasSpecial].filter(Boolean).length
  if (score <= 1) return { level: 1, label: 'Weak', color: '#e53e3e' }
  if (score === 2) return { level: 2, label: 'Fair', color: '#D4AF37' }
  if (score === 3) return { level: 3, label: 'Good', color: '#38a169' }
  return { level: 4, label: 'Strong', color: '#276749' }
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { token } = useParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const passwordsMatch = confirm.length > 0 && password === confirm

  const canSubmit = useMemo(() => {
    if (!token) return false
    if (!validatePassword(password)) return false
    if (password !== confirm) return false
    return true
  }, [confirm, password, token])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!token) { setError('Invalid or expired reset link.'); return }
    if (!validatePassword(password)) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const result = await authService.resetPassword({ token, password })
      const jwt = result?.token || ''
      const role = result?.role || 'user'
      login(jwt)
      setDone(true)
      setTimeout(() => navigate(role === 'admin' ? '/admin' : '/'), 1800)
    } catch (err) {
      setError(err?.message || 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rp-root">
      {/* ── Left panel ── */}
      <div className="rp-left">
        <div className="rp-left-overlay" />

        {/* decorative meat-themed graphic elements */}
        <div className="rp-decor rp-decor-1" />
        <div className="rp-decor rp-decor-2" />
        <div className="rp-decor rp-decor-3" />

        <div className="rp-left-content">
          <div className="rp-brand">
            <div className="rp-logo-ring">
              <img
                src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png"
                alt="MeatByAlvi"
              />
            </div>
            <span className="rp-brand-name">MeatByAlvi</span>
          </div>

          <div className="rp-left-body">
            <h2 className="rp-left-headline">Secure<br />your account</h2>
            <p className="rp-left-sub">
              Choose a strong password to keep your MeatByAlvi account protected.
            </p>

            <div className="rp-tips">
              {['At least 6 characters', 'Mix letters & numbers', 'Add a special character'].map((tip) => (
                <div className="rp-tip" key={tip}>
                  <span className="rp-tip-dot" />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="rp-left-footer">
            <span className="rp-tagline">Premium Quality · Fresh Daily</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="rp-right">
        <div className="rp-card">
          {!done ? (
            <>
              <div className="rp-card-header">
                <div className="rp-icon-badge">
                  <LockIcon />
                </div>
                <h1 className="rp-title">Set new password</h1>
                <p className="rp-subtitle">Enter and confirm your new password below.</p>
              </div>

              <form className="rp-form" onSubmit={onSubmit} noValidate>
                {/* New password */}
                <div className="rp-field">
                  <label htmlFor="rp-password" className="rp-label">New Password</label>
                  <div className={`rp-input-wrap ${error && !password ? 'rp-input-error' : ''}`}>
                    <span className="rp-input-icon"><LockIcon /></span>
                    <input
                      id="rp-password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      placeholder="Min. 6 characters"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowPwd(v => !v)}
                      tabIndex={-1}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPwd} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="rp-strength">
                      <div className="rp-strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className="rp-strength-bar"
                            style={{ backgroundColor: i <= strength.level ? strength.color : 'var(--border-light)' }}
                          />
                        ))}
                      </div>
                      <span className="rp-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="rp-field">
                  <label htmlFor="rp-confirm" className="rp-label">Confirm Password</label>
                  <div className={`rp-input-wrap ${error && !passwordsMatch && confirm ? 'rp-input-error' : passwordsMatch ? 'rp-input-ok' : ''}`}>
                    <span className="rp-input-icon"><LockIcon /></span>
                    <input
                      id="rp-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError('') }}
                      placeholder="Re-enter password"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    {passwordsMatch && (
                      <span className="rp-match-check"><CheckIcon /></span>
                    )}
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm.length > 0 && !passwordsMatch && (
                    <span className="rp-field-hint rp-hint-error">Passwords don't match</span>
                  )}
                </div>

                {/* Error banner */}
                {error && (
                  <div className="rp-error-banner" role="alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={`rp-submit ${loading ? 'rp-submit-loading' : ''}`}
                  disabled={loading || !canSubmit}
                >
                  {loading ? (
                    <span className="rp-spinner-wrap">
                      <span className="rp-spinner" />
                      Resetting…
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <div className="rp-back">
                <Link to="/login" className="rp-back-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="rp-success">
              <div className="rp-success-ring">
                <CheckIcon />
              </div>
              <h2 className="rp-success-title">Password updated!</h2>
              <p className="rp-success-body">Redirecting you to your account…</p>
              <div className="rp-success-bar">
                <div className="rp-success-bar-fill" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}