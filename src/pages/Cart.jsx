import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaShoppingCart,
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaWeightHanging,
  FaDna,
  FaTag,
  FaWhatsapp,
  FaArrowRight,
  FaShieldAlt,
  FaTruck,
  FaCheckCircle,
  FaCalendarAlt,
  FaBoxOpen,
  FaArrowLeft
} from 'react-icons/fa'
import api from '../services/api'
import '../css/Cart.css'
import { animalsService } from '../services/animalsService'
import { useCart } from '../contexts/cartContextCore'
import { buildMediaUrl, isAbsoluteUrl } from '../utils/mediaUrl'
import { WHATSAPP_NUMBER } from '../constants/contact'
import { formatPrice } from '../utils/priceUtils'

// ── Config ──
const DELIVERY_CHARGE = 0

// ── Stock badge config ──
const stockConfig = {
  available: { label: 'Available', className: 'cart-stock--available' },
  Available: { label: 'Available', className: 'cart-stock--available' },
  new: { label: 'Available', className: 'cart-stock--available' },
  limited: { label: 'Limited Stock', className: 'cart-stock--limited' },
  reserved: { label: 'Reserved', className: 'cart-stock--reserved' },
  Reserved: { label: 'Reserved', className: 'cart-stock--reserved' },
  sold: { label: 'Sold', className: 'cart-stock--sold' },
  Sold: { label: 'Sold', className: 'cart-stock--sold' }
}

// ── Helper: Parse price to number ──
const priceToNumber = (price) => {
  if (!price) return 0
  if (typeof price === 'number') return price
  return parseInt(price.replace(/,/g, ''), 10) || 0
}

// ── Helper: Build full image URL ──
const buildImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '/placeholder.jpg'
  const trimmed = imagePath.trim()
  if (!trimmed) return '/placeholder.jpg'
  
  // Already a full URL
  if (isAbsoluteUrl(trimmed)) return trimmed
  return buildMediaUrl(trimmed) || '/placeholder.jpg'
}

// ── Helper: Get thumbnail URL ──
const getThumbnail = (item) => {
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    return buildImageUrl(item.images[0])
  }
  if (item.imageUrl) {
    return buildImageUrl(item.imageUrl)
  }
  if (item.img) {
    return buildImageUrl(item.img)
  }
  return '/placeholder.jpg'
}

// ── Helper: Get stock status ──
const getStockConfig = (stock) => {
  return stockConfig[stock] || stockConfig.available
}

const normalize = (v) => String(v || '').trim().toLowerCase()

const isMultiQuantityItem = (item) => {
  const mode = normalize(item?.purchaseMode)
  if (mode === 'multi') return true
  const type = normalize(item?.itemType)
  return type === 'meat'
}

const normalizeCartItem = (item) => {
  const base = { ...item }
  if (!base.purchaseMode) base.purchaseMode = 'single'
  if (!base.itemType) base.itemType = 'livestock'
  if (!isMultiQuantityItem(base)) base.quantity = 1
  if (!base.quantity || base.quantity < 1) base.quantity = 1
  return base
}

const getEffectiveQuantity = (item) => (isMultiQuantityItem(item) ? (item.quantity || 1) : 1)

const availabilityMessage = (name) =>
  `${name} is no longer available because another customer has already purchased it.`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cart Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Cart = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart: cartItems, removeItem, updateQuantity, updateCart } = useCart()

  const [isVisible, setIsVisible] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [notices, setNotices] = useState([])

  // ── Entrance animation ──
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // ── Scroll to top ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Banner when redirected from checkout (empty cart) or buy-now confirmation
  useEffect(() => {
    const notice = location.state?.notice
    const fromBuyNow = location.state?.fromBuyNow
    const messages = []
    if (typeof notice === 'string' && notice.trim()) {
      messages.push({ type: 'info', text: notice.trim() })
    }
    if (fromBuyNow) {
      messages.push({
        type: 'success',
        text: 'Item added to your cart. Review below and proceed to checkout when ready.'
      })
    }
    if (messages.length > 0) {
      setNotices((prev) => [...messages, ...prev].slice(0, 4))
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // ════════════════════════════════════════════
  // Calculations
  // ════════════════════════════════════════════

  const subtotal = cartItems.reduce(
    (sum, item) => sum + priceToNumber(item.price) * getEffectiveQuantity(item),
    0
  )
  const delivery = cartItems.length > 0 ? DELIVERY_CHARGE : 0
  const total = subtotal + delivery
  const totalItems = cartItems.reduce((sum, item) => sum + getEffectiveQuantity(item), 0)

  // ════════════════════════════════════════════
  // Handlers
  // ════════════════════════════════════════════

  const handleUpdateQuantity = (id, delta) => {
    updateQuantity(id, delta)
  }

  const handleRemoveItem = (id) => {
    setRemovingId(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingId(null)
    }, 400)
  }

  const pruneUnavailable = useCallback(
    async (items) => {
      const ids = (items || [])
        .filter((it) => !isMultiQuantityItem(it))
        .map((it) => String(it._id || it.id || '').trim())
        .filter(Boolean)
      if (ids.length === 0) return

      try {
        const result = await animalsService.checkAvailability({ ids })
        const unavailable = Array.isArray(result?.unavailable) ? result.unavailable : []
        if (unavailable.length === 0) return

        const setIds = new Set(unavailable.map((u) => String(u.id)))
        const removed = items.filter((it) => setIds.has(String(it._id || it.id)))
        const kept = items
          .filter((it) => !setIds.has(String(it._id || it.id)))
          .map(normalizeCartItem)

        if (removed.length > 0) {
          const msgs = removed.map((it) => ({
            type: 'info',
            text: availabilityMessage(it.name || 'This item')
          }))
          setNotices((prev) => [...msgs, ...prev].slice(0, 3))
          updateCart(kept)
        }
      } catch (e) {
        void e
      }
    },
    [updateCart]
  )

  useEffect(() => {
    pruneUnavailable(cartItems)
    const onFocus = () => pruneUnavailable(cartItems)
    window.addEventListener('focus', onFocus)
    const interval = setInterval(() => pruneUnavailable(cartItems), 20000)
    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
  }, [cartItems, pruneUnavailable])

  useEffect(() => {
    const handleExpired = () => {
      setNotices([{ type: 'warning', text: 'Your cart expired and was cleared.' }]);
    };
    window.addEventListener('cart-expired', handleExpired);
    return () => window.removeEventListener('cart-expired', handleExpired);
  }, []);

  const buildWhatsAppMessage = () => {
    let msg = `Assalam o Alaikum!%0A%0A🛒 *New Order from Farm2Meat Website*%0A%0A`

    cartItems.forEach((item, i) => {
      const qty = getEffectiveQuantity(item)
      msg += `${i + 1}. *${item.name}*%0A`
      msg += `   Breed: ${item.breed}`
      if (item.weight) msg += ` | Weight (Zinda): ${item.weight}`
      msg += `%0A`
      msg += `   Price: Rs ${formatPrice(item.price)} x ${qty}%0A`
      msg += `   Subtotal: Rs ${formatPrice(priceToNumber(item.price) * qty)}%0A%0A`
    })

    msg += `━━━━━━━━━━━━━━━%0A`
    msg += `Items: ${totalItems}%0A`
    msg += `Subtotal: Rs ${formatPrice(subtotal)}%0A`
    msg += `Delivery: Free%0A`
    msg += `*Total: Rs ${formatPrice(total)}*%0A`

    return msg
  }

  const handleWhatsAppOrder = async () => {
    try {
      const response = await api.post('/api/inquiries/bulk', {
        customerName: 'WhatsApp User',
        phone: WHATSAPP_NUMBER,
        email: '',
        items: cartItems.map((item) => ({
          _id: item._id || item.id,
          name: item.name,
          tagId: item.tagId || item._id || '',
          breed: item.breed || '',
          weight: item.weight || '',
          price: item.price,
          quantity: getEffectiveQuantity(item),
          itemType: item.itemType || 'livestock',
          purchaseMode: item.purchaseMode || 'single'
        })),
        deliveryAddress: 'WhatsApp Inquiry',
        city: 'Unknown',
        deliveryCharge: 0,
        paymentMethod: 'whatsapp',
        orderSource: 'cart',
        notes: 'Customer inquiring via WhatsApp'
      })

      const result = response.data
    } catch (err) {
      console.error('Error saving inquiry:', err)
      
      if (err.response && err.response.status === 409) {
        setNotices([{ 
          type: 'warning', 
          text: "This animal was just sold to another user. Please refresh your cart." 
        }])
        setTimeout(() => {
          window.location.reload()
        }, 3500)
        return
      }
    }

    const msg = buildWhatsAppMessage()
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const handleCheckout = () => {
    navigate('/checkout', {
      state: {
        cart: cartItems.map(normalizeCartItem)
      }
    })
  }

  const isCartEmpty = cartItems.length === 0

  // ════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════

  return (
    <div className={`cart-page ${isVisible ? 'cart-page--visible' : ''}`}>

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <section className="cart-header-section">
        <div className="cart-header-bg">
          <div className="cart-header-circle cart-header-circle--1"></div>
          <div className="cart-header-circle cart-header-circle--2"></div>
          <div className="cart-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
          <div className="col-12">
            <div className="cart-header-content">
              <div className="unified-header-top">
                <button className="cart-back-link" onClick={() => navigate('/shop')}>
                  <FaArrowLeft />
                  <span>Back to Shop</span>
                </button>
              </div>
              <div className="cart-header-main">
                  <div className="cart-header-title-row">
                    <FaShoppingCart className="cart-header-icon" />
                    <h1 className="cart-header-title">My Shopping Cart</h1>
                  </div>
                  <div className="cart-free-delivery-badge">
                    <FaTruck />
                    <span>Free Home Delivery Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <section className="cart-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              {notices.length > 0 && (
                <div className="cart-notice-stack">
                  {notices.map((n, idx) => (
                    <div key={idx} className={`cart-notice cart-notice--${n.type || 'info'}`}>
                      <FaShieldAlt className="cart-notice-icon" />
                      <span>{n.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {isCartEmpty ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon-wrap">
                    <FaBoxOpen className="cart-empty-icon" />
                  </div>
                  <h2 className="cart-empty-title">Your Cart is Empty</h2>
                  <p className="cart-empty-text">
                    Abhi tak koi janwar select nahi kiya. Hamari premium
                    collection zaroor dekhein!
                  </p>
                  <button className="cart-empty-btn" onClick={() => navigate('/shop')}>
                    <span>Browse Collection</span>
                    <FaArrowRight />
                  </button>
                </div>
              ) : (
                <div className="cart-layout">

                  {/* ═══════ LEFT: CART ITEMS ═══════ */}
                  <div className="cart-items-col">

                    <div className="cart-items-header">
                      <h2 className="cart-items-title">Cart Items ({totalItems})</h2>
                      {cartItems.length > 1 && (
                        <button
                          className="cart-clear-all-btn"
                          onClick={() => updateCart([])}
                        >
                          <FaTrashAlt />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>

                    <div className="cart-items-list">
                      {cartItems.map((item) => (
                        <div
                          key={item._id}
                          className={`cart-item ${removingId === item._id ? 'cart-item--removing' : ''}`}
                        >
                          <div className="cart-item-img-wrap">
                            <img
                              src={getThumbnail(item)}
                              alt={item.name}
                              className="cart-item-img"
                              onError={(e) => { e.target.src = '/placeholder.jpg' }}
                            />
                            <div className={`cart-item-stock ${getStockConfig(item.stock).className}`}>
                              <span className="cart-item-stock-dot"></span>
                              {getStockConfig(item.stock).label}
                            </div>
                          </div>

                          <div className="cart-item-details">
                            <div className="cart-item-top">
                              <button
                                className="cart-item-name-link"
                                onClick={() => navigate(`/shop/${item._id}`)}
                              >
                                <h3 className="cart-item-name">{item.name}</h3>
                              </button>
                              <button
                                className="cart-item-remove"
                                onClick={() => handleRemoveItem(item._id)}
                                aria-label={`Remove ${item.name}`}
                              >
                                <FaTrashAlt />
                              </button>
                            </div>

                            <div className="cart-item-meta">
                              {item.breed && (
                                <span className="cart-item-meta-tag">
                                  <FaDna className="cart-item-meta-icon" />
                                  {item.breed}
                                </span>
                              )}
                              {item.weight && (
                                <span className="cart-item-meta-tag">
                                  <FaWeightHanging className="cart-item-meta-icon" />
                                  {item.weight}
                                </span>
                              )}
                              {item.age && (
                                <span className="cart-item-meta-tag">
                                  <FaCalendarAlt className="cart-item-meta-icon" />
                                  {item.age}
                                </span>
                              )}
                            </div>

                            <div className="cart-item-bottom">
                              <div className="cart-item-price-block">
                                <span className="cart-item-price-label">
                                  <FaTag className="cart-item-price-icon" />
                                  Price
                                </span>
                                <span className="cart-item-price">
                                  {formatPrice(item.price)}
                                </span>
                              </div>

                              {isMultiQuantityItem(item) ? (
                                <div className="cart-item-qty">
                                  <button
                                    className="cart-qty-btn"
                                    onClick={() => handleUpdateQuantity(item._id, -1)}
                                    disabled={(item.quantity || 1) <= 1}
                                    aria-label="Decrease quantity"
                                  >
                                    <FaMinus />
                                  </button>
                                  <span className="cart-qty-value">{item.quantity || 1}</span>
                                  <button
                                    className="cart-qty-btn"
                                    onClick={() => handleUpdateQuantity(item._id, 1)}
                                    disabled={(item.quantity || 1) >= 5}
                                    aria-label="Increase quantity"
                                  >
                                    <FaPlus />
                                  </button>
                                </div>
                              ) : (
                                <div className="cart-item-qty cart-item-qty--fixed">
                                  <span className="cart-qty-value">Qty: 1</span>
                                </div>
                              )}

                              <div className="cart-item-total">
                                <span className="cart-item-total-label">Subtotal</span>
                                <span className="cart-item-total-value">
                                  Rs {formatPrice(priceToNumber(item.price) * getEffectiveQuantity(item))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ═══════ RIGHT: ORDER SUMMARY ═══════ */}
                  <div className="cart-summary-col">
                    <div className="cart-summary-card">

                      <div className="cart-summary-header">
                        <h3 className="cart-summary-title">Order Summary</h3>
                        <span className="cart-summary-items">
                          {totalItems} item{totalItems > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="cart-summary-items-list">
                        {cartItems.map((item) => (
                          <div key={item._id} className="cart-summary-item">
                            <div className="cart-summary-item-info">
                              <span className="cart-summary-item-name">{item.name}</span>
                              <span className="cart-summary-item-qty">x{getEffectiveQuantity(item)}</span>
                            </div>
                            <span className="cart-summary-item-price">
                              Rs {formatPrice(priceToNumber(item.price) * getEffectiveQuantity(item))}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="cart-summary-divider"></div>

                      <div className="cart-summary-row">
                        <span className="cart-summary-label">Subtotal</span>
                        <span className="cart-summary-value">{formatPrice(subtotal)}</span>
                      </div>

                      <div className="cart-summary-row">
                        <span className="cart-summary-label">
                          <FaTruck className="cart-summary-label-icon" />
                          Delivery
                        </span>
                        <span className="cart-summary-value cart-summary-value--delivery">
                          Free
                        </span>
                      </div>

                      <div className="cart-summary-divider cart-summary-divider--total"></div>

                      <div className="cart-summary-row cart-summary-row--total">
                        <span className="cart-summary-total-label">Total Amount</span>
                        <span className="cart-summary-total-value">{formatPrice(total)}</span>
                      </div>

                      <div className="cart-cod-badge">
                        <FaCheckCircle className="cart-cod-icon" />
                        <span>Cash On Delivery</span>
                      </div>

                      <div className="cart-cta-group">
                        <button className="cart-btn cart-btn--whatsapp" onClick={handleWhatsAppOrder}>
                          <FaWhatsapp className="cart-btn-icon" />
                          <span>Order via WhatsApp</span>
                        </button>

                        <button
                          className="cart-btn cart-btn--checkout"
                          onClick={handleCheckout}
                        >
                          <span>Proceed to Checkout</span>
                          <FaArrowRight className="cart-btn-icon" />
                        </button>
                      </div>

                      <p className="cart-summary-note">
                        <FaShieldAlt className="cart-summary-note-icon" />
                        Prices include all applicable charges. No hidden fees.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MOBILE STICKY CHECKOUT BAR
      ══════════════════════════════════════════ */}
      {!isCartEmpty && (
        <div className="cart-sticky-bar">
          <div className="cart-sticky-info">
            <span className="cart-sticky-total-label">Total</span>
            <span className="cart-sticky-total-value">{formatPrice(total)}</span>
          </div>
          <div className="cart-sticky-actions">
            <button
              type="button"
              className="cart-sticky-btn cart-sticky-btn--checkout"
              onClick={handleCheckout}
            >
              <span>Checkout</span>
              <FaArrowRight className="cart-sticky-btn-icon" />
            </button>
            <button
              type="button"
              className="cart-sticky-btn cart-sticky-btn--whatsapp"
              onClick={handleWhatsAppOrder}
            >
              <FaWhatsapp className="cart-sticky-btn-icon" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
