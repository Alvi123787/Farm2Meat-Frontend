import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { butcherService } from '../services/butcherService';
import { useCart } from '../contexts/cartContextCore';
import '../css/ButcherModal.css';

const ButcherModal = ({ isOpen, onClose }) => {
  const { selectedButcher, setSelectedButcher } = useCart();
  const [butchers, setButchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      const fetchButchers = async () => {
        setLoading(true);
        const response = await butcherService.getAllButchers();
        if (response.success && Array.isArray(response.data)) {
          setButchers(response.data);
        }
        setLoading(false);
      };
      fetchButchers();
    }
  }, [isOpen]);

  const resolveImageUrl = (src) => {
    if (!src) return '';
    return src.startsWith('/uploads') ? `${apiBase}${src}` : src;
  };

  const handleSelect = (butcher) => {
    setSelectedButcher(butcher);
  };

  const handleSkip = () => {
    setSelectedButcher(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bm-overlay">
      <div className="bm-container">
        <button className="bm-close-btn" onClick={onClose} aria-label="Close modal">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="bm-header">
          <div className="bm-icon-circle">
            {/* Icon removed */}
          </div>
          <h2 className="bm-title">Need Help with Cutting Your Animal?</h2>
          <p className="bm-description">
            We can arrange a professional butcher to prepare your animal for you. 
            Select a butcher below or skip if you prefer to manage it yourself.
          </p>
        </div>

        <div className="bm-content">
          {loading ? (
            <div className="bm-loading">
              <FontAwesomeIcon icon={faSpinner} spin className="bm-spinner" />
              <p>Finding available butchers...</p>
            </div>
          ) : butchers.length > 0 ? (
            <div className="bm-butcher-list">
              {butchers.map((butcher) => (
                <div 
                  key={butcher._id} 
                  className={`bm-butcher-card ${selectedButcher?._id === butcher._id ? 'bm-butcher-card--selected' : ''}`}
                  onClick={() => handleSelect(butcher)}
                >
                  <div className="bm-butcher-avatar-wrapper">
                    {(butcher.image || butcher.avatar) ? (
                      <img 
                        src={resolveImageUrl(butcher.image || butcher.avatar)} 
                        alt={butcher.name} 
                        className="bm-butcher-avatar" 
                      />
                    ) : (
                      <div className="bm-butcher-avatar-placeholder">
                        {butcher.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {butcher.isVerified && (
                      <div className="bm-verified-badge" title="Verified Professional">
                        {/* Icon removed */}
                      </div>
                    )}
                  </div>
                  <div className="bm-butcher-info">
                    <h3 className="bm-butcher-name">
                      {butcher.name}
                    </h3>
                    {butcher.experience && (
                      <p className="bm-butcher-exp">{butcher.experience} Experience</p>
                    )}
                    <p className="bm-butcher-location">{butcher.location || 'Rahim Yar Khan'}</p>
                  </div>
                  {selectedButcher?._id === butcher._id && (
                    <div className="bm-selected-tick">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bm-no-butchers">
              <p>No professional butchers available at the moment.</p>
            </div>
          )}
        </div>

        <div className="bm-footer">
          <button className="bm-btn bm-btn--skip" onClick={handleSkip}>
            No, I’ll manage it myself
          </button>
          <button 
            className={`bm-btn bm-btn--confirm ${!selectedButcher ? 'bm-btn--disabled' : ''}`} 
            onClick={onClose}
            disabled={!selectedButcher}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ButcherModal;
