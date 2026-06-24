import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaCheckCircle,
  FaHome,
  FaArrowRight,
  FaPaw,
  FaInfoCircle,
  FaMoneyBillWave,
  FaCalendarAlt
} from 'react-icons/fa'
import '../css/Checkout.css'
import AnimalCareModal from '../components/AnimalCareModal'

const formatPrice = (price) => {
  if (!price && price !== 0) return '0'
  const num = typeof price === 'string'
    ? parseInt(price.replace(/,/g, ''), 10)
    : price
  if (isNaN(num)) return String(price)
  return num.toLocaleString('en-PK')
}

const OrderSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAnimalCareModal, setShowAnimalCareModal] = useState(false)
  const [animalCare, setAnimalCare] = useState(false)

  const s = location.state || {}
  const ok = Boolean(s.fromPurchase)

  useEffect(() => {
    if (!ok) {
      navigate('/shop', { replace: true })
    }
  }, [ok, navigate])

  useEffect(() => {
    setAnimalCare(s.animalCareSelected || false)
  }, [s.animalCareSelected])

  const handleAnimalCareProceed = () => {
    setAnimalCare(true)
    setShowAnimalCareModal(false)
  }

  const handleAnimalCareClose = () => {
    setShowAnimalCareModal(false)
  }

  if (!ok) {
    return null
  }

  const {
    orderId = '',
    grandTotal = 0,
    totalItems = 0,
    customerName = '',
    city = '',
    email = '',
    animalCareSelected = false,
    items = []
  } = s

  const hasLivestock = items.some(it => String(it.itemType || '').toLowerCase() !== 'meat')

  // Show AnimalCareModal automatically if has livestock
  useEffect(() => {
    if (hasLivestock && ok) {
      const t = setTimeout(() => setShowAnimalCareModal(true), 600)
      return () => clearTimeout(t)
    }
  }, [hasLivestock, ok])

  const advanceAmount = Math.round(grandTotal * 0.20)
  const remainingAmount = grandTotal - advanceAmount

  const livestockName = items.find(it => String(it.itemType || '').toLowerCase() !== 'meat')?.name || 'your animal'

  return (
    <div className="checkout-page checkout-page--visible">
      {hasLivestock && (
        <AnimalCareModal
          isOpen={showAnimalCareModal}
          onClose={handleAnimalCareClose}
          onProceed={handleAnimalCareProceed}
          animalName={livestockName}
        />
      )}

      <div className="co-success-screen">
        <div className="co-success-icon-wrap">
          <FaCheckCircle className="co-success-icon" />
        </div>
        <h1 className="co-success-title">Your order has been placed successfully!</h1>
        <p className="co-success-text">
          Aapka order record ho chuka hai. Hamari team jald aap se contact karegi —
          WhatsApp par bhi summary bhej di gayi hai.
        </p>
        <div className="co-success-details">
          {orderId ? (
            <div className="co-success-row">
              <span>Order reference</span>
              <strong>{orderId}</strong>
            </div>
          ) : null}
          <div className="co-success-row">
            <span>Order total</span>
            <strong>Rs {formatPrice(grandTotal)}</strong>
          </div>
          <div className="co-success-row">
            <span>Payment</span>
            <strong>Cash on delivery</strong>
          </div>
          <div className="co-success-row">
            <span>Items</span>
            <strong>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </strong>
          </div>
          {customerName ? (
            <div className="co-success-row">
              <span>Customer</span>
              <strong>{customerName}</strong>
            </div>
          ) : null}
          {city ? (
            <div className="co-success-row">
              <span>Delivery city</span>
              <strong>{city}</strong>
            </div>
          ) : null}
        </div>

        {/* Animal Care Service Section — Only for livestock */}
        {hasLivestock && (
          <div className="co-success-care-card">
            <div className="co-success-care-header">
              <FaPaw className="co-success-care-header-icon" />
              <h3>Animal Care Service</h3>
            </div>
            
            <div className="co-success-care-body">
              {!animalCare ? (
                <p className="co-success-care-status-msg">
                  You did not choose Animal Care Service for this order.
                </p>
              ) : (
                <>
                  <p className="co-success-care-status-msg co-success-care-status-msg--selected">
                    You have selected Animal Care Service for this order.
                  </p>
                  
                  <div className="co-success-care-payment-box">
                    <div className="co-success-care-alert">
                      <FaInfoCircle className="co-success-care-alert-icon" />
                      <span>You need to pay a 20% advance based on your order amount to confirm this service.</span>
                    </div>
                    
                    <div className="co-success-care-breakdown">
                      <div className="co-success-care-row">
                        <span>20% Advance Amount</span>
                        <strong className="co-highlight-price">Rs {formatPrice(advanceAmount)}</strong>
                      </div>
                      <div className="co-success-care-row">
                        <span>Remaining Amount (80%)</span>
                        <strong className="co-highlight-price">Rs {formatPrice(remainingAmount)}</strong>
                      </div>
                    </div>
                    
                    <div className="co-success-care-explanation">
                      <p>The remaining amount will be collected when we receive your animal.</p>
                      <p>Per day charges (Rs. 100/day) are not included in this amount and will be handled separately when you visit.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="co-success-care-footer">
              <FaCalendarAlt className="co-success-care-footer-icon" />
              <span>You can visit your animal anytime after handing it over.</span>
            </div>
          </div>
        )}

        <div className="co-success-actions">
          <button
            type="button"
            className="co-success-btn co-success-btn--home"
            onClick={() => navigate('/')}
          >
            <FaHome className="co-success-btn-icon" />
            <span>Back to home</span>
          </button>
          <button
            type="button"
            className="co-success-btn co-success-btn--shop"
            onClick={() => navigate('/shop')}
          >
            <span>Continue shopping</span>
            <FaArrowRight className="co-success-btn-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
