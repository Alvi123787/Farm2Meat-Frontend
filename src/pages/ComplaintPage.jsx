import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaChevronDown,
  FaPaperPlane,
  FaShieldAlt,
  FaCheckCircle,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaExclamationTriangle,
  FaClipboardList,
} from 'react-icons/fa'
import '../css/ComplaintPage.css' // unique CSS
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_LINK,
  WHATSAPP_DISPLAY,
  WHATSAPP_LINK,
} from '../constants/contact'
import toast from 'react-hot-toast'
import complaintService from '../services/complaintService';

// FAQ data – complaint‑specific
const faqData = [
  {
    id: 1,
    question: 'How long does it take to resolve a complaint?',
    answer: 'We aim to respond within 24 hours and resolve most complaints within 3 business days.',
  },
  {
    id: 2,
    question: 'What information should I include in my complaint?',
    answer: 'Please provide your order number (if applicable), a clear description of the issue, and any supporting details like photos.',
  },
  {
    id: 3,
    question: 'Can I submit a complaint via WhatsApp?',
    answer: 'Yes, you can also reach us via WhatsApp at the number provided on this page.',
  },
  {
    id: 4,
    question: 'What if I am not satisfied with the resolution?',
    answer: 'You can escalate your concern by replying to the resolution email or calling our support line.',
  },
];

const ComplaintPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    orderNumber: '',
    subject: '',
    complaint: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.complaint.trim()) newErrors.complaint = 'Please describe your complaint';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await complaintService.submitComplaint(form);
      setShowSuccess(true);
      setForm({ name: '', phone: '', email: '', orderNumber: '', subject: '', complaint: '' });
      setErrors({});
      setTimeout(() => setShowSuccess(false), 5000);
      toast.success('Your complaint has been submitted. We will get back to you shortly.');
    } catch (error) {
      console.error('Complaint submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit complaint. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className={`cp-page ${isVisible ? 'cp-page--visible' : ''}`}>
      {/* ===== HERO SECTION ===== */}
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
                  File a Complaint
                </span>
                <h1 className="cp-hero-title">
                  We Take Your <span className="cp-hero-title-accent">Concerns</span> Seriously
                </h1>
                <p className="cp-hero-subtitle">
                  Encountered an issue? Let us know and we’ll resolve it promptly. Fill in the
                  details below or reach out to us directly.
                </p>

                <div className="cp-hero-quick">
                  <a href={PHONE_LINK} className="cp-hero-btn cp-hero-btn--call">
                    <FaPhoneAlt className="cp-hero-btn-icon" />
                    <span>Call Us</span>
                  </a>
                  <a href={WHATSAPP_LINK} className="cp-hero-btn cp-hero-btn--wa">
                    <FaWhatsapp className="cp-hero-btn-icon" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BODY: INFO + FORM ===== */}
      <div className="cp-body">
        {/* Left: Contact Info & FAQ */}
        <aside className="cp-info">
          <div className="cp-accent-bar" aria-hidden="true"></div>
          <h2 className="cp-section-label">Contact Details</h2>

          <div className="cp-contact-item">
            <div className="cp-icon-box" aria-hidden="true">
              <FaPhoneAlt />
            </div>
            <div>
              <p className="cp-ci-label">Phone</p>
              <a href={PHONE_LINK} className="cp-ci-value">{PHONE_DISPLAY}</a>
            </div>
          </div>

          <div className="cp-contact-item">
            <div className="cp-icon-box" aria-hidden="true">
              <FaWhatsapp />
            </div>
            <div>
              <p className="cp-ci-label">WhatsApp</p>
              <a href={WHATSAPP_LINK} className="cp-ci-value">{WHATSAPP_DISPLAY}</a>
            </div>
          </div>

          <div className="cp-contact-item">
            <div className="cp-icon-box" aria-hidden="true">
              <FaMapMarkerAlt />
            </div>
            <div>
              <p className="cp-ci-label">Location</p>
              <p className="cp-ci-value">Rahim Yar Khan, Pakistan</p>
            </div>
          </div>

          <hr className="cp-divider" />

          <h2 className="cp-section-label">Follow Us</h2>
          <div className="cp-socials">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-social-btn"
              aria-label="Follow us on Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-social-btn"
              aria-label="Follow us on Instagram"
            >
              <FaInstagram />
            </a>
          </div>

          <hr className="cp-divider" />

          <h2 className="cp-section-label">Frequently Asked Questions</h2>
          <div className="cp-faq-list">
            {faqData.map((item) => (
              <div
                key={item.id}
                className={`cp-faq-item ${expandedFaq === item.id ? 'cp-faq-open' : ''}`}
              >
                <button
                  type="button"
                  className="cp-faq-question"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={expandedFaq === item.id}
                >
                  <span>{item.question}</span>
                  <FaChevronDown
                    className={`cp-faq-icon ${expandedFaq === item.id ? 'cp-faq-icon-rotated' : ''}`}
                  />
                </button>
                <div className="cp-faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right: Complaint Form */}
        <div className="cp-form-wrap">
          {showSuccess ? (
            <div className="cp-success">
              <div className="cp-success-icon" aria-hidden="true">
                <FaCheckCircle />
              </div>
              <h2>Complaint Submitted!</h2>
              <p>Thank you for bringing this to our attention. We will review and respond soon.</p>
              <button
                className="cp-btn-ghost"
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/');
                }}
              >
                <FaEnvelope />
                Back to Home
              </button>
            </div>
          ) : (
            <form className="cp-form" onSubmit={handleSubmit} noValidate>
              <h2 className="cp-form-title">Submit a Complaint</h2>
              <p className="cp-form-subtitle">
                Please provide as much detail as possible so we can assist you effectively.
              </p>

              <div className="cp-field">
                <label className="cp-label" htmlFor="name">
                  <FaUser className="cp-label-icon" /> Name <span className="cp-required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`cp-input ${errors.name ? 'cp-input-error' : ''}`}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className="cp-error-text">{errors.name}</p>}
              </div>

              <div className="cp-row">
                <div className="cp-field">
                  <label className="cp-label" htmlFor="phone">
                    <FaPhone className="cp-label-icon" /> Phone <span className="cp-required">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`cp-input ${errors.phone ? 'cp-input-error' : ''}`}
                    placeholder="03XX-XXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && <p className="cp-error-text">{errors.phone}</p>}
                </div>
                <div className="cp-field">
                  <label className="cp-label" htmlFor="email">
                    <FaEnvelope className="cp-label-icon" /> Email (Optional)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`cp-input ${errors.email ? 'cp-input-error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="cp-error-text">{errors.email}</p>}
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="orderNumber">
                  <FaClipboardList className="cp-label-icon" /> Order Number (Optional)
                </label>
                <input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  className="cp-input"
                  placeholder="e.g. #ORD-12345"
                  value={form.orderNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="subject">
                  Subject <span className="cp-required">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className={`cp-input ${errors.subject ? 'cp-input-error' : ''}`}
                  placeholder="Brief subject of your complaint"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
                {errors.subject && <p className="cp-error-text">{errors.subject}</p>}
              </div>

              <div className="cp-field">
                <label className="cp-label" htmlFor="complaint">
                  Complaint Description <span className="cp-required">*</span>
                </label>
                <textarea
                  id="complaint"
                  name="complaint"
                  className={`cp-input cp-textarea ${errors.complaint ? 'cp-input-error' : ''}`}
                  placeholder="Describe the issue in detail..."
                  rows="5"
                  value={form.complaint}
                  onChange={handleChange}
                  required
                />
                {errors.complaint && <p className="cp-error-text">{errors.complaint}</p>}
              </div>

              <button
                type="submit"
                className={`cp-submit ${isSubmitting ? 'cp-loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="cp-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Complaint
                    <FaPaperPlane className="cp-submit-icon" />
                  </>
                )}
              </button>

              <p className="cp-note">
                <FaShieldAlt className="cp-note-icon" />
                Your information is secure and will only be used to address your complaint.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;