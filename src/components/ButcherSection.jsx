import React, { useEffect, useState } from 'react';
import { butcherService } from '../services/butcherService';
import '../css/ButcherSection.css';

const ButcherSection = () => {
  const [butchers, setButchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const resolveImageUrl = (src) => {
    if (!src) return '';
    return src.startsWith('/uploads') ? `${apiBase}${src}` : src;
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
            <h2 className="section-title">Hire a Professional Butcher</h2>
            <p className="section-subtitle">Loading professional butchers near you...</p>
          </div>
          <div className="butcher-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="butcher-card skeleton">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (butchers.length === 0) {
    return null; // Don't show the section if no butchers are available
  }

  return (
    <section className="butcher-section">
      <div className="container">
        <div className="section-header">
          <div className="badge-premium">Professional Services</div>
          <h2 className="section-title">Hire a Professional Butcher</h2>
          <p className="section-subtitle">
            Get your livestock slaughtered and processed by verified professionals in Rahim Yar Khan.
          </p>
        </div>

        <div className="butcher-grid">
          {butchers.map((butcher) => (
            <div key={butcher._id} className="butcher-card">
              <div className="butcher-avatar-wrapper">
                {(butcher.image || butcher.avatar) ? (
                  <img src={resolveImageUrl(butcher.image || butcher.avatar)} alt={butcher.name} className="butcher-avatar" />
                ) : (
                  <div className="butcher-avatar-placeholder">
                    {butcher.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {butcher.isVerified && (
                  <div className="verified-badge" title="Verified Professional">
                    {/* Icon removed */}
                  </div>
                )}
              </div>

              <div className="butcher-info">
                <h3 className="butcher-name">
                  {butcher.name}
                </h3>
                <div className="butcher-detail">
                  <span>{butcher.location || 'Rahim Yar Khan'}</span>
                </div>
                
                <a href={`tel:${butcher.phone}`} className="btn-call">
                  {butcher.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="butcher-notice">
          <p>
            * Prices are negotiated directly with the butcher. We only provide verified listings for your convenience.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ButcherSection;
