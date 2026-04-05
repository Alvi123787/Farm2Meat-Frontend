import React from 'react'
import { FaHandPointer, FaWhatsapp, FaTruck } from 'react-icons/fa'
import '../css/HIW.css'

const steps = [
  {
    id: 1,
    icon: <FaHandPointer />,
    title: 'Pasand Karen',
    description: 'Browse our healthy collection and choose your preferred animal easily.',
  },
  {
    id: 2,
    icon: <FaWhatsapp />,
    title: 'Video Mangwayen',
    description: 'WhatsApp par live video dekh kar tasalli karen before confirming your order.',
  },
  {
    id: 3,
    icon: <FaTruck />,
    title: 'Ghar Hasil Karen',
    description: 'Free home delivery with Cash on Delivery service.',
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
                Sirf 3 aasan steps mein apna pasandida janwar ghar baithay hasil karen — bilkul asaan aur mehfooz!
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
                100% Trusted &amp; Verified — RYK ki sab se bharosemand service
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks