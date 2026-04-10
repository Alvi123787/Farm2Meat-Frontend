import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaStore } from 'react-icons/fa'
import '../css/ShopHeader.css'

export default function ShopHeader({ activeCategory }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 90)
    return () => clearTimeout(t)
  }, [])

  const hasCategory = Boolean(String(activeCategory || '').trim() && activeCategory !== 'all')

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
              <button className="shopHeader-backLink" type="button" onClick={() => navigate('/')}>
                <FaArrowLeft />
                <span>Back to Home</span>
              </button>
              <div className="shopHeader-logo-wrap logo-visibility-wrapper" onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
                <img 
                  src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                  alt="Farm2Meat Logo" 
                  style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                />
              </div>
              <div className="shopHeader-main">
                <div className="shopHeader-iconWrap">
                  <FaStore className="shopHeader-icon" />
                </div>
                <div>
                  <h1 className="shopHeader-title">Shop</h1>
                  <p className="shopHeader-sub">
                    {hasCategory
                      ? `Showing ${activeCategory} animals.`
                      : 'Browse our premium livestock collection.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

