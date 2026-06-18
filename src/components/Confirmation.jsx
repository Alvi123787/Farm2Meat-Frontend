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

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1Z" fill="currentColor" />
    <path d="M20 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H20C21.1 23 22 22.1 22 21V7C22 5.9 21.1 5 20 5Z" fill="currentColor" />
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
      city: s.city || '',
    },
    delivery: {
      expectedDate: '2-3 hours',
      message: 'Our team will contact you for delivery confirmation.',
    },
    products: s.items || [],
    subtotal: s.subtotal || 0,
    shipping: s.deliveryCharge || 50,
    total: s.grandTotal || 0,
    butcher: s.butcher || null,
    animalCare: s.animalCareSelected || false,
    animalCarePrice:
      s.animalCarePrice || (s.animalCareSelected ? (s.items?.length || 1) * 100 : 0),
  };

  const livestockTotal = (s.items || []).reduce((acc, item) => {
    const isMeat = String(item.itemType || '').toLowerCase() === 'meat';
    if (!isMeat) return acc + Number(item.price || 0) * (item.quantity || 1);
    return acc;
  }, 0);

  orderData.advanceAmount =
    s.advanceAmount !== undefined ? s.advanceAmount : Math.round(livestockTotal * 0.2);

  orderData.remainingAmount =
    s.remainingAmount !== undefined
      ? s.remainingAmount
      : orderData.total +
        (orderData.animalCare ? orderData.animalCarePrice : 0) -
        orderData.advanceAmount;

  const grandTotal = orderData.total + (orderData.animalCare ? orderData.animalCarePrice : 0);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const firstName = orderData.customer.name.split(' ')[0];

  return (
    <div className="conf-page">
      <OrderExperienceModal
        open={showExperienceModal}
        onClose={handleExperienceModalClose}
        orderId={orderData.orderId}
        customerName={orderData.customer.name}
        email={s.email || ''}
      />

      <div className="conf-container">

        {/* Hero card */}
        <div className="conf-card conf-hero">
          <div className="conf-hero__body">
            <div className="conf-hero__icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="conf-eyebrow">Order placed</p>
            <h1 className="conf-hero__title">Thank you, {firstName}!</h1>
            <p className="conf-hero__sub">
              Your order has been confirmed. We'll contact you shortly for delivery.
            </p>
            <div className="conf-hero__rule" aria-hidden="true" />
          </div>

          <div className="conf-hero__meta">
            <div className="conf-hero__meta-left">
              <p className="conf-eyebrow">Order ID</p>
              <button
                className={`conf-copy-pill${copySuccess ? ' conf-copy-pill--success' : ''}`}
                onClick={handleCopyOrderId}
                aria-label="Copy order ID"
              >
                <span className="conf-copy-pill__id">{orderData.orderId}</span>
                <span className="conf-copy-pill__icon">
                  {copySuccess ? <CheckIcon size={13} /> : <CopyIcon />}
                </span>
                <span className="conf-copy-pill__label">{copySuccess ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="conf-hero__meta-right">
              <p className="conf-eyebrow">Estimated delivery</p>
              <p className="conf-delivery-eta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                {orderData.delivery.expectedDate}
              </p>
            </div>
          </div>

          <div className="conf-guarantee">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="conf-guarantee__icon">
              <path d="M12 2L3 6V12C3 16.97 7.02 21.61 12 23C16.98 21.61 21 16.97 21 12V6L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>
              If the quality of your meat or livestock does not meet expectations, we will issue a
              refund with a valid reason. Your satisfaction is our top priority.
            </p>
          </div>
        </div>

        {/* Two-column info grid */}
        <div className="conf-info-grid">
          <div className="conf-card">
            <div className="conf-card__header">
              <p className="conf-eyebrow">Order details</p>
              <h2 className="conf-card__title">Summary</h2>
            </div>
            <div className="conf-card__body">
              <div className="conf-meta-row">
                <span className="conf-meta-key">Date</span>
                <span className="conf-meta-val">{orderData.orderDate}</span>
              </div>
              <div className="conf-meta-row">
                <span className="conf-meta-key">Payment</span>
                <span className="conf-meta-val">{orderData.paymentMethod}</span>
              </div>
              <div className="conf-meta-row conf-meta-row--last">
                <span className="conf-meta-key">Status</span>
                <span className="conf-badge-confirmed">{orderData.status}</span>
              </div>
            </div>
          </div>

          <div className="conf-card">
            <div className="conf-card__header">
              <p className="conf-eyebrow">Delivery to</p>
              <h2 className="conf-card__title">Customer</h2>
            </div>
            <div className="conf-card__body">
              <div className="conf-meta-row">
                <span className="conf-meta-key">Name</span>
                <span className="conf-meta-val">{orderData.customer.name}</span>
              </div>
              <div className="conf-meta-row">
                <span className="conf-meta-key">Phone</span>
                <span className="conf-meta-val">{orderData.customer.phone}</span>
              </div>
              <div className="conf-meta-row conf-meta-row--last">
                <span className="conf-meta-key">Address</span>
                <span className="conf-meta-val conf-meta-val--address">{orderData.customer.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary card */}
        <div className="conf-card">
          <div className="conf-card__header">
            <p className="conf-eyebrow">Items ordered</p>
            <h2 className="conf-card__title">Order summary</h2>
          </div>
          <div className="conf-card__body">

            <div className="conf-items">
              {orderData.products.map((item, idx) => (
                <div key={item.id || idx} className="conf-item">
                  <div className="conf-item__img">
                    <img
                      src={buildImageUrl(item.image)}
                      alt={item.name}
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                    {(item.quantity || 1) > 1 && (
                      <span className="conf-item__qty">×{item.quantity}</span>
                    )}
                  </div>
                  <div className="conf-item__details">
                    <p className="conf-item__name">{item.name}</p>
                    <p className="conf-item__meta">
                      {item.breed && <span>{item.breed}</span>}
                      {item.breed && item.weight && <span className="conf-item__dot"> · </span>}
                      {item.weight && <span>{item.weight}</span>}
                      {!item.breed && !item.weight && (
                        <span>Qty ×{item.quantity || 1}</span>
                      )}
                    </p>
                  </div>
                  <span className="conf-item__total">
                    {formatPrice(Number(item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="conf-totals">
              <div className="conf-total-row">
                <span>Items subtotal</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              {orderData.animalCare && (
                <div className="conf-total-row">
                  <span>Animal care service</span>
                  <span>{formatPrice(orderData.animalCarePrice)}</span>
                </div>
              )}
              <div className="conf-total-row">
                <span>Delivery</span>
                <span>{formatPrice(orderData.shipping)}</span>
              </div>
              <div className="conf-total-row conf-total-row--grand">
                <span>Grand total</span>
                <span className="conf-grand-amount">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {orderData.advanceAmount > 0 && (
              <div className="conf-advance">
                <p className="conf-eyebrow conf-advance__eyebrow">Payment breakdown</p>
                <div className="conf-advance__row conf-advance__row--first">
                  <span className="conf-advance__label">
                    <span className="conf-dot conf-dot--primary" />
                    20% advance required
                  </span>
                  <span className="conf-advance__val conf-advance__val--primary">
                    {formatPrice(orderData.advanceAmount)}
                  </span>
                </div>
                <div className="conf-advance__row">
                  <span className="conf-advance__label">
                    <span className="conf-dot conf-dot--muted" />
                    80% balance on delivery
                  </span>
                  <span className="conf-advance__val">
                    {formatPrice(orderData.remainingAmount)}
                  </span>
                </div>
                <p className="conf-advance__note">
                  Remaining balance will be collected at the time of delivery.
                </p>
              </div>
            )}

            {orderData.animalCare && (
              <div className="conf-animal-care">
                <div className="conf-animal-care__header">
                  <span className="conf-status-dot" aria-hidden="true" />
                  <span className="conf-animal-care__title">Animal care service — active</span>
                </div>
                <p className="conf-animal-care__desc">
                  Our team will provide safe and clean facility care for your animals.
                </p>
                <div className="conf-animal-care__meta">
                  <span>Rate: Rs. 100/day</span>
                  <span className="conf-item__dot"> · </span>
                  <span>Visit anytime</span>
                </div>
              </div>
            )}

            {orderData.butcher && (
              <div className="conf-butcher">
                <p className="conf-eyebrow conf-butcher__eyebrow">Assigned butcher</p>
                <p className="conf-butcher__name">{orderData.butcher.name}</p>
                <p className="conf-butcher__sub">
                  {orderData.butcher.specialty}
                  {orderData.butcher.specialty && orderData.butcher.phone && ' · '}
                  {orderData.butcher.phone}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Actions */}
        <div className="conf-actions">
          <Link to="/" className="conf-btn conf-btn--primary">Back to home</Link>
          <Link to="/shop" className="conf-btn conf-btn--outline">Continue shopping</Link>
          <button onClick={() => window.print()} className="conf-btn conf-btn--ghost">
            Print receipt
          </button>
        </div>

        {/* Support */}
        <div className="conf-support">
          <span>Need help with your order?</span>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="conf-support__link"
          >
            Contact support on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};

export default Confirmation;