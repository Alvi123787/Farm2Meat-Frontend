import React, { useCallback, useEffect, useState, useRef } from 'react'
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
  FaArrowLeft,
  FaTimes,
  FaSpinner
} from 'react-icons/fa'
import ReactGA from 'react-ga4'
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
  if (isAbsoluteUrl(trimmed)) return trimmed
  return buildMediaUrl(trimmed) || '/placeholder.jpg'
}

// ── Helper: Get thumbnail URL ──
const getThumbnail = (item) => {
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    return buildImageUrl(item.images[0])
  }
  if (item.imageUrl) return buildImageUrl(item.imageUrl)
  if (item.img) return buildImageUrl(item.img)
  return '/placeholder.jpg'
}

// ── Helper: Get stock status ──
const getStockConfig = (stock) => stockConfig[stock] || stockConfig.available

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

const isItemAvailable = (item) => {
  const isMeat = isMultiQuantityItem(item)
  if (isMeat) {
    return item.isAvailable !== false
  } else {
    return true
  }
}

const getEffectiveQuantity = (item) => (isMultiQuantityItem(item) ? (item.quantity || 1) : 1)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cart Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Cart = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart: cartItems, removeItem, updateQuantity, updateCart } = useCart()

  const [isVisible, setIsVisible] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const checkingRef = useRef(false)
  const [notices, setNotices] = useState([])

  // FIX: Loading states for buttons (double-click prevention)
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

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

  // FIX: Dismiss a single notice by index
  const dismissNotice = (idx) => {
    setNotices((prev) => prev.filter((_, i) => i !== idx))
  }

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
    // Find item to get details for GA4 event
    const item = cartItems.find(i => i._id === id)
    if (item) {
      const newQuantity = (item.quantity || 1) + delta
      console.log(`📦 [GA4] Tracking quantity change: ${item.name} - ${delta > 0 ? 'increased' : 'decreased'} to ${newQuantity}${item.unit ? ` ${item.unit}` : ''}`)
      
      ReactGA.event({
        category: 'Cart',
        action: 'Quantity_Changed',
        label: item.name,
        value: newQuantity,
        item_id: id,
        item_type: item.itemType || 'livestock',
        unit: item.unit || 'piece',
        price: priceToNumber(item.price)
      })
    }
    updateQuantity(id, delta)
  }

  const handleRemoveItem = (id) => {
    // Track item removal before removing it
    const item = cartItems.find(i => i._id === id)
    if (item) {
      console.log(`🗑️ [GA4] Tracking item removed: ${item.name}`)
      ReactGA.event({
        category: 'Cart',
        action: 'Item_Removed',
        label: item.name,
        item_id: id,
        item_type: item.itemType || 'livestock',
        unit: item.unit || 'piece',
        price: priceToNumber(item.price)
      })
    }

    setRemovingId(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingId(null)
    }, 400)
  }

  const pruneUnavailable = useCallback(
    async (items) => {
      if (checkingRef.current) return
      checkingRef.current = true

      const meatItemIds = (items || [])
        .filter((it) => isMultiQuantityItem(it))
        .map((it) => String(it._id || it.id || '').trim())
        .filter(Boolean)

      const meatItemMap = new Map()
      if (meatItemIds.length > 0) {
        try {
          const response = await api.get('/api/meat-items', { params: { limit: 1000 } })
          if (response.data && response.data.success) {
            response.data.data.forEach(item => meatItemMap.set(String(item._id), item))
          }
        } catch (e) {
          console.warn('Could not fetch meat items for availability check:', e)
        }
      }

      const livestockIds = (items || [])
        .filter((it) => !isMultiQuantityItem(it))
        .map((it) => String(it._id || it.id || '').trim())
        .filter(Boolean)

      let unavailableAnimalIds = []
      if (livestockIds.length > 0) {
        try {
          const result = await animalsService.checkAvailability({ ids: livestockIds })
          unavailableAnimalIds = Array.isArray(result?.unavailable)
            ? result.unavailable.map(u => String(u.id || u))
            : []
        } catch (e) {
          void e
        }
      }

      const setUnavailableAnimalIds = new Set(unavailableAnimalIds)
      const removed = items.filter((it) => {
        const isMeat = isMultiQuantityItem(it)
        if (isMeat) {
          const id = String(it._id || it.id)
          const freshItem = meatItemMap.get(id)
          return freshItem ? !freshItem.isAvailable : !isItemAvailable(it)
        } else {
          return setUnavailableAnimalIds.has(String(it._id || it.id))
        }
      })
      const kept = items
        .filter((it) => {
          const isMeat = isMultiQuantityItem(it)
          if (isMeat) {
            const id = String(it._id || it.id)
            const freshItem = meatItemMap.get(id)
            return freshItem ? freshItem.isAvailable : isItemAvailable(it)
          } else {
            return !setUnavailableAnimalIds.has(String(it._id || it.id))
          }
        })
        .map(normalizeCartItem)

      if (removed.length > 0) {
        const names = removed.map((it) => it.name).filter(Boolean)
        let message = ''
        if (names.length === 1) {
          message = `"${names[0]}" has been removed from your cart because it's no longer available.`
        } else if (names.length <= 3) {
          message = `Some items have been removed from your cart: ${names.join(', ')}`
        } else {
          message = `Several items have been removed from your cart because they're no longer available.`
        }

        setNotices((prev) => [{ type: 'warning', text: message }, ...prev].slice(0, 3))

        if (kept.length === 0) {
          navigate('/unavailable-item', { replace: true })
          checkingRef.current = false
          return
        }
        await updateCart(kept)
      }

      checkingRef.current = false
    },
    [updateCart, navigate]
  )

  // FIX: Stable dependency key — only re-run when cart contents actually change,
  //      not on every render (prevents infinite loop when updateCart causes re-render)
  const cartItemsKey = cartItems.map(it => `${it._id || it.id}:${it.quantity || 1}`).join(',')

  useEffect(() => {
    pruneUnavailable(cartItems)

    const onFocus = () => {
      if (!checkingRef.current && document.visibilityState === 'visible') {
        pruneUnavailable(cartItems)
      }
    }
    window.addEventListener('focus', onFocus)

    const interval = setInterval(() => {
      if (!checkingRef.current && document.visibilityState === 'visible') {
        pruneUnavailable(cartItems)
      }
    }, 20000)

    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItemsKey, pruneUnavailable])

  useEffect(() => {
    const handleExpired = () => {
      setNotices([{ type: 'warning', text: 'Your cart expired and was cleared.' }])
    }
    window.addEventListener('cart-expired', handleExpired)
    return () => window.removeEventListener('cart-expired', handleExpired)
  }, [])

  // FIX: Extracted message builder (was previously inlined and called handleCheckoutWhatsApp)
  const buildWhatsAppMessage = () => {
    let msg = `Assalam o Alaikum!%0A%0A🛒 *New Order from MeatByAlvi Website*%0A%0A`
    cartItems.forEach((item, i) => {
      const qty = getEffectiveQuantity(item)
      const unitText = item.unit ? ` ${item.unit}` : ''
      msg += `${i + 1}. *${item.name}*%0A`
      msg += `   Breed: ${item.breed}`
      if (item.weight) msg += ` | Weight (Zinda): ${item.weight}`
      msg += `%0A`
      msg += `   Price: ${formatPrice(item.price)} x ${qty}${unitText}%0A`
      msg += `   Subtotal: ${formatPrice(priceToNumber(item.price) * qty)}%0A%0A`
    })
    msg += `━━━━━━━━━━━━━━━%0A`
    msg += `Items: ${totalItems}%0A`
    msg += `Subtotal:  ${formatPrice(subtotal)}%0A`
    msg += `*Total:  ${formatPrice(total)}*%0A`
    return msg
  }

  const handleWhatsAppOrder = async () => {
    if (whatsappLoading) return
    setWhatsappLoading(true)

    try {
      await api.post('/api/inquiries/bulk', {
        customerName: 'WhatsApp User',
        phone: WHATSAPP_NUMBER,
        email: '',
        items: cartItems.map((item) => ({
          _id: item._id || item.id,
          name: item.name,
          tagId: item.tagId || item._id || '',
          breed: item.breed || '',
          weight: item.weight || '',
          unit: item.unit || '',
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
    } catch (err) {
      if (err.response?.status === 409) {
        // Atomic conflict: Animal already sold or reserved
        navigate('/unavailable-item', { replace: true })
        setWhatsappLoading(false)
        return
      }
      // FIX: Non-409 errors — show notice but still allow WhatsApp redirect
      console.error('Error saving inquiry:', err)
      setNotices((prev) =>
        [
          {
            type: 'warning',
            text: 'Could not save your order record, but you can still place your order via WhatsApp.'
          },
          ...prev
        ].slice(0, 3)
      )
    }

    // FIX: Clear cart after WhatsApp order is initiated
    await updateCart([])

    const msg = buildWhatsAppMessage()
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    setWhatsappLoading(false)
  }

  const handleCheckout = () => {
    if (checkoutLoading) return
    setCheckoutLoading(true)
    navigate('/checkout', {
      state: { cart: cartItems.map(normalizeCartItem) }
    })
    // Reset in case user navigates back
    setTimeout(() => setCheckoutLoading(false), 1500)
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

              {/* FIX: Dismissible notices with × button */}
              {notices.length > 0 && (
                <div className="cart-notice-stack">
                  {notices.map((n, idx) => (
                    <div key={idx} className={`cart-notice cart-notice--${n.type || 'info'}`}>
                      <FaShieldAlt className="cart-notice-icon" />
                      <span>{n.text}</span>
                      <button
                        className="cart-notice-dismiss"
                        onClick={() => dismissNotice(idx)}
                        aria-label="Dismiss notification"
                      >
                        <FaTimes />
                      </button>
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
                  {/* FIX: English only — removed Urdu mix */}
                  <p className="cart-empty-text">
                    You haven't selected any items yet. Browse our premium collection and find the perfect choice for you!
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
                          {/* FIX: Image thumbnail is now clickable */}
                          <button
                            className="cart-item-img-wrap cart-item-img-btn"
                            onClick={() => navigate(`/shop/${item._id}`)}
                            aria-label={`View details for ${item.name}`}
                          >
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
                          </button>

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
                          <span className="cart-qty-value">
                            {item.quantity || 1}
                            {item.unit ? ` ${item.unit}` : ''}
                          </span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => handleUpdateQuantity(item._id, 1)}
                            disabled={(item.quantity || 1) >= 99}
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
                                   {formatPrice(priceToNumber(item.price) * getEffectiveQuantity(item))}
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
                              {formatPrice(priceToNumber(item.price) * getEffectiveQuantity(item))}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="cart-summary-divider"></div>

                      <div className="cart-summary-row">
                        <span className="cart-summary-label">Subtotal</span>
                        <span className="cart-summary-value"> {formatPrice(subtotal)}</span>
                      </div>

                      {/* FIX: Free Delivery row in summary */}
                      

                      <div className="cart-summary-divider cart-summary-divider--total"></div>

                      <div className="cart-summary-row cart-summary-row--total">
                        <span className="cart-summary-total-label">Total Amount</span>
                        <span className="cart-summary-total-value"> {formatPrice(total)}</span>
                      </div>

                      <div className="cart-cod-badge">
                        <FaCheckCircle className="cart-cod-icon" />
                        <span>Cash On Delivery</span>
                      </div>

                      <div className="cart-cta-group">
                        {/* FIX: WhatsApp button with loading state */}
                        <button
                          className="cart-btn cart-btn--whatsapp"
                          onClick={handleWhatsAppOrder}
                          disabled={whatsappLoading}
                        >
                          {whatsappLoading
                            ? <FaSpinner className="cart-btn-icon cart-btn-icon--spin" />
                            : <FaWhatsapp className="cart-btn-icon" />
                          }
                          <span>{whatsappLoading ? 'Processing...' : 'Order via WhatsApp'}</span>
                        </button>

                        {/* FIX: Checkout button with loading state */}
                        <button
                          className="cart-btn cart-btn--checkout"
                          onClick={handleCheckout}
                          disabled={checkoutLoading}
                        >
                          {checkoutLoading && (
                            <FaSpinner className="cart-btn-icon cart-btn-icon--spin" />
                          )}
                          <span>{checkoutLoading ? 'Loading...' : 'Proceed to Checkout'}</span>
                          {!checkoutLoading && <FaArrowRight className="cart-btn-icon" />}
                        </button>
                      </div>

                      <p className="cart-summary-note">
                        <FaShieldAlt className="cart-summary-note-icon" />
                        Prices include all applicable charges. No hidden fees.
                      </p>
                    </div>

                    {/* ── QUALITY GUARANTEE SECTION ── */}
                    <div className="cart-guarantee-card">
                      <div className="cart-guarantee-icon-wrap">
                        <FaShieldAlt className="cart-guarantee-icon" />
                      </div>
                      <h3 className="cart-guarantee-title">100% Quality Assurance</h3>
                      <p className="cart-guarantee-text">
                        We take pride in the quality of our meat and livestock. If your order doesn't meet our standards for freshness, tenderness, or taste, we offer a full refund for any valid quality concerns. Your satisfaction is our primary commitment.
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
            {/* FIX: Items count added to sticky bar label */}
            <span className="cart-sticky-total-label">
              {totalItems} item{totalItems > 1 ? 's' : ''} · Total
            </span>
            <span className="cart-sticky-total-value"> {formatPrice(total)}</span>
          </div>
          <div className="cart-sticky-actions">
            <button
              type="button"
              className="cart-sticky-btn cart-sticky-btn--checkout"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading
                ? <FaSpinner className="cart-sticky-btn-icon cart-btn-icon--spin" />
                : <FaArrowRight className="cart-sticky-btn-icon" />
              }
              <span>Checkout</span>
            </button>
            <button
              type="button"
              className="cart-sticky-btn cart-sticky-btn--whatsapp"
              onClick={handleWhatsAppOrder}
              disabled={whatsappLoading}
            >
              {whatsappLoading
                ? <FaSpinner className="cart-sticky-btn-icon cart-btn-icon--spin" />
                : <FaWhatsapp className="cart-sticky-btn-icon" />
              }
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart