import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  FaBoxOpen,
  FaStar,
  FaMedal,
  FaUserShield,
  FaPhoneAlt
} from 'react-icons/fa'
import '../css/ProductDetail.css'
import CustomerReviewSection from '../components/CustomerReviewSection'
import { useCart } from '../contexts/cartContextCore'
import api from '../services/api'
import { buildMediaUrl, isAbsoluteUrl } from '../utils/mediaUrl'
import { WHATSAPP_NUMBER } from '../constants/contact'
import { formatPrice } from '../utils/priceUtils'

const trustElements = [
  { icon: <FaBalanceScale />, title: 'Honest Weight', desc: 'Guaranteed accurate weight' },
  { icon: <FaShieldAlt />, title: 'No Hidden Charges', desc: 'Price is what you see' },
  { icon: <FaHistory />, title: '30+ Years Legacy', desc: 'Trusted since 1994' },
  { icon: <FaVideo />, title: 'Live Video', desc: 'Available on request' },
  { icon: <FaTruck />, title: 'Free Delivery', desc: 'Within RYK city' },
  { icon: <FaMoneyBillWave />, title: 'Cash on Delivery', desc: 'Pay when you receive' }
]

const priceToNumber = (price) => {
  if (!price) return 0
  if (typeof price === 'number') return price
  return parseInt(price.replace(/,/g, ''), 10) || 0
}

const buildImageUrls = (animal) => {
  const urls = []
  if (animal.images && animal.images.length > 0) {
    animal.images.forEach((img) => {
      urls.push(isAbsoluteUrl(img) ? img : buildMediaUrl(img))
    })
  } else if (animal.imageUrl) {
    urls.push(isAbsoluteUrl(animal.imageUrl) ? animal.imageUrl : buildMediaUrl(animal.imageUrl))
  }
  if (urls.length === 0) urls.push('/placeholder.jpg')
  return urls
}

const buildVideoUrls = (animal) => {
  if (!animal.videos || animal.videos.length === 0) return []
  return animal.videos.map((vid) => isAbsoluteUrl(vid) ? vid : buildMediaUrl(vid))
}

const buildLocation = (animal) => {
  if (animal.farmLocation && animal.city) return `${animal.farmLocation}, ${animal.city}`
  if (animal.farmLocation) return animal.farmLocation
  if (animal.city) return animal.city
  if (animal.location) return animal.location
  return 'Rahim Yar Khan'
}

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
  const [activeTab, setActiveTab] = useState('details')

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

  if (loading) {
    return (
      <div className="pdp-loading">
        <div className="pdp-loading-spinner">
          <FaSpinner />
        </div>
        <p>Loading animal details...</p>
      </div>
    )
  }

  if (error || !productData) {
    return (
      <div className="pdp-error">
        <div className="pdp-error-card">
          <div className="pdp-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>{error || 'Animal Not Found'}</h2>
          <p>The animal you're looking for might have been removed or doesn't exist.</p>
          <div className="pdp-error-actions">
            <button className="pdp-btn pdp-btn--primary" onClick={() => navigate('/shop')}>
              <FaArrowLeft /> Back to Shop
            </button>
            <button className="pdp-btn pdp-btn--outline" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

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

  const handlePrevImage = () => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const handleNextImage = () => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))

  const handleWhatsApp = () => {
    const msg = productData.whatsappMsg ||
      `Assalam o Alaikum!\n\nI'm interested in *${productData.name}*\n\nBreed: ${productData.breed}\nWeight: ${productData.weight}\nPrice: Rs ${formatPrice(productData.price)}\n\nPlease share more details.`
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

  return (
    <div className={`pdp-page ${isVisible ? 'pdp-page--visible' : ''}`}>
      {/* ══════════════════════════════════════════
          HEADER
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
                <div className="unified-header-top">
                  <button className="pdp-back-link" onClick={() => navigate('/shop')}>
                    <FaArrowLeft />
                    <span>Back to Shop</span>
                  </button>
                  <div className="pdp-header-logo-wrap logo-visibility-wrapper" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img 
                      src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                      alt="Farm2Meat Logo" 
                      style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div className="pdp-header-main">
                  <div className="pdp-header-title-row">
                    <FaInfoCircle className="pdp-header-icon" />
                    <h1 className="pdp-header-title">{productData.name}</h1>
                  </div>
                  <div className="pdp-header-badge">
                    <FaTag />
                    <span>Premium Livestock Details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="pdp-lightbox" onClick={() => setIsLightboxOpen(false)}>
          <button className="pdp-lightbox-close" onClick={() => setIsLightboxOpen(false)}>
            <FaTimes />
          </button>
          <button className="pdp-lightbox-nav pdp-lightbox-nav--prev" onClick={(e) => { e.stopPropagation(); handlePrevImage() }}>
            <FaChevronLeft />
          </button>
          <img src={images[activeImage]} alt={productData.name} className="pdp-lightbox-img" onClick={(e) => e.stopPropagation()} />
          <button className="pdp-lightbox-nav pdp-lightbox-nav--next" onClick={(e) => { e.stopPropagation(); handleNextImage() }}>
            <FaChevronRight />
          </button>
          <div className="pdp-lightbox-counter">{activeImage + 1} / {images.length}</div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="pdp-breadcrumb-container">
        <div className="pdp-container">
          <nav className="pdp-breadcrumb-nav">
            <Link to="/" className="pdp-breadcrumb-link">Home</Link>
            <span className="pdp-breadcrumb-sep">/</span>
            <Link to="/shop" className="pdp-breadcrumb-link">Shop</Link>
            <span className="pdp-breadcrumb-sep">/</span>
            <span className="pdp-breadcrumb-current">{productData.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pdp-container">
        <div className="pdp-grid">
          {/* Left Column - Gallery */}
          <div className="pdp-gallery-col">
            <div className="pdp-gallery-card">
              {/* Main Image */}
              <div className="pdp-main-image-container">
                <img
                  src={images[activeImage]}
                  alt={productData.name}
                  className="pdp-main-image"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Badges */}
                <div className="pdp-image-badges">
                  {discount > 0 && (
                    <span className="pdp-badge pdp-badge--discount">-{discount}% OFF</span>
                  )}
                  <span className={`pdp-badge ${isSold ? 'pdp-badge--sold' : isReserved ? 'pdp-badge--reserved' : 'pdp-badge--available'}`}>
                    <span className="pdp-badge-dot" />
                    {isSold ? 'Sold Out' : isReserved ? 'Reserved' : 'In Stock'}
                  </span>
                </div>

                {/* Image Actions */}
                <div className="pdp-image-actions">
                  <button className="pdp-image-action" onClick={() => setIsLightboxOpen(true)} title="Expand">
                    <FaExpand />
                  </button>
                  <button className="pdp-image-action" onClick={handleShare} title="Share">
                    <FaShareAlt />
                  </button>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button className="pdp-gallery-arrow pdp-gallery-arrow--prev" onClick={handlePrevImage}>
                      <FaChevronLeft />
                    </button>
                    <button className="pdp-gallery-arrow pdp-gallery-arrow--next" onClick={handleNextImage}>
                      <FaChevronRight />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="pdp-image-counter">{activeImage + 1} / {images.length}</div>
                )}

                {/* Sold Overlay */}
                {(isSold || isReserved) && (
                  <div className="pdp-sold-overlay">
                    <span className="pdp-sold-stamp">{isSold ? 'SOLD' : 'RESERVED'}</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="pdp-thumbnails-container">
                  <div className="pdp-thumbnails-scroll">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        className={`pdp-thumbnail ${activeImage === index ? 'pdp-thumbnail--active' : ''}`}
                        onClick={() => setActiveImage(index)}
                      >
                        <img src={img} alt={`Thumbnail ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Section */}
              {videos.length > 0 && (
                <div className="pdp-video-section">
                  <h4 className="pdp-section-title">
                    <FaVideo /> Product Videos
                  </h4>
                  <div className="pdp-video-grid">
                    {videos.map((vid, index) => (
                      <video key={index} src={vid} className="pdp-video" controls preload="metadata" />
                    ))}
                  </div>
                </div>
              )}

              {/* Live Video Request */}
              <button className="pdp-live-video-btn" onClick={handleWhatsApp}>
                <FaVideo />
                <span>Request Live Video Call</span>
                <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="pdp-info-col">
            <div className="pdp-info-card">
              {/* Seller Info */}
              <div className="pdp-seller-section">
                <div className="pdp-seller-badge">
                  <FaMedal className="pdp-seller-badge-icon" />
                  <span>Verified Seller</span>
                </div>
                <div className="pdp-seller-name">
                  <FaUserShield />
                  <span>Farm2Meat Official</span>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="pdp-product-title">{productData.name}</h1>

              {/* Breed & Category */}
              <div className="pdp-meta-tags">
                {productData.breed && (
                  <span className="pdp-meta-tag">
                    <FaDna /> {productData.breed}
                  </span>
                )}
                {productData.category && (
                  <span className="pdp-meta-tag">
                    <FaCertificate /> {productData.category}
                  </span>
                )}
              </div>

              {/* Price Section */}
              <div className="pdp-price-section">
                <div className="pdp-price-main">
                  <span className="pdp-price-label">Price</span>
                  <div className="pdp-price-value">
                    <span className="pdp-current-price">{formatPrice(productData.price)}</span>
                    {hasDiscount && (
                      <span className="pdp-old-price">{formatPrice(oldPrice)}</span>
                    )}
                  </div>
                </div>
                {savings > 0 && (
                  <div className="pdp-savings-badge">
                    <FaTag />
                    <span>You save {formatPrice(savings)} ({discount}% OFF)</span>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="pdp-quick-info">
                {productData.weight && (
                  <div className="pdp-quick-info-item">
                    <FaWeightHanging />
                    <span>{productData.weight}</span>
                  </div>
                )}
                {productData.age && (
                  <div className="pdp-quick-info-item">
                    <FaClock />
                    <span>{productData.age}</span>
                  </div>
                )}
                <div className="pdp-quick-info-item">
                  <FaMapMarkerAlt />
                  <span>{buildLocation(productData)}</span>
                </div>
              </div>

              {/* Delivery & Payment */}
              <div className="pdp-delivery-info">
                <div className="pdp-delivery-item">
                  <FaTruck />
                  <span>Free Delivery in RYK</span>
                </div>
                <div className="pdp-delivery-item">
                  <FaMoneyBillWave />
                  <span>Cash on Delivery</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pdp-actions">
                <button
                  className={`pdp-btn-cart ${addedToCart ? 'pdp-btn-cart--added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                >
                  {addedToCart ? (
                    <><FaCheckCircle /> Added to Cart</>
                  ) : (
                    <><FaShoppingCart /> Add to Cart</>
                  )}
                </button>
                <button
                  className="pdp-btn-buy"
                  onClick={handleBuyNow}
                  disabled={!isAvailable}
                >
                  Buy Now <FaArrowRight />
                </button>
              </div>

              {/* WhatsApp Contact */}
              <button
                className="pdp-btn-whatsapp"
                onClick={handleWhatsApp}
                disabled={isSold}
              >
                <FaWhatsapp />
                <span>{isSold ? 'Currently Unavailable' : 'Contact on WhatsApp'}</span>
              </button>

              {productData.negotiable && (
                <div className="pdp-negotiable-notice">
                  <FaHandshake />
                  <span>Price is negotiable — contact seller to discuss</span>
                </div>
              )}

              {/* Tabs Section */}
              <div className="pdp-tabs">
                <div className="pdp-tabs-header">
                  <button
                    className={`pdp-tab ${activeTab === 'details' ? 'pdp-tab--active' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    <FaClipboardList /> Details
                  </button>
                  <button
                    className={`pdp-tab ${activeTab === 'description' ? 'pdp-tab--active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    <FaInfoCircle /> Description
                  </button>
                  <button
                    className={`pdp-tab ${activeTab === 'trust' ? 'pdp-tab--active' : ''}`}
                    onClick={() => setActiveTab('trust')}
                  >
                    <FaShieldAlt /> Trust
                  </button>
                </div>

                <div className="pdp-tabs-content">
                  {activeTab === 'details' && (
                    <div className="pdp-details-grid">
                      {details.map((detail, index) => (
                        <div key={index} className="pdp-detail-card">
                          <div className="pdp-detail-icon">{detail.icon}</div>
                          <div className="pdp-detail-info">
                            <span className="pdp-detail-label">{detail.label}</span>
                            <span className="pdp-detail-value">{detail.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'description' && (
                    <div className="pdp-description-section">
                      <p className={`pdp-description ${showFullDesc ? 'pdp-description--expanded' : ''}`}>
                        {description}
                      </p>
                      {description.length > 200 && (
                        <button className="pdp-read-more-btn" onClick={() => setShowFullDesc(!showFullDesc)}>
                          {showFullDesc ? 'Show Less' : 'Read More'} <FaChevronDown className={showFullDesc ? 'rotate-180' : ''} />
                        </button>
                      )}
                      {productData.specialNotes && (
                        <div className="pdp-special-notes">
                          <FaInfoCircle />
                          <p>{productData.specialNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'trust' && (
                    <div className="pdp-trust-grid">
                      {trustElements.map((item, index) => (
                        <div key={index} className="pdp-trust-card">
                          <div className="pdp-trust-icon">{item.icon}</div>
                          <div className="pdp-trust-info">
                            <strong>{item.title}</strong>
                            <span>{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Note */}
              <div className="pdp-security-note">
                <FaShieldAlt />
                <span>Secure transaction · SSL encrypted · Verified seller</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <CustomerReviewSection />

      {/* Mobile Sticky Bar */}
      <div className="pdp-mobile-bar">
        <div className="pdp-mobile-price">
          <span className="pdp-mobile-price-label">Price</span>
          <span className="pdp-mobile-price-value">{formatPrice(productData.price)}</span>
        </div>
        <div className="pdp-mobile-actions">
          <button
            className="pdp-mobile-cart"
            onClick={handleAddToCart}
            disabled={!isAvailable}
          >
            <FaShoppingCart />
          </button>
          <button
            className="pdp-mobile-buy"
            onClick={handleBuyNow}
            disabled={!isAvailable}
          >
            {isSold ? 'Sold Out' : 'Buy Now'}
          </button>
          <button className="pdp-mobile-whatsapp" onClick={handleWhatsApp}>
            <FaWhatsapp />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail