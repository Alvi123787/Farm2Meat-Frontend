import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHeadphones,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaStar,
  FaBell,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import '../css/SupportHub.css';

const SupportHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const focusRef = useRef(null);

  const steps = [
    {
      id: 0,
      icon: FaExclamationTriangle,
      iconColor: '#f59e0b',
      title: 'Report an Issue',
      description: "Experiencing a problem with an order or service? Let us know and we'll make it right.",
      buttonText: 'Go to Complaints Page',
      buttonLink: '/complaint',
    },
    {
      id: 1,
      icon: FaPhoneAlt,
      iconColor: '#3b82f6',
      title: 'Get in Touch',
      description: 'Have a question or need direct assistance? Our team is ready to help you.',
      buttonText: 'Visit Contact Page',
      buttonLink: '/contact',
    },
    {
      id: 2,
      icon: FaStar,
      iconColor: '#10b981',
      title: 'Share Your Feedback',
      description: 'Your experience matters to us. Help us improve by sharing your thoughts.',
      buttonText: 'Give Feedback',
      buttonLink: '/feedback',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
      if (isOpen) {
        if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      focusRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      setCurrentStep(0);
    }, 220);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleButtonClick = (link) => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      setCurrentStep(0);
      navigate(link);
    }, 220);
  };

  if (!isOpen) {
    return (
      <button
        className="sh-fab"
        onClick={handleOpen}
        aria-label="Open Support Hub"
      >
        <FaHeadphones className="sh-fab-icon" />
        <span className="sh-tooltip">Support Hub</span>
      </button>
    );
  }

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <>
      <div
        className={`sh-overlay ${closing ? 'sh-overlay--closing' : ''}`}
        onClick={handleClose}
      />
      <div
        ref={modalRef}
        className={`sh-modal ${closing ? 'sh-modal--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={focusRef}
          className="sh-close"
          onClick={handleClose}
          aria-label="Close Support Hub"
        >
          <FaTimes />
        </button>

        <div className="sh-header">
          <h2 className="sh-heading">
            <FaBell className="sh-heading-icon" /> How Can We Help You?
          </h2>
          <p className="sh-subheading">Choose the type of support you need below.</p>
        </div>

        <div className="sh-steps">
          <div className="sh-step-content">
            <div className="sh-step">
              <div
                className="sh-step-icon"
                style={{ backgroundColor: `${currentStepData.iconColor}15`, color: currentStepData.iconColor }}
              >
                <IconComponent />
              </div>
              <h3 className="sh-step-title">{currentStepData.title}</h3>
              <p className="sh-step-description">{currentStepData.description}</p>
              <button
                className="sh-step-button"
                onClick={() => handleButtonClick(currentStepData.buttonLink)}
                style={{ backgroundColor: currentStepData.iconColor }}
              >
                {currentStepData.buttonText}
              </button>
            </div>
          </div>
        </div>

        <div className="sh-navigation">
          <button
            className="sh-nav-btn"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <FaChevronLeft /> Previous
          </button>
          <div className="sh-dots">
            {steps.map((step, index) => (
              <button
                key={step.id}
                className={`sh-dot ${index === currentStep ? 'sh-dot--active' : ''}`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          <button
            className="sh-nav-btn"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            Next <FaChevronRight />
          </button>
        </div>

        <div className="sh-step-indicator">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </>
  );
};

export default SupportHub;