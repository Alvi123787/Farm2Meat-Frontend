import React from 'react'
import { FaHandPointer, FaWhatsapp, FaTruck } from 'react-icons/fa'
import '../css/HIW.css'

const steps = [
  {
    id: 1,
    icon: <FaHandPointer />,
    title: 'Choose Your Cuts',
    description: 'Browse our premium meat menu and select the finest cuts of mutton, beef, or chicken.',
  },
  {
    id: 2,
    icon: <FaWhatsapp />,
    title: 'Hygiene Check',
    description: 'Review our sterile processing standards or request a live view of our fresh stock on WhatsApp.',
  },
  {
    id: 3,
    icon: <FaTruck />,
    title: 'Fresh Home Delivery',
    description: 'Get your fresh, hygienically packed meat delivered to your doorstep in record time.',
  },
]

const HowItWorks = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="how-it-works">
            <div className="how-it-works-header">
              <h2 className="how-it-works-title">
                How It <span className="how-it-works-accent">Works</span>
              </h2>
              <p className="how-it-works-sub">
                Experience the finest meat delivery service in 3 simple steps — fresh, halal, and 100% hygienic.
              </p>
            </div>

            <div className="how-it-works-steps">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="how-it-works-card">
                    <div className="how-it-works-step-number">
                      {String(step.id).padStart(2, '0')}
                    </div>
                    <div className="how-it-works-icon-wrapper">
                      {step.icon}
                    </div>
                    <h3 className="how-it-works-step-title">{step.title}</h3>
                    <p className="how-it-works-step-desc">{step.description}</p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="how-it-works-connector">
                      <div className="connector-line"></div>
                      <div className="connector-arrow"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="how-it-works-trust-badge">
              <span className="trust-badge-icon">🛡️</span>
              <span className="trust-badge-text">
                100% Trusted &amp; Verified — Rahim Yar Khan's premier fresh meat delivery service.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks