import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaShareAlt,
  FaWhatsapp,
  FaShoppingCart,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaDna,
  FaClock,
  FaSyringe,
  FaHeartbeat,
  FaTruck,
  FaVideo,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaTimes,
  FaHistory,
  FaBalanceScale,
  FaTag,
  FaCertificate,
  FaInfoCircle,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaExclamationTriangle,
  FaPalette,
  FaMars,
  FaVenus,
  FaHandshake,
  FaBoxOpen
} from 'react-icons/fa'
import '../css/ProductDetail.css'
import CustomerReviewSection from '../components/CustomerReviewSection'
import { useCart } from '../contexts/cartContextCore'

import api from '../services/api'

// ── Config ──
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const WHATSAPP_NUMBER = '923089880479'

// ── Trust elements — matches Cart page format ──
const trustElements = [
  { icon: <FaBalanceScale />, title: 'Honest Weight', desc: 'Guaranteed accurate weight' },
  { icon: <FaShieldAlt />, title: 'No Hidden Charges', desc: 'Price is what you see' },
  { icon: <FaHistory />, title: '30+ Years Legacy', desc: 'Trusted since 1994' },
  { icon: <FaVideo />, title: 'Live Video', desc: 'Available on request' },
  { icon: <FaTruck />, title: 'Free Delivery', desc: 'Within RYK city' },
  { icon: <FaMoneyBillWave />, title: 'Cash on Delivery', desc: 'Pay when you receive' }
]

// ── Helper: Format price ──
const formatPrice = (price) => {
  if (!price) return '0'
  if (typeof price === 'string' && price.includes(',')) return price
  const num = typeof price === 'string' ? parseInt(price.replace(/,/g, ''), 10) : price
  if (isNaN(num)) return price
  return num.toLocaleString('en-PK')
}

// ── Helper: Parse price to number ──
const priceToNumber = (price) => {
  if (!price) return 0
  if (typeof price === 'number') return price
  return parseInt(price.replace(/,/g, ''), 10) || 0
}

// ── Helper: Build image URLs ──
const buildImageUrls = (animal) => {
  const urls = []
  if (animal.images && animal.images.length > 0) {
    animal.images.forEach((img) => {
      if (img.startsWith('http://') || img.startsWith('https://')) {
        urls.push(img)
      } else {
        const path = img.startsWith('/uploads') ? img : `/${img}`
        urls.push(`${API_URL}${path}`)
      }
    })
  } else if (animal.imageUrl) {
    const img = animal.imageUrl
    if (img.startsWith('http://') || img.startsWith('https://')) {
      urls.push(img)
    } else {
      const path = img.startsWith('/uploads') ? img : `/${img}`
      urls.push(`${API_URL}${path}`)
    }
  }
  if (urls.length === 0) urls.push('/placeholder.jpg')
  return urls
}

// ── Helper: Build video URLs ──
const buildVideoUrls = (animal) => {
  if (!animal.videos || animal.videos.length === 0) return []
  return animal.videos.map((vid) => {
    if (vid.startsWith('http://') || vid.startsWith('https://')) {
      return vid
    }
    const path = vid.startsWith('/uploads') ? vid : `/${vid}`
    return `${API_URL}${path}`
  })
}

// ── Helper: Build location string ──
const buildLocation = (animal) => {
  if (animal.farmLocation && animal.city) return `${animal.farmLocation}, ${animal.city}`
  if (animal.farmLocation) return animal.farmLocation
  if (animal.city) return animal.city
  if (animal.location) return animal.location
  return 'Rahim Yar Khan'
}

