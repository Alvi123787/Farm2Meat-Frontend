import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaLock,
  FaShieldAlt,
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaPhoneAlt,
  FaEnvelope,
  FaCity,
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStickyNote,
  FaMoneyBillWave,
  FaCheckCircle,
  FaWhatsapp,
  FaWeightHanging,
  FaDna,
  FaTag,
  FaTruck,
  FaBalanceScale,
  FaHistory,
  FaSeedling,
  FaFileInvoiceDollar,
  FaCheck,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaVideo,
  FaSpinner
} from 'react-icons/fa'
import api from '../services/api'
import '../css/Checkout.css'
import { cartStorage } from '../utils/cartStorage'
import { animalsService } from '../services/animalsService'
import { useCart } from '../contexts/cartContextCore'
import ButcherModal from '../components/ButcherModal'
import AnimalCareModal from '../components/AnimalCareModal'
import { buildMediaUrl, isAbsoluteUrl } from '../utils/mediaUrl'
import { WHATSAPP_NUMBER } from '../constants/contact'
import { formatPrice } from '../utils/priceUtils'

// ── Config ──
const DELIVERY_CHARGE = 0
const PURCHASE_STATE_KEY = 'postPurchaseConfirmationState'

const normalize = (v) => String(v || '').trim().toLowerCase()

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return (
    /^03\d{9}$/.test(cleaned) || 
    /^92\d{10}$/.test(cleaned) || 
    /^\+92\d{10}$/.test(phone.trim())
  )
}

const isMultiQuantityItem = (item) => {
  const mode = normalize(item?.purchaseMode)
  if (mode === 'multi') return true
  const type = normalize(item?.itemType)
  return type === 'meat'
}

