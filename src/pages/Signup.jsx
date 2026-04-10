import React, { useState, useEffect, useRef } from 'react'
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaCheck,
  FaStar,
  FaLeaf,
  FaTruck,
  FaVideo,
  FaHandshake,
  FaCrown,
  FaUsers,
  FaAward
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import '../css/Signup.css'
import { authService } from '../services/authService'

const Signup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    password: '',
    confirmPassword: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [signupPhase, setSignupPhase] = useState('form')
  const [resendHint, setResendHint] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [btnState, setBtnState] = useState('idle')

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())

  const validateStep1 = () => {
    const email = String(formData.email || '').trim().toLowerCase()
    const password = String(formData.password || '')
    const confirmPassword = String(formData.confirmPassword || '')

    if (!formData.fullName?.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.phone?.trim()) {
      setError('Please enter your phone number')
      return false
    }
    if (!isValidEmail(email)) {
      setError('Invalid email format')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return false
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!agreed) {
      setError('Please accept the terms to continue')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResendHint('')

    if (!validateStep1()) {
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 1800)
      return
    }

    setLoading(true)
    setBtnState('loading')

    try {
      await authService.signup({
        email: String(formData.email || '').trim().toLowerCase(),
        password: String(formData.password || ''),
        fullName: String(formData.fullName || '').trim(),
        phone: String(formData.phone || '').trim(),
        city: String(formData.city || '').trim(),
      })
      setSignupPhase('sent')
      setBtnState('idle')
    } catch (err) {
      const msg = err?.message || 'Signup failed'
      setError(msg)
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const email = String(formData.email || '').trim().toLowerCase()
    setError('')
    setResendHint('')
    try {
      await authService.resendVerification(email)
      setResendHint('A new verification link has been sent. Check your inbox.')
    } catch (err) {
      if (err?.status === 404) {
        setError('No account found with this email.')
      } else {
        setError(err?.message || 'Could not resend email')
      }
    }
  }

  const getFieldStrength = () => {
    const pwd = formData.password
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return Math.min(score, 4)
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']
  const passwordStrength = getFieldStrength()

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

  const btnClassName = [
    'su-submit',
    signupPhase === 'form' && !agreed && 'su-submit--disabled',
    btnState === 'loading' && 'su-submit--loading',
    btnState === 'success' && 'su-submit--success',
    btnState === 'error' && 'su-submit--error',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`su-page ${isVisible ? 'su-page--visible' : ''}`}>
      {/* Clean Background */}
      <div className="su-bg">
        <div className="su-bg-base"></div>
        <div className="su-bg-glow su-bg-glow--1"></div>
        <div className="su-bg-glow su-bg-glow--2"></div>
      </div>

      <div className="su-container">
        {/* Left Panel - Clean Hero */}
        <div className="su-hero">
          <div className="su-hero-content">
            <div className="su-hero-badge">
              <FaCrown className="su-hero-badge-icon" />
              <span>Pakistan's #1 Livestock Marketplace</span>
            </div>

            <h1 className="su-hero-title">
              Join the most trusted
              <span className="su-hero-title-accent"> livestock community</span>
            </h1>

            <p className="su-hero-desc">
              Create your account and get instant access to verified animals, 
              professional butchers, and seamless delivery across Rahim Yar Khan.
            </p>

            <div className="su-hero-features">
              {features.map((f, i) => (
                <div className="su-hero-feature" key={i}>
                  <div className="su-hero-feature-icon">{f.icon}</div>
                  <div className="su-hero-feature-info">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="su-hero-stats">
              {stats.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="su-hero-stat">
                    <div className="su-hero-stat-icon">{s.icon}</div>
                    <div className="su-hero-stat-content">
                      <span className="su-hero-stat-value">{s.value}</span>
                      <span className="su-hero-stat-label">{s.label}</span>
                    </div>
                  </div>
                  {i < stats.length - 1 && <div className="su-hero-stat-divider" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Clean Form */}
        <div className="su-form-panel">
          <div className="su-card">
            <div className="su-card-header">
              <div className="su-brand">
                <img 
                  src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                  alt="Farm2Meat" 
                  className="su-brand-logo"
                />
                <span className="su-brand-text">Farm2<span>Meat</span></span>
              </div>

              <h2 className="su-title">Create your account</h2>
              <p className="su-subtitle">Join thousands of happy buyers and sellers</p>
            </div>

            <div className="su-progress">
              <div className={`su-progress-step ${signupPhase === 'form' ? 'active' : ''} ${signupPhase === 'sent' ? 'completed' : ''}`}>
                <span className="su-progress-num">1</span>
                <span className="su-progress-label">Account Details</span>
              </div>
              <div className="su-progress-line">
                <div className={`su-progress-line-fill ${signupPhase === 'sent' ? 'filled' : ''}`} />
              </div>
              <div className={`su-progress-step ${signupPhase === 'sent' ? 'active' : ''}`}>
                <span className="su-progress-num">2</span>
                <span className="su-progress-label">Verify Email</span>
              </div>
            </div>

            <form className="su-form" onSubmit={handleSubmit} noValidate>
              {signupPhase === 'sent' && (
                <div className="su-success-panel">
                  <div className="su-success-icon">
                    <FaEnvelope />
                  </div>
                  <h3>Check your inbox</h3>
                  <p>
                    We've sent a verification link to <strong>{formData.email.trim()}</strong>
                  </p>
                  <p className="su-success-note">
                    Click the link to activate your account. The link expires in 24 hours.
                  </p>
                  {resendHint && <p className="su-success-hint">{resendHint}</p>}
                  <div className="su-success-actions">
                    <button
                      type="button"
                      className="su-btn su-btn--secondary"
                      onClick={handleResendVerification}
                      disabled={loading}
                    >
                      Resend Email
                    </button>
                    <Link to="/login" className="su-btn su-btn--primary">
                      Go to Login <FaArrowRight />
                    </Link>
                  </div>
                </div>
              )}

              {signupPhase === 'form' && (
                <div className="su-form-fields">
                  <div className="su-field-row">
                    <div className={`su-field ${focusedField === 'fullName' ? 'focused' : ''} ${formData.fullName ? 'filled' : ''}`}>
                      <label>Full Name</label>
                      <div className="su-field-input">
                        <FaUser className="su-field-icon" />
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Muhammad Ahmed"
                          value={formData.fullName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                        />
                        {formData.fullName.trim().length > 2 && <FaCheckCircle className="su-field-check" />}
                      </div>
                    </div>

                    <div className={`su-field ${focusedField === 'phone' ? 'focused' : ''} ${formData.phone ? 'filled' : ''}`}>
                      <label>Phone Number</label>
                      <div className="su-field-input">
                        <FaPhone className="su-field-icon" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="03XX-XXXXXXX"
                          value={formData.phone}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="su-field-row">
                    <div className={`su-field ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                      <label>Email Address</label>
                      <div className="su-field-input">
                        <FaEnvelope className="su-field-icon" />
                        <input
                          type="email"
                          name="email"
                          placeholder="ahmed@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                        />
                        {formData.email && isValidEmail(formData.email) && <FaCheckCircle className="su-field-check" />}
                      </div>
                    </div>

                    <div className={`su-field ${focusedField === 'city' ? 'focused' : ''} ${formData.city ? 'filled' : ''}`}>
                      <label>City</label>
                      <div className="su-field-input">
                        <FaMapMarkerAlt className="su-field-icon" />
                        <input
                          type="text"
                          name="city"
                          placeholder="Rahim Yar Khan"
                          value={formData.city}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('city')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`su-field ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                    <label>Password</label>
                    <div className="su-field-input">
                      <FaLock className="su-field-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="su-field-eye"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="su-password-strength">
                        <div className="su-strength-bar">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`su-strength-segment ${passwordStrength >= level ? 'active' : ''}`}
                              style={{ backgroundColor: passwordStrength >= level ? strengthColors[passwordStrength] : undefined }}
                            />
                          ))}
                        </div>
                        <span className="su-strength-text" style={{ color: strengthColors[passwordStrength] }}>
                          {strengthLabels[passwordStrength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`su-field ${focusedField === 'confirmPassword' ? 'focused' : ''} ${formData.confirmPassword ? 'filled' : ''}`}>
                    <label>Confirm Password</label>
                    <div className="su-field-input">
                      <FaLock className="su-field-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="su-field-eye"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="su-password-match">
                        {formData.password === formData.confirmPassword ? (
                          <span className="match"><FaCheckCircle /> Passwords match</span>
                        ) : (
                          <span className="no-match">Passwords do not match</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="su-terms">
                    <label className="su-checkbox">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={() => setAgreed(!agreed)}
                        disabled={loading}
                      />
                      <span className="su-checkbox-custom"></span>
                      <span className="su-checkbox-text">
                        I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <div className="su-error">
                  <FaShieldAlt />
                  <span>{error}</span>
                </div>
              )}

              {signupPhase === 'form' && (
                <>
                  <button
                    type="submit"
                    className={btnClassName}
                    disabled={!agreed || loading}
                  >
                    <span className="su-submit-text">
                      {btnState === 'idle' && (
                        <>Create Account <FaArrowRight /></>
                      )}
                      {btnState === 'loading' && (
                        <>Creating Account...</>
                      )}
                      {btnState === 'error' && (
                        <>Try Again <FaArrowRight /></>
                      )}
                    </span>
                  </button>

                  <div className="su-secure-badge">
                    <FaShieldAlt />
                    <span>Protected by 256-bit SSL encryption</span>
                  </div>
                </>
              )}
            </form>

            <div className="su-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="su-footer-link">
                Sign In <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup