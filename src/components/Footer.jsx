import React from 'react'
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaChevronRight,
  FaShieldAlt
} from 'react-icons/fa'
import '../css/Footer.css'
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_LINK,
  WHATSAPP_DISPLAY,
  WHATSAPP_LINK,
} from '../constants/contact'

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
]

const socialLinks = [
  { icon: <FaFacebookF />, href: FACEBOOK_URL, label: 'Facebook' },
  { icon: <FaInstagram />, href: INSTAGRAM_URL, label: 'Instagram' },
  { icon: <FaWhatsapp />, href: WHATSAPP_LINK, label: 'WhatsApp' },
]

const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,70 1440,60 L1440,0 L0,0 Z"
            fill="var(--bg-main)"
          />
        </svg>
      </div>

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="footer-content">

              {/* ---- BRAND COLUMN ---- */}
              <div className="footer-col footer-brand-col">
                <div className="footer-logo-wrap logo-visibility-wrapper" style={{ marginBottom: '1.5rem' }}>
                  <img 
                    src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                    alt="MeatByAlvi Logo" 
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                </div>
                <h3 className="footer-brand">
                  MeatBy <span className="footer-brand-accent">Alvi</span>
                </h3>
                <p className="footer-brand-desc">
                  Rahim Yar Khan ki sab se bharosemand online mandi — sehatmand janwar, live video verification, aur free home delivery.
                </p>
                <div className="footer-social">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-link"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* ---- QUICK LINKS COLUMN ---- */}
              <div className="footer-col">
                <h4 className="footer-col-title">Quick Links</h4>
                <ul className="footer-links">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.path} className="footer-link">
                        <FaChevronRight className="footer-link-arrow" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ---- CONTACT INFO COLUMN ---- */}
              <div className="footer-col">
                <h4 className="footer-col-title">Contact Info</h4>
                <ul className="footer-contact-list">
                  <li className="footer-contact-item">
                    <span className="footer-contact-icon">
                      <FaPhoneAlt />
                    </span>
                    <div>
                      <span className="footer-contact-label">Phone</span>
                      <a href={PHONE_LINK} className="footer-contact-value">
                        {PHONE_DISPLAY}
                      </a>
                    </div>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-icon">
                      <FaWhatsapp />
                    </span>
                    <div>
                      <span className="footer-contact-label">WhatsApp</span>
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-contact-value"
                      >
                        {WHATSAPP_DISPLAY}
                      </a>
                    </div>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-icon">
                      <FaEnvelope />
                    </span>
                    <div>
                      <span className="footer-contact-label">Email</span>
                      <a href="mailto:rebalalvi123@gmail.com" className="footer-contact-value">
                        rebalalvi123@gmail.com
                      </a>
                    </div>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-icon">
                      <FaMapMarkerAlt />
                    </span>
                    <div>
                      <span className="footer-contact-label">Office</span>
                      <span className="footer-contact-value">
                        Near Gulshan Iqbal 110/p, Rahim Yar Khan, Punjab, Pakistan
                      </span>
                    </div>
                  </li>
                  <li className="footer-contact-item">
                    <span className="footer-contact-icon">
                      <FaClock />
                    </span>
                    <div>
                      <span className="footer-contact-label">Timing</span>
                      <span className="footer-contact-value">
                        Mon – Sun: 8:00 AM – 10:00 PM
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* ---- TRUST COLUMN ---- */}
              <div className="footer-col">
                <h4 className="footer-col-title">Why Trust Us?</h4>
                <div className="footer-trust-list">
                  <div className="footer-trust-item">
                    <FaShieldAlt className="footer-trust-icon" />
                    <span>100% Verified Animals</span>
                  </div>
                  <div className="footer-trust-item">
                    <FaShieldAlt className="footer-trust-icon" />
                    <span>Live Video Before Purchase</span>
                  </div>
                  <div className="footer-trust-item">
                    <FaShieldAlt className="footer-trust-icon" />
                    <span>Cash on Delivery</span>
                  </div>
                  <div className="footer-trust-item">
                    <FaShieldAlt className="footer-trust-icon" />
                    <span>Free Home Delivery in RYK</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ---- COPYRIGHT BAR ---- */}
      <div className="footer-bottom">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="footer-bottom-content">
                <p className="footer-copyright">
                  &copy; 2024 MeatByAlvi &mdash; All Rights Reserved.
                </p>
                <div className="footer-bottom-links">
                  <a href="/privacy-policy">Privacy Policy</a>
                  <span className="footer-dot">&bull;</span>
                  <a href="/terms">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
