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
  FaPhoneAlt,
  FaHome,
  FaStore,
  FaRegHeart,
  FaHeart,
  FaCheck,
  FaTruckFast,
  FaRotateLeft,
  FaHeadset
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
  
  if (animal.age) {
    const ageUnit = animal.ageUnit === 'years' ? (animal.age > 1 ? 'years' : 'year') : (animal.age > 1 ? 'months' : 'month')
    details.push({ icon: <FaClock />, label: 'Age', value: `${animal.age} ${ageUnit}` })
  }
  
  if (animal.weight) {
    const weightValue = animal.weight.toString().toLowerCase().includes('kg') ? animal.weight : `${animal.weight} KG`
    details.push({ icon: <FaWeightHanging />, label: 'Weight (Live)', value: weightValue })
  }

  if (animal.gender) {
    details.push({
      icon: animal.gender === 'male' ? <FaMars /> : <FaVenus />,
      label: 'Gender',
      value: animal.gender === 'male' ? 'Male' : 'Female'
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
  if (animal.age) {
    const ageUnit = animal.ageUnit === 'years' ? (animal.age > 1 ? 'years' : 'year') : (animal.age > 1 ? 'months' : 'month')
    parts.push(`This animal is ${animal.age} ${ageUnit} old`)
  }
  if (animal.weight) {
    const weightValue = animal.weight.toString().toLowerCase().includes('kg') ? animal.weight : `${animal.weight} KG`
    parts.push(`weighing approximately ${weightValue}`)
  }
  if (animal.healthStatus) parts.push(`with ${animal.healthStatus} health condition`)
  return parts.join('. ') + '.'
}

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [showShareTooltip, setShowShareTooltip] = useState(false)

  useEffect(() => {
    const fetchProduct = async (isManualCheck = false) => {
      try {
        if (!isManualCheck) {
          setLoading(true)
          setError('')
        }
        const response = await api.get(`/api/animals/${id}`)
        const result = response.data
        if (result.success && result.data) {
          const animal = result.data
          const status = animal.status || 'available'
          const isSold = status === 'sold' || status === 'Sold'
          const isReserved = status === 'reserved' || status === 'Reserved'

          if (isSold || isReserved) {
            navigate('/unavailable-item', { 
              replace: true,
              state: { productName: animal.name } 
            })
            return
          }
          setProductData(animal)
        } else {
          navigate('/unavailable-item', { replace: true })
        }
      } catch (err) {
        console.error('Fetch error:', err)
        if (!isManualCheck) setError('Cannot connect to server. Please try again later.')
      } finally {
        if (!isManualCheck) setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
      const handleFocus = () => fetchProduct(true)
      window.addEventListener('focus', handleFocus)
      const interval = setInterval(() => fetchProduct(true), 30000)

      return () => {
        window.removeEventListener('focus', handleFocus)
        clearInterval(interval)
      }
    }
  }, [id, navigate])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  if (loading) {
    return (
      <div className="product-loading">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner"></div>
        </div>
        <p>Loading animal details...</p>
      </div>
    )
  }

  if (error || !productData) {
    return (
      <div className="product-error">
        <div className="error-container">
          <div className="error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>{error || 'Animal Not Found'}</h2>
          <p>The animal you're looking for might have been removed or doesn't exist.</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              <FaArrowLeft /> Back to Shop
            </button>
            <button className="btn-outline" onClick={() => window.location.reload()}>
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
      `Assalam o Alaikum!%0A%0AI'm interested in *${productData.name}*%0A%0ABreed: ${productData.breed}%0AWeight: ${productData.weight}%0APrice: Rs ${formatPrice(productData.price)}%0A%0APlease share more details.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const handleAddToCart = () => {
    if (!productData) return
    for (let i = 0; i < quantity; i++) {
      addItem(productData)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const handleBuyNow = async () => {
    if (!productData) return

    try {
      setLoading(true)
      const response = await api.get(`/api/animals/${id}`)
      const result = response.data
      const status = result?.data?.status || 'available'
      const isStillAvailable = status === 'available' || status === 'new' || status === 'Available'

      if (!isStillAvailable) {
        navigate('/unavailable-item', { 
          replace: true,
          state: { productName: productData.name } 
        })
        return
      }

      for (let i = 0; i < quantity; i++) {
        addItem(productData)
      }
      navigate('/cart', { state: { fromBuyNow: true } })
    } catch (err) {
      console.error('Pre-checkout check failed:', err)
      for (let i = 0; i < quantity; i++) {
        addItem(productData)
      }
      navigate('/cart', { state: { fromBuyNow: true } })
    } finally {
      setLoading(false)
    }
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
        setShowShareTooltip(true)
        setTimeout(() => setShowShareTooltip(false), 2000)
      }
    } catch (err) {
      console.log('Share failed:', err)
    }
  }

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)))
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/"><FaHome /> Home</Link>
            <FaChevronRight className="separator" />
            <Link to="/shop"><FaStore /> Shop</Link>
            <FaChevronRight className="separator" />
            <span className="current">{productData.name}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="product-main">
          {/* Gallery Section */}
          <div className="gallery-section">
            <div className="gallery-card">
              {/* Main Image Container */}
              <div className="main-image-wrapper">
                <img
                  src={images[activeImage]}
                  alt={productData.name}
                  className="main-image"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Status Badges */}
                <div className="image-badges">
                  {hasDiscount && (
                    <span className="badge discount">-{discount}% OFF</span>
                  )}
                  <span className={`badge status ${stockStatus}`}>
                    <span className="status-dot" />
                    {isSold ? 'Sold Out' : isReserved ? 'Reserved' : 'Available'}
                  </span>
                </div>

                {/* Image Actions */}
                <div className="image-actions">
                  <button 
                    className={`action-btn wishlist ${isWishlisted ? 'active' : ''}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    title="Add to Wishlist"
                  >
                    {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <button className="action-btn" onClick={() => setIsLightboxOpen(true)} title="View Fullscreen">
                    <FaExpand />
                  </button>
                  <div className="share-wrapper">
                    <button className="action-btn" onClick={handleShare} title="Share">
                      <FaShareAlt />
                    </button>
                    {showShareTooltip && (
                      <span className="share-tooltip">Link Copied!</span>
                    )}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button className="nav-arrow prev" onClick={handlePrevImage}>
                      <FaChevronLeft />
                    </button>
                    <button className="nav-arrow next" onClick={handleNextImage}>
                      <FaChevronRight />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="image-counter">
                    {activeImage + 1} / {images.length}
                  </div>
                )}

                {/* Unavailable Overlay */}
                {(isSold || isReserved) && (
                  <div className="unavailable-overlay">
                    <span className="unavailable-stamp">{isSold ? 'SOLD' : 'RESERVED'}</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="thumbnail-strip">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={img} alt={`View ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Video Gallery */}
              {videos.length > 0 && (
                <div className="video-section">
                  <h4 className="section-title">
                    <FaVideo /> Product Videos
                  </h4>
                  <div className="video-grid">
                    {videos.map((vid, index) => (
                      <video key={index} src={vid} className="product-video" controls preload="metadata" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="info-section">
            <div className="info-card">
              {/* Seller Info */}
              <div className="seller-info">
                <div className="seller-badge">
                  <FaMedal />
                  <span>Verified Seller</span>
                </div>
                <div className="seller-name">
                  <FaUserShield />
                  <span>Farm2Meat Official</span>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="product-title">{productData.name}</h1>

              {/* Meta Information */}
              <div className="meta-tags">
                {productData.breed && (
                  <span className="meta-tag">
                    <FaDna /> {productData.breed}
                  </span>
                )}
                {productData.category && (
                  <span className="meta-tag">
                    <FaCertificate /> {productData.category}
                  </span>
                )}
              </div>

              {/* Price Section */}
              <div className="price-section">
                <div className="price-main">
                  <span className="price-label">Price</span>
                  <div className="price-values">
                    <span className="current-price">{formatPrice(productData.price)}</span>
                    {hasDiscount && (
                      <span className="old-price">{formatPrice(oldPrice)}</span>
                    )}
                  </div>
                </div>
                {hasDiscount && (
                  <div className="savings-badge">
                    <FaTag />
                    <span>Save {formatPrice(savings)} ({discount}% OFF)</span>
                  </div>
                )}
              </div>

              {/* Quick Info Cards */}
              <div className="quick-info-grid">
                {productData.weight && (
                  <div className="quick-info-card">
                    <FaWeightHanging />
                    <div>
                      <span className="label">Weight</span>
                      <span className="value">
                        {productData.weight.toString().toLowerCase().includes('kg') 
                          ? productData.weight 
                          : `${productData.weight} KG`}
                      </span>
                    </div>
                  </div>
                )}
                {productData.age && (
                  <div className="quick-info-card">
                    <FaClock />
                    <div>
                      <span className="label">Age</span>
                      <span className="value">
                        {productData.age} {productData.ageUnit === 'years' 
                          ? (productData.age > 1 ? 'years' : 'year') 
                          : (productData.age > 1 ? 'months' : 'month')}
                      </span>
                    </div>
                  </div>
                )}
                <div className="quick-info-card">
                  <FaMapMarkerAlt />
                  <div>
                    <span className="label">Location</span>
                    <span className="value">{buildLocation(productData)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="delivery-options">
                <div className="delivery-option">
                  <FaTruckFast />
                  <span>Free Delivery in RYK</span>
                </div>
                <div className="delivery-option">
                  <FaMoneyBillWave />
                  <span>Cash on Delivery</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-selector">
                <span className="label">Quantity:</span>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <FaChevronLeft />
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className={`btn-add-to-cart ${addedToCart ? 'added' : ''}`}
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
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={!isAvailable}
                >
                  Buy Now <FaArrowRight />
                </button>
              </div>

              {/* WhatsApp Button */}
              <button
                className="btn-whatsapp"
                onClick={handleWhatsApp}
                disabled={isSold}
              >
                <FaWhatsapp />
                <span>{isSold ? 'Currently Unavailable' : 'Chat on WhatsApp'}</span>
              </button>

              {productData.negotiable && (
                <div className="negotiable-notice">
                  <FaHandshake />
                  <span>Price negotiable — contact seller to discuss</span>
                </div>
              )}

              {/* Product Features */}
              <div className="product-features">
                <div className="feature">
                  <FaRotateLeft />
                  <span>7 Day Return Policy</span>
                </div>
                <div className="feature">
                  <FaHeadset />
                  <span>24/7 Support</span>
                </div>
                <div className="feature">
                  <FaShieldAlt />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FaClipboardList /> Specifications
            </button>
            <button
              className={`tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              <FaInfoCircle /> Description
            </button>
            <button
              className={`tab ${activeTab === 'trust' ? 'active' : ''}`}
              onClick={() => setActiveTab('trust')}
            >
              <FaShieldAlt /> Why Trust Us
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'details' && (
              <div className="specifications-grid">
                {details.map((detail, index) => (
                  <div key={index} className="spec-card">
                    <div className="spec-icon">{detail.icon}</div>
                    <div className="spec-content">
                      <span className="spec-label">{detail.label}</span>
                      <span className="spec-value">{detail.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'description' && (
              <div className="description-content">
                <div 
                  className={`description-text ${showFullDesc ? 'expanded' : ''}`}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {description.length > 200 && (
                  <button className="read-more-btn" onClick={() => setShowFullDesc(!showFullDesc)}>
                    {showFullDesc ? (
                      <>Show Less <FaChevronUp /></>
                    ) : (
                      <>Read More <FaChevronDown /></>
                    )}
                  </button>
                )}
                {productData.specialNotes && (
                  <div className="special-notes">
                    <FaInfoCircle />
                    <p>{productData.specialNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="trust-grid">
                {trustElements.map((item, index) => (
                  <div key={index} className="trust-card">
                    <div className="trust-icon">{item.icon}</div>
                    <div className="trust-content">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Video Request Banner */}
        <div className="live-video-banner">
          <div className="banner-content">
            <div className="banner-icon">
              <FaVideo />
            </div>
            <div className="banner-text">
              <h3>Want to see this animal live?</h3>
              <p>Request a video call with our team to inspect the animal in real-time</p>
            </div>
            <button className="banner-btn" onClick={handleWhatsApp}>
              Request Live Video <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <CustomerReviewSection />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="mobile-bottom-bar">
        <div className="price-info">
          <span className="label">Price</span>
          <span className="value">{formatPrice(productData.price)}</span>
        </div>
        <div className="actions">
          <button
            className="mobile-cart-btn"
            onClick={handleAddToCart}
            disabled={!isAvailable}
          >
            <FaShoppingCart />
          </button>
          <button
            className="mobile-buy-btn"
            onClick={handleBuyNow}
            disabled={!isAvailable}
          >
            {isSold ? 'Sold Out' : isReserved ? 'Reserved' : 'Buy Now'}
          </button>
          <button className="mobile-wa-btn" onClick={handleWhatsApp}>
            <FaWhatsapp />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="lightbox" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>
            <FaTimes />
          </button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); handlePrevImage() }}>
            <FaChevronLeft />
          </button>
          <img 
            src={images[activeImage]} 
            alt={productData.name} 
            className="lightbox-image" 
            onClick={(e) => e.stopPropagation()} 
          />
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); handleNextImage() }}>
            <FaChevronRight />
          </button>
          <div className="lightbox-counter">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail