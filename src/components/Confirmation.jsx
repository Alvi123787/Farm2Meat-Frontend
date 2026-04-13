import React, { useEffect, useState } from 'react';
import '../css/Confirmation.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import OrderExperienceModal from './OrderExperienceModal';
import { buildMediaUrl, isAbsoluteUrl } from '../utils/mediaUrl';
import { WHATSAPP_LINK } from '../constants/contact';
import { formatPrice } from '../utils/priceUtils';
const PURCHASE_STATE_KEY = 'postPurchaseConfirmationState';
const REVIEW_DISMISSED_PREFIX = 'postPurchaseReviewDismissed:';

const loadStoredPurchaseState = () => {
  try {
    const raw = sessionStorage.getItem(PURCHASE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.fromPurchase ? parsed : null;
  } catch (e) {
    void e;
    return null;
  }
};

const savePurchaseState = (state) => {
  try {
    sessionStorage.setItem(PURCHASE_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    void e;
  }
};

const buildImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '/placeholder.jpg';
  const trimmed = imagePath.trim();
  if (!trimmed) return '/placeholder.jpg';
  if (isAbsoluteUrl(trimmed)) return trimmed;
  return buildMediaUrl(trimmed) || '/placeholder.jpg';
};

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [purchaseState, setPurchaseState] = useState(() => {
    const routeState = location.state || {};
    if (routeState.fromPurchase) return routeState;
    return loadStoredPurchaseState() || {};
  });

  useEffect(() => {
    const routeState = location.state || {};
    if (!routeState.fromPurchase) return;
    setPurchaseState(routeState);
    savePurchaseState(routeState);
  }, [location.state]);

  const s = purchaseState || {};
  const ok = Boolean(s.fromPurchase);
  const reviewDismissedKey = s.orderId ? `${REVIEW_DISMISSED_PREFIX}${s.orderId}` : '';

  useEffect(() => {
    if (!ok) {
      navigate('/shop', { replace: true });
    }
  }, [ok, navigate]);

  useEffect(() => {
    if (!s.orderId || !reviewDismissedKey) return;
    try {
      if (sessionStorage.getItem(reviewDismissedKey) === '1') return;
    } catch (e) {
      void e;
    }
    // Small delay before showing the experience modal to ensure user sees success message
    const timer = setTimeout(() => {
      setShowExperienceModal(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [s.orderId, reviewDismissedKey]);

  const handleExperienceModalClose = () => {
    setShowExperienceModal(false);
    if (!reviewDismissedKey) return;
    try {
      sessionStorage.setItem(reviewDismissedKey, '1');
    } catch (e) {
      void e;
    }
  };

  if (!ok) return null;

  const orderData = {
    orderId: s.orderId || 'N/A',
    orderDate: s.timestamp
      ? new Date(s.timestamp).toLocaleDateString('en-PK', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now',
    paymentMethod: s.paymentMethod || 'Cash On Delivery',
    status: 'Confirmed',
    customer: {
      name: s.customerName || 'N/A',
      phone: s.phone || 'N/A',
      address: `${s.address || ''}, ${s.city || ''}`,
    },
    delivery: {
      expectedDate: '2-3 hours',
      message: 'Our team will contact you for delivery confirmation.',
    },
    products: s.items || [],
    subtotal: s.subtotal || 0,
    shipping: 0,
    total: s.grandTotal || 0,
    butcher: s.butcher || null,
    animalCare: s.animalCareSelected || false,
    animalCarePrice: s.animalCarePrice || (s.animalCareSelected ? (s.items?.length || 1) * 100 : 0),
    advanceAmount: s.advanceAmount || Math.round((s.grandTotal || 0) * 0.20),
    remainingAmount: s.remainingAmount || ((s.grandTotal || 0) - Math.round((s.grandTotal || 0) * 0.20))
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <div className="order-confirmation">
      <OrderExperienceModal
        open={showExperienceModal}
        onClose={handleExperienceModalClose}
        orderId={orderData.orderId}
        customerName={orderData.customer.name}
        email={s.email || ''}
      />

      <div className="confirmation-container">
        {/* Amazing Header Section */}
        <div className="confirmation-header">
          {/* Background decorative elements */}
          <div className="header-bg">
            <div className="bg-circle bg-circle-1"></div>
            <div className="bg-circle bg-circle-2"></div>
            <div className="bg-circle bg-circle-3"></div>
          </div>
          
          {/* Animated confetti particles */}
          <div className="confetti">
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
          </div>

          <div className="header-content">
            {/* Animated success icon */}
            <div className="success-icon-wrapper">
              <div className="success-ring"></div>
              <div className="success-icon">
                <svg className="success-icon-svg" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M20 32L28 40L44 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Typography with animation */}
            <div className="header-text">
              <h1>
                <span className="greeting">Thank You,</span>
                <span className="customer-name">{orderData.customer.name.split(' ')[0]}!</span>
              </h1>
              <div className="order-status">
                <span className="status-text">Your order has been </span>
                <span className="status-highlight">confirmed</span>
              </div>
              <p>We've received your order and will process it right away</p>
            </div>

            {/* Order ID Card */}
            <div className="order-id-card">
              <div className="order-id-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="order-id-content">
                <span className="order-id-label">Order ID</span>
                <span className="order-id-value">{orderData.orderId}</span>
              </div>
              <button className="copy-btn" onClick={handleCopyOrderId}>
                {copySuccess ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1Z" fill="currentColor"/>
                      <path d="M20 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H20C21.1 23 22 22.1 22 21V7C22 5.9 21.1 5 20 5Z" fill="currentColor"/>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Delivery estimate chip */}
            <div className="delivery-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Estimated delivery: <strong>{orderData.delivery.expectedDate}</strong></span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="confirmation-content">
          {/* Order Summary */}
          <div className="summary-card">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {orderData.products.map((item, idx) => (
                <div key={item.id || idx} className="order-item">
                  <div className="item-image">
                    <img
                      src={buildImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                    <span className="item-quantity">×{item.quantity || 1}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      {item.breed && <span>{item.breed}</span>}
                      {item.weight && <span>{item.weight}</span>}
                    </div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                  <div className="item-total">
                    {formatPrice(Number(item.price || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>

            <div className="totals">
              <div className="total-row">
                <span>Items Subtotal</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              {orderData.animalCare && (
                <div className="total-row">
                  <span>Animal Care Service</span>
                  <span>{formatPrice(orderData.animalCarePrice)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping</span>
                <span className="free-shipping">Free</span>
              </div>
              <div className="total-row grand-total">
                <span>Grand Total</span>
                <span>{formatPrice(orderData.total + (orderData.animalCare ? orderData.animalCarePrice : 0))}</span>
              </div>
              
              <div className="payment-breakdown">
                <div className="breakdown-row advance">
                  <div className="breakdown-label">
                    <span className="dot"></span>
                    20% Advance Required
                  </div>
                  <span className="breakdown-value">{formatPrice(orderData.advanceAmount)}</span>
                </div>
                <div className="breakdown-row remaining">
                  <div className="breakdown-label">
                    <span className="dot"></span>
                    80% Remaining Balance
                  </div>
                  <span className="breakdown-value">{formatPrice(orderData.remainingAmount)}</span>
                </div>
                <p className="payment-note">
                  * Remaining balance of <strong>{formatPrice(orderData.remainingAmount)}</strong> will be collected at the time of delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="info-card">
            <h2>Customer Information</h2>
            
            <div className="info-section">
              <h3>Contact Details</h3>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span>{orderData.customer.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span>{orderData.customer.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span>{orderData.customer.address}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Order Details</h3>
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span>{orderData.orderDate}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Payment:</span>
                <span>{orderData.paymentMethod}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="status-badge">{orderData.status}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Delivery Information</h3>
              <div className="info-row">
                <span className="info-label">Expected Delivery:</span>
                <span>{orderData.delivery.expectedDate}</span>
              </div>
              <div className="delivery-note">
                {orderData.delivery.message}
              </div>
            </div>

            {orderData.butcher && (
              <div className="info-section">
                <h3>Assigned Butcher</h3>
                <div className="butcher-info">
                  <div className="butcher-name">{orderData.butcher.name}</div>
                  <div className="butcher-details">
                    <div>{orderData.butcher.specialty}</div>
                    <div>{orderData.butcher.phone}</div>
                  </div>
                </div>
              </div>
            )}

            {orderData.animalCare && (
              <div className="info-section animal-care-section">
                <h3>Animal Care Service</h3>
                <div className="animal-care-info">
                  <div className="service-status">
                    <span className="status-dot"></span>
                    Selected for this order
                  </div>
                  <div className="service-details">
                    <p>Our team will provide safe and clean facility care for your animals.</p>
                    <div className="service-meta">
                      <span>Rate: Rs. 100/day</span>
                      <span>•</span>
                      <span>Visit anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link to="/shop" className="btn btn-secondary">
            Continue Shopping
          </Link>
          <button onClick={() => window.print()} className="btn btn-text">
            Print Receipt
          </button>
        </div>

        {/* Support Section */}
        <div className="support-section">
          <span>Need help with your order?</span>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
