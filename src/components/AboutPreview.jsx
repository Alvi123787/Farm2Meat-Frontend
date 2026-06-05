import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaShieldAlt,
  FaBalanceScale,
  FaWhatsapp,
  FaTruck,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa'
import '../css/AboutPreview.css'

const features = [
  {
    icon: <FaShieldAlt />,
    title: 'Premium Quality',
    desc: 'Har janwar carefully selected aur farm-raised hota hai.',
    color: '128, 0, 0'
  },
  {
    icon: <FaBalanceScale />,
    title: 'Honest Weight',
    desc: 'Transparent pricing aur accurate wazan ki guarantee.',
    color: '139, 69, 19'
  },
  {
    icon: <FaWhatsapp />,
    title: 'WhatsApp Support',
    desc: 'Live video call par janwar dekh kar tasalli karein.',
    color: '34, 85, 34'
  },
  {
    icon: <FaTruck />,
    title: 'Home Delivery',
    desc: 'Aapke ghar tak safe aur timely delivery ka intezaam.',
    color: '128, 0, 0'
  }
]

export default function AboutPreview({
  buttonText = 'More About Us',
  to = '/about'
}) {
  const navigate = useNavigate()
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      const t = setTimeout(() => setVisible(true), 120)
      return () => clearTimeout(t)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className={`ap-section ${visible ? 'ap-section--visible' : ''}`}
    >
      {/* Decorative Background */}
      <div className="ap-bg-decor">
        <div className="ap-decor-circle ap-decor-circle-1"></div>
        <div className="ap-decor-circle ap-decor-circle-2"></div>
        <div className="ap-decor-circle ap-decor-circle-3"></div>
      </div>

      <div className="container-fluid px-lg-5">
        {/* Section Header */}
        <div className="row mb-5">
          <div className="col-12">
            <span className="ap-badge">ABOUT US</span>
            <h2 className="ap-title">
              Why Choose <span className="ap-title-highlight">OnlyMeat</span>?
            </h2>
            <div className="ap-title-divider">
              <span className="ap-divider-dot"></span>
              <span className="ap-divider-line"></span>
              <span className="ap-divider-dot"></span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row g-4 px-md-3">
          {/* Left — Description Card */}
          <div className="col-12 col-lg-5">
            <div className="ap-desc-card">
              <div className="ap-desc-card-accent"></div>
              <div className="ap-desc-card-body">
                <div className="ap-desc-icon-wrap">
                  <FaShieldAlt />
                </div>
                <h3 className="ap-desc-heading">Hamari Pehchaan</h3>
                <p className="ap-desc-text">
                  MeatByAlvi par aapko sehatmand aur farm-raised bakray miltay
                  hain — honest weight, transparent pricing, aur WhatsApp
                  support ke saath. Har janwar carefully selected hota hai
                  taake aapko premium quality aur trust dono milein.
                </p>
                <ul className="ap-desc-list">
                  <li className="ap-desc-list-item">
                    <FaCheckCircle className="ap-check-icon" />
                    <span>Verified &amp; Healthy Animals</span>
                  </li>
                  <li className="ap-desc-list-item">
                    <FaCheckCircle className="ap-check-icon" />
                    <span>Live WhatsApp Video Inspection</span>
                  </li>
                  <li className="ap-desc-list-item">
                    <FaCheckCircle className="ap-check-icon" />
                    <span>Cash on Delivery Available</span>
                  </li>
                  <li className="ap-desc-list-item">
                    <FaCheckCircle className="ap-check-icon" />
                    <span>Free Home Delivery in RYK</span>
                  </li>
                </ul>
                <button
                  className="ap-btn"
                  type="button"
                  onClick={() => navigate(to)}
                >
                  <span className="ap-btn-text">{buttonText}</span>
                  <FaArrowRight className="ap-btn-arrow" />
                </button>
              </div>
            </div>
          </div>

          {/* Right — Feature Cards */}
          <div className="col-12 col-lg-7">
            <div className="row g-3">
              {features.map((feat, i) => (
                <div key={i} className="col-6 col-sm-6">
                  <div
                    className="ap-feature-card"
                    style={{ '--ap-feat-color': feat.color, '--ap-delay': `${i * 0.1}s` }}
                  >
                    <div className="ap-feature-icon">{feat.icon}</div>
                    <h4 className="ap-feature-title">{feat.title}</h4>
                    <p className="ap-feature-desc">{feat.desc}</p>
                    <div className="ap-feature-line"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
