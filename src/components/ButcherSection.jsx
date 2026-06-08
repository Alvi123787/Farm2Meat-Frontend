import React from 'react';
import { FaWhatsapp, FaArrowRight, FaUsers } from 'react-icons/fa';
import '../css/ButcherSection.css';
import { WHATSAPP_NUMBER } from '../constants/contact';

const ButcherSection = () => {
  const handleWhatsApp = () => {
    const msg = "Assalam o Alaikum! I'm interested in your premium meat and livestock services. Can you provide more details?";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleContact = () => {
    window.location.href = '/contact';
  };

  return (
    <section className="btr-section">
      <div className="btr-container">
        <div className="btr-cta-card">
          <div className="btr-cta-icon-wrapper">
            <FaUsers className="btr-cta-icon" />
          </div>
          
          <h2 className="btr-cta-title">Professional Butcher Services</h2>
          
          <p className="btr-cta-description">
            Experience premium, halal-certified meat processing right at your doorstep. 
            Our expert butchers are available 24/7 to provide precision cutting, 
            hygienic handling, and professional packaging services. Whether it's for 
            daily needs or special occasions, we guarantee master-level craftsmanship 
            and total convenience.
          </p>
          
          <div className="btr-cta-actions">
            <button className="btr-btn-contact" onClick={handleContact}>
              Contact Us <FaArrowRight className="btr-btn-arrow" />
            </button>
            <button className="btr-btn-whatsapp" onClick={handleWhatsApp}>
              <FaWhatsapp className="btr-wa-icon" /> Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ButcherSection;