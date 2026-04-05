import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaInfoCircle, 
  FaSearch, 
  FaShoppingCart, 
  FaClipboardCheck, 
  FaTruck,
  FaChevronRight
} from 'react-icons/fa';
import '../css/HowItWorks.css';

const HowItWorks = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const steps = [
    {
      id: 1,
      icon: <FaSearch />,
      title: 'Browse Products / Animals',
      description: 'Explore our premium selection of meat products and livestock listings. We offer healthy, farm-raised animals with detailed descriptions and images.',
      points: ['Detailed weight and breed info', 'Live video verification available', 'Premium quality meat products']
    },
    {
      id: 2,
      icon: <FaShoppingCart />,
      title: 'Add to Cart',
      description: 'Select your desired meat products or livestock and add them to your shopping cart. You can review your selection and adjust quantities easily.',
      points: ['Secure shopping cart', 'Multiple categories', 'Easy item management']
    },
    {
      id: 3,
      icon: <FaClipboardCheck />,
      title: 'Place Order',
      description: 'Provide your delivery details and contact information. Our checkout process is secure, transparent, and designed for your convenience.',
      points: ['No hidden charges', 'Transparent pricing', 'Simple contact form']
    },
    {
      id: 4,
      icon: <FaTruck />,
      title: 'Order Confirmation & Delivery',
      description: 'Once confirmed, our team will coordinate the delivery. We offer free home delivery to your doorstep, ensuring your order arrives safely.',
      points: ['Free home delivery', 'Safe and secure handling', 'Timely updates on WhatsApp']
    }
  ];

  return (
    <div className={`hiw-page ${isVisible ? 'hiw-page--visible' : ''}`}>
      {/* ══════════════════════════════════════════
          HEADER SECTION
      ══════════════════════════════════════════ */}
      <section className="hiw-header-section">
        <div className="hiw-header-bg">
          <div className="hiw-header-circle hiw-header-circle--1"></div>
          <div className="hiw-header-circle hiw-header-circle--2"></div>
          <div className="hiw-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="hiw-header-content">
                <button className="hiw-back-link" onClick={() => navigate(-1)}>
                  <FaArrowLeft />
                  <span>Go Back</span>
                </button>
                <div className="hiw-header-main">
                  <div className="hiw-header-title-row">
                    <FaInfoCircle className="hiw-header-icon" />
                    <h1 className="hiw-header-title">How It Works</h1>
                  </div>
                  <div className="hiw-free-delivery-badge">
                    <FaTruck />
                    <span>Free Home Delivery Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <section className="hiw-main">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="hiw-intro">
                <h2 className="hiw-intro-title">Buying made simple and transparent</h2>
                <p className="hiw-intro-text">
                  Humara platform aapke liye behtareen quality ka gosht aur janwar khareedna asaan banata hai.
                  Neechay diye gaye steps follow karein aur apna order aaj hi place karein.
                </p>
              </div>

              <div className="hiw-steps-grid">
                {steps.map((step, index) => (
                  <div key={step.id} className="hiw-step-card" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="hiw-step-number">{step.id}</div>
                    <div className="hiw-step-icon-wrap">
                      {step.icon}
                    </div>
                    <div className="hiw-step-content">
                      <h3 className="hiw-step-title">{step.title}</h3>
                      <p className="hiw-step-description">{step.description}</p>
                      <ul className="hiw-step-points">
                        {step.points.map((point, pIdx) => (
                          <li key={pIdx}>
                            <FaChevronRight className="hiw-point-icon" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hiw-cta-section">
                <div className="hiw-cta-card">
                  <h3 className="hiw-cta-title">Tayyar hain khareedari ke liye?</h3>
                  <p className="hiw-cta-text">Hamari collection dekhein aur apna pasandida janwar ya meat product muntakhib karein.</p>
                  <button className="hiw-cta-btn" onClick={() => navigate('/shop')}>
                    <span>Start Shopping</span>
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
