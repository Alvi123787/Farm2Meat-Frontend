import React, { useEffect, useState } from 'react'
import {
  FaGavel,
  FaUserShield,
  FaIdCard,
  FaHandshake,
  FaMoneyCheckAlt,
  FaBan,
  FaExclamationTriangle,
  FaCopyright,
  FaUserSlash,
  FaSyncAlt,
  FaChevronRight,
  FaArrowLeft,
  FaPrint,
  FaCalendarAlt,
  FaShieldAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope
} from 'react-icons/fa'
import "../css/Terms.css"
import { PHONE_LINK, WHATSAPP_LINK } from '../constants/contact'

const sections = [
  {
    id: 'use',
    icon: <FaUserShield />,
    title: 'Use of Website',
    points: [
      'You must be at least 18 years old to use this site.',
      'You agree to use the website only for lawful purposes related to buying, selling, or learning about goats.',
      'You shall not misuse the website, hack, or access unauthorized areas of the site.',
    ],
  },
  {
    id: 'account',
    icon: <FaIdCard />,
    title: 'Account Registration',
    points: [
      'Users must provide accurate and complete information during registration.',
      'You are responsible for keeping your account details, including password, confidential.',
      'Any activity on your account will be considered your responsibility.',
    ],
  },
  {
    id: 'buying',
    icon: <FaHandshake />,
    title: 'Buying and Selling Goats',
    points: [
      'All transactions between buyers and sellers are solely between the parties involved.',
      'The website acts as a platform and is not responsible for disputes between users.',
      'Sellers must ensure that all livestock listed is healthy and as described.',
      'Buyers should verify the information provided and inspect goats where possible before purchase.',
    ],
  },
  {
    id: 'payments',
    icon: <FaMoneyCheckAlt />,
    title: 'Payments',
    points: [
      'Payments should be made through approved channels only.',
      'The website does not hold funds or act as an escrow unless explicitly mentioned.',
      'Refunds and cancellations are subject to agreement between buyer and seller.',
    ],
  },
  {
    id: 'prohibited',
    icon: <FaBan />,
    title: 'Prohibited Activities',
    points: [
      'Posting false or misleading information about goats.',
      'Using the platform for illegal activities (e.g., fraud, animal cruelty).',
      'Sending spam, advertisements, or unsolicited messages.',
    ],
  },
  {
    id: 'liability',
    icon: <FaExclamationTriangle />,
    title: 'Limitation of Liability',
    points: [
      'The website is not liable for any damages, losses, or disputes arising from the purchase, sale, or inspection of goats.',
      'Users agree to indemnify the website from any claims resulting from their actions on the platform.',
    ],
  },
  {
    id: 'ip',
    icon: <FaCopyright />,
    title: 'Intellectual Property',
    points: [
      'All content on the website, including images, text, and logos, is the property of the website unless otherwise stated.',
      'You may not use content for commercial purposes without prior permission.',
    ],
  },
  {
    id: 'termination',
    icon: <FaUserSlash />,
    title: 'Termination',
    points: [
      'The website reserves the right to suspend or terminate accounts violating terms.',
      'Termination may occur without prior notice in case of severe misconduct.',
    ],
  },
  {
    id: 'changes',
    icon: <FaSyncAlt />,
    title: 'Changes to Terms',
    points: [
      'Terms may be updated periodically. Users are encouraged to review the page regularly.',
      'Continued use of the website after updates constitutes acceptance of the revised terms.',
    ],
  },
]

const Terms = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={`terms-page ${isVisible ? 'terms-page--visible' : ''}`}>

      {/* ══════════ HEADER ══════════ */}
      <section className="tp-header">
        <div className="tp-header-bg">
          <div className="tp-header-circle tp-header-circle--1"></div>
          <div className="tp-header-circle tp-header-circle--2"></div>
          <div className="tp-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
          <div className="col-12">
            <div className="tp-header-content">
              <div className="unified-header-top">
                <a href="/" className="tp-back-link">
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </a>
                <div className="tp-logo-wrap logo-visibility-wrapper" style={{ cursor: 'pointer' }}>
                  <a href="/">
                    <img 
                      src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                      alt="OnlyMeat Logo" 
                      style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                    />
                  </a>
                </div>
              </div>
              <div className="tp-header-main">
                  <div className="tp-header-icon-wrap">
                    <FaGavel className="tp-header-icon" />
                  </div>
                  <div>
                    <h1 className="tp-header-title">Terms & Conditions</h1>
                    <p className="tp-header-sub">
                      Please read these terms carefully before using OnlyMeat's services.
                    </p>
                  </div>
                </div>
                <div className="tp-header-meta">
                  <div className="tp-meta-item">
                    <FaCalendarAlt className="tp-meta-icon" />
                    <span>Effective Date: January 1, 2024</span>
                  </div>
                  <div className="tp-meta-item">
                    <FaSyncAlt className="tp-meta-icon" />
                    <span>Last Updated: December 15, 2024</span>
                  </div>
                  <button className="tp-print-btn" onClick={handlePrint}>
                    <FaPrint className="tp-print-icon" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section className="tp-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="tp-layout">

                {/* ──── SIDEBAR NAV ──── */}
                <aside className="tp-sidebar">
                  <div className="tp-sidebar-card">
                    <h3 className="tp-sidebar-title">Quick Navigation</h3>
                    <nav className="tp-sidebar-nav">
                      {sections.map((section, index) => (
                        <button
                          key={section.id}
                          className={`tp-nav-item ${activeSection === section.id ? 'tp-nav-item--active' : ''}`}
                          onClick={() => scrollToSection(section.id)}
                        >
                          <span className="tp-nav-num">{index + 1}</span>
                          <span className="tp-nav-label">{section.title}</span>
                          <FaChevronRight className="tp-nav-arrow" />
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Sidebar Trust */}
                  <div className="tp-sidebar-trust">
                    <FaShieldAlt className="tp-sidebar-trust-icon" />
                    <p>Your rights are protected under Pakistani consumer law.</p>
                  </div>
                </aside>

                {/* ──── CONTENT ──── */}
                <div className="tp-content">

                  {/* Introduction */}
                  <div className="tp-intro-card">
                    <div className="tp-intro-icon">📜</div>
                    <div className="tp-intro-text">
                      <p>
                        Welcome to <strong>OnlyMeat</strong>. By using our website and services,
                        you agree to the following terms and conditions. Please read them carefully
                        before proceeding with any transaction on our platform.
                      </p>
                      <p>
                        These terms apply to all users — buyers, sellers, and visitors —
                        accessing <strong>onlymeat.com</strong> from Rahim Yar Khan and beyond.
                      </p>
                    </div>
                  </div>

                  {/* Sections */}
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      id={section.id}
                      className="tp-section"
                      style={{ '--section-delay': `${index * 0.06}s` }}
                    >
                      <div className="tp-section-header">
                        <div className="tp-section-num">{index + 1}</div>
                        <div className="tp-section-icon">{section.icon}</div>
                        <h2 className="tp-section-title">{section.title}</h2>
                      </div>
                      <div className="tp-section-body">
                        <ul className="tp-points-list">
                          {section.points.map((point, pIndex) => (
                            <li key={pIndex} className="tp-point">
                              <span className="tp-point-bullet"></span>
                              <span className="tp-point-text">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {/* Contact Section */}
                  <div className="tp-contact-card">
                    <h3 className="tp-contact-title">Questions About These Terms?</h3>
                    <p className="tp-contact-text">
                      Agar aapko in terms ke baare mein koi sawaal hai, toh humse zaroor raabta karen.
                    </p>
                    <div className="tp-contact-links">
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tp-contact-link tp-contact-link--wa"
                      >
                        <FaWhatsapp />
                        <span>WhatsApp</span>
                      </a>
                      <a href={PHONE_LINK} className="tp-contact-link tp-contact-link--phone">
                        <FaPhoneAlt />
                        <span>Call Us</span>
                      </a>
                      <a href="mailto:onlymeat@gmail.com" className="tp-contact-link tp-contact-link--email">
                        <FaEnvelope />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="tp-footer-note">
                    <p>
                      © 2024 OnlyMeat — All Rights Reserved. These terms and conditions are
                      governed by the laws of Pakistan. By continuing to use this website, you
                      acknowledge and accept these terms.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Terms
