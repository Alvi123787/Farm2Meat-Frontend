import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
  FaHandshake,
  FaCrown,
  FaUsers,
  FaAward
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
        setError('No account found with this email.')
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

  const stats = [
    { icon: <FaUsers />, value: '5,000+', label: 'Animals Sold' },
    { icon: <FaStar />, value: '4.9', label: 'User Rating' },
    { icon: <FaAward />, value: '1990', label: 'Since' }
  ]

  return (
    <div className={`lg-page ${isVisible ? 'lg-page--visible' : ''}`}>
      {/* Clean Background */}
      <div className="lg-bg">
        <div className="lg-bg-base"></div>
        <div className="lg-bg-glow lg-bg-glow--1"></div>
        <div className="lg-bg-glow lg-bg-glow--2"></div>
      </div>

      <div className="lg-container">
        {/* Left Panel - Clean Hero */}
        <div className="lg-hero">
          <div className="lg-hero-content">
            <div className="lg-hero-badge">
              <FaCrown className="lg-hero-badge-icon" />
              <span>Pakistan's #1 Livestock Marketplace</span>
            </div>

            <h1 className="lg-hero-title">
              Welcome back to
              <span className="lg-hero-title-accent"> OnlyMeat</span>
            </h1>

            <p className="lg-hero-desc">
              Sign in to access your account and continue browsing verified animals,
              connecting with professional butchers, and enjoying seamless delivery.
            </p>

            <div className="lg-hero-features">
              {features.map((f, i) => (
                <div className="lg-hero-feature" key={i}>
                  <div className="lg-hero-feature-icon">{f.icon}</div>
                  <div className="lg-hero-feature-info">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg-hero-stats">
              {stats.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="lg-hero-stat">
                    <div className="lg-hero-stat-icon">{s.icon}</div>
                    <div className="lg-hero-stat-content">
                      <span className="lg-hero-stat-value">{s.value}</span>
                      <span className="lg-hero-stat-label">{s.label}</span>
                    </div>
                  </div>
                  {i < stats.length - 1 && <div className="lg-hero-stat-divider" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Clean Form */}
        <div className="lg-form-panel">
          <div className="lg-card">
            <div className="lg-card-header">
              <div className="lg-brand">
                <img 
                  src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                  alt="OnlyMeat" 
                  className="lg-brand-logo"
                />
                <span className="lg-brand-text">Only<span>Meat</span></span>
              </div>

              <h2 className="lg-title">Sign in to your account</h2>
              <p className="lg-subtitle">Welcome back! Please enter your details</p>
            </div>

            <form className="lg-form" onSubmit={handleSubmit} noValidate>
              <div className="lg-form-fields">
                <div className={`lg-field ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                  <label>Email Address</label>
                  <div className="lg-field-input">
                    <FaEnvelope className="lg-field-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="email"
                      disabled={loading}
                    />
                    {formData.email && isValidEmail(formData.email) && (
                      <FaCheckCircle className="lg-field-check" />
                    )}
                  </div>
                </div>

                <div className={`lg-field ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                  <div className="lg-field-label-row">
                    <label>Password</label>
                    <Link to="/forgot-password" className="lg-forgot-link">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="lg-field-input">
                    <FaLock className="lg-field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="lg-field-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="lg-remember">
                  <label className="lg-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      disabled={loading}
                    />
                    <span className="lg-checkbox-custom"></span>
                    <span className="lg-checkbox-text">Keep me signed in</span>
                  </label>
                </div>
              </div>

              {(message || error) && (
                <div className={`lg-alert ${error ? 'lg-alert--error' : 'lg-alert--success'}`}>
                  {error ? <FaShieldAlt /> : <FaCheckCircle />}
                  <span>{error || message}</span>
                </div>
              )}

              {needsVerify && (
                <div className="lg-verify-box">
                  <p>Please verify your email to continue.</p>
                  <button
                    type="button"
                    className="lg-verify-btn"
                    onClick={handleResendVerification}
                    disabled={resendBusy || loading}
                  >
                    {resendBusy ? 'Sending...' : 'Resend verification email'}
                  </button>
                  {resendOk && <p className="lg-verify-success">{resendOk}</p>}
                </div>
              )}

              <button
                type="submit"
                className={`lg-submit ${loading ? 'lg-submit--loading' : ''}`}
                disabled={loading}
              >
                <span className="lg-submit-text">
                  {loading ? (
                    <>Signing in <FaSpinner className="lg-spinner" /></>
                  ) : (
                    <>Sign In <FaArrowRight /></>
                  )}
                </span>
              </button>

              <div className="lg-secure-badge">
                <FaShieldAlt />
                <span>Protected by 256-bit SSL encryption</span>
              </div>
            </form>

            <div className="lg-footer">
              <span>Don't have an account?</span>
              <Link to="/signup" className="lg-footer-link">
                Create an account <FaArrowRight />
              </Link>
            </div>
          </div>

          <div className="lg-trust-badge">
            <div className="lg-trust-item">
              <FaShieldAlt />
              <span>Verified</span>
            </div>
            <div className="lg-trust-divider" />
            <div className="lg-trust-item">
              <FaCheckCircle />
              <span>Trusted</span>
            </div>
            <div className="lg-trust-divider" />
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