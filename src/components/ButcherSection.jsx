import React, { useEffect, useState } from 'react';
import { FaPhoneAlt, FaMapMarkerAlt, FaCheckCircle, FaStar, FaUtensils, FaUserCheck } from 'react-icons/fa';
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
      <section className="butcher-section">
        <div className="container">
          <div className="section-header">
            <div className="header-icon-wrapper">
              <FaUtensils className="header-icon" />
            </div>
            <h2 className="section-title">Master Butchers</h2>
            <p className="section-subtitle">Discovering skilled professionals in your area...</p>
          </div>
          <div className="butcher-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="butcher-card skeleton">
                <div className="skeleton-badge"></div>
                <div className="skeleton-avatar"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-button"></div>
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
    <section className="butcher-section">
      <div className="container">
        <div className="section-header">
          <div className="header-icon-wrapper">
            <FaUtensils className="header-icon" />
          </div>
          <div className="header-copy">
            <div className="header-badge">
              <span>Halal Certified</span>
            </div>
            <h2 className="section-title">Master Butchers</h2>
          </div>
          <p className="section-subtitle">
            Expert craftsmen dedicated to professional halal meat processing in Rahim Yar Khan.
          </p>
        </div>

        <div className="butcher-grid">
          {butchers.map((butcher) => (
            <div key={butcher._id} className="butcher-card">
              {/* Decorative corner accent */}
              <div className="card-corner-accent"></div>
              
              {/* Experience Badge */}
              {butcher.experience && (
                <div className="experience-badge">
                  <FaStar className="star-icon" />
                  <span>{butcher.experience}+ Years</span>
                </div>
              )}

              <div className="butcher-avatar-wrapper">
                {(butcher.image || butcher.avatar) ? (
                  <img 
                    src={resolveImageUrl(butcher.image || butcher.avatar)} 
                    alt={butcher.name} 
                    className="butcher-avatar" 
                  />
                ) : (
                  <div className="butcher-avatar-placeholder">
                    {butcher.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {butcher.isVerified && (
                  <div className="verified-badge" title="Verified Professional Butcher">
                    <FaCheckCircle />
                  </div>
                )}
              </div>

              <div className="butcher-info">
                <div className="name-wrapper">
                  <h3 className="butcher-name">{butcher.name}</h3>
                  {butcher.isVerified && (
                    <FaUserCheck className="verified-icon" title="Verified Butcher" />
                  )}
                </div>
                
                <div className="butcher-specialty">
                  <span>Professional Halal Butcher</span>
                </div>

                <div className="butcher-location">
                  <FaMapMarkerAlt className="location-icon" />
                  <span>{butcher.location || 'Rahim Yar Khan'}</span>
                </div>

                <a href={`tel:${butcher.phone}`} className="contact-btn">
                  <FaPhoneAlt className="phone-icon" />
                  <span className="contact-text">{butcher.phone}</span>
                  <span className="contact-label">Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="butcher-footer">
          <div className="footer-content">
            <FaCheckCircle className="footer-icon" />
            <p>
              All butchers are personally verified. Pricing and scheduling arranged directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ButcherSection;
