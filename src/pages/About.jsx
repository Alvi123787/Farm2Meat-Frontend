import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaQuoteLeft,
  FaHandshake,
  FaHeart,
  FaShieldAlt,
  FaEye,
  FaBullseye,
  FaStar,
  FaWhatsapp,
  FaTruck,
  FaBalanceScale,
  FaUsers,
  FaSeedling,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaLeaf,
  FaMedal,
  FaGem,
  FaEnvelope
} from 'react-icons/fa'
import '../css/About.css'
import { PHONE_DISPLAY, PHONE_LINK, WHATSAPP_LINK } from '../constants/contact'

/* ── Animate-on-scroll hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => {
    try {
      return typeof window !== 'undefined' && !('IntersectionObserver' in window)
    } catch (e) {
      void e
      return false
    }
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}

/* ════════════════════════════════════════
   DATA
   ════════════════════════════════════════ */

const values = [
  {
    icon: <FaShieldAlt />,
    title: 'Food Safety First',
    desc: 'Our operations strictly adhere to food safety regulations. From sterile processing environments to temperature-controlled logistics, we ensure every cut of meat reaches you in its most hygienic and nutritious state.',
    color: '34, 85, 34'
  },
  {
    icon: <FaHeart />,
    title: 'Humane Handling',
    desc: 'We treat every animal with the respect it deserves. Our management protocols prioritize low-stress environments, natural feed, and ethical treatment, believing that compassionate care is the foundation of quality.',
    color: '139, 69, 19'
  },
  {
    icon: <FaHandshake />,
    title: 'Supply Chain Integrity',
    desc: 'We maintain a transparent, closed-loop supply chain. By managing everything from rearing to final processing, we eliminate middle-man uncertainties and guarantee the pedigree and purity of our products.',
    color: '128, 0, 0'
  },
  {
    icon: <FaGem />,
    title: 'Culinary Excellence',
    desc: 'Our meat isn\'t just a product; it\'s a culinary experience. We focus on marbling, texture, and aging to provide premium cuts that satisfy the most discerning chefs and home cooks alike.',
    color: '128, 0, 0'
  }
]

const offerings = [
  {
    icon: <FaCheckCircle />,
    title: 'Premium Meat Cuts',
    desc: 'Expertly hand-trimmed mutton, beef, and chicken. Each piece is selected for quality, ensuring you get the perfect balance of tenderness and flavor in every meal.'
  },
  {
    icon: <FaSeedling />,
    title: 'Ethical Livestock Rearing',
    desc: 'Our animals are raised on open pastures with natural, organic feed. We strictly avoid growth hormones and antibiotics, focusing on slow, natural growth for better health.'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Hygienic Processing',
    desc: 'Our state-of-the-art processing facility follows rigorous sanitization protocols. Every cut is tray-wrapped and quality-bagged to preserve freshness and prevent contamination.'
  },
  {
    icon: <FaBalanceScale />,
    title: 'Honest Weight System',
    desc: 'Digital precision in every transaction. We believe in "what you see is what you get," providing transparent weighing for both live animals and processed meat.'
  },
  {
    icon: <FaWhatsapp />,
    title: 'Farm-to-Table Transparency',
    desc: 'Track your order from the farm to your door. We provide live updates and video inspections so you can be 100% sure of the source and quality of your food.'
  },
  {
    icon: <FaTruck />,
    title: 'Temperature Controlled Delivery',
    desc: 'Our delivery fleet is optimized to maintain the cold chain. Your meat arrives at your doorstep fresh, never frozen, maintaining its natural juices and nutrients.'
  }
]

/* ════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════ */

