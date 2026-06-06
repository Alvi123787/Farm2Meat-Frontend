import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaStore } from 'react-icons/fa'
import '../css/ShopHeader.css'

export default function ShopHeader({ activeCategory, productName, pageTitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 90)
    return () => clearTimeout(t)
  }, [])

  // Only display on specific routes
  const allowedRoutes = ['/shop', '/product', '/detail']
  const isAllowed = allowedRoutes.some(route => location.pathname.startsWith(route))
  
  if (!isAllowed) {
    return null
  }

  const getSubText = () => {
    if (productName) return `Viewing ${productName}`
    
    const category = String(activeCategory || '').trim().toLowerCase()
    if (!category || category === 'all') return 'Browse our premium livestock collection.'
    
    // Translate common terms to English
    const translations = {
      bakra: 'Goat',
      bakray: 'Goats',
      dumba: 'Sheep',
      gaaye: 'Cow',
      bhains: 'Buffalo'
    }
    
    const translated = translations[category] || category.charAt(0).toUpperCase() + category.slice(1)
    return `Showing premium ${translated} animals.`
  }

  const title = pageTitle || 'Shop'

  return (
    <section className="shopHeader-section">
      <div className="shopHeader-bg">
        <div className="shopHeader-circle shopHeader-circle--1"></div>
        <div className="shopHeader-circle shopHeader-circle--2"></div>
        <div className="shopHeader-pattern"></div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className={`shopHeader-content ${visible ? 'shopHeader-content--visible' : ''}`}>
              <div className="unified-header-top">
                <button className="shopHeader-backLink" type="button" onClick={() => navigate('/')}>
                  <FaArrowLeft />
                  <span>Back to Home</span>
                </button>
              </div>
               <div className="shopHeader-main">
                <div className="shopHeader-iconWrap">
                  <FaStore className="shopHeader-icon" />
                </div>
                <div>
                  <h1 className="shopHeader-title">{title}</h1>
                  <p className="shopHeader-sub">{getSubText()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

