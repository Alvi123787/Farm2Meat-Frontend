// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEnvelope,
  faLock,
  faCheckCircle,
  faSpinner,
  faShieldAlt,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../css/ForgotPassword.css";
import { authService } from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err) {
      // Anti-enumeration: always show success UI even on error (except server crash/validation)
      // If it's a 429 (cooldown), we might want to show the error.
      if (err?.status === 429) {
        setError(err?.message || "Too many requests. Please wait.");
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      // Keep isSubmitted true
    } catch (err) {
      if (err?.status === 429) {
        setError(err?.message || "Too many requests. Please wait.");
      } else {
        // Even on other errors, we keep showing success UI for anti-enumeration
        // but maybe log it or show a subtle hint if needed.
        // For now, let's just keep it simple.
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-container">
      {/* Left Side - Image/Branding */}
      <div className="fp-left">
        <div className="fp-overlay" />
        <div className="fp-branding">
          <div className="fp-logo">
            <div className="logo-visibility-wrapper" style={{ padding: '8px' }}>
              <img 
                src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                alt="OnlyMeat Logo" 
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            </div>
            <span style={{ marginLeft: '14px', color: 'white' }}>OnlyMeat</span>
          </div>
          <div className="fp-quote">
            <h2>Secure Your Account</h2>
            <p>We take security seriously. Reset your password securely and regain access to your livestock management dashboard.</p>
          </div>
          <div className="fp-features">
            <div className="fp-feature-item">
              <div className="fp-feature-icon">🔒</div>
              <span>End-to-end encryption</span>
            </div>
            <div className="fp-feature-item">
              <div className="fp-feature-icon">⚡</div>
              <span>Instant email delivery</span>
            </div>
            <div className="fp-feature-item">
              <div className="fp-feature-icon">🛡️</div>
              <span>24/7 Security monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="fp-right">
        <div className="fp-card">
          {!isSubmitted ? (
            <>
              <div className="fp-header">
                <div className="fp-icon">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <h1>Forgot Password?</h1>
                <p>Enter your email address and we'll send you instructions to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit} className="fp-form">
                <div className={`fp-form-group ${focusedInput === "email" ? "fp-focused" : ""} ${error ? "fp-error" : ""}`}>
                  <label htmlFor="fp-email">
                    <FontAwesomeIcon icon={faEnvelope} />
                    Email Address
                  </label>
                  <div className="fp-input-wrapper">
                    <input
                      type="email"
                      id="fp-email"
                      className="fp-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="admin@livestock.com"
                      disabled={isLoading}
                    />
                    <div className="fp-input-border" />
                  </div>
                  {error && (
                    <div className="fp-error-message">
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className={`fp-submit-btn ${isLoading ? "fp-loading" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <FontAwesomeIcon icon={faArrowRight} />
                    </>
                  )}
                </button>
              </form>

              <div className="fp-footer">
                <Link to="/login" className="fp-back-link">
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Login
                </Link>
                
                <div className="fp-help-text">
                  Need help? <a href="/contact" className="fp-link">Contact Support</a>
                </div>
              </div>
            </>
          ) : (
            <div className="fp-success">
              <div className="fp-success-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h2>Check Your Email</h2>
              <p>
                We've sent password reset instructions to:
                <br />
                <strong className="fp-highlight-email">{email}</strong>
              </p>
              <div className="fp-success-info">
                <p>Didn't receive the email?</p>
                <ul className="fp-list">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes for delivery</li>
                </ul>
              </div>
              <div className="fp-success-actions">
                <button 
                  className={`fp-resend-btn ${isLoading ? "fp-loading" : ""}`}
                  onClick={handleResend}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Resending...
                    </>
                  ) : (
                    "Resend Email"
                  )}
                </button>
                <Link to="/login" className="fp-return-btn">
                  Return to Login
                </Link>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="fp-security-badge">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>Secured by 256-bit encryption</span>
          </div>
        </div>

        {/* Mobile Footer Links */}
        <div className="fp-mobile-footer">
          <p>&copy; 2024 LiveStock Pro. All rights reserved.</p>
          <div className="fp-footer-links">
            <a href="/privacy" className="fp-link">Privacy Policy</a>
            <a href="/terms" className="fp-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;