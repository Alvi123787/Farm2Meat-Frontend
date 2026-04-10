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
  FaHandshake
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
  /** 'form' | 'sent' — after signup we show check-email instructions */
  const [signupPhase, setSignupPhase] = useState('form')
  const [resendHint, setResendHint] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [btnState, setBtnState] = useState('idle')
  const [ripples, setRipples] = useState([])
  const btnRef = useRef(null)

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

  const createRipple = (e) => {
    if (!btnRef.current || loading) return
    const rect = btnRef.current.getBoundingClientRect()
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    setRipples((prev) => [...prev, ripple])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 900)
  }

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
      // Send all fields to backend
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
  const strengthColors = ['', '#ef5350', '#ffa726', '#42a5f5', '#66bb6a']
  const passwordStrength = getFieldStrength()

  const features = [
    { icon: <FaVideo />, title: 'Live Inspection', desc: 'WhatsApp video calls' },
    { icon: <FaLeaf />, title: 'Verified Animals', desc: 'Health guaranteed' },
    { icon: <FaTruck />, title: 'Free Delivery', desc: 'Across RYK district' },
    { icon: <FaHandshake />, title: 'COD Available', desc: 'Pay on delivery' }
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
      {/* Background */}
      <div className="su-bg">
        <div className="su-bg-gradient"></div>
        <div className="su-bg-pattern"></div>
        <div className="su-bg-noise"></div>
      </div>

      {/* Animated Shapes */}
      <div className="su-shapes">
        <div className="su-shape su-shape--1"></div>
        <div className="su-shape su-shape--2"></div>
        <div className="su-shape su-shape--3"></div>
        <div className="su-shape su-shape--4"></div>
        <div className="su-shape su-shape--5"></div>
      </div>

      {/* Particles */}
      <div className="su-particles">
        {[...Array(8)].map((_, i) => (
          <span key={i} className={`su-dot su-dot--${i + 1}`}></span>
        ))}
      </div>

      {/* Main Layout */}
      <div className="su-layout">
        {/* Left — Hero Panel */}
        <div className="su-hero">
          <div className="su-hero-inner">
            <div className="su-hero-badge">
              <FaStar className="su-hero-badge-star" />
              <span>Trusted Since 1990</span>
            </div>

            <h1 className="su-hero-title">
              <span className="su-hero-title-line">Join Pakistan's</span>
              <span className="su-hero-title-accent">#1 Livestock</span>
              <span className="su-hero-title-line">Marketplace</span>
            </h1>

            <p className="su-hero-desc">
              Farm2Meat par apna account banayein aur hazaron verified janwaron
              tak instant access paayein — seedha apne ghar se.
            </p>

            <div className="su-hero-features">
              {features.map((f, i) => (
                <div
                  className="su-hero-feat"
                  key={i}
                  style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                >
                  <div className="su-hero-feat-icon">{f.icon}</div>
                  <div className="su-hero-feat-text">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="su-hero-stats">
              <div className="su-hero-stat">
                <span className="su-hero-stat-num">5,000+</span>
                <span className="su-hero-stat-label">Animals Sold</span>
              </div>
              <div className="su-hero-stat-divider"></div>
              <div className="su-hero-stat">
                <span className="su-hero-stat-num">2,500+</span>
                <span className="su-hero-stat-label">Happy Buyers</span>
              </div>
              <div className="su-hero-stat-divider"></div>
              <div className="su-hero-stat">
                <span className="su-hero-stat-num">4.9★</span>
                <span className="su-hero-stat-label">User Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — White Form Panel */}
        <div className="su-form-panel">
          <div className="su-card">
            {/* Top accent bar */}
            <div className="su-card-accent"></div>

            {/* Brand */}
            <div className="su-brand">
              <div className="su-brand-icon">
                <span>🐐</span>
              </div>
              <div className="su-brand-name">
                RYK <span>Mandi</span>
              </div>
            </div>

            {/* Header */}
            <div className="su-header">
              <h2 className="su-title">Create Account</h2>
              <p className="su-subtitle">
                Join Pakistan's most trusted livestock marketplace
              </p>
            </div>

            {/* Steps */}
            <div className="su-steps">
              <div
                className={`su-step ${signupPhase === 'form' ? 'su-step--active' : ''} su-step--done`}
              >
                <span className="su-step-num">{signupPhase === 'sent' ? <FaCheck /> : '1'}</span>
                <span className="su-step-label">Your details</span>
              </div>
              <div className="su-step-connector">
                <div
                  className={`su-step-connector-fill ${signupPhase === 'sent' ? 'su-step-connector-fill--active' : ''}`}
                ></div>
              </div>
              <div
                className={`su-step ${signupPhase === 'sent' ? 'su-step--active su-step--done' : ''}`}
              >
                <span className="su-step-num">{signupPhase === 'sent' ? <FaCheck /> : '2'}</span>
                <span className="su-step-label">Verify via email</span>
              </div>
            </div>

            {/* Form */}
            <form className="su-form" onSubmit={handleSubmit} noValidate>
              {signupPhase === 'sent' && (
                <div className="su-email-sent-panel">
                  <div className="su-otp-illustration">
                    <div className="su-otp-envelope">
                      <FaEnvelope />
                    </div>
                  </div>
                  <h3 className="su-email-sent-title">Check your email</h3>
                  <p className="su-otp-intro">
                    We sent a verification link to <strong>{formData.email.trim()}</strong>. Open it and
                    tap <strong>Verify Your Account</strong> to activate your profile. The link expires in{' '}
                    <strong>24 hours</strong>.
                  </p>
                  {resendHint ? (
                    <p className="su-resend-hint su-resend-hint--ok">{resendHint}</p>
                  ) : null}
                  <div className="su-email-sent-actions">
                    <button
                      type="button"
                      className="su-otp-resend"
                      onClick={handleResendVerification}
                      disabled={loading}
                    >
                      Resend verification email
                    </button>
                    <Link to="/login" className="su-footer-link su-email-sent-login">
                      Go to login <FaArrowRight className="su-footer-arrow" />
                    </Link>
                  </div>
                </div>
              )}

              {signupPhase === 'form' && (
                <div className="su-step1">
                  {/* Row 1: Name + Phone */}
                  <div className="su-row">
                    <div
                      className={`su-field ${focusedField === 'fullName' ? 'su-field--focused' : ''} ${formData.fullName ? 'su-field--filled' : ''}`}
                    >
                      <label className="su-label" htmlFor="su-fullName">
                        Full Name
                      </label>
                      <div className="su-input-wrap">
                        <FaUser className="su-input-icon" />
                        <input
                          type="text"
                          id="su-fullName"
                          name="fullName"
                          className="su-input"
                          placeholder="Muhammad Ahmed"
                          value={formData.fullName}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                          required
                        />
                        {formData.fullName.trim().length > 2 && (
                          <FaCheckCircle className="su-input-check" />
                        )}
                        <div className="su-input-ring"></div>
                      </div>
                    </div>

                    <div
                      className={`su-field ${focusedField === 'phone' ? 'su-field--focused' : ''} ${formData.phone ? 'su-field--filled' : ''}`}
                    >
                      <label className="su-label" htmlFor="su-phone">
                        Phone Number
                      </label>
                      <div className="su-input-wrap">
                        <FaPhone className="su-input-icon" />
                        <input
                          type="tel"
                          id="su-phone"
                          name="phone"
                          className="su-input"
                          placeholder="03XX-XXXXXXX"
                          value={formData.phone}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                          required
                        />
                        <div className="su-input-ring"></div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email + City */}
                  <div className="su-row">
                    <div
                      className={`su-field ${focusedField === 'email' ? 'su-field--focused' : ''} ${formData.email ? 'su-field--filled' : ''}`}
                    >
                      <label className="su-label" htmlFor="su-email">
                        Email Address
                      </label>
                      <div className="su-input-wrap">
                        <FaEnvelope className="su-input-icon" />
                        <input
                          type="email"
                          id="su-email"
                          name="email"
                          className="su-input"
                          placeholder="ahmed@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                          required
                        />
                        {formData.email && isValidEmail(formData.email) && (
                          <FaCheckCircle className="su-input-check" />
                        )}
                        <div className="su-input-ring"></div>
                      </div>
                    </div>

                    <div
                      className={`su-field ${focusedField === 'city' ? 'su-field--focused' : ''} ${formData.city ? 'su-field--filled' : ''}`}
                    >
                      <label className="su-label" htmlFor="su-city">
                        City
                      </label>
                      <div className="su-input-wrap">
                        <FaMapMarkerAlt className="su-input-icon" />
                        <input
                          type="text"
                          id="su-city"
                          name="city"
                          className="su-input"
                          placeholder="Rahim Yar Khan"
                          value={formData.city}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('city')}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading}
                        />
                        <div className="su-input-ring"></div>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div
                    className={`su-field ${focusedField === 'password' ? 'su-field--focused' : ''} ${formData.password ? 'su-field--filled' : ''}`}
                  >
                    <label className="su-label" htmlFor="su-password">
                      Password
                    </label>
                    <div className="su-input-wrap">
                      <FaLock className="su-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="su-password"
                        name="password"
                        className="su-input su-input--pw"
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="su-eye"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password"
                        disabled={loading}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <div className="su-input-ring"></div>
                    </div>

                    {formData.password && (
                      <div className="su-strength">
                        <div className="su-strength-track">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`su-strength-seg ${passwordStrength >= level ? 'su-strength-seg--active' : ''}`}
                              style={{
                                backgroundColor: passwordStrength >= level
                                  ? strengthColors[passwordStrength]
                                  : undefined,
                              }}
                            ></div>
                          ))}
                        </div>
                        <span
                          className="su-strength-label"
                          style={{ color: strengthColors[passwordStrength] }}
                        >
                          {strengthLabels[passwordStrength]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div
                    className={`su-field ${focusedField === 'confirmPassword' ? 'su-field--focused' : ''} ${formData.confirmPassword ? 'su-field--filled' : ''}`}
                  >
                    <label className="su-label" htmlFor="su-confirm">
                      Confirm Password
                    </label>
                    <div className="su-input-wrap">
                      <FaLock className="su-input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="su-confirm"
                        name="confirmPassword"
                        className="su-input su-input--pw"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="su-eye"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <div className="su-input-ring"></div>
                    </div>

                    {formData.confirmPassword && (
                      <div className="su-match">
                        {formData.password === formData.confirmPassword ? (
                          <span className="su-match--yes">
                            <FaCheckCircle /> Passwords match
                          </span>
                        ) : (
                          <span className="su-match--no">
                            Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Terms Toggle */}
                  <div className="su-terms">
                    <label className="su-toggle-label">
                      <input
                        type="checkbox"
                        className="su-toggle-native"
                        checked={agreed}
                        onChange={() => setAgreed(!agreed)}
                        disabled={loading}
                      />
                      <div className={`su-toggle-track ${agreed ? 'su-toggle-track--on' : ''}`}>
                        <div className="su-toggle-thumb"></div>
                      </div>
                      <span className="su-toggle-text">
                        I agree to the{' '}
                        <a href="/terms" className="su-link">Terms</a> &{' '}
                        <a href="/privacy-policy" className="su-link">Privacy Policy</a>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="su-alert su-alert--error">
                  <div className="su-alert-icon">
                    <FaShieldAlt />
                  </div>
                  <p className="su-alert-text">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              {signupPhase === 'form' && (
              <button
                ref={btnRef}
                type="submit"
                className={btnClassName}
                disabled={!agreed || loading}
                onClick={createRipple}
              >
                <span className="su-submit-shimmer"></span>
                <span className="su-submit-glow"></span>

                {ripples.map((r) => (
                  <span
                    key={r.id}
                    className="su-submit-ripple"
                    style={{ left: r.x, top: r.y }}
                  />
                ))}

                {btnState === 'loading' && (
                  <span className="su-submit-progress"></span>
                )}

                {btnState === 'success' && (
                  <span className="su-submit-particles">
                    {[...Array(14)].map((_, i) => (
                      <span
                        key={i}
                        className="su-submit-particle"
                        style={{
                          '--angle': `${i * 25.7}deg`,
                          '--delay': `${i * 0.035}s`,
                          '--distance': `${60 + Math.random() * 40}px`,
                        }}
                      />
                    ))}
                  </span>
                )}

                {btnState === 'idle' && (
                  <span className="su-submit-content su-submit-content--idle">
                    <span>Create account</span>
                    <FaArrowRight className="su-submit-arrow" />
                  </span>
                )}

                {btnState === 'loading' && (
                  <span className="su-submit-content su-submit-content--loading">
                    <span className="su-submit-spinner"></span>
                    <span className="su-submit-loading-text">
                      Creating account
                      <span className="su-submit-dots">
                        <span className="su-submit-dot">.</span>
                        <span className="su-submit-dot">.</span>
                        <span className="su-submit-dot">.</span>
                      </span>
                    </span>
                  </span>
                )}

                {btnState === 'success' && (
                  <span className="su-submit-content su-submit-content--success">
                    <span className="su-submit-check-circle">
                      <FaCheck className="su-submit-check-icon" />
                    </span>
                    <span>Check your email</span>
                  </span>
                )}

                {btnState === 'error' && (
                  <span className="su-submit-content su-submit-content--error">
                    <span>Try Again</span>
                    <FaArrowRight className="su-submit-arrow" />
                  </span>
                )}
              </button>
              )}

              {/* Security */}
              {signupPhase === 'form' && (
              <div className="su-secure">
                <FaShieldAlt />
                <span>Protected by 256-bit SSL encryption</span>
              </div>
              )}
            </form>

            {/* Footer */}
            <div className="su-footer">
              <p>
                Already have an account?{' '}
                <a href="/login" className="su-footer-link">
                  Sign In
                  <FaArrowRight className="su-footer-arrow" />
                </a>
              </p>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="su-trust">
            <div className="su-trust-item">
              <FaShieldAlt />
              <span>Verified</span>
            </div>
            <div className="su-trust-dot"></div>
            <div className="su-trust-item">
              <FaCheckCircle />
              <span>Trusted</span>
            </div>
            <div className="su-trust-dot"></div>
            <div className="su-trust-item">
              <FaLock />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
