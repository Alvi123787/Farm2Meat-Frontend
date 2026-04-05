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
    title: 'Amanat Dari',
    desc: 'Hum apne har customer ke saath poori imaandari se deal karte hain. Janwar ka wazan, sehat aur nasl — sab kuch bilkul transparent hota hai. Humara maqsad sirf ek baar bechna nahi, balke aapka bharosa jeetna hai jo zindagi bhar qaim rahe.',
    color: '128, 0, 0'
  },
  {
    icon: <FaHeart />,
    title: 'Janwaron Ki Dekhbhaal',
    desc: 'Humare yahan har janwar ko puri mohabbat aur ehtyaat se rakha jaata hai. Unki khoraak, saaf paani, aur sehat ka poora khayal rakha jaata hai. Hum yakin rakhte hain ke ek sehatmand janwar hi aapke ghar mein barkat laata hai.',
    color: '139, 69, 19'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Quality Ka Waada',
    desc: 'Farm2Meat ka har janwar carefully selected hota hai. Hum kabhi bhi quality par samjhauta nahi karte. Har bakra, bakri aur patth ko experts ki nigrani mein check kiya jaata hai taake aapko sirf behtareen milway.',
    color: '34, 85, 34'
  },
  {
    icon: <FaGem />,
    title: 'Customer First',
    desc: 'Aap humari sabse bari priority hain. Aapki har zaroorat, har sawaal, aur har concern ka jawaab dena humari zimmedari hai. Chahe raat ho ya din, humari team aapki khidmat ke liye hamesha tayyar rehti hai — kyunke aap humara asal sarmaya hain.',
    color: '128, 0, 0'
  }
]

