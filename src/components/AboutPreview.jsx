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
    title: 'Premium Meat',
    desc: 'Hand-selected livestock and expertly processed fresh cuts.',
    accent: 'maroon'
  },
  {
    icon: <FaBalanceScale />,
    title: 'Fair Pricing',
    desc: 'Transparent weight and competitive market rates.',
    accent: 'gold'
  },
  {
    icon: <FaWhatsapp />,
    title: 'Direct Support',
    desc: 'Custom cuts and bulk orders via direct team contact.',
    accent: 'maroon'
  },
  {
    icon: <FaTruck />,
    title: 'Fresh Delivery',
    desc: 'Safe and timely delivery to your door, every time.',
    accent: 'gold'
  }
]

const checklist = [
  'Hygienically Processed Meat',
  'Ethically Raised Livestock',
  'Cold-Chain Preservation',
  'Guaranteed Freshness & Quality'
]



export default function AboutPreview({
  buttonText = 'More About Us',
  to = '/about'
}) {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
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
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`abp-root${visible ? ' abp-root--visible' : ''}`}
    >
      <div className="abp-bg" aria-hidden="true">
        <div className="abp-bg__blob abp-bg__blob--1" />
        <div className="abp-bg__blob abp-bg__blob--2" />
      </div>

      <div className="container-fluid px-lg-5">

        <div className="abp-header">
          <span className="abp-eyebrow">About Us</span>
          <h2 className="abp-heading">
            Why Choose <span className="abp-heading__brand">MeatByAlvi</span>?
          </h2>
          <div className="abp-rule" />
        </div>

        <div className="row g-4 g-lg-5 px-md-2">

          <div className="col-12 col-lg-5">
            <div className="abp-desc">
              <div className="abp-desc__icon-wrap" aria-hidden="true">
                <FaShieldAlt />
              </div>

              <h3 className="abp-desc__title">Our Expertise</h3>

              <p className="abp-desc__body">
                At MeatByAlvi, we provide premium quality meat and healthy
                livestock sourced directly from our managed farms. Our focus is
                on maintaining the highest standards of hygiene and transparency,
                ensuring every family receives fresh, halal, and nutritious food
                with complete peace of mind.
              </p>

              <ul className="abp-checklist">
                {checklist.map((item, i) => (
                  <li key={i} className="abp-checklist__item">
                    <FaCheckCircle className="abp-checklist__icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                className="abp-cta"
                type="button"
                onClick={() => navigate(to)}
              >
                <span>{buttonText}</span>
                <FaArrowRight className="abp-cta__arrow" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="abp-features">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className={`abp-feature abp-feature--${feat.accent}`}
                  style={{ '--abp-delay': `${i * 0.08}s` }}
                >
                  <div className="abp-feature__icon" aria-hidden="true">
                    {feat.icon}
                  </div>
                  <h4 className="abp-feature__title">{feat.title}</h4>
                  <p className="abp-feature__desc">{feat.desc}</p>
                  <div className="abp-feature__bar" aria-hidden="true" />
                </div>
              ))}
            </div>


          </div>

        </div>
      </div>
    </section>
  )
}