const normalizeOrderItem = (item) => {
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

// ── Trust boosters ──
const trustBoosters = [
  { icon: <FaBalanceScale />, title: 'Honest Weight', desc: 'Wazan ki 100% guarantee' },
  { icon: <FaHistory />, title: '30+ Years Legacy', desc: 'Trusted since 1994' },
  { icon: <FaSeedling />, title: 'Farm Raised', desc: 'Organic feed, healthy janwar' },
  { icon: <FaFileInvoiceDollar />, title: 'Transparent Pricing', desc: 'No hidden charges ever' }
]

// ── Helper: Parse price to number ──
const priceToNumber = (price) => {
  if (!price) return 0
  if (typeof price === 'number') return price
  return parseInt(String(price).replace(/[^\d]/g, ''), 10) || 0
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Checkout Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, loading: cartLoading, clearCart, updateCart, selectedButcher, setSelectedButcher } = useCart()

  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isButcherModalOpen, setIsButcherModalOpen] = useState(false)
  const [hasShownButcherModal, setHasShownButcherModal] = useState(false)
  const [isAnimalCareModalOpen, setIsAnimalCareModalOpen] = useState(false)
  const [hasShownAnimalCareModal, setHasShownAnimalCareModal] = useState(false)
  const [animalCareSelected, setAnimalCareSelected] = useState(false)

  // ── Refs ──
  const checkingRef = useRef(false)
  const orderItemsRef = useRef([])
  const lastCheckRef = useRef(0)
  const fullNameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)
  const cityRef = useRef(null)
  const addressRef = useRef(null)

  const [expandedSection, setExpandedSection] = useState({
    review: true,
    customer: true,
    delivery: true
  })

  // Sync ref with state
  useEffect(() => {
    orderItemsRef.current = orderItems
  }, [orderItems])

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    altPhone: '',
    email: '',
    city: '',
    address: '',
    landmark: '',
    instructions: ''
  })
  const [confirmations, setConfirmations] = useState({
    weightCheck: false,
    termsAgree: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false)
  const [notices, setNotices] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Current flow: Open AnimalCareModal instead of ButcherModal
    if (!loading && orderItems.length > 0 && !hasShownAnimalCareModal) {
      setIsAnimalCareModalOpen(true)
      setHasShownAnimalCareModal(true)
    }
    /* Original ButcherModal trigger logic preserved:
    if (!loading && orderItems.length > 0 && !hasShownButcherModal && !selectedButcher) {
      setIsButcherModalOpen(true)
      setHasShownButcherModal(true)
    }
    */
  }, [loading, orderItems.length, hasShownAnimalCareModal])

  // ════════════════════════════════════════════
  // Load order items from Cart page or localStorage
  // ════════════════════════════════════════════

  useEffect(() => {
    if (cartLoading) return;

    let items = []
    if (location.state?.cart && location.state.cart.length > 0) {
      items = location.state.cart
      // Clear state after reading to prevent issues on refresh
      window.history.replaceState({}, document.title)
    } else {
      items = cart
    }

    if (items.length === 0) {
      navigate('/cart', {
        replace: true,
        state: {
          notice: 'Your cart is empty. Add animals from the shop, then open checkout again.'
        }
      })
      return
    }

    const normalized = (Array.isArray(items) ? items : []).map(normalizeOrderItem)
    setOrderItems(normalized)
    setLoading(false)
  }, [location.state, cart, cartLoading, navigate])

  useEffect(() => {
    let cancelled = false
    if (!loading && orderItems.length === 0 && !cancelled) {
      navigate('/unavailable-item', { replace: true })
    }
    return () => {
      cancelled = true
    }
  }, [loading, orderItems, navigate])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ════════════════════════════════════════════
  // Calculations (Memoized)
  // ════════════════════════════════════════════

  const subtotal = useMemo(() => 
    orderItems.reduce(
      (sum, item) => sum + priceToNumber(item.price) * getEffectiveQuantity(item),
      0
    ), [orderItems]
  )

  const totalItems = useMemo(() => 
    orderItems.reduce(
      (sum, item) => sum + getEffectiveQuantity(item),
      0
    ), [orderItems]
  )

  const delivery = useMemo(() => (orderItems.length > 0 ? DELIVERY_CHARGE : 0), [orderItems.length])
  const grandTotal = useMemo(() => subtotal + delivery, [subtotal, delivery])

  const allConfirmed = confirmations.weightCheck && confirmations.termsAgree
  const isFormValid = useMemo(() => 
    formData.fullName &&
    validatePhone(formData.phone) &&
    validateEmail(formData.email) &&
    formData.city &&
    formData.address,
    [formData]
  )

  // ════════════════════════════════════════════
  // Validation Logic
  // ════════════════════════════════════════════

  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required'
        break
      case 'phone':
        if (!value.trim()) error = 'Phone number is required'
        else if (!validatePhone(value)) error = 'Enter a valid phone number (e.g., 03XXXXXXXXX)'
        break
      case 'altPhone':
        if (value.trim() && !validatePhone(value)) error = 'Enter a valid alternative phone number'
        break
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!validateEmail(value)) error = 'Enter a valid email address (e.g., example@gmail.com)'
        break
      case 'city':
        if (!value.trim()) error = 'City is required'
        break
      case 'address':
        if (!value.trim()) error = 'Full address is required'
        break
      default:
        break
    }
    return error
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ════════════════════════════════════════════
  // Handlers
  // ════════════════════════════════════════════

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Real-time validation
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }))
  }

  const handleConfirmationChange = (key) => {
    setConfirmations((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleSection = (key) => {
    setExpandedSection((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const createOrderPayload = (paymentMethod) => {
    const currentItems = orderItemsRef.current
    return {
      customerName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      items: currentItems.map((item) => ({
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
      deliveryAddress: formData.address,
      city: formData.city,
      deliveryCharge: 0,
      paymentMethod: paymentMethod || 'cod',
      orderSource: 'checkout',
      notes: formData.instructions || '',
      butcher: selectedButcher?._id || null
    }
  }

  const buildWhatsAppOrder = (orderId) => {
    const currentItems = orderItemsRef.current
    let msg = `Assalam o Alaikum!%0A%0A✅ *ORDER CONFIRMATION — Farm2Meat*%0A%0A`
    if (orderId) {
      msg += `*Order ID: ${orderId}*%0A`
    }
    msg += `━━━━━━━━━━━━━━━%0A`

    currentItems.forEach((item, i) => {
      const qty = getEffectiveQuantity(item)
      const itemTotal = priceToNumber(item.price) * qty

      msg += `${i + 1}. *${item.name}*%0A`
      msg += `   Breed: ${item.breed || 'N/A'}`
      if (item.weight) msg += ` | Weight (Zinda): ${item.weight}`
      msg += `%0A`
      msg += `   Price: Rs ${formatPrice(item.price)} x ${qty}%0A`
      msg += `   Subtotal: Rs ${formatPrice(itemTotal)}%0A%0A`
    })

    msg += `━━━━━━━━━━━━━━━%0A`
    msg += `Total Items: ${totalItems}%0A`
    msg += `Product Total: Rs ${formatPrice(subtotal)}%0A`
    msg += `Delivery: Free%0A`
    msg += `*Grand Total: Rs ${formatPrice(grandTotal)}*%0A`
    msg += `Payment: Cash On Delivery%0A%0A`

    msg += `👤 *Customer Details*%0A`
    msg += `Name: ${formData.fullName}%0A`
    msg += `Phone: ${formData.phone}%0A`
    if (formData.altPhone) msg += `Alt Phone: ${formData.altPhone}%0A`
    msg += `Email: ${formData.email}%0A`
    msg += `City: ${formData.city}%0A`
    msg += `Address: ${formData.address}%0A`
    if (formData.landmark) msg += `Landmark: ${formData.landmark}%0A`
    if (formData.instructions) msg += `Instructions: ${formData.instructions}%0A`

    if (selectedButcher) {
      msg += `%0A*Butcher Service*%0A`
      msg += `Selected Butcher: ${selectedButcher.name}%0A`
      msg += `Location: ${selectedButcher.location || 'Rahim Yar Khan'}%0A`
    }

    return msg
  }

  const focusFirstInvalid = () => {
    const errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0]
      switch (firstField) {
        case 'fullName': fullNameRef.current?.focus(); break;
        case 'phone': phoneRef.current?.focus(); break;
        case 'email': emailRef.current?.focus(); break;
        case 'city': cityRef.current?.focus(); break;
        case 'address': addressRef.current?.focus(); break;
        default: break;
      }
      return true
    }
    return false
  }

  const handlePlaceOrder = async () => {
    if (isSubmitting) return
    if (!validateForm()) {
      focusFirstInvalid()
      return
    }
    if (!allConfirmed) return
    
    // Final check before placement
    setIsSubmitting(true)
    const itemsChanged = await pruneUnavailable(orderItemsRef.current)
    if (itemsChanged) {
      setIsSubmitting(false)
      return // Re-render will show new notices or redirect
    }

    setNotices([])

    try {
      const response = await api.post('/api/inquiries/bulk', createOrderPayload('cod'))

      const data = response.data
      
      // Axios throws for non-2xx status codes, so 409 will be handled in catch
      // The backend returns { success: true, data: { orderId: '...' } }
      const orderIdFromApi = String(data?.data?.orderId || data?.orderId || '').trim()

      clearCart()
      setSelectedButcher(null)

      const confirmationState = {
        fromPurchase: true,
        orderId: orderIdFromApi,
        grandTotal,
        totalItems,
        subtotal,
        animalCareSelected,
        customerName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        email: formData.email,
        paymentMethod: 'Cash On Delivery',
        items: orderItemsRef.current.map((item) => ({
          _id: item._id || item.id,
          name: item.name,
          tagId: item.tagId || item._id || '',
          breed: item.breed || '',
          weight: item.weight || '',
          price: item.price,
          quantity: getEffectiveQuantity(item),
          image: getThumbnail(item)
        })),
        butcher: selectedButcher ? {
          id: selectedButcher._id,
          name: selectedButcher.name,
          phone: selectedButcher.phone || 'Contact support',
          specialty: selectedButcher.specialty || selectedButcher.experience || 'Professional Butcher'
        } : null,
        timestamp: new Date().toISOString()
      }

      try {
        sessionStorage.setItem(PURCHASE_STATE_KEY, JSON.stringify(confirmationState))
        if (orderIdFromApi) {
          sessionStorage.removeItem(`postPurchaseReviewDismissed:${orderIdFromApi}`)
        }
      } catch (e) {
        void e
      }

      navigate('/confirmation', {
        replace: true,
        state: confirmationState
      })
    } catch (err) {
      console.error('Error saving inquiries:', err)

      if (err.response && err.response.status === 409) {
        navigate('/unavailable-item', { 
          replace: true,
          state: { message: 'Some items were just sold. Please review your cart again.' }
        })
        return
      }

      const message = err.response?.data?.message || err.response?.data?.error || 'Order could not be placed. Please try again.'
      setNotices([{ type: 'warning', text: message }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppOrder = async () => {
    if (isSubmitting) return
    if (!validateForm()) {
      focusFirstInvalid()
      return
    }
    if (!allConfirmed) return

    // Final check before placement
    setIsSubmitting(true)
    const itemsChanged = await pruneUnavailable(orderItemsRef.current)
    if (itemsChanged) {
      setIsSubmitting(false)
      return
    }

    setNotices([])

    try {
      // First, create the inquiry in our database (without redirecting)
      const response = await api.post('/api/inquiries/bulk', createOrderPayload('whatsapp'))

      const data = response.data
      const orderIdFromApi = String(data?.data?.orderId || data?.orderId || '').trim()

      const orderText = buildWhatsAppOrder(orderIdFromApi)
      const encodedMsg = encodeURIComponent(orderText)
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`
      
      const newWin = window.open(waUrl, '_blank')
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        alert('Please allow popups to complete your WhatsApp order redirection.')
      }

      // Clear cart and redirect to success/confirmation page
      clearCart()
      setSelectedButcher(null)

      const confirmationState = {
        fromPurchase: true,
        orderId: orderIdFromApi,
        grandTotal,
        totalItems,
        subtotal,
        animalCareSelected,
        customerName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        email: formData.email,
        paymentMethod: 'WhatsApp Inquiry',
        items: orderItemsRef.current.map((item) => ({
          _id: item._id || item.id,
          name: item.name,
          tagId: item.tagId || item._id || '',
          breed: item.breed || '',
          weight: item.weight || '',
          price: item.price,
          quantity: getEffectiveQuantity(item),
          image: getThumbnail(item)
        })),
        butcher: selectedButcher ? {
          id: selectedButcher._id,
          name: selectedButcher.name,
          phone: selectedButcher.phone || 'Contact support',
          specialty: selectedButcher.specialty || selectedButcher.experience || 'Professional Butcher'
        } : null,
        timestamp: new Date().toISOString()
      }

      try {
        sessionStorage.setItem(PURCHASE_STATE_KEY, JSON.stringify(confirmationState))
      } catch (e) {
        void e
      }

      navigate('/confirmation', {
        replace: true,
        state: confirmationState
      })
    } catch (err) {
      console.error('Error saving WhatsApp inquiry:', err)
      if (err.response && err.response.status === 409) {
        navigate('/unavailable-item', { 
          replace: true,
          state: { message: 'Some items were just sold. Please review your cart again.' }
        })
        return
      }
      const message = err.response?.data?.message || err.response?.data?.error || 'Could not initiate WhatsApp order. Please try again.'
      setNotices([{ type: 'warning', text: message }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const pruneUnavailable = useCallback(
    async (items) => {
      if (checkingRef.current) return false
      
      const now = Date.now()
      if (now - lastCheckRef.current < 15000) return false // Debounce
      lastCheckRef.current = now

      checkingRef.current = true

      // Safety timeout to prevent permanent lock if API fails
      const safetyTimeout = setTimeout(() => {
        checkingRef.current = false
      }, 8000)
      
      const ids = (items || [])
        .filter((it) => !isMultiQuantityItem(it))
        .map((it) => String(it._id || it.id || '').trim())
        .filter(Boolean)
      if (ids.length === 0) {
        clearTimeout(safetyTimeout)
        checkingRef.current = false
        return false
      }

      try {
        setCheckingAvailability(true)
        const result = await animalsService.checkAvailability({ ids })
        const unavailable = Array.isArray(result?.unavailable) ? result.unavailable : []
        
        if (unavailable.length === 0) {
          clearTimeout(safetyTimeout)
          checkingRef.current = false
          setCheckingAvailability(false)
          return false
        }

        const setIds = new Set(unavailable)
        const removed = (items || []).filter((it) => setIds.has(String(it._id || it.id)))
        
        if (removed.length > 0) {
          const kept = (items || [])
            .filter((it) => !setIds.has(String(it._id || it.id)))
            .map(normalizeOrderItem)

          const names = removed.map((it) => it.name).filter(Boolean)
          let message = ''

          if (names.length === 1) {
            message = `“${names[0]}” has already been purchased by another customer.`
          } else if (names.length <= 3) {
            message = `Some items are no longer available: ${names.join(', ')}`
          } else {
            message = `Few of your selected items are no longer available (already purchased by another customer).`
          }

          setNotices((prev) => [
            { type: 'warning', text: message },
            ...prev
          ].slice(0, 3))

          // 🔥 If ALL items gone → redirect 
          if (kept.length === 0) {
            navigate('/unavailable-item', { 
              replace: true,
              state: { message: 'All items in your cart have just been purchased by others.' }
            })
            return true // Signifies redirection or all items gone
          }

          // ✅ Otherwise update remaining items 
          await updateCart(kept)
          setOrderItems(kept)
          return true // Signifies some items removed
        }
        return false
      } catch (e) {
        void e
        return false
      } finally {
        clearTimeout(safetyTimeout)
        setCheckingAvailability(false)
        checkingRef.current = false
      }
    },
    [updateCart, navigate]
  )

  useEffect(() => {
    if (loading || isSubmitting || hasCheckedOnce) return
    
    // Initial check
    pruneUnavailable(orderItemsRef.current)
    setHasCheckedOnce(true)
    
    const onFocus = () => {
      if (!isSubmitting && !checkingRef.current && document.visibilityState === 'visible') {
        pruneUnavailable(orderItemsRef.current)
      }
    }
    
    window.addEventListener('focus', onFocus)
    
    // Increased interval to 60s to reduce flickering/load
    const interval = setInterval(() => {
      if (!isSubmitting && !checkingRef.current && document.visibilityState === 'visible') {
        pruneUnavailable(orderItemsRef.current)
      }
    }, 60000)
    
    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
  }, [loading, pruneUnavailable, isSubmitting, hasCheckedOnce])

  useEffect(() => {
    const interval = setInterval(() => {
      const loaded = cartStorage.load()
      if (loaded.expired) {
        clearCart()
        setOrderItems([])
        setNotices([{ type: 'warning', text: 'Your cart expired and was cleared.' }])
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [clearCart])

  // ════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════
  if (loading) {
    return (
      <div className="checkout-page checkout-page--visible">
        <div className="co-loading-state">
          <FaSpinner className="co-loading-spinner" />
          <p>Loading your order...</p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // EMPTY STATE
  // ════════════════════════════════════════════
  if (!loading && orderItems.length === 0) {
    return (
      <div className="checkout-page checkout-page--visible">
        <div className="co-loading-state">
          <FaSpinner className="co-loading-spinner" />
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // MAIN CHECKOUT FORM
  // ════════════════════════════════════════════
  return (
    <div className={`checkout-page ${isVisible ? 'checkout-page--visible' : ''}`}>
      {/* Inline Checking Indicator */}
      {checkingAvailability && (
        <div className="co-availability-indicator">
          <FaSpinner className="co-spin" />
          <span>Verifying latest availability...</span>
        </div>
      )}

      {/* ══════════ HEADER ══════════ */}
      <section className="co-header">
        <div className="co-header-bg">
          <div className="co-header-circle co-header-circle--1"></div>
          <div className="co-header-circle co-header-circle--2"></div>
          <div className="co-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="co-header-content">
                <div className="co-header-top-nav">
                  <button className="co-back-link" onClick={() => navigate('/cart')}>
                    <FaArrowLeft />
                    <span>Back to Cart</span>
                  </button>
                </div>
                <div className="co-header-main">
                  <div className="co-header-lock">
                    <FaLock className="co-header-lock-icon" />
                  </div>
                  <div className="co-header-titles">
                    <h1 className="co-header-title">Secure Checkout</h1>
                    <div className="co-free-delivery-badge">
                      <FaTruck />
                      <span>Free Home Delivery Available</span>
                    </div>
                  </div>
                </div>
                <div className="co-header-steps">
                  <div className="co-step co-step--done">
                    <span className="co-step-num">1</span>
                    <span className="co-step-label">Cart</span>
                  </div>
                  <div className="co-step-line co-step-line--done"></div>
                  <div className="co-step co-step--active">
                    <span className="co-step-num">2</span>
                    <span className="co-step-label">Checkout</span>
                  </div>
                  <div className="co-step-line"></div>
                  <div className="co-step">
                    <span className="co-step-num">3</span>
                    <span className="co-step-label">Confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notices.length > 0 && (
        <div className="co-notice-stack">
          {notices.map((n, idx) => (
            <div key={idx} className={`co-notice co-notice--${n.type || 'info'}`}>
              <FaShieldAlt className="co-notice-icon" />
              <span>{n.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section className="co-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="co-layout">

                {/* ═══════ LEFT COLUMN ═══════ */}
                <div className="co-form-col">

                  {/* ──── ORDER REVIEW ──── */}
                  <div className="co-section-card">
                    <button
                      className="co-section-toggle"
                      onClick={() => toggleSection('review')}
                    >
                      <div className="co-section-toggle-left">
                        <span className="co-section-number">1</span>
                        <h2 className="co-section-heading">
                          Order Review ({totalItems} item{totalItems > 1 ? 's' : ''})
                        </h2>
                      </div>
                      {expandedSection.review ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <div className={`co-section-body ${expandedSection.review ? 'co-section-body--open' : ''}`}>
                      <div className="co-review-list">
                        {orderItems.map((item) => {
                          const qty = getEffectiveQuantity(item)
                          const itemTotal = priceToNumber(item.price) * qty

                          return (
                            <div key={item._id || item.id} className="co-review-item">
                              <div className="co-review-img-wrap">
                                <img
                                  src={getThumbnail(item)}
                                  alt={item.name}
                                  className="co-review-img"
                                  onError={(e) => { 
                                    e.target.onerror = null
                                    e.target.src = '/placeholder.jpg' 
                                  }}
                                />
                                {qty > 1 && (
                                  <span className="co-review-qty-badge">x{qty}</span>
                                )}
                              </div>
                              <div className="co-review-details">
                                <h3 className="co-review-name">{item.name}</h3>
                                <div className="co-review-meta">
                                  {item.breed && (
                                    <span className="co-review-tag">
                                      <FaDna className="co-review-tag-icon" />
                                      {item.breed}
                                    </span>
                                  )}
                                  {item.weight && (
                                    <span className="co-review-tag">
                                      <FaWeightHanging className="co-review-tag-icon" />
                                      {item.weight}
                                    </span>
                                  )}
                                  {item.age && (
                                    <span className="co-review-tag">
                                      <FaCalendarAlt className="co-review-tag-icon" />
                                      {item.age}
                                    </span>
                                  )}
                                </div>
                                <div className="co-review-price-row">
                                  <span className="co-review-price-label">
                                    <FaTag className="co-review-price-icon" />
                                    {qty > 1
                                      ? `${formatPrice(item.price)} x ${qty}`
                                      : 'Price'}
                                  </span>
                                  <span className="co-review-price">
                                    {formatPrice(itemTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="co-review-note">
                        <FaVideo className="co-review-note-icon" />
                        <span>
                          Live video verification available on WhatsApp before delivery.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ──── CUSTOMER INFO ──── */}
                  <div className="co-section-card">
                    <button
                      className="co-section-toggle"
                      onClick={() => toggleSection('customer')}
                    >
                      <div className="co-section-toggle-left">
                        <span className="co-section-number">2</span>
                        <h2 className="co-section-heading">Customer Information</h2>
                      </div>
                      {expandedSection.customer ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <div className={`co-section-body ${expandedSection.customer ? 'co-section-body--open' : ''}`}>
                      <div className="co-form-grid">
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-fullName">
                            <FaUser className="co-label-icon" />
                            Full Name <span className="co-required">*</span>
                          </label>
                          <input
                            type="text"
                            id="co-fullName"
                            name="fullName"
                            className="co-input"
                            placeholder="Apna poora naam"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-phone">
                            <FaPhone className="co-label-icon" />
                            Phone Number <span className="co-required">*</span>
                          </label>
                          <input
                            type="tel"
                            id="co-phone"
                            name="phone"
                            className="co-input"
                            placeholder="03XX-XXXXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-altPhone">
                            <FaPhoneAlt className="co-label-icon" />
                            Alternate Phone
                          </label>
                          <input
                            type="tel"
                            id="co-altPhone"
                            name="altPhone"
                            className="co-input"
                            placeholder="Optional"
                            value={formData.altPhone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-email">
                            <FaEnvelope className="co-label-icon" />
                            Email <span className="co-required">*</span>
                          </label>
                          <input
                            type="email"
                            id="co-email"
                            name="email"
                            className="co-input"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ──── DELIVERY INFO ──── */}
                  <div className="co-section-card">
                    <button
                      className="co-section-toggle"
                      onClick={() => toggleSection('delivery')}
                    >
                      <div className="co-section-toggle-left">
                        <span className="co-section-number">3</span>
                        <h2 className="co-section-heading">Delivery Information</h2>
                      </div>
                      {expandedSection.delivery ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <div className={`co-section-body ${expandedSection.delivery ? 'co-section-body--open' : ''}`}>
                      <div className="co-form-grid">
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-city">
                            <FaCity className="co-label-icon" />
                            City <span className="co-required">*</span>
                          </label>
                          <input
                            type="text"
                            id="co-city"
                            name="city"
                            className="co-input"
                            placeholder="e.g., Rahim Yar Khan"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-landmark">
                            <FaMapMarkerAlt className="co-label-icon" />
                            Nearest Landmark
                          </label>
                          <input
                            type="text"
                            id="co-landmark"
                            name="landmark"
                            className="co-input"
                            placeholder="e.g., Near Cattle Market"
                            value={formData.landmark}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="co-form-group co-form-group--full">
                        <label className="co-label" htmlFor="co-address">
                          <FaHome className="co-label-icon" />
                          Full Address <span className="co-required">*</span>
                        </label>
                        <input
                          type="text"
                          id="co-address"
                          name="address"
                          className="co-input"
                          placeholder="Mohalla, Street, House No."
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="co-form-grid">
                        <div className="co-form-group">
                          <label className="co-label" htmlFor="co-instructions">
                            <FaStickyNote className="co-label-icon" />
                            Special Instructions
                          </label>
                          <input
                            type="text"
                            id="co-instructions"
                            name="instructions"
                            className="co-input"
                            placeholder="Any special request"
                            value={formData.instructions}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="co-delivery-note">
                        <FaInfoCircle className="co-delivery-note-icon" />
                        <span>
                          Free delivery within RYK district. Our team will coordinate delivery time on call/WhatsApp.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ──── CONFIRMATION CHECKBOXES ──── */}
                  <div className="co-confirm-section">
                    <label className="co-checkbox-label">
                      <input
                        type="checkbox"
                        className="co-checkbox-input"
                        checked={confirmations.weightCheck}
                        onChange={() => handleConfirmationChange('weightCheck')}
                      />
                      <span className={`co-checkbox-custom ${confirmations.weightCheck ? 'co-checkbox-custom--checked' : ''}`}>
                        {confirmations.weightCheck && <FaCheck />}
                      </span>
                      <span className="co-checkbox-text">
                        I confirm that I have checked the <strong>weight, breed, and all details</strong> of my selected livestock.
                      </span>
                    </label>
                    <label className="co-checkbox-label">
                      <input
                        type="checkbox"
                        className="co-checkbox-input"
                        checked={confirmations.termsAgree}
                        onChange={() => handleConfirmationChange('termsAgree')}
                      />
                      <span className={`co-checkbox-custom ${confirmations.termsAgree ? 'co-checkbox-custom--checked' : ''}`}>
                        {confirmations.termsAgree && <FaCheck />}
                      </span>
                      <span className="co-checkbox-text">
                        I agree to the{' '}
                        <a href="/terms" className="co-terms-link">Terms & Conditions</a>{' '}
                        and{' '}
                        <a href="/privacy-policy" className="co-terms-link">Privacy Policy</a>.
                      </span>
                    </label>
                  </div>
                </div>

                {/* ═══════ RIGHT COLUMN — ORDER SUMMARY ═══════ */}
                <div className="co-summary-col">
                  <div className="co-summary-card">
                    <div className="co-summary-header">
                      <h3 className="co-summary-title">
                        <FaFileInvoiceDollar className="co-summary-title-icon" />
                        Order Summary
                      </h3>
                    </div>

                    <div className="co-summary-items">
                      {orderItems.map((item) => {
                        const qty = getEffectiveQuantity(item)
                        const itemTotal = priceToNumber(item.price) * qty

                        return (
                          <div key={item._id || item.id} className="co-summary-item">
                            <div className="co-summary-item-left">
                              <span className="co-summary-item-name">{item.name}</span>
                              <span className="co-summary-item-detail">
                                {item.breed || ''}
                                {item.breed && item.weight ? ' · ' : ''}
                                {item.weight || ''}
                                {qty > 1 ? ` · x${qty}` : ''}
                              </span>
                            </div>
                            <span className="co-summary-item-price">
                              Rs {formatPrice(itemTotal)}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="co-summary-divider"></div>

                    <div className="co-summary-row">
                      <span>Product Total ({totalItems} items)</span>
                      <span>Rs {formatPrice(subtotal)}</span>
                    </div>
                    <div className="co-summary-row">
                      <span className="co-summary-row-label">
                        <FaTruck className="co-summary-row-icon" /> Delivery
                      </span>
                      <span className="co-summary-value--free">Free</span>
                    </div>

                    <div className="co-summary-divider co-summary-divider--total"></div>

                    <div className="co-summary-row co-summary-row--total">
                      <span>Grand Total</span>
                      <span>Rs {formatPrice(grandTotal)}</span>
                    </div>

                    {/* COD Badge */}
                    <div className="co-summary-payment-badge">
                      <FaMoneyBillWave />
                      <span>Cash On Delivery</span>
                    </div>

                    {/* CTA Buttons */}
                    <div className="co-summary-cta">
                      <button
                        className={`co-btn co-btn--confirm ${!allConfirmed || !isFormValid ? 'co-btn--disabled' : ''}`}
                        onClick={handlePlaceOrder}
                        disabled={!allConfirmed || !isFormValid || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="co-spinner"></span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="co-btn-icon" />
                            <span>Place Order</span>
                          </>
                        )}
                      </button>

                      <button
                        className="co-btn co-btn--whatsapp"
                        onClick={handleWhatsAppOrder}
                        disabled={!allConfirmed || !isFormValid || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="co-spinner"></span>
                            <span>Opening WhatsApp...</span>
                          </>
                        ) : (
                          <>
                            <FaWhatsapp className="co-btn-icon" />
                            <span>Place via WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Validation Hint */}
                    {(!allConfirmed || !isFormValid) && (
                      <div className="co-summary-hint">
                        <FaInfoCircle className="co-summary-hint-icon" />
                        <span>
                          {!isFormValid
                            ? 'Please fill all required fields.'
                            : 'Please check both confirmation boxes.'}
                        </span>
                      </div>
                    )}

                    {/* Security Note */}
                    <div className="co-summary-security">
                      <FaLock className="co-summary-security-icon" />
                      <span>
                        Your data is securely transmitted and protected. No information is shared with third parties.
                      </span>
                    </div>
                  </div>

                  {/* ── Trust Boosters ── */}
                  <div className="co-trust-section">
                    <h4 className="co-trust-title">Guaranteed Quality</h4>
                    <div className="co-trust-grid">
                      {trustBoosters.map((item, idx) => (
                        <div key={idx} className="co-trust-item">
                          <div className="co-trust-icon">{item.icon}</div>
                          <div className="co-trust-info">
                            <strong>{item.title}</strong>
                            <span>{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MOBILE STICKY BAR ══════════ */}
      <div className="co-sticky-bar">
        <div className="co-sticky-info">
          <span className="co-sticky-label">Grand Total</span>
          <span className="co-sticky-value">{formatPrice(grandTotal)}</span>
        </div>
        <button
          className="co-sticky-btn"
          onClick={handlePlaceOrder}
          disabled={!allConfirmed || !isFormValid || isSubmitting}
        >
          <FaCheckCircle className="co-sticky-btn-icon" />
          <span>Confirm</span>
        </button>
      </div>

      {/* Butcher Modal disabled for now, replaced by AnimalCareModal */}
      {false && (
        <ButcherModal 
          isOpen={isButcherModalOpen} 
          onClose={() => setIsButcherModalOpen(false)} 
        />
      )}

      <AnimalCareModal
        isOpen={isAnimalCareModalOpen}
        onClose={() => {
          setIsAnimalCareModalOpen(false);
          setAnimalCareSelected(false);
        }}
        onProceed={() => {
          setIsAnimalCareModalOpen(false);
          setAnimalCareSelected(true);
        }}
        animalName={orderItems.length > 0 ? orderItems[0].name : "your animal"}
      />
    </div>
  )
}

export default Checkout
