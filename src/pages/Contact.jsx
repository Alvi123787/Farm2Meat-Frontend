import React, { useEffect, useRef, useState } from 'react'
import {
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope,
  FaPaperPlane,
  FaUser,
  FaPhone,
  FaPaw,
  FaCheckCircle,
  FaShieldAlt,
  FaTruck,
  FaVideo
} from 'react-icons/fa'
import '../css/Contact.css'
import {
  FACEBOOK_URL,
  PHONE_DISPLAY,
  PHONE_LINK,
  WHATSAPP_DISPLAY,
  WHATSAPP_LINK,
} from '../constants/contact'

const contactInfo = [
  {
    id: 1,
    icon: <FaPhoneAlt />,
    label: 'Phone',
    value: PHONE_DISPLAY,
    href: PHONE_LINK,
    color: 'primary',
  },
  {
    id: 2,
    icon: <FaWhatsapp />,
    label: 'WhatsApp',
    value: WHATSAPP_DISPLAY,
    href: WHATSAPP_LINK,
    color: 'whatsapp',
  },
  {
    id: 3,
    icon: <FaEnvelope />,
    label: 'Email',
    value: 'rebalalvi123@gmail.com',
    href: 'mailto:rebalalvi123@gmail.com',
    color: 'accent',
  },
  {
    id: 4,
    icon: <FaClock />,
    label: 'Working Hours',
    value: 'Mon – Sun: 8AM – 10PM',
    href: null,
    color: 'dark',
  },
]

const trustPoints = [
  { icon: <FaShieldAlt />, text: '100% Verified Animals' },
  { icon: <FaVideo />, text: 'Live Video Before Purchase' },
  { icon: <FaTruck />, text: 'Free Home Delivery in RYK' },
  { icon: <FaCheckCircle />, text: 'Cash on Delivery Available' },
]

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    requirement: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pageRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Build WhatsApp message from form
    const message = `Assalam o Alaikum!%0A%0A*New Inquiry from Website*%0A%0A👤 Name: ${formData.fullName}%0A📞 Phone: ${formData.phone}%0A%0A🐐 Requirement:%0A${formData.requirement}`

    setTimeout(() => {
      window.open(
        `${WHATSAPP_LINK}?text=${message}`,
        '_blank'
      )
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ fullName: '', phone: '', requirement: '' })

      setTimeout(() => setIsSubmitted(false), 5000)
    }, 800)
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
                  SERVICE & SUPPORT
                </span>
                <h1 className="cp-hero-title">
                  Contact <span className="cp-hero-title-accent">Us</span>
                </h1>
                <p className="cp-hero-subtitle">
                  We're here to guide you in choosing the best livestock with
                  <em> honesty and care</em>. Aapki har zaroorat hamari zimmedari hai.
                </p>

                {/* Quick Contact Buttons */}
                <div className="cp-hero-quick">
                  <a
                    href={`${WHATSAPP_LINK}?text=Assalam%20o%20Alaikum!%20Website%20se%20contact%20kar%20raha%20hun.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-hero-btn cp-hero-btn--wa"
                  >
                    <FaWhatsapp className="cp-hero-btn-icon" />
                    <span>WhatsApp Par Baat Karen</span>
                  </a>
                  <a href={PHONE_LINK} className="cp-hero-btn cp-hero-btn--call">
                    <FaPhoneAlt className="cp-hero-btn-icon" />
                    <span>Direct Call Karen</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT INFO CARDS
      ══════════════════════════════════════════ */}
      <section className="cp-info-section">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="cp-info-grid">
                {contactInfo.map((info, index) => (
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

                {/* ──────── LEFT: MAP + ADDRESS ──────── */}
                <div className="cp-map-col">
                  <div className="cp-map-header">
                    <h2 className="cp-section-title">
                      <FaMapMarkerAlt className="cp-section-icon" />
                      Our Location
                    </h2>
                    <p className="cp-section-sub">
                      Rahim Yar Khan mein hamari mandi ki exact location
                    </p>
                  </div>

                  {/* Google Map */}
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

                  {/* Address Card */}
                  <div className="cp-address-card">
                    <div className="cp-address-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="cp-address-content">
                      <strong className="cp-address-title">MeatByAlvi Office</strong>
                      <p className="cp-address-text">
                        Near Gulshan Iqbal 110/p, <br />
                        Rahim Yar Khan, Punjab, Pakistan
                      </p>
                    </div>
                  </div>

                  {/* Trust Points */}
                  <div className="cp-trust-grid">
                    {trustPoints.map((point, index) => (
                      <div key={index} className="cp-trust-item">
                        <span className="cp-trust-icon">{point.icon}</span>
                        <span className="cp-trust-text">{point.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ──────── RIGHT: INQUIRY FORM ──────── */}
                <div className="cp-form-col">
                  <div className="cp-form-card">

                    {/* Form Header */}
                    <div className="cp-form-header">
                      <h2 className="cp-section-title">
                        <FaPaw className="cp-section-icon" />
                        Apni Zaroorat Batayen
                      </h2>
                      <p className="cp-section-sub">
                        Janwar ki breed, weight, aur budget batayen — hum aapko behtareen option denge.
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
                          placeholder="Apna poora naam likhein"
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

                      {/* Requirement */}
                      <div className="cp-form-group">
                        <label className="cp-form-label" htmlFor="requirement">
                          <FaPaw className="cp-label-icon" />
                          Animal Requirement <span className="cp-required">*</span>
                        </label>
                        <textarea
                          id="requirement"
                          name="requirement"
                          className="cp-form-textarea"
                          placeholder="Breed, weight range, budget, aur koi bhi khaas zaroorat likhein...&#10;&#10;Example: Beetal bakra chahiye, 40-50kg, budget 60,000 tak"
                          rows="5"
                          value={formData.requirement}
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
                            <span>Send via WhatsApp</span>
                          </>
                        )}
                      </button>

                      {/* Success Message */}
                      {isSubmitted && (
                        <div className="cp-form-success">
                          <FaCheckCircle className="cp-success-icon" />
                          <span>Inquiry sent successfully! We'll contact you shortly.</span>
                        </div>
                      )}

                      {/* Form Note */}
                      <p className="cp-form-note">
                        <FaShieldAlt className="cp-note-icon" />
                        Aapki information secure hai — sirf WhatsApp par response diya jayega.
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
              <h3 className="cp-social-title">Connect With Us Directly</h3>
              <p className="cp-social-sub">
                Social media par bhi humse jud sakte hain — live updates aur nayi collection dekhein
              </p>

              <div className="cp-social-grid">
                {/* WhatsApp */}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-social-card cp-social-card--wa"
                >
                  <div className="cp-social-card-icon">
                    <FaWhatsapp />
                  </div>
                  <div className="cp-social-card-info">
                    <strong>WhatsApp</strong>
                    <span>Direct Message</span>
                  </div>
                </a>

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
                    <span>Follow Our Page</span>
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
                    <span>{PHONE_DISPLAY}</span>
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

export default Contact