// ── Helper: Build details array ──
const buildDetails = (animal) => {
  const details = []
  if (animal.breed) details.push({ icon: <FaDna />, label: 'Breed', value: animal.breed })
  if (animal.age) details.push({ icon: <FaClock />, label: 'Age', value: animal.age })
  if (animal.weight) details.push({ icon: <FaWeightHanging />, label: 'Weight (Zinda)', value: animal.weight })
  if (animal.gender) {
    details.push({
      icon: animal.gender === 'male' ? <FaMars /> : <FaVenus />,
      label: 'Gender',
      value: animal.gender === 'male' ? 'Male (Nar)' : 'Female (Mada)'
    })
  }
  if (animal.healthStatus) {
    const healthLabels = { excellent: 'Excellent', good: 'Good', average: 'Average' }
    details.push({
      icon: <FaHeartbeat />,
      label: 'Health',
      value: healthLabels[animal.healthStatus] || animal.healthStatus
    })
  }
  if (animal.vaccinated !== undefined) {
    details.push({
      icon: <FaSyringe />,
      label: 'Vaccination',
      value: animal.vaccinated ? 'Fully Vaccinated' : 'Not Vaccinated'
    })
  }
  if (animal.color) details.push({ icon: <FaPalette />, label: 'Color', value: animal.color })
  if (animal.teeth) details.push({ icon: <FaInfoCircle />, label: 'Teeth', value: `${animal.teeth} Teeth` })
  const location = buildLocation(animal)
  if (location) details.push({ icon: <FaMapMarkerAlt />, label: 'Location', value: location })
  if (animal.category) {
    details.push({
      icon: <FaCertificate />,
      label: 'Category',
      value: animal.category.charAt(0).toUpperCase() + animal.category.slice(1)
    })
  }
  return details
}

