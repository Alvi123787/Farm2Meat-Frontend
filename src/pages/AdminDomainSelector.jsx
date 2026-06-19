import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaw, faDrumstickBite } from '@fortawesome/free-solid-svg-icons'
import { useAdminDomain } from '../contexts/AdminDomainContext'
import '../css/AdminDomainSelector.css'

export default function AdminDomainSelector() {
  const navigate = useNavigate()
  const { selectDomain } = useAdminDomain()

  const handleSelectDomain = (selectedDomain) => {
    selectDomain(selectedDomain)
    navigate('/admin')
  }

  return (
    <div className="admin-domain-selector">
      <div className="domain-selector-overlay" />
      
      <div className="domain-selector-container">
        <div className="domain-selector-header">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Select your domain to continue</p>
        </div>

        <div className="domain-cards">
          {/* Animal Card */}
          <button
            className="domain-card animal-card"
            onClick={() => handleSelectDomain('animal')}
            type="button"
            aria-label="Select Animal domain"
          >
            <div className="domain-card-icon animal-icon">
              <FontAwesomeIcon icon={faPaw} />
            </div>
            <h2 className="domain-card-title">Animal</h2>
            <p className="domain-card-description">
              Manage livestock, animal orders, inquiries, and all animal-related content
            </p>
            <div className="domain-card-features">
              <span className="feature">Animal Dashboard</span>
              <span className="feature">Animal Orders</span>
              <span className="feature">Inquiries</span>
            </div>
            <div className="domain-card-cta">Select Domain</div>
          </button>

          {/* Meat Card */}
          <button
            className="domain-card meat-card"
            onClick={() => handleSelectDomain('meat')}
            type="button"
            aria-label="Select Meat domain"
          >
            <div className="domain-card-icon meat-icon">
              <FontAwesomeIcon icon={faDrumstickBite} />
            </div>
            <h2 className="domain-card-title">Meat</h2>
            <p className="domain-card-description">
              Manage meat items, meat orders, inventory, and all meat-related operations
            </p>
            <div className="domain-card-features">
              <span className="feature">Meat Dashboard</span>
              <span className="feature">Meat Items</span>
              <span className="feature">Meat Orders</span>
            </div>
            <div className="domain-card-cta">Select Domain</div>
          </button>
        </div>

        <div className="domain-selector-footer">
          <p>You can switch domains anytime from the admin panel</p>
        </div>
      </div>
    </div>
  )
}
