import React, { useEffect, useRef, useState } from 'react'
import {
  FaFacebookF,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope,
  FaPaperPlane,
  FaUser,
  FaPhone,
  FaStar,           // new icon for feedback
  FaCheckCircle,
  FaShieldAlt,
  FaHeart,          // new icon
  FaSmile,          // new icon
} from 'react-icons/fa'
import '../css/Contact.css'      // CSS unchanged
import {
  FACEBOOK_URL,
  PHONE_DISPLAY,
  PHONE_LINK,
} from '../constants/contact'
import feedbackService from '../services/feedbackService'

const feedbackStats = [
  {
    id: 1,
    icon: <FaStar />,
    label: 'Average Rating',
    value: '4.9 / 5',
    href: null,
    color: 'accent',
  },
  {
    id: 2,
    icon: <FaHeart />,
    label: 'Happy Customers',
    value: '500+',
    href: null,
    color: 'primary',
  },
  {
    id: 3,
    icon: <FaSmile />,
    label: 'Response Rate',
    value: '100% in 1 Hour',
    href: null,
    color: 'primary',
  },
  {
    id: 4,
    icon: <FaClock />,
    label: 'We Listen',
    value: 'Every Message Read',
    href: null,
    color: 'dark',
  },
]

const whyFeedbackMatters = [
  { icon: <FaShieldAlt />, text: 'Your Opinion Shapes Our Service' },
  { icon: <FaStar />, text: 'We Reply to Every Feedback' },
  { icon: <FaHeart />, text: 'Continuous Improvement Guaranteed' },
  { icon: <FaCheckCircle />, text: '100% Genuine Customer Voices' },
]

const FeedbackPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    feedback: '',            // renamed from requirement
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const pageRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await feedbackService.sendFeedback({
        fullName: formData.fullName,
        phone: formData.phone,
        feedback: formData.feedback
      })

      setIsSubmitted(true)
      setFormData({ fullName: '', phone: '', feedback: '' })
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error) {
      console.error('Feedback submit failed:', error)
      setErrorMessage(error?.response?.data?.message || error.message || 'Could not send feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`contact-page ${isVisible ? 'contact-page--visible' : ''}`} ref={pageRef}>

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="cp-hero">
        <div className="cp-hero-bg">
          <div className="cp-hero-circle cp-hero-circle--1"></div>
          <div className="cp-hero-circle cp-hero-circle--2"></div>
          <div className="cp-hero-pattern"></div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="cp-hero-content">
                <span className="cp-hero-badge">
                  <span className="cp-hero-badge-dot"></span>
                  YOUR VOICE MATTERS
                </span>
                <h1 className="cp-hero-title">
                  Share Your <span className="cp-hero-title-accent">Feedback</span>
                </h1>
                <p className="cp-hero-subtitle">
                  We’re always listening. Tell us about your experience with our meat quality,
                  delivery, or service — <em>your words help us improve</em>.
                </p>

                {/* Quick Contact Buttons */}
                <div className="cp-hero-quick">
                  <a href={PHONE_LINK} className="cp-hero-btn cp-hero-btn--call">
                    <FaPhoneAlt className="cp-hero-btn-icon" />
                    <span>Call & Talk to Us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEEDBACK STATS CARDS
      ══════════════════════════════════════════ */}
      <section className="cp-info-section">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="cp-info-grid">
                {feedbackStats.map((info, index) => (
                  <div
                    key={info.id}
                    className="cp-info-card"
                    style={{ '--info-delay': `${index * 0.1}s` }}
                  >
                    <div className={`cp-info-icon cp-info-icon--${info.color}`}>
                      {info.icon}
                    </div>
                    <div className="cp-info-content">
                      <span className="cp-info-label">{info.label}</span>
                      {info.href ? (
                        <a
                          href={info.href}
                          target={info.href.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="cp-info-value cp-info-value--link"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="cp-info-value">{info.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT — MAP + FORM (Split Layout)
      ══════════════════════════════════════════ */}
      <section className="cp-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="cp-main-wrapper">

                {/* ──────── LEFT: MAP + TRUST ──────── */}
                <div className="cp-map-col">
                  <div className="cp-map-header">
                    <h2 className="cp-section-title">
                      <FaMapMarkerAlt className="cp-section-icon" />
                      Our Commitment to You
                    </h2>
                    <p className="cp-section-sub">
                      Every single feedback is read personally by our team. You are the reason we grow.
                    </p>
                  </div>

                  {/* Map (same location, still relevant) */}
                  <div className="cp-map-container">
                    <iframe
                      title="OnlyMeat Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55676.27637825424!2d70.2895822!3d28.4209205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39375d22992a57d5%3A0xf0e1eb8f8e1ec6c7!2sRahim%20Yar%20Khan%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                  {/* Address Card → Leave a Review on Google */}
                  <div className="cp-address-card">
                    <div className="cp-address-icon">
                      <FaStar />
                    </div>
                    <div className="cp-address-content">
                      <strong className="cp-address-title">Rate Us on Google</strong>
                      <p className="cp-address-text">
                        Search <strong>OnlyMeat Rahim Yar Khan</strong> and leave a review — we’d love to hear from you!
                      </p>
                    </div>
                  </div>

                  {/* Trust Points → Why Feedback Matters */}
                  <div className="cp-trust-grid">
                    {whyFeedbackMatters.map((point, index) => (
                      <div key={index} className="cp-trust-item">
                        <span className="cp-trust-icon">{point.icon}</span>
                        <span className="cp-trust-text">{point.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ──────── RIGHT: FEEDBACK FORM ──────── */}
                <div className="cp-form-col">
                  <div className="cp-form-card">

                    {/* Form Header */}
                    <div className="cp-form-header">
                      <h2 className="cp-section-title">
                        <FaStar className="cp-section-icon" />
                        Your Feedback
                      </h2>
                      <p className="cp-section-sub">
                        Tell us what you loved, what we can improve, or any suggestion — we read every word.
                      </p>
                    </div>

                    {/* Form */}
                    <form className="cp-form" onSubmit={handleSubmit}>

                      {/* Full Name */}
                      <div className="cp-form-group">
                        <label className="cp-form-label" htmlFor="fullName">
                          <FaUser className="cp-label-icon" />
                          Full Name <span className="cp-required">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          className="cp-form-input"
                          placeholder="Apna naam likhein"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="cp-form-group">
                        <label className="cp-form-label" htmlFor="phone">
                          <FaPhone className="cp-label-icon" />
                          Phone Number <span className="cp-required">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="cp-form-input"
                          placeholder="03XX-XXXXXXX"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Feedback Message */}
                      <div className="cp-form-group">
                        <label className="cp-form-label" htmlFor="feedback">
                          <FaStar className="cp-label-icon" />
                          Your Feedback <span className="cp-required">*</span>
                        </label>
                        <textarea
                          id="feedback"
                          name="feedback"
                          className="cp-form-textarea"
                          placeholder="Meat quality kesi lagi? Delivery time? Koi suggestion ho to zaroor batayein..."
                          rows="5"
                          value={formData.feedback}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className={`cp-form-submit ${isSubmitting ? 'cp-form-submit--loading' : ''}`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="cp-spinner"></span>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="cp-submit-icon" />
                            <span>Submit Feedback</span>
                          </>
                        )}
                      </button>

                      {/* Success Message */}
                      {isSubmitted && (
                        <div className="cp-form-success">
                          <FaCheckCircle className="cp-success-icon" />
                          <span>Thank you! Your feedback has been sent. We truly appreciate it.</span>
                        </div>
                      )}

                      {errorMessage && (
                        <div className="cp-form-error" style={{ color: '#b91c1c', fontWeight: 600 }}>
                          {errorMessage}
                        </div>
                      )}

                      {/* Form Note */}
                      <p className="cp-form-note">
                        <FaShieldAlt className="cp-note-icon" />
                        Your information is secure — only used to respond to your feedback.
                      </p>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SOCIAL & DIRECT LINKS
      ══════════════════════════════════════════ */}
      <section className="cp-social-section">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 text-center">
              <h3 className="cp-social-title">Stay Connected & See Reviews</h3>
              <p className="cp-social-sub">
                Follow us for latest updates, customer stories, and to see what others are saying.
              </p>

              <div className="cp-social-grid">
                {/* Facebook */}
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-social-card cp-social-card--fb"
                >
                  <div className="cp-social-card-icon">
                    <FaFacebookF />
                  </div>
                  <div className="cp-social-card-info">
                    <strong>Facebook</strong>
                    <span>Read Reviews</span>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={PHONE_LINK}
                  className="cp-social-card cp-social-card--phone"
                >
                  <div className="cp-social-card-icon">
                    <FaPhoneAlt />
                  </div>
                  <div className="cp-social-card-info">
                    <strong>Direct Call</strong>
                    <span>Talk to Us</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FeedbackPage