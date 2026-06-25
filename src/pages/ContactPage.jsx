import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'react-icons/fa';
import '../css/ContactPage.css'; // will be replaced with new CSS
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_LINK,
  WHATSAPP_DISPLAY,
  WHATSAPP_LINK,
} from '../constants/contact';
import feedbackService from '../services/feedbackService';
import toast from 'react-hot-toast';

const faqData = [
  {
    id: 1,
    question: 'What are your delivery hours?',
    answer: 'We deliver from 8:00 AM to 11:00 PM, Monday through Sunday.',
  },
  {
    id: 2,
    question: 'Do you deliver in Rahim Yar Khan only?',
    answer: 'Currently, we primarily deliver in Rahim Yar Khan. For other areas, please contact us.',
  },
  {
    id: 3,
    question: 'How can I place an order?',
    answer: 'You can order through our website, WhatsApp, or by calling us directly.',
  },
  {
    id: 4,
    question: 'Is your meat 100% halal?',
    answer: 'Yes, all our meat is 100% halal and sourced from trusted farms.',
  },
];

const ContactPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
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
    if (!form.message.trim()) newErrors.message = 'Message is required';
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
      await feedbackService.sendFeedback({
        fullName: form.name,
        phone: form.phone,
        email: form.email,
        feedback: `Subject: ${form.subject}\n\n${form.message}`,
      });
      setShowSuccess(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
      setErrors({});
      setTimeout(() => setShowSuccess(false), 5000);
      toast.success('Thank you! We will get back to you soon.');
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className={`ct-page ${isVisible ? 'ct-page--visible' : ''}`}>
      {/* ===== HERO SECTION (same style as feedback page) ===== */}
      <section className="ct-hero">
        <div className="ct-hero-bg">
          <div className="ct-hero-circle ct-hero-circle--1"></div>
          <div className="ct-hero-circle ct-hero-circle--2"></div>
          <div className="ct-hero-pattern"></div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="ct-hero-content">
                <span className="ct-hero-badge">
                  <span className="ct-hero-badge-dot"></span>
                  Get in Touch
                </span>
                <h1 className="ct-hero-title">
                  We're Here to <span className="ct-hero-title-accent">Help</span>
                </h1>
                <p className="ct-hero-subtitle">
                  Have a question or need assistance? Reach out to us — we're just a message or call away.
                </p>

                <div className="ct-hero-quick">
                  <a href={PHONE_LINK} className="ct-hero-btn ct-hero-btn--call">
                    <FaPhoneAlt className="ct-hero-btn-icon" />
                    <span>Call Us</span>
                  </a>
                  <a href={WHATSAPP_LINK} className="ct-hero-btn ct-hero-btn--wa">
                    <FaWhatsapp className="ct-hero-btn-icon" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BODY: INFO + FORM ===== */}
      <div className="ct-body">
        {/* Left: Contact Info & FAQ */}
        <aside className="ct-info">
          <div className="ct-accent-bar" aria-hidden="true"></div>
          <h2 className="ct-section-label">Contact Details</h2>

          <div className="ct-contact-item">
            <div className="ct-icon-box" aria-hidden="true">
              <FaPhoneAlt />
            </div>
            <div>
              <p className="ct-ci-label">Phone</p>
              <a href={PHONE_LINK} className="ct-ci-value">{PHONE_DISPLAY}</a>
            </div>
          </div>

          <div className="ct-contact-item">
            <div className="ct-icon-box" aria-hidden="true">
              <FaWhatsapp />
            </div>
            <div>
              <p className="ct-ci-label">WhatsApp</p>
              <a href={WHATSAPP_LINK} className="ct-ci-value">{WHATSAPP_DISPLAY}</a>
            </div>
          </div>

          <div className="ct-contact-item">
            <div className="ct-icon-box" aria-hidden="true">
              <FaMapMarkerAlt />
            </div>
            <div>
              <p className="ct-ci-label">Location</p>
              <p className="ct-ci-value">Rahim Yar Khan, Pakistan</p>
            </div>
          </div>

          <hr className="ct-divider" />

          <h2 className="ct-section-label">Follow Us</h2>
          <div className="ct-socials">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-social-btn"
              aria-label="Follow us on Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-social-btn"
              aria-label="Follow us on Instagram"
            >
              <FaInstagram />
            </a>
          </div>

          <hr className="ct-divider" />

          <h2 className="ct-section-label">Frequently Asked Questions</h2>
          <div className="ct-faq-list">
            {faqData.map((item) => (
              <div
                key={item.id}
                className={`ct-faq-item ${expandedFaq === item.id ? 'ct-faq-open' : ''}`}
              >
                <button
                  type="button"
                  className="ct-faq-question"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={expandedFaq === item.id}
                >
                  <span>{item.question}</span>
                  <FaChevronDown
                    className={`ct-faq-icon ${expandedFaq === item.id ? 'ct-faq-icon-rotated' : ''}`}
                  />
                </button>
                <div className="ct-faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right: Contact Form */}
        <div className="ct-form-wrap">
          {showSuccess ? (
            <div className="ct-success">
              <div className="ct-success-icon" aria-hidden="true">
                <FaCheckCircle />
              </div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We will get back to you soon.</p>
              <button
                className="ct-btn-ghost"
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
            <form className="ct-form" onSubmit={handleSubmit} noValidate>
              <h2 className="ct-form-title">Send Us a Message</h2>
              <p className="ct-form-subtitle">
                Fill out the form below and we'll respond as soon as possible.
              </p>

              <div className="ct-field">
                <label className="ct-label" htmlFor="name">
                  <FaUser className="ct-label-icon" /> Name <span className="ct-required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`ct-input ${errors.name ? 'ct-input-error' : ''}`}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className="ct-error-text">{errors.name}</p>}
              </div>

              <div className="ct-row">
                <div className="ct-field">
                  <label className="ct-label" htmlFor="phone">
                    <FaPhone className="ct-label-icon" /> Phone <span className="ct-required">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`ct-input ${errors.phone ? 'ct-input-error' : ''}`}
                    placeholder="03XX-XXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && <p className="ct-error-text">{errors.phone}</p>}
                </div>
                <div className="ct-field">
                  <label className="ct-label" htmlFor="email">
                    <FaEnvelope className="ct-label-icon" /> Email (Optional)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`ct-input ${errors.email ? 'ct-input-error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="ct-error-text">{errors.email}</p>}
                </div>
              </div>

              <div className="ct-field">
                <label className="ct-label" htmlFor="subject">
                  Subject <span className="ct-required">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className={`ct-input ${errors.subject ? 'ct-input-error' : ''}`}
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
                {errors.subject && <p className="ct-error-text">{errors.subject}</p>}
              </div>

              <div className="ct-field">
                <label className="ct-label" htmlFor="message">
                  Message <span className="ct-required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  className={`ct-input ct-textarea ${errors.message ? 'ct-input-error' : ''}`}
                  placeholder="Tell us what you need..."
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
                {errors.message && <p className="ct-error-text">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className={`ct-submit ${isSubmitting ? 'ct-loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="ct-spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <FaPaperPlane className="ct-submit-icon" />
                  </>
                )}
              </button>

              <p className="ct-note">
                <FaShieldAlt className="ct-note-icon" />
                Your information is secure.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;