const offerings = [
  {
    icon: <FaBalanceScale />,
    title: 'Honest Weight System',
    desc: 'Digital weighing machine se accurate wazan — koi andaza nahi, koi dhoka nahi. Aap khud apni aankhon se wazan dekh sakte hain aur poori tasalli ke saath khareedari kar sakte hain.'
  },
  {
    icon: <FaWhatsapp />,
    title: 'Live Video Inspection',
    desc: 'Ghar baithe WhatsApp par live video call ke zariye apna janwar dekh sakte hain. Har angle se, har detail — taake aapko koi bhi shak na rahe aur faisla karna aasan ho jaye.'
  },
  {
    icon: <FaTruck />,
    title: 'Safe Home Delivery',
    desc: 'Rahim Yar Khan aur aas paas ke ilaqon mein safe aur timely delivery. Janwar ko poori hifazat ke saath aapke darwaze tak pohunchaya jaata hai — bilkul waise jaisa aapne video mein dekha tha.'
  },
  {
    icon: <FaSeedling />,
    title: 'Farm-Raised Animals',
    desc: 'Sab janwar khule aur saaf mahol mein paale jaate hain. Qudrati charagah, saaf paani aur poori ghiza — yahi wajah hai ke humare janwar sehatmand aur active hote hain.'
  },
  {
    icon: <FaMedal />,
    title: 'Premium Naslein',
    desc: 'Hum sirf behtareen naslon ke janwar rakhte hain jo apni khoobsurati, wazan aur sehat ke liye mashhoor hain. Chahe Qurbani ke liye ho ya palne ke liye — har nasl ka apna maqaam hai.'
  },
  {
    icon: <FaPhoneAlt />,
    title: '24/7 Support',
    desc: 'Humari team hamesha aapki madad ke liye haazir hai. Koi bhi sawaal ho, koi bhi mushkil — bas ek call ya message karein. Hum aapki baat sunne aur masla hal karne mein yakeen rakhte hain.'
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
                <button className="abt-back-link" type="button" onClick={() => navigate('/')}>
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </button>
                <div className="abt-header-main">
                  <div className="abt-header-icon-wrap">
                    <FaUsers className="abt-header-icon" />
                  </div>
                  <div>
                    <h1 className="abt-header-title">About Farm2Meat</h1>
                    <p className="abt-header-sub">
                      Bharosa, quality aur sahi daam — hamara waada, aapka itmaad.
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
            <div className="col-12 text-center">
              <span className="abt-section-badge">OUR STORY</span>
              <h2 className="abt-section-title">
                Hamari <span className="abt-section-highlight">Kahani</span>
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
                    Yeh safar shuru hua ek bohat seedhi si soch se — ke Rahim Yar Khan
                    ke logon ko ghar baithe behtareen janwar milne chahiye bina kisi
                    dhoke ya pareshani ke. Hum ne dekha ke mandi mein aksar log
                    pareshan hote hain — wazan mein farq hota hai, quality ka pata nahi
                    chalta, aur bharosa karna mushkil hota hai.
                  </p>
                  <p className="abt-story-text">
                    Isi mushkil ko hal karne ke liye Farm2Meat ka tasawwur paida hua.
                    Humne socha ke agar hum technology aur imaandari ko ek saath laye
                    — toh ek aisa platform bana sakte hain jahan logon ko na sirf
                    achi quality milay, balke poora bharosa bhi ho. Aur yahi humne kiya.
                  </p>
                  <p className="abt-story-text">
                    Aaj Farm2Meat Rahim Yar Khan ka ek jaana-pehchana naam hai. Humare
                    customers ki meherbani se hum rooz barh rahe hain. Har janwar jo
                    hum bechte hain, uske peeche humari poori team ki mehnat, lagan
                    aur aapke liye dua hoti hai. Yeh sirf karobaar nahi — yeh humara
                    junoon hai, humari zimmedari hai, aur humara waada hai ke hum
                    hamesha aapke saath imaandari se pesh aayenge.
                  </p>
                  <p className="abt-story-text">
                    Humne chhoti si shuruat ki thi — bas chand janwaron se. Lekin aapke
                    bharose ne humein itna aagay barhaya ke aaj hum bakre, bakriyan,
                    patth aur dumbe tak — sab kuch pesh karte hain. Aur humara iraada
                    hai ke aagay chal kar hum aur bhi zyada categories aur services
                    laye taake aapki har zaroorat poori ho sake.
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
            <div className="col-12 text-center">
              <span className="abt-section-badge">MISSION & VISION</span>
              <h2 className="abt-section-title">
                Humara <span className="abt-section-highlight">Maqsad</span>
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
                  Humara mission hai ke Rahim Yar Khan aur uske aas paas ke har ghar
                  tak sehatmand aur farm-raised janwar pohunchayein — bilkul sahi
                  daam par, poori transparency ke saath. Hum chahte hain ke har
                  insaan ko janwar khareedne ka tajurba aasan, bharosemand aur
                  khushgawar lage. Koi dhoka nahi, koi chhupana nahi — sirf saaf
                  aur seedha muamla. Hum technology ko istemal karte hue is poore
                  amal ko itna aasan banana chahte hain ke aap ghar baithe apna
                  janwar chunein aur poori tasalli se khareed sakein.
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
                  Humara vision hai ke Farm2Meat sirf Rahim Yar Khan tak mehdood na
                  rahe — balke poore Pakistan mein ek aisi mandi bane jahan log
                  online janwar khareedne par utna hi bharosa karein jitna apni
                  aankhon se dekh kar karte hain. Hum chahte hain ke aglay kuch
                  saalon mein livestock ki online trading mein humara naam sabse
                  pehle liya jaye. Ek aisa platform jahan quality, trust aur customer
                  satisfaction sabse upar ho — yahi humara sapna hai aur iske liye
                  hum rozana mehnat karte hain.
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
            <div className="col-12 text-center">
              <span className="abt-section-badge">WHAT WE OFFER</span>
              <h2 className="abt-section-title">
                Hum Kya <span className="abt-section-highlight">Pesh Karte Hain</span>
              </h2>
              <p className="abt-section-subtitle">
                Farm2Meat par aapko milta hai behtareen tajurba — shuru se aakhir tak
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
            <div className="col-12 text-center">
              <span className="abt-section-badge">OUR VALUES</span>
              <h2 className="abt-section-title">
                Humari <span className="abt-section-highlight">Buniyadi Qadrein</span>
              </h2>
              <p className="abt-section-subtitle">
                Yeh woh usool hain jin par Farm2Meat ki bunyaad rakhi gayi hai
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
            <div className="col-12 text-center">
              <span className="abt-section-badge">FOUNDER</span>
              <h2 className="abt-section-title">
                Hamara <span className="abt-section-highlight">Bani</span>
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
                      alt="Founder of Farm2Meat"
                      className="abt-founder-img"
                    />
                    <div className="abt-founder-img-border"></div>
                    <div className="abt-founder-img-glow"></div>
                  </div>

                  <div className="abt-founder-name-card">
                    <h3 className="abt-founder-name">Muhammad Ahmad</h3>
                    <span className="abt-founder-role">Founder &amp; CEO — Farm2Meat</span>
                    <div className="abt-founder-contact">
                      <a href="tel:03089880479" className="abt-founder-contact-item">
                        <FaPhoneAlt /> <span>0308-9880479</span>
                      </a>
                      <a href="mailto:farm2meat@gmail.com" className="abt-founder-contact-item">
                        <FaEnvelope /> <span>farm2meat@gmail.com</span>
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
                    Mera naam Muhammad Ahmad hai aur mein Rahim Yar Khan ka rehne wala
                    hoon. Bachpan se mera taluq farming aur janwaron ki parwarish se
                    raha hai. Mere walid sahab bhi is kaam se judhe the aur unhon ne
                    mujhe sikhaya ke janwaron ki dekhbhaal kaise ki jaati hai aur logon
                    se kaise imaandari se muamla kiya jaata hai.
                  </p>
                  <p className="abt-founder-text">
                    Jab mein ne dekha ke aaj ke daur mein log online shopping toh
                    karte hain lekin janwar khareedne ke liye abhi bhi purani mandi ka
                    tareeqa istemal karte hain — jahan aksar dhoka hota hai, wazan mein
                    farq hota hai, aur bharosa karna mushkil hota hai — toh mein ne
                    socha ke kyun na ek aisa platform banaya jaye jahan logon ko ghar
                    baithe quality janwar mil sakein poori transparency ke saath.
                  </p>
                  <p className="abt-founder-text">
                    Isi soch ne Farm2Meat ko janam diya. Shuru mein bohat mushkilat
                    aayin — logon ka bharosa jeetna aasan nahi tha. Lekin humne
                    imaandari, quality aur customer care ko apna usool banaya aur
                    dheere dheere logon ne humari mehnat ko saraha. Aaj hum faqr se keh
                    sakte hain ke Farm2Meat ne bohat se gharon mein khushiyan
                    pohunchayi hain.
                  </p>
                  <p className="abt-founder-text">
                    Mera yakeen hai ke agar niyat saaf ho aur mehnat sachchi ho toh
                    Allah Taala zaroor kamyabi ata farmate hain. Mein apne har customer
                    ko apna mehman samajhta hoon aur unki khushi meri sabse bari
                    kamyabi hai. Farm2Meat mera khwaab tha — aur aapke bharose se yeh
                    khwaab haqeeqat ban raha hai.
                  </p>
                  <p className="abt-founder-text abt-founder-sign">
                    — Muhammad Ahmad, Founder Farm2Meat
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
                <h2 className="abt-cta-title">Aayein, Humse Judein!</h2>
                <p className="abt-cta-text">
                  Agar aap bhi ek bharosemand jagah dhundh rahe hain jahan se sehatmand
                  aur behtareen janwar mil sakein — toh Farm2Meat aapka apna platform
                  hai. Humse aaj hi rabta karein aur apna pasandida janwar chunein.
                  Hum aapki khidmat ke liye hamesha tayyar hain.
                </p>
                <div className="abt-cta-actions">
                  <a href="/contact" className="abt-cta-btn abt-cta-btn-primary">
                    <span>Rabta Karein</span>
                    <FaArrowRight />
                  </a>
                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="abt-cta-btn abt-cta-btn-wa"
                  >
                    <FaWhatsapp />
                    <span>WhatsApp Par Baat Karein</span>
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
