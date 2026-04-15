import React, { useEffect, useState } from 'react';
import { FaPhoneAlt, FaMapMarkerAlt, FaCheckCircle, FaStar, FaUserCheck } from 'react-icons/fa';
import { butcherService } from '../services/butcherService';
import '../css/ButcherSection.css';
import { buildMediaUrl } from '../utils/mediaUrl';

const ButcherSection = () => {
  const [butchers, setButchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const resolveImageUrl = (src) => {
    if (!src) return '';
    return buildMediaUrl(src) || src;
  };

  useEffect(() => {
    const fetchButchers = async () => {
      const response = await butcherService.getAllButchers();
      if (response.success && Array.isArray(response.data)) {
        setButchers(response.data);
      }
      setLoading(false);
    };

    fetchButchers();
  }, []);

  if (loading) {
    return (
      <section className="btr-section">
        <div className="btr-container">
          <div className="btr-section-header">
            <span className="btr-section-badge">Halal Certified</span>
            <h2 className="btr-section-title">
              Master <span className="btr-section-title-highlight">Butchers</span>
            </h2>
            <p className="btr-section-subtitle">Discovering skilled professionals in your area...</p>
            <div className="btr-section-divider">
              <span className="btr-section-divider-line"></span>
            </div>
          </div>
          <div className="btr-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="btr-card btr-card--skeleton">
                <div className="btr-skeleton-badge"></div>
                <div className="btr-skeleton-avatar"></div>
                <div className="btr-skeleton-line"></div>
                <div className="btr-skeleton-line btr-skeleton-line--short"></div>
                <div className="btr-skeleton-button"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (butchers.length === 0) {
    return null;
  }

  return (
    <section className="btr-section">
      <div className="btr-container">
        <div className="btr-section-header">
          <span className="btr-section-badge">Halal Certified</span>
          <h2 className="btr-section-title">
            Master <span className="btr-section-title-highlight">Butchers</span>
          </h2>
          <p className="btr-section-subtitle">
            Expert craftsmen dedicated to professional halal meat processing in Rahim Yar Khan.
          </p>
          <div className="btr-section-divider">
            <span className="btr-section-divider-line"></span>
          </div>
        </div>

        <div className="btr-grid">
          {butchers.map((butcher) => (
            <div key={butcher._id} className="btr-card">
              {/* Decorative corner accent */}
              <div className="btr-card-corner-accent"></div>
              
              {/* Experience Badge */}
              {butcher.experience && (
                <div className="btr-experience-badge">
                  <FaStar className="btr-star-icon" />
                  <span>{butcher.experience}+ Years</span>
                </div>
              )}

              <div className="btr-avatar-wrapper">
                {(butcher.image || butcher.avatar) ? (
                  <img 
                    src={resolveImageUrl(butcher.image || butcher.avatar)} 
                    alt={butcher.name} 
                    className="btr-avatar" 
                  />
                ) : (
                  <div className="btr-avatar-placeholder">
                    {butcher.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {butcher.isVerified && (
                  <div className="btr-verified-badge" title="Verified Professional Butcher">
                    <FaCheckCircle />
                  </div>
                )}
              </div>

              <div className="btr-card-info">
                <div className="btr-name-wrapper">
                  <h3 className="btr-butcher-name">{butcher.name}</h3>
                  {butcher.isVerified && (
                    <FaUserCheck className="btr-verified-icon" title="Verified Butcher" />
                  )}
                </div>
                
                <div className="btr-specialty">
                  <span>Professional Halal Butcher</span>
                </div>

                <div className="btr-location">
                  <FaMapMarkerAlt className="btr-location-icon" />
                  <span>{butcher.location || 'Rahim Yar Khan'}</span>
                </div>

                <a href={`tel:${butcher.phone}`} className="btr-contact-btn">
                  <FaPhoneAlt className="btr-phone-icon" />
                  <span className="btr-contact-text">{butcher.phone}</span>
                  <span className="btr-contact-label">Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Minimal Footer Notice */}
        <div className="btr-footer">
          <p className="btr-footer-text">
            All butchers are personally verified. Pricing arranged directly.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ButcherSection;