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
      title: 'Browse Premium Meat',
      description: 'Explore our editorial meat menu featuring hand-picked cuts of mutton, beef, and chicken. We provide detailed information on aging, marbling, and weight for every item.',
      points: ['Expertly hand-trimmed cuts', 'Hygienic tray-wrapped packaging', '100% Halal certified process']
    },
    {
      id: 2,
      icon: <FaShoppingCart />,
      title: 'Add to Order',
      description: 'Select your preferred meat cuts or explore our healthy livestock options. Review your selection in the cart and customize your order according to your needs.',
      points: ['Secure checkout', 'Custom weight selection', 'Easy order management']
    },
    {
      id: 3,
      icon: <FaClipboardCheck />,
      title: 'Secure Payment & Details',
      description: 'Provide your delivery information and choose your preferred contact method. Our process is fully transparent with no hidden service charges.',
      points: ['Direct farm-to-table pricing', 'Cash on delivery available', 'Simple 1-minute form']
    },
    {
      id: 4,
      icon: <FaTruck />,
      title: 'Fast & Fresh Delivery',
      description: 'Our specialized delivery fleet ensures your meat reaches you fresh and within the cold-chain window. We coordinate via WhatsApp for precise delivery timing.',
      points: ['Temperature controlled handling', 'Safe & contactless delivery', 'Real-time WhatsApp updates']
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
                    <span>Premium Meat Delivery Service</span>
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
                <h2 className="hiw-intro-title">Premium Meat, Simple Process</h2>
                <p className="hiw-intro-text">
                  Our platform is designed to provide you with the highest quality, farm-fresh meat with uncompromising hygiene standards.
                  Follow our simple process to bring the finest cuts of mutton, beef, and chicken to your table.
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
                  <h3 className="hiw-cta-title">Hungry for Quality?</h3>
                  <p className="hiw-cta-text">Explore our premium meat cuts and livestock collection to place your order today.</p>
                  <button className="hiw-cta-btn" onClick={() => navigate('/menu-page')}>
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