// ── Helper: Build description ──
const buildDescription = (animal) => {
  if (animal.fullDescription) return animal.fullDescription
  if (animal.shortDescription) return animal.shortDescription
  const parts = []
  parts.push(`Premium quality ${animal.breed || ''} goat`)
  if (animal.farmLocation) parts.push(`raised at ${animal.farmLocation}`)
  if (animal.age) parts.push(`This animal is ${animal.age} old`)
  if (animal.weight) parts.push(`weighing approximately ${animal.weight}`)
  if (animal.healthStatus) parts.push(`with ${animal.healthStatus} health condition`)
  if (animal.vaccinated) parts.push('All vaccinations are up to date')
  return parts.join('. ') + '.'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const thumbnailRef = useRef(null)

  // ── Fetch animal data ──
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(`/api/animals/${id}`)
        const result = response.data
        if (result.success && result.data) {
          setProductData(result.data)
        } else {
          setError('Animal not found. It may have been removed.')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Cannot connect to server. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProduct()
  }, [id])

  useEffect(() => {
    if (productData) {
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }
  }, [productData])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // ════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════
  if (loading) {
    return (
      <div className="pdp-state">
        <div className="pdp-state-box">
          <FaSpinner className="pdp-state-spinner" />
          <h2 className="pdp-state-title">Loading Animal Details...</h2>
          <p className="pdp-state-text">Please wait while we fetch the information.</p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // ERROR STATE
  // ════════════════════════════════════════
  if (error || !productData) {
    return (
      <div className="pdp-state">
        <div className="pdp-state-box pdp-state-box--error">
          <div className="pdp-state-icon-wrap">
            <FaExclamationTriangle className="pdp-state-icon" />
          </div>
          <h2 className="pdp-state-title">{error || 'Animal Not Found'}</h2>
          <p className="pdp-state-text">
            The animal you're looking for might have been removed or doesn't exist.
          </p>
          <div className="pdp-state-actions">
            <button className="pdp-state-btn pdp-state-btn--primary" onClick={() => navigate('/shop')}>
              <FaArrowLeft />
              <span>Back to Shop</span>
            </button>
            <button className="pdp-state-btn pdp-state-btn--secondary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════
  // BUILD DYNAMIC DATA
  // ════════════════════════════════════════

  const images = buildImageUrls(productData)
  const videos = buildVideoUrls(productData)
  const details = buildDetails(productData)
  const description = buildDescription(productData)

  const currentPrice = priceToNumber(productData.price)
  const oldPrice = priceToNumber(productData.discountPrice || productData.oldPrice)
  const hasDiscount = oldPrice > 0 && oldPrice > currentPrice
  const discount = hasDiscount ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0
  const savings = hasDiscount ? oldPrice - currentPrice : 0

  const stockStatus = productData.status || 'available'
  const isAvailable = stockStatus === 'available' || stockStatus === 'new' || stockStatus === 'Available'
  const isSold = stockStatus === 'sold' || stockStatus === 'Sold'
  const isReserved = stockStatus === 'reserved' || stockStatus === 'Reserved'

  const sellerName = 'Farm2Meat Official'
  const sellerVerified = true

  // ════════════════════════════════════════
  // HANDLERS
  // ════════════════════════════════════════

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleWhatsApp = () => {
    const msg =
      productData.whatsappMsg ||
      `Assalam o Alaikum!\n\nI'm interested in *${productData.name}*\n\nBreed: ${productData.breed}\nWeight (Zinda): ${productData.weight}\nPrice: Rs ${formatPrice(productData.price)}\n\nPlease share more details and live video.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleAddToCart = () => {
    if (!productData) return
    addItem(productData)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const handleBuyNow = () => {
    if (!productData || !isAvailable) return
    addItem(productData)
    navigate('/cart', { state: { fromBuyNow: true } })
  }

  const handleShare = async () => {
    const shareData = {
      title: productData.name,
      text: `Check out ${productData.name} — Rs ${formatPrice(productData.price)}`,
      url: window.location.href
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.log('Share failed:', err)
    }
  }

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════

  return (
    <div className={`pdp ${isVisible ? 'pdp--visible' : ''}`}>

      {/* ── Lightbox ── */}
      {isLightboxOpen && (
        <div className="pdp-lightbox" onClick={() => setIsLightboxOpen(false)}>
          <button className="pdp-lightbox-close" onClick={() => setIsLightboxOpen(false)}>
            <FaTimes />
          </button>
          <button
            className="pdp-lightbox-nav pdp-lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); handlePrevImage() }}
          >
            <FaChevronLeft />
          </button>
          <img
            src={images[activeImage]}
            alt={productData.name}
            className="pdp-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="pdp-lightbox-nav pdp-lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); handleNextImage() }}
          >
            <FaChevronRight />
          </button>
          <div className="pdp-lightbox-counter">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HEADER SECTION
      ══════════════════════════════════════════ */}
      <section className="pdp-header-section">
        <div className="pdp-header-bg">
          <div className="pdp-header-circle pdp-header-circle--1"></div>
          <div className="pdp-header-circle pdp-header-circle--2"></div>
          <div className="pdp-header-pattern"></div>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="pdp-header-content">
                <button className="pdp-back-link" onClick={() => navigate('/shop')}>
                  <FaArrowLeft />
                  <span>Back to Shop</span>
                </button>
                <div className="pdp-header-main">
                  <div className="pdp-header-icon-wrap">
                    <FaBoxOpen className="pdp-header-icon" />
                  </div>
                  <div>
                    <h1 className="pdp-header-title">{productData.name}</h1>
                    <p className="pdp-header-sub">
                      {productData.breed && <span>{productData.breed}</span>}
                      {productData.breed && productData.weight && <span> · </span>}
                      {productData.weight && <span>{productData.weight}</span>}
                      {!productData.breed && !productData.weight && 'View complete details and order below.'}
                    </p>
                  </div>
                </div>

                {/* Breadcrumb inside header */}
                <div className="pdp-breadcrumb">
                  <button className="pdp-breadcrumb-link" onClick={() => navigate('/')}>Home</button>
                  <span className="pdp-breadcrumb-sep">/</span>
                  <button className="pdp-breadcrumb-link" onClick={() => navigate('/shop')}>Shop</button>
                  <span className="pdp-breadcrumb-sep">/</span>
                  <span className="pdp-breadcrumb-current">{productData.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN PRODUCT SECTION
      ══════════════════════════════════════════ */}
      <section className="pdp-main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="pdp-layout">

                {/* ═══════ LEFT — IMAGE GALLERY ═══════ */}
                <div className="pdp-gallery">

                  {/* Main Image */}
                  <div className="pdp-main-image-wrap">
                    <img
                      src={images[activeImage]}
                      alt={`${productData.name} — Image ${activeImage + 1}`}
                      className="pdp-main-image"
                      onClick={() => setIsLightboxOpen(true)}
                    />

                    {images.length > 1 && (
                      <>
                        <button className="pdp-gallery-nav pdp-gallery-nav--prev" onClick={handlePrevImage}>
                          <FaChevronLeft />
                        </button>
                        <button className="pdp-gallery-nav pdp-gallery-nav--next" onClick={handleNextImage}>
                          <FaChevronRight />
                        </button>
                      </>
                    )}

                    <div className="pdp-image-badges">
                      {discount > 0 && (
                        <span className="pdp-badge pdp-badge--discount">-{discount}% OFF</span>
                      )}
                      <span
                        className={`pdp-badge ${
                          isSold ? 'pdp-badge--sold' : isReserved ? 'pdp-badge--reserved' : 'pdp-badge--stock'
                        }`}
                      >
                        <span className="pdp-badge-dot"></span>
                        {isSold ? 'Sold' : isReserved ? 'Reserved' : 'Available'}
                      </span>
                    </div>

                    {(isSold || isReserved) && (
                      <div className="pdp-sold-overlay">
                        <span className="pdp-sold-stamp">{isSold ? 'SOLD' : 'RESERVED'}</span>
                      </div>
                    )}

                    {/* Image Actions — only Expand & Share (heart removed) */}
                    <div className="pdp-image-actions">
                      <button className="pdp-img-action-btn" onClick={() => setIsLightboxOpen(true)} aria-label="Expand image">
                        <FaExpand />
                      </button>
                      <button className="pdp-img-action-btn" onClick={handleShare} aria-label="Share">
                        <FaShareAlt />
                      </button>
                    </div>

                    {images.length > 1 && (
                      <div className="pdp-image-counter">{activeImage + 1} / {images.length}</div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="pdp-thumbnails" ref={thumbnailRef}>
                      {images.map((img, index) => (
                        <button
                          key={index}
                          className={`pdp-thumb ${activeImage === index ? 'pdp-thumb--active' : ''}`}
                          onClick={() => setActiveImage(index)}
                        >
                          <img src={img} alt={`Thumbnail ${index + 1}`} className="pdp-thumb-img" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Videos */}
                  {videos.length > 0 && (
                    <div className="pdp-videos-section">
                      <h4 className="pdp-videos-title"><FaVideo /> Videos ({videos.length})</h4>
                      <div className="pdp-videos-grid">
                        {videos.map((vid, index) => (
                          <video key={index} src={vid} className="pdp-video-player" controls preload="metadata" />
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="pdp-video-btn" onClick={handleWhatsApp}>
                    <FaVideo className="pdp-video-btn-icon" />
                    <span>Request Live Video on WhatsApp</span>
                  </button>

                  {/* Trust Section */}
                  <div className="pdp-trust-section">
                    <h4 className="pdp-trust-title">Why Trust Farm2Meat?</h4>
                    <div className="pdp-trust-grid">
                      {trustElements.map((item, index) => (
                        <div key={index} className="pdp-trust-item">
                          <div className="pdp-trust-icon">{item.icon}</div>
                          <div className="pdp-trust-content">
                            <strong>{item.title}</strong>
                            <span>{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ═══════ RIGHT — PRODUCT INFO ═══════ */}
                <div className="pdp-info">
                  <div className="pdp-info-card">

                    {/* Seller Badge */}
                    <div className="pdp-seller-row">
                      <div className="pdp-seller-badge">
                        {sellerVerified && <FaCheckCircle className="pdp-seller-verified-icon" />}
                        <span className="pdp-seller-name">{sellerName}</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h2 className="pdp-product-name">{productData.name}</h2>

                    {/* Breed Tag */}
                    {productData.breed && (
                      <div className="pdp-breed-tag">
                        <FaDna className="pdp-breed-tag-icon" />
                        <span>{productData.breed}</span>
                      </div>
                    )}

                    {/* Price Block */}
                    <div className="pdp-price-block">
                      <div className="pdp-price-main">
                        <span className="pdp-price-label">
                          <FaTag className="pdp-price-label-icon" />
                          Price
                        </span>
                        <div className="pdp-price-row">
                          <span className="pdp-price">Rs {formatPrice(productData.price)}</span>
                          {hasDiscount && (
                            <span className="pdp-old-price">Rs {formatPrice(oldPrice)}</span>
                          )}
                        </div>
                        {savings > 0 && (
                          <span className="pdp-discount-tag">
                            <FaCheckCircle className="pdp-discount-tag-icon" />
                            Save Rs {formatPrice(savings)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* COD Badge */}
                    <div className="pdp-cod-badge">
                      <FaCheckCircle className="pdp-cod-icon" />
                      <span>Cash on Delivery Available</span>
                    </div>

                    {/* Negotiable */}
                    {productData.negotiable && (
                      <div className="pdp-negotiable-badge">
                        <FaHandshake />
                        <span>Price is negotiable — contact seller</span>
                      </div>
                    )}

                    <div className="pdp-divider"></div>

                    {/* Description */}
                    <div className="pdp-description-section">
                      <h3 className="pdp-section-label">
                        <FaInfoCircle className="pdp-section-label-icon" />
                        Description
                      </h3>
                      <p className={`pdp-description ${showFullDesc ? 'pdp-description--full' : ''}`}>
                        {description}
                      </p>
                      {description.length > 150 && (
                        <button className="pdp-read-more" onClick={() => setShowFullDesc(!showFullDesc)}>
                          {showFullDesc ? <>Show Less <FaChevronUp /></> : <>Read More <FaChevronDown /></>}
                        </button>
                      )}
                    </div>

                    {/* Special Notes */}
                    {productData.specialNotes && (
                      <div className="pdp-special-notes">
                        <FaInfoCircle className="pdp-special-notes-icon" />
                        <div>
                          <strong>Special Notes</strong>
                          <p>{productData.specialNotes}</p>
                        </div>
                      </div>
                    )}

                    <div className="pdp-divider"></div>

                    {/* Key Details */}
                    {details.length > 0 && (
                      <div className="pdp-details-section">
                        <h3 className="pdp-section-label">
                          <FaClipboardList className="pdp-section-label-icon" />
                          Key Details
                        </h3>
                        <div className="pdp-details-grid">
                          {details.map((detail, index) => (
                            <div key={index} className="pdp-detail-item">
                              <div className="pdp-detail-icon">{detail.icon}</div>
                              <div className="pdp-detail-content">
                                <span className="pdp-detail-label">{detail.label}</span>
                                <span className="pdp-detail-value">{detail.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pdp-divider"></div>

                    {/* Delivery */}
                    <div className="pdp-delivery-card pdp-delivery-card--free">
                      <FaTruck className="pdp-delivery-icon" />
                      <div>
                        <strong>Free Home Delivery</strong>
                        <p>Enjoy free delivery to your doorstep. No hidden charges ever.</p>
                      </div>
                    </div>

                    {/* CTA BUTTONS */}
                    <div className="pdp-cta-group">
                      <button
                        className="pdp-cta pdp-cta--whatsapp"
                        onClick={handleWhatsApp}
                        disabled={isSold}
                      >
                        <FaWhatsapp className="pdp-cta-icon" />
                        <span>{isSold ? 'This animal is sold' : 'Contact via WhatsApp'}</span>
                      </button>

                      <div className="pdp-cta-row">
                        <button
                          className={`pdp-cta pdp-cta--cart ${addedToCart ? 'pdp-cta--cart-added' : ''}`}
                          onClick={handleAddToCart}
                          disabled={!isAvailable}
                        >
                          {addedToCart ? (
                            <>
                              <FaCheckCircle className="pdp-cta-icon" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <FaShoppingCart className="pdp-cta-icon" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>

                        <button
                          className={`pdp-cta pdp-cta--buy ${!isAvailable ? 'pdp-cta--disabled' : ''}`}
                          onClick={handleBuyNow}
                          disabled={!isAvailable}
                        >
                          <span>Buy Now</span>
                          <FaArrowRight className="pdp-cta-icon" />
                        </button>
                      </div>
                    </div>

                    {/* Security Note */}
                    <p className="pdp-summary-note">
                      <FaShieldAlt className="pdp-summary-note-icon" />
                      Prices include all applicable charges. No hidden fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CustomerReviewSection />

      {/* ══════════════════════════════════════════
          MOBILE STICKY BAR
      ══════════════════════════════════════════ */}
      <div className="pdp-sticky-bar">
        <div className="pdp-sticky-info">
          <span className="pdp-sticky-total-label">Price</span>
          <span className="pdp-sticky-total-value">Rs {formatPrice(productData.price)}</span>
        </div>
        <div className="pdp-sticky-actions">
          <button
            className="pdp-sticky-btn pdp-sticky-btn--cart"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            aria-label="Add to cart"
          >
            <FaShoppingCart />
          </button>
          <button
            className="pdp-sticky-btn pdp-sticky-btn--buy"
            onClick={handleBuyNow}
            disabled={!isAvailable}
          >
            <FaShoppingCart className="pdp-sticky-btn-icon" />
            <span>{isSold ? 'Sold' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