export default function About() {
  const navigate = useNavigate()
  const [headerVisible, setHeaderVisible] = useState(false)
  const [storyRef, storyVis] = useReveal()
  const [missionRef, missionVis] = useReveal()
  const [offerRef, offerVis] = useReveal(0.08)
  const [valuesRef, valuesVis] = useReveal(0.08)
  const [founderRef, founderVis] = useReveal()
  const [ctaRef, ctaVis] = useReveal()

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="abt-page">
      <section className="abt-header-section">
        <div className="abt-header-bg">
          <div className="abt-header-circle abt-header-circle--1"></div>
          <div className="abt-header-circle abt-header-circle--2"></div>
          <div className="abt-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
          <div className="col-12">
            <div className={`abt-header-content ${headerVisible ? 'abt-header-content--visible' : ''}`}>
              <div className="unified-header-top">
                <button className="abt-back-link" type="button" onClick={() => navigate('/')}>
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </button>
                <div className="abt-logo-wrap logo-visibility-wrapper" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                  <img 
                    src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                    alt="MeatByAlvi Logo" 
                    style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                  />
                </div>
              </div>
              <div className="abt-header-main">
                  <div className="abt-header-icon-wrap">
                    <FaUsers className="abt-header-icon" />
                  </div>
                  <div>
                    <h1 className="abt-header-title">About MeatByAlvi</h1>
                    <p className="abt-header-sub">
                      Trust, quality, and fair prices — our promise, your confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ OUR STORY ══════════ */}
      <section
        ref={storyRef}
        className={`abt-story ${storyVis ? 'abt-reveal' : ''}`}
      >
        <div className="abt-story-decor">
          <div className="abt-story-decor-circle"></div>
        </div>
        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <span className="abt-section-badge">OUR STORY</span>
              <h2 className="abt-section-title">
                Our <span className="abt-section-highlight">Story</span>
              </h2>
              <div className="abt-section-divider">
                <span className="abt-sec-div-dot"></span>
                <span className="abt-sec-div-line"></span>
                <span className="abt-sec-div-dot"></span>
              </div>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-10">
              <div className="abt-story-card">
                <div className="abt-story-accent"></div>
                <div className="abt-story-body">
                  <div className="abt-story-quote-icon">
                    <FaQuoteLeft />
                  </div>
                  <p className="abt-story-text">
                    This journey started with a simple but powerful realization: that the heart of a great meal begins long before the kitchen. In the markets of Rahim Yar Khan, we saw families struggling to find meat they could truly trust—meat that wasn't just fresh, but sourced with integrity and handled with the highest standards of hygiene.
                  </p>
                  <p className="abt-story-text">
                    MeatByAlvi was born to bridge that gap. We didn't just want to be another meat shop; we set out to build a complete farm-to-table ecosystem. By taking full control of our supply chain—from the natural pastures where our livestock grazes to the sterile environments where our meat is processed—we've made "quality" more than just a buzzword. It's a promise kept every single day.
                  </p>
                  <p className="abt-story-text">
                    Our livestock management is rooted in deep respect for the animals. We believe that healthy, low-stress animals raised on organic feed naturally produce superior meat. This commitment to humane handling, combined with our rigorous compliance with food safety regulations, ensures that every cut of mutton, beef, or chicken we deliver is of the highest nutritional grade.
                  </p>
                  <p className="abt-story-text">
                    Today, MeatByAlvi stands as a testament to what's possible when you combine traditional values with modern food safety standards. We started small, but your trust has allowed us to grow into a comprehensive livestock and meat provider. Whether you're looking for a specific cut for a family dinner or a healthy animal for your farm, we are here to provide excellence, transparency, and the finest quality in the region.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MISSION & VISION ══════════ */}
      <section
        ref={missionRef}
        className={`abt-mission ${missionVis ? 'abt-reveal' : ''}`}
      >
        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <span className="abt-section-badge">MISSION & VISION</span>
              <h2 className="abt-section-title">
                Our <span className="abt-section-highlight">Purpose</span>
              </h2>
              <div className="abt-section-divider">
                <span className="abt-sec-div-dot"></span>
                <span className="abt-sec-div-line"></span>
                <span className="abt-sec-div-dot"></span>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-4 px-md-3 justify-content-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="abt-mv-card" style={{ '--abt-mv-delay': '0s' }}>
                <div className="abt-mv-icon-wrap abt-mv-icon-mission">
                  <FaBullseye />
                </div>
                <h3 className="abt-mv-title">Our Mission</h3>
                <p className="abt-mv-text">
                  Our mission is to redefine the standards of meat and livestock in Pakistan by providing 100% halal, farm-fresh, and ethically raised products. We aim to deliver premium-grade mutton, beef, and chicken directly to your doorstep with full transparency in weight and quality. By integrating technology with traditional husbandry, we ensure a seamless and trustworthy experience for every family we serve.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-5">
              <div className="abt-mv-card" style={{ '--abt-mv-delay': '0.15s' }}>
                <div className="abt-mv-icon-wrap abt-mv-icon-vision">
                  <FaEye />
                </div>
                <h3 className="abt-mv-title">Our Vision</h3>
                <p className="abt-mv-text">
                  Our vision is to become Pakistan's leading authority in the meat and livestock sector, recognized for our commitment to food safety, animal welfare, and customer trust. We envision a future where every household has access to healthy, traceable, and premium-quality meat, setting a benchmark for the entire industry through our farm-to-table excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ WHAT WE OFFER ══════════ */}
      <section
        ref={offerRef}
        className={`abt-offer ${offerVis ? 'abt-reveal' : ''}`}
      >
        <div className="abt-offer-decor">
          <div className="abt-offer-decor-circle-1"></div>
          <div className="abt-offer-decor-circle-2"></div>
        </div>

        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <span className="abt-section-badge">WHAT WE OFFER</span>
              <h2 className="abt-section-title">
                What We <span className="abt-section-highlight">Offer</span>
              </h2>
              <p className="abt-section-subtitle">
                At OnlyMeat, you get the best experience — from start to finish
              </p>
              <div className="abt-section-divider">
                <span className="abt-sec-div-dot"></span>
                <span className="abt-sec-div-line"></span>
                <span className="abt-sec-div-dot"></span>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-4 px-md-3">
            {offerings.map((item, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div
                  className="abt-offer-card"
                  style={{ '--abt-offer-delay': `${i * 0.08}s` }}
                >
                  <div className="abt-offer-icon">{item.icon}</div>
                  <h4 className="abt-offer-title">{item.title}</h4>
                  <p className="abt-offer-desc">{item.desc}</p>
                  <div className="abt-offer-line"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OUR VALUES ══════════ */}
      <section
        ref={valuesRef}
        className={`abt-values ${valuesVis ? 'abt-reveal' : ''}`}
      >
        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <span className="abt-section-badge">OUR VALUES</span>
              <h2 className="abt-section-title">
                Our <span className="abt-section-highlight">Core Values</span>
              </h2>
              <p className="abt-section-subtitle">
                These are the principles on which the foundation of OnlyMeat was laid
              </p>
              <div className="abt-section-divider">
                <span className="abt-sec-div-dot"></span>
                <span className="abt-sec-div-line"></span>
                <span className="abt-sec-div-dot"></span>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-4 px-md-3">
            {values.map((v, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                <div
                  className="abt-value-card"
                  style={{
                    '--abt-val-color': v.color,
                    '--abt-val-delay': `${i * 0.1}s`
                  }}
                >
                  <div className="abt-value-icon">{v.icon}</div>
                  <h4 className="abt-value-title">{v.title}</h4>
                  <p className="abt-value-desc">{v.desc}</p>
                  <div className="abt-value-line"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOUNDER ══════════ */}
      <section
        ref={founderRef}
        className={`abt-founder ${founderVis ? 'abt-reveal' : ''}`}
      >
        <div className="abt-founder-decor">
          <div className="abt-founder-decor-circle-1"></div>
          <div className="abt-founder-decor-circle-2"></div>
        </div>

        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <span className="abt-section-badge">FOUNDER</span>
              <h2 className="abt-section-title">
                Our <span className="abt-section-highlight">Founder</span>
              </h2>
              <div className="abt-section-divider">
                <span className="abt-sec-div-dot"></span>
                <span className="abt-sec-div-line"></span>
                <span className="abt-sec-div-dot"></span>
              </div>
            </div>
          </div>

          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-10">
              <div className="abt-founder-card">
                <div className="abt-founder-left">
                  <div className="abt-founder-img-wrap">
                    <img
                      src="../uploads/founder.jpg"
                      alt="Founder of OnlyMeat"
                      className="abt-founder-img"
                    />
                    <div className="abt-founder-img-border"></div>
                    <div className="abt-founder-img-glow"></div>
                  </div>

                  <div className="abt-founder-name-card">
                    <h3 className="abt-founder-name">Muhammad Ahmad</h3>
                    <span className="abt-founder-role">Founder &amp; CEO — OnlyMeat</span>
                    <div className="abt-founder-contact">
                      <a href={PHONE_LINK} className="abt-founder-contact-item">
                        <FaPhoneAlt /> <span>{PHONE_DISPLAY}</span>
                      </a>
                      <a href="mailto:rebalalvi123@gmail.com" className="abt-founder-contact-item">
                        <FaEnvelope /> <span>rebalalvi123@gmail.com</span>
                      </a>
                    </div>
                    <div className="abt-founder-location">
                      <FaMapMarkerAlt />
                      <span>Rahim Yar Khan, Punjab</span>
                    </div>
                  </div>
                </div>

                <div className="abt-founder-right">
                  <div className="abt-founder-quote-icon">
                    <FaQuoteLeft />
                  </div>
                  <p className="abt-founder-text">
                    My name is Muhammad Ahmad, and my life has been defined by the rolling pastures of Rahim Yar Khan. Growing up in a family deeply rooted in agriculture, I learned early on that true quality comes from a place of respect—respect for the land, the livestock, and the families we feed.
                  </p>
                  <p className="abt-founder-text">
                    When I looked at the traditional meat industry, I saw a gap between what families needed and what was available. There was a lack of transparency in sourcing, inconsistent hygiene standards, and a disconnect between the farm and the table. I realized that to fix this, we needed to own the entire process.
                  </p>
                  <p className="abt-founder-text">
                    MeatByAlvi was founded on the principle that meat should be more than just a commodity; it should be a source of health and vitality. By overseeing every step—from rearing livestock with natural feed to implementing sterile processing techniques—we've created a brand that stands for uncompromising quality.
                  </p>
                  <p className="abt-founder-text">
                    This isn't just a business for me; it's a lifelong commitment to my community. I consider every customer a guest at my own table, and ensuring your family receives the safest, freshest, and most ethical meat is my greatest priority. With your trust, we are raising the bar for the entire livestock industry in Pakistan.
                  </p>
                  <p className="abt-founder-text abt-founder-sign">
                    — Muhammad Ahmad, Founder OnlyMeat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section
        ref={ctaRef}
        className={`abt-cta ${ctaVis ? 'abt-reveal' : ''}`}
      >
        <div className="container-fluid px-lg-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <div className="abt-cta-card">
                <div className="abt-cta-glow"></div>
                <FaUsers className="abt-cta-icon" />
                <h2 className="abt-cta-title">Come, Join Us!</h2>
                <p className="abt-cta-text">
                  Whether you're looking for the finest meat for your kitchen or healthy livestock for your farm, MeatByAlvi is your trusted partner. Experience the difference that farm-to-table integrity makes. Contact us today to place an order or learn more about our processes.
                </p>
                <div className="abt-cta-actions">
                  <a href="/contact" className="abt-cta-btn abt-cta-btn-primary">
                    <span>Contact Us</span>
                    <FaArrowRight />
                  </a>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="abt-cta-btn abt-cta-btn-wa"
                  >
                    <FaWhatsapp />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
