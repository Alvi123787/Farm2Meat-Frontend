import React, { useEffect, useState } from 'react'
import {
  FaShieldAlt,
  FaDatabase,
  FaCogs,
  FaShareAlt,
  FaLock,
  FaCookieBite,
  FaUserCheck,
  FaChild,
  FaSyncAlt,
  FaChevronRight,
  FaArrowLeft,
  FaPrint,
  FaCalendarAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa'
import '../css/PrivacyPolicy.css'
import { PHONE_DISPLAY, PHONE_LINK, WHATSAPP_LINK } from '../constants/contact'

const sections = [
  {
    id: 'collect',
    icon: <FaDatabase />,
    title: 'Information We Collect',
    subsections: [
      {
        subtitle: 'Personal Information',
        points: [
          'Name, contact number, email address',
          'Physical address and location details',
          'Account registration details and credentials',
        ],
      },
      {
        subtitle: 'Transactional Data',
        points: [
          'Purchase history and order details',
          'Goat listings and product interactions',
          'Payment and billing information',
        ],
      },
      {
        subtitle: 'Cookies & Usage Data',
        points: [
          'Device information and browser type',
          'IP address and geographic location',
          'Website activity, pages visited, and session duration',
        ],
      },
    ],
  },
  {
    id: 'usage',
    icon: <FaCogs />,
    title: 'How We Use Your Information',
    points: [
      'To facilitate buying and selling of goats on our platform.',
      'To communicate important updates, notifications, or promotional offers.',
      'To improve website experience, services, and user interface.',
      'To comply with legal obligations and regulatory requirements.',
      'To prevent fraud and ensure platform security.',
    ],
  },
  {
    id: 'sharing',
    icon: <FaShareAlt />,
    title: 'Sharing Your Information',
    intro: 'We do not sell personal information to third parties. Information may be shared with:',
    points: [
      'Sellers or buyers during a transaction to complete the order.',
      'Payment processors to securely handle and verify payments.',
      'Legal authorities if required by Pakistani law or court order.',
      'Service providers who assist in website operations under strict confidentiality.',
    ],
  },
  {
    id: 'security',
    icon: <FaLock />,
    title: 'Data Security',
    points: [
      'We implement industry-standard secure protocols (SSL/TLS) to protect your data.',
      'User data is stored in encrypted databases with restricted access controls.',
      'Users should also maintain security of their accounts and use strong passwords.',
      'No system is 100% secure; we are not responsible for breaches caused by external attacks beyond our control.',
    ],
  },
  {
    id: 'cookies',
    icon: <FaCookieBite />,
    title: 'Cookies',
    points: [
      'We use cookies to enhance website functionality and personalize user experience.',
      'Cookies help us analyze website traffic and understand user behavior.',
      'You may disable cookies in your browser settings; however, some features may not work properly.',
      'Third-party analytics tools (e.g., Google Analytics) may also use cookies.',
    ],
  },
  {
    id: 'rights',
    icon: <FaUserCheck />,
    title: 'Your Rights',
    points: [
      'Access your personal information stored on our platform at any time.',
      'Request correction of inaccurate or incomplete personal data.',
      'Request deletion of your account and associated personal information.',
      'Opt-out of marketing communications and promotional emails at any time.',
      'Withdraw consent for data processing where applicable.',
    ],
  },
  {
    id: 'children',
    icon: <FaChild />,
    title: "Children's Privacy",
    points: [
      'The website is not intended for users under 18 years of age.',
      'We do not knowingly collect personal information from children.',
      'If we discover that a child has provided personal data, we will delete it promptly.',
      'Parents or guardians who believe their child has submitted data should contact us immediately.',
    ],
  },
  {
    id: 'changes',
    icon: <FaSyncAlt />,
    title: 'Changes to Policy',
    points: [
      'This Privacy Policy may be updated periodically to reflect changes in our practices.',
      'Significant changes will be communicated via website notice or email notification.',
      'Continued use of the website after updates constitutes acceptance of the revised policy.',
      'We recommend reviewing this page regularly to stay informed about how we protect your data.',
    ],
  },
]

const dataHighlights = [
  {
    icon: <FaCheckCircle />,
    title: 'No Data Selling',
    desc: 'We never sell your data',
    color: 'green',
  },
  {
    icon: <FaLock />,
    title: 'Encrypted Storage',
    desc: 'SSL/TLS protection',
    color: 'blue',
  },
  {
    icon: <FaUserCheck />,
    title: 'Your Control',
    desc: 'Access & delete anytime',
    color: 'purple',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Legal Compliance',
    desc: 'Pakistani law protected',
    color: 'maroon',
  },
]

const PrivacyPolicy = () => {
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

  const handlePrint = () => window.print()

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`privacy-page ${isVisible ? 'privacy-page--visible' : ''}`}>

      {/* ══════════ HEADER ══════════ */}
      <section className="pp-header">
        <div className="pp-header-bg">
          <div className="pp-header-circle pp-header-circle--1"></div>
          <div className="pp-header-circle pp-header-circle--2"></div>
          <div className="pp-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="pp-header-content">
                <a href="/" className="pp-back-link">
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </a>
                <div className="pp-logo-wrap" style={{ marginBottom: '1.5rem' }}>
                  <a href="/">
                    <img 
                      src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                      alt="Farm2Meat Logo" 
                      style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    />
                  </a>
                </div>
                <div className="pp-header-main">
                  <div className="pp-header-icon-wrap">
                    <FaShieldAlt className="pp-header-icon" />
                  </div>
                  <div>
                    <h1 className="pp-header-title">Privacy Policy</h1>
                    <p className="pp-header-sub">
                      Your privacy matters to us. Learn how Farm2Meat protects your personal information.
                    </p>
                  </div>
                </div>
                <div className="pp-header-meta">
                  <div className="pp-meta-item">
                    <FaCalendarAlt className="pp-meta-icon" />
                    <span>Effective Date: January 1, 2024</span>
                  </div>
                  <div className="pp-meta-item">
                    <FaSyncAlt className="pp-meta-icon" />
                    <span>Last Updated: December 15, 2024</span>
                  </div>
                  <button className="pp-print-btn" onClick={handlePrint}>
                    <FaPrint className="pp-print-icon" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ DATA HIGHLIGHTS ══════════ */}
      <section className="pp-highlights-section">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="pp-highlights-grid">
                {dataHighlights.map((item, index) => (
                  <div
                    key={index}
                    className={`pp-highlight-card pp-highlight-card--${item.color}`}
                    style={{ '--hl-delay': `${index * 0.1}s` }}
                  >
                    <div className="pp-highlight-icon">{item.icon}</div>
                    <div className="pp-highlight-info">
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section className="pp-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="pp-layout">

                {/* ──── SIDEBAR ──── */}
                <aside className="pp-sidebar">
                  <div className="pp-sidebar-card">
                    <h3 className="pp-sidebar-title">Sections</h3>
                    <nav className="pp-sidebar-nav">
                      {sections.map((section, index) => (
                        <button
                          key={section.id}
                          className={`pp-nav-item ${activeSection === section.id ? 'pp-nav-item--active' : ''}`}
                          onClick={() => scrollToSection(section.id)}
                        >
                          <span className="pp-nav-num">{index + 1}</span>
                          <span className="pp-nav-label">{section.title}</span>
                          <FaChevronRight className="pp-nav-arrow" />
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="pp-sidebar-commitment">
                    <FaShieldAlt className="pp-sidebar-commitment-icon" />
                    <div>
                      <strong>Our Commitment</strong>
                      <p>Farm2Meat is committed to protecting your data with the highest standards of security and transparency.</p>
                    </div>
                  </div>
                </aside>

                {/* ──── CONTENT ──── */}
                <div className="pp-content">

                  {/* Introduction */}
                  <div className="pp-intro-card">
                    <div className="pp-intro-icon">🔒</div>
                    <div className="pp-intro-text">
                      <p>
                        <strong>Farm2Meat</strong> is committed to protecting your privacy.
                        This policy explains how we collect, use, and safeguard your personal
                        information when you use our website and services.
                      </p>
                      <p>
                        By using our platform, you consent to the data practices described in
                        this Privacy Policy. If you do not agree, please discontinue use of our services.
                      </p>
                    </div>
                  </div>

                  {/* Sections */}
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      id={section.id}
                      className="pp-section"
                    >
                      <div className="pp-section-header">
                        <div className="pp-section-num">{index + 1}</div>
                        <div className="pp-section-icon">{section.icon}</div>
                        <h2 className="pp-section-title">{section.title}</h2>
                      </div>
                      <div className="pp-section-body">

                        {/* Intro text if exists */}
                        {section.intro && (
                          <p className="pp-section-intro">{section.intro}</p>
                        )}

                        {/* Subsections (for Information We Collect) */}
                        {section.subsections && (
                          <div className="pp-subsections">
                            {section.subsections.map((sub, sIdx) => (
                              <div key={sIdx} className="pp-subsection">
                                <h4 className="pp-subsection-title">
                                  <span className="pp-subsection-bullet"></span>
                                  {sub.subtitle}
                                </h4>
                                <ul className="pp-points-list pp-points-list--nested">
                                  {sub.points.map((point, pIdx) => (
                                    <li key={pIdx} className="pp-point">
                                      <span className="pp-point-dash">—</span>
                                      <span className="pp-point-text">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Regular Points */}
                        {section.points && (
                          <ul className="pp-points-list">
                            {section.points.map((point, pIdx) => (
                              <li key={pIdx} className="pp-point">
                                <span className="pp-point-bullet"></span>
                                <span className="pp-point-text">{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Special callout for Security section */}
                        {section.id === 'security' && (
                          <div className="pp-callout pp-callout--warning">
                            <FaExclamationCircle className="pp-callout-icon" />
                            <span>
                              No digital system is 100% secure. We strongly recommend using
                              strong, unique passwords and enabling two-factor authentication
                              where available.
                            </span>
                          </div>
                        )}

                        {/* Special callout for Rights section */}
                        {section.id === 'rights' && (
                          <div className="pp-callout pp-callout--info">
                            <FaCheckCircle className="pp-callout-icon" />
                            <span>
                              To exercise any of your rights, contact us via WhatsApp at
                              {PHONE_DISPLAY} or email farm2meat@gmail.com. We will respond
                              within 7 business days.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Contact Section */}
                  <div className="pp-contact-card">
                    <h3 className="pp-contact-title">Questions About Your Privacy?</h3>
                    <p className="pp-contact-text">
                      Agar aapko apni privacy ke baare mein koi sawaal ya concern hai,
                      toh humse zaroor raabta karen. Hum aapki madad ke liye hamesha tayyar hain.
                    </p>
                    <div className="pp-contact-links">
                      <a
                        href={`${WHATSAPP_LINK}?text=Assalam%20o%20Alaikum!%20Privacy%20Policy%20ke%20baare%20mein%20poochna%20tha.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pp-contact-link pp-contact-link--wa"
                      >
                        <FaWhatsapp />
                        <span>WhatsApp</span>
                      </a>
                      <a href={PHONE_LINK} className="pp-contact-link pp-contact-link--phone">
                        <FaPhoneAlt />
                        <span>Call Us</span>
                      </a>
                      <a href="mailto:farm2meat@gmail.com" className="pp-contact-link pp-contact-link--email">
                        <FaEnvelope />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="pp-footer-note">
                    <p>
                      © 2024 Farm2Meat — All Rights Reserved. This Privacy Policy is governed
                      by the laws of Pakistan. By continuing to use this website, you acknowledge
                      and accept this privacy policy and all its terms.
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

export default PrivacyPolicy
