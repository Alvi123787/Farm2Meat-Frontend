import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import '../css/Navbar.css';

const LoginRequiredPopup = ({ isOpen, onClose, message = "Please login first to add to favourites" }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay to catch outside clicks */}
      <div
        className="pnav-account-overlay"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        className="pnav-account-popup"
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}
        role="dialog"
        aria-label="Login required"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="pnav-popup-header">
          <div className="pnav-popup-icon-wrap">
            <FontAwesomeIcon
              icon={faUserShield}
              className="pnav-popup-icon"
            />
          </div>
          <div className="pnav-popup-welcome-text">
            <h3 className="pnav-popup-title">Login Required</h3>
            <p className="pnav-popup-sub">{message}</p>
          </div>
        </div>

        {/* Gold divider */}
        <div className="pnav-popup-divider" />

        {/* Action buttons */}
        <div className="pnav-popup-actions">
          <Link
            to="/login"
            className="pnav-popup-btn pnav-popup-login"
            onClick={onClose}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="pnav-popup-btn pnav-popup-sign-up"
            onClick={onClose}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
};

export default LoginRequiredPopup;
