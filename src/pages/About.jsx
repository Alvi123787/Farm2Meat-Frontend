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
    icon: <FaHandshake />,
    title: 'Trust & Integrity',
    desc: 'We deal with every customer with complete honesty. Animal weight, health, and breed — everything is fully transparent. Our goal is not just to sell once, but to win your trust that lasts a lifetime.',
    color: '128, 0, 0'
  },
  {
    icon: <FaHeart />,
    title: 'Animal Care',
    desc: 'Every animal here is kept with full love and care. Their feed, clean water, and health are fully taken care of. We believe that only a healthy animal brings blessings to your home.',
    color: '139, 69, 19'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Quality Promise',
    desc: 'Every animal at OnlyMeat is carefully selected. We never compromise on quality. Every goat and sheep is checked under the supervision of experts to ensure you get only the best.',
    color: '34, 85, 34'
  },
  {
    icon: <FaGem />,
    title: 'Customer First',
    desc: 'You are our top priority. Answering your every need, question, and concern is our responsibility. Whether day or night, our team is always ready for your service — because you are our true asset.',
    color: '128, 0, 0'
  }
]

const offerings = [
  {
    icon: <FaBalanceScale />,
    title: 'Honest Weight System',
    desc: 'Accurate weight from a digital weighing machine — no guesses, no deception. You can see the weight with your own eyes and shop with complete satisfaction.'
  },
  {
    icon: <FaWhatsapp />,
    title: 'Live Video Inspection',
    desc: 'You can see your animal via live video call on WhatsApp from the comfort of your home. Every angle, every detail — so that you have no doubt and making a decision becomes easy.'
  },
  {
    icon: <FaTruck />,
    title: 'Safe Home Delivery',
    desc: 'Safe and timely delivery in Rahim Yar Khan and surrounding areas. The animal is delivered to your doorstep with full safety — exactly as you saw in the video.'
  },
  {
    icon: <FaSeedling />,
    title: 'Farm-Raised Animals',
    desc: 'All animals are raised in open and clean environments. Natural pastures, clean water, and full nutrition — this is why our animals are healthy and active.'
  },
  {
    icon: <FaMedal />,
    title: 'Premium Breeds',
    desc: 'We only keep the best breeds of animals that are famous for their beauty, weight, and health. Whether for Qurbani or for raising — every breed has its own place.'
  },
  {
    icon: <FaPhoneAlt />,
    title: '24/7 Support',
    desc: 'Our team is always present for your help. Any question, any difficulty — just a call or message away. We believe in listening to you and solving the problem.'
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
                    This journey started with a very simple thought — that the people of Rahim Yar Khan
                    should get the best animals at home without any deception or trouble. We saw that
                    in the market (mandi), people are often troubled — there is a difference in weight,
                    quality is unknown, and it's hard to trust.
                  </p>
                  <p className="abt-story-text">
                    To solve this problem, the concept of MeatByAlvi was born. We thought that if we
                    bring technology and honesty together — then we can create a platform where people
                    not only get good quality but also have complete trust. And that's exactly what we did.
                  </p>
                  <p className="abt-story-text">
                    Today, MeatByAlvi is a well-known name in Rahim Yar Khan. Thanks to our customers,
                    we are growing every day. Behind every animal we sell is the hard work, dedication
                    of our entire team, and prayers for you. This is not just a business — it's our
                    passion, our responsibility, and our promise that we will always deal with you honestly.
                  </p>
                  <p className="abt-story-text">
                    We started small — with just a few animals. But your trust has brought us so far
                    that today we offer goats, sheep, and even lambs. And our intention is to bring
                    even more categories and services in the future so that your every need can be met.
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
                  Our mission is to deliver healthy and farm-raised animals to every home in
                  Rahim Yar Khan and its surroundings — at exactly the right price, with full
                  transparency. We want every person to find the experience of buying an animal
                  easy, reliable, and pleasant. No deception, no hiding — just a clean and
                  straightforward matter. Using technology, we want to make this entire process
                  so easy that you can choose your animal from home and buy with complete satisfaction.
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
                  Our vision is that OnlyMeat should not be limited only to Rahim Yar Khan — but
                  should become such a market across Pakistan where people trust online animal buying
                  as much as they do seeing it with their own eyes. We want our name to be the first
                  one taken in livestock online trading in the next few years. A platform where quality,
                  trust, and customer satisfaction are above all — this is our dream and we work
                  hard for it every day.
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
                    My name is Muhammad Ahmad and I am a resident of Rahim Yar Khan. Since childhood,
                    I have been associated with farming and animal husbandry. My father was also
                    involved in this work and he taught me how to take care of animals and how to
                    deal with people honestly.
                  </p>
                  <p className="abt-founder-text">
                    When I saw that in today's era, people do online shopping but still use the old
                    market method to buy animals — where there is often deception, weight differences,
                    and it's hard to trust — then I thought why not create a platform where people
                    can get quality animals from home with full transparency.
                  </p>
                  <p className="abt-founder-text">
                    This thought gave birth to OnlyMeat. In the beginning, there were many difficulties —
                    it was not easy to win people's trust. But we made honesty, quality, and customer
                    care our principle and gradually people appreciated our hard work. Today, we can say
                    with pride that OnlyMeat has brought happiness to many homes.
                  </p>
                  <p className="abt-founder-text">
                    I believe that if the intention is pure and the hard work is sincere, then Allah
                    Almighty definitely grants success. I consider every customer as my guest and
                    their happiness is my biggest success. OnlyMeat was my dream — and with your
                    trust, this dream is becoming a reality.
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
                  If you are also looking for a reliable place where you can get healthy and best
                  animals — then OnlyMeat is your own platform. Contact us today and choose your
                  favorite animal. We are always ready for your service.
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
