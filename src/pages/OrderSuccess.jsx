import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaCheckCircle,
  FaHome,
  FaArrowRight
} from 'react-icons/fa'
import '../css/Checkout.css'
import OrderExperienceModal from '../components/OrderExperienceModal'

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
  const [showExperienceModal, setShowExperienceModal] = useState(false)

  const s = location.state || {}
  const ok = Boolean(s.fromPurchase)

  useEffect(() => {
    if (!ok) {
      navigate('/shop', { replace: true })
    }
  }, [ok, navigate])

  useEffect(() => {
    if (!s.orderId) return undefined
    const t = setTimeout(() => setShowExperienceModal(true), 600)
    return () => clearTimeout(t)
  }, [s.orderId])

  if (!ok) {
    return null
  }

  const {
    orderId = '',
    grandTotal = 0,
    totalItems = 0,
    customerName = '',
    city = '',
    email = ''
  } = s

  return (
    <div className="checkout-page checkout-page--visible">
      {orderId ? (
        <OrderExperienceModal
          open={showExperienceModal}
          onClose={() => setShowExperienceModal(false)}
          orderId={orderId}
          customerName={customerName}
          email={email}
        />
      ) : null}

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
