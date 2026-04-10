import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
  FaSpinner,
  FaStar,
  FaLeaf,
  FaTruck,
  FaVideo,
  FaHandshake
} from 'react-icons/fa'
import '../css/Login.css'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/authContextCore'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resendBusy, setResendBusy] = useState(false)
  const [resendOk, setResendOk] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')
  const [formData, setFormData] = useState({ email: '', password: '' })

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (needsVerify) setNeedsVerify(false)
    if (resendOk) setResendOk('')
  }

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const email = String(formData.email || '').trim()
    const password = String(formData.password || '')

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const result = await authService.login({ email, password })
      login(result.token)

      if (result.role === 'admin') {
        navigate('/admin')
      } else {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (err) {
      const status = err?.status
      const msg = err?.message || 'Login failed. Please try again.'
      setError(msg)
      setNeedsVerify(status === 403 || err?.code === 'EMAIL_NOT_VERIFIED' || /verify your email/i.test(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const email = String(formData.email || '').trim().toLowerCase()
    if (!isValidEmail(email)) {
      setError('Enter your email above, then resend the verification link.')
      return
    }
    setResendBusy(true)
    setResendOk('')
    setError('')
    try {
      await authService.resendVerification(email)
      setResendOk('Verification email sent. Check your inbox.')
    } catch (e) {
      if (e?.status === 404) {
        setError('No account found with this email. Check the email or sign up first.')
      } else {
        setError(e?.message || 'Could not resend email.')
      }
    } finally {
      setResendBusy(false)
    }
  }

  const features = [
    { icon: <FaVideo />, title: 'Live Inspection', desc: 'WhatsApp video calls' },
    { icon: <FaLeaf />, title: 'Verified Animals', desc: 'Health guaranteed' },
    { icon: <FaTruck />, title: 'Free Delivery', desc: 'Across RYK district' },
    { icon: <FaHandshake />, title: 'COD Available', desc: 'Pay on delivery' }
  ]

  return (
    <div className={`lg-page ${isVisible ? 'lg-page--visible' : ''}`}>
      {/* Background */}
      <div className="lg-bg">
        <div className="lg-bg-gradient"></div>
        <div className="lg-bg-pattern"></div>
        <div className="lg-bg-noise"></div>
      </div>

      {/* Animated Shapes */}
      <div className="lg-shapes">
        <div className="lg-shape lg-shape--1"></div>
        <div className="lg-shape lg-shape--2"></div>
        <div className="lg-shape lg-shape--3"></div>
        <div className="lg-shape lg-shape--4"></div>
        <div className="lg-shape lg-shape--5"></div>
      </div>

      {/* Floating Particles */}
      <div className="lg-particles">
        {[...Array(8)].map((_, i) => (
          <span key={i} className={`lg-dot lg-dot--${i + 1}`}></span>
        ))}
      </div>

      {/* Main Layout */}
      <div className="lg-layout">
        {/* Left Panel */}
        <div className="lg-hero">
          <div className="lg-hero-inner">
            <div className="lg-logo-wrap" style={{ marginBottom: '2rem' }}>
              <img 
                src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                alt="Farm2Meat Logo" 
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>
            <div className="lg-hero-badge">
              <FaStar className="lg-hero-badge-star" />
              <span>Trusted Since 1990</span>
            </div>

            <h1 className="lg-hero-title">
              <span className="lg-hero-title-line">Pakistan Ka</span>
              <span className="lg-hero-title-accent">Sabse Bharosemand</span>
              <span className="lg-hero-title-line">Livestock Platform</span>
            </h1>

            <p className="lg-hero-desc">
              Farm2Meat par login karein aur hazaron sehatmand, farm-raised
              janwaron mein se apna pasandida chunein — ghar baithe, poori
              tasalli ke saath.
            </p>

            <div className="lg-hero-features">
              {features.map((f, i) => (
                <div
                  className="lg-hero-feat"
                  key={i}
                  style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                >
                  <div className="lg-hero-feat-icon">{f.icon}</div>
                  <div className="lg-hero-feat-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg-hero-stats">
              <div className="lg-hero-stat">
                <span className="lg-hero-stat-num">5,000+</span>
                <span className="lg-hero-stat-label">Animals Sold</span>
              </div>
              <div className="lg-hero-stat-divider"></div>
              <div className="lg-hero-stat">
                <span className="lg-hero-stat-num">2,500+</span>
                <span className="lg-hero-stat-label">Happy Buyers</span>
              </div>
              <div className="lg-hero-stat-divider"></div>
              <div className="lg-hero-stat">
                <span className="lg-hero-stat-num">4.9★</span>
                <span className="lg-hero-stat-label">User Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — White Form */}
        <div className="lg-form-panel">
          <div className="lg-card">
            {/* Top accent bar */}
            <div className="lg-card-accent"></div>

            {/* Brand */}
            <div className="lg-brand">
              <div className="lg-brand-icon">
                <span>🐐</span>
              </div>
              <div className="lg-brand-name">
                RYK <span>Mandi</span>
              </div>
            </div>

            {/* Header */}
            <div className="lg-header">
              <h2 className="lg-title">Welcome Back</h2>
              <p className="lg-subtitle">Sign in to continue to your account</p>
            </div>

            {/* Form */}
            <form className="lg-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div
                className={`lg-field ${
                  focusedField === 'email' ? 'lg-field--focused' : ''
                } ${formData.email ? 'lg-field--filled' : ''}`}
              >
                <label className="lg-label" htmlFor="lg-email">
                  Email Address
                </label>
                <div className="lg-input-wrap">
                  <FaEnvelope className="lg-input-icon" />
                  <input
                    id="lg-email"
                    type="email"
                    name="email"
                    className="lg-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                  {formData.email && isValidEmail(formData.email) && (
                    <FaCheckCircle className="lg-input-check" />
                  )}
                  <div className="lg-input-focus-ring"></div>
                </div>
              </div>

              {/* Password */}
              <div
                className={`lg-field ${
                  focusedField === 'password' ? 'lg-field--focused' : ''
                } ${formData.password ? 'lg-field--filled' : ''}`}
              >
                <div className="lg-label-row">
                  <label className="lg-label" htmlFor="lg-password">
                    Password
                  </label>
                  <a href="/forgot-password" className="lg-forgot">
                    Forgot password?
                  </a>
                </div>
                <div className="lg-input-wrap">
                  <FaLock className="lg-input-icon" />
                  <input
                    id="lg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="lg-input lg-input--pw"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="lg-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className="lg-input-focus-ring"></div>
                </div>

                {/* Strength */}
                {formData.password && (
                  <div className="lg-strength">
                    <div className="lg-strength-track">
                      <div
                        className={`lg-strength-fill ${
                          formData.password.length >= 8
                            ? 'lg-strength--strong'
                            : formData.password.length >= 6
                            ? 'lg-strength--medium'
                            : 'lg-strength--weak'
                        }`}
                      ></div>
                    </div>
                    <span className="lg-strength-label">
                      {formData.password.length >= 8
                        ? 'Strong'
                        : formData.password.length >= 6
                        ? 'Medium'
                        : 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              {/* Remember */}
              <div className="lg-remember">
                <label className="lg-toggle-label">
                  <input
                    type="checkbox"
                    className="lg-toggle-native"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    disabled={loading}
                  />
                  <div
                    className={`lg-toggle-track ${
                      rememberMe ? 'lg-toggle-track--on' : ''
                    }`}
                  >
                    <div className="lg-toggle-thumb"></div>
                  </div>
                  <span className="lg-toggle-text">Keep me signed in</span>
                </label>
              </div>

              {/* Notifications */}
              {(message || error) && (
                <div
                  className={`lg-alert ${
                    error ? 'lg-alert--error' : 'lg-alert--success'
                  }`}
                >
                  <div className="lg-alert-icon">
                    {error ? <FaShieldAlt /> : <FaCheckCircle />}
                  </div>
                  <p className="lg-alert-text">{error || message}</p>
                </div>
              )}

              {needsVerify && (
                <div className="lg-verify-banner">
                  <p className="lg-verify-banner-text">
                    Please verify your email to continue. Didn&apos;t get the link?
                  </p>
                  <button
                    type="button"
                    className="lg-verify-resend"
                    onClick={handleResendVerification}
                    disabled={resendBusy || loading}
                  >
                    {resendBusy ? 'Sending…' : 'Resend verification email'}
                  </button>
                  {resendOk ? <p className="lg-verify-ok">{resendOk}</p> : null}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className={`lg-submit ${loading ? 'lg-submit--loading' : ''}`}
                disabled={loading}
              >
                <span className="lg-submit-shine"></span>
                <span className="lg-submit-content">
                  <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                  {loading ? (
                    <FaSpinner className="lg-submit-icon lg-spin" />
                  ) : (
                    <FaArrowRight className="lg-submit-icon" />
                  )}
                </span>
              </button>

              {/* Secure note */}
              <div className="lg-secure">
                <FaShieldAlt />
                <span>Protected by 256-bit SSL encryption</span>
              </div>
            </form>

            {/* Footer */}
            <div className="lg-footer">
              <p>
                Don't have an account?{' '}
                <a href="/signup" className="lg-footer-link">
                  Create one free
                  <FaArrowRight className="lg-footer-arrow" />
                </a>
              </p>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="lg-trust">
            <div className="lg-trust-item">
              <FaShieldAlt />
              <span>Verified</span>
            </div>
            <div className="lg-trust-dot"></div>
            <div className="lg-trust-item">
              <FaCheckCircle />
              <span>Trusted</span>
            </div>
            <div className="lg-trust-dot"></div>
            <div className="lg-trust-item">
              <FaLock />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
