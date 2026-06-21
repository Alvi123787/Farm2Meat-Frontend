import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ShopHeader from '../components/ShopHeader'
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
  FaExclamationTriangle,
  FaPalette,
  FaMars,
  FaVenus,
  FaHandshake,
  FaMedal,
  FaUserShield,
  FaRegHeart,
  FaHeart,
  FaUndoAlt,
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
      <div className="pd-loading">
        <div className="pd-spinner" />
        <p>Loading animal details…</p>
      </div>
    )
  }

  if (error || !productData) {
    return (
      <div className="pd-error">
        <div className="pd-error__card">
          <div className="pd-error__icon"><FaExclamationTriangle /></div>
          <h2>{error || 'Animal Not Found'}</h2>
          <p>The animal you're looking for might have been removed or doesn't exist.</p>
          <div className="pd-error__actions">
            <button className="pd-btn pd-btn--primary" onClick={() => navigate('/shop')}>
              <FaArrowLeft /> Back to Shop
            </button>
            <button className="pd-btn pd-btn--outline" onClick={() => window.location.reload()}>
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
    addItem(productData)
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

      addItem(productData)
      navigate('/cart', { state: { fromBuyNow: true } })
    } catch (err) {
      console.error('Pre-checkout check failed:', err)
      addItem(productData)
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

  return (
    <div className="pd-page">
      <div className="pd-header-wrapper">
        <ShopHeader
          activeCategory={productData?.category}
          productName={productData?.name}
          pageTitle="Product Details"
        />
      </div>

      <div className="pd-container">
        <div className="pd-main">

          {/* ── Gallery ── */}
          <div className="pd-gallery">
            <div className="pd-gallery__card">
              <div className="pd-gallery__main">
                <img
                  src={images[activeImage]}
                  alt={productData.name}
                  className="pd-gallery__img"
                  onClick={() => setIsLightboxOpen(true)}
                />

                <div className="pd-badges">
                  {hasDiscount && <span className="pd-badge pd-badge--discount">-{discount}% OFF</span>}
                  <span className={`pd-badge pd-badge--status pd-badge--${stockStatus}`}>
                    <span className="pd-badge__dot" />
                    {isSold ? 'Sold Out' : isReserved ? 'Reserved' : 'Available'}
                  </span>
                </div>

                <div className="pd-quick-actions">
                  <button
                    className={`pd-icon-btn ${isWishlisted ? 'pd-icon-btn--active' : ''}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    title="Add to Wishlist"
                  >
                    {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <button className="pd-icon-btn" onClick={() => setIsLightboxOpen(true)} title="View Fullscreen">
                    <FaExpand />
                  </button>
                  <div className="pd-share">
                    <button className="pd-icon-btn" onClick={handleShare} title="Share">
                      <FaShareAlt />
                    </button>
                    {showShareTooltip && <span className="pd-share__tip">Link Copied!</span>}
                  </div>
                </div>

                {images.length > 1 && (
                  <>
                    <button className="pd-nav pd-nav--prev" onClick={handlePrevImage} aria-label="Previous image">
                      <FaChevronLeft />
                    </button>
                    <button className="pd-nav pd-nav--next" onClick={handleNextImage} aria-label="Next image">
                      <FaChevronRight />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="pd-counter">{activeImage + 1} / {images.length}</div>
                )}

                {(isSold || isReserved) && (
                  <div className="pd-unavailable">
                    <span className="pd-unavailable__stamp">{isSold ? 'SOLD' : 'RESERVED'}</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="pd-thumbs">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`pd-thumb ${activeImage === index ? 'pd-thumb--active' : ''}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={img} alt={`View ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {videos.length > 0 && (
                <div className="pd-videos">
                  <h4 className="pd-section-title"><FaVideo /> Product Videos</h4>
                  <div className="pd-videos__grid">
                    {videos.map((vid, index) => (
                      <video key={index} src={vid} className="pd-video" controls preload="metadata" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="pd-info">
            <div className="pd-info__card">
              <div className="pd-seller">
                <div className="pd-pill pd-pill--gold"><FaMedal /><span>Verified Seller</span></div>
                <div className="pd-pill pd-pill--neutral"><FaUserShield /><span>MeatByAlvi Official</span></div>
              </div>

              <h1 className="pd-title">{productData.name}</h1>

              <div className="pd-tags">
                {productData.breed && <span className="pd-tag"><FaDna /> {productData.breed}</span>}
                {productData.category && <span className="pd-tag"><FaCertificate /> {productData.category}</span>}
              </div>

              <div className="pd-price">
                <div className="pd-price__top">
                  <span className="pd-price__label">Price</span>
                  <div className="pd-price__row">
                    <span className="pd-price__current">{formatPrice(productData.price)}</span>
                    {hasDiscount && <span className="pd-price__old">{formatPrice(oldPrice)}</span>}
                  </div>
                </div>
                {hasDiscount && (
                  <div className="pd-price__savings">
                    <FaTag /><span>Save {formatPrice(savings)} ({discount}% OFF)</span>
                  </div>
                )}
              </div>

              <div className="pd-quick-grid">
                {productData.weight && (
                  <div className="pd-quick-card">
                    <FaWeightHanging />
                    <div>
                      <span className="pd-quick-card__label">Weight</span>
                      <span className="pd-quick-card__value">
                        {productData.weight.toString().toLowerCase().includes('kg')
                          ? productData.weight
                          : `${productData.weight} KG`}
                      </span>
                    </div>
                  </div>
                )}
                {productData.age && (
                  <div className="pd-quick-card">
                    <FaClock />
                    <div>
                      <span className="pd-quick-card__label">Age</span>
                      <span className="pd-quick-card__value">
                        {productData.age} {productData.ageUnit === 'years'
                          ? (productData.age > 1 ? 'years' : 'year')
                          : (productData.age > 1 ? 'months' : 'month')}
                      </span>
                    </div>
                  </div>
                )}
                <div className="pd-quick-card">
                  <FaMapMarkerAlt />
                  <div>
                    <span className="pd-quick-card__label">Location</span>
                    <span className="pd-quick-card__value">{buildLocation(productData)}</span>
                  </div>
                </div>
              </div>

              <div className="pd-delivery">
                <div className="pd-delivery__item"><FaTruck /><span>Free Delivery in RYK</span></div>
                <div className="pd-delivery__item"><FaMoneyBillWave /><span>Cash on Delivery</span></div>
              </div>

              <div className="pd-actions">
                <button
                  className={`pd-btn pd-btn--cart ${addedToCart ? 'pd-btn--added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                >
                  {addedToCart ? <><FaCheckCircle /> Added to Cart</> : <><FaShoppingCart /> Add to Cart</>}
                </button>
                <button className="pd-btn pd-btn--buy" onClick={handleBuyNow} disabled={!isAvailable}>
                  Buy Now <FaArrowRight />
                </button>
              </div>

              <button className="pd-btn pd-btn--whatsapp" onClick={handleWhatsApp} disabled={isSold}>
                <FaWhatsapp />
                <span>{isSold ? 'Currently Unavailable' : 'Chat on WhatsApp'}</span>
              </button>

              {productData.negotiable && (
                <div className="pd-negotiable">
                  <FaHandshake /><span>Price negotiable — contact seller to discuss</span>
                </div>
              )}

              <div className="pd-features">
                <div className="pd-features__item"><FaUndoAlt /><span>7 Day Return Policy</span></div>
                <div className="pd-features__item"><FaHeadset /><span>24/7 Support</span></div>
                <div className="pd-features__item"><FaShieldAlt /><span>Secure Payment</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pd-tabs">
          <div className="pd-tabs__header">
            <button className={`pd-tab ${activeTab === 'details' ? 'pd-tab--active' : ''}`} onClick={() => setActiveTab('details')}>
              <FaClipboardList /> Specifications
            </button>
            <button className={`pd-tab ${activeTab === 'description' ? 'pd-tab--active' : ''}`} onClick={() => setActiveTab('description')}>
              <FaInfoCircle /> Description
            </button>
            <button className={`pd-tab ${activeTab === 'trust' ? 'pd-tab--active' : ''}`} onClick={() => setActiveTab('trust')}>
              <FaShieldAlt /> Why Trust Us
            </button>
          </div>

          <div className="pd-tabs__content">
            {activeTab === 'details' && (
              <div className="pd-specs">
                {details.map((detail, index) => (
                  <div key={index} className="pd-spec">
                    <div className="pd-spec__icon">{detail.icon}</div>
                    <div className="pd-spec__body">
                      <span className="pd-spec__label">{detail.label}</span>
                      <span className="pd-spec__value">{detail.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'description' && (
              <div className="pd-desc">
                <div
                  className={`pd-desc__text ${showFullDesc ? 'pd-desc__text--expanded' : ''}`}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                {description.length > 200 && (
                  <button className="pd-read-more" onClick={() => setShowFullDesc(!showFullDesc)}>
                    {showFullDesc ? <>Show Less <FaChevronUp /></> : <>Read More <FaChevronDown /></>}
                  </button>
                )}
                {productData.specialNotes && (
                  <div className="pd-notes">
                    <FaInfoCircle />
                    <p>{productData.specialNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="pd-trust">
                {trustElements.map((item, index) => (
                  <div key={index} className="pd-trust__card">
                    <div className="pd-trust__icon">{item.icon}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Live video banner ── */}
        <div className="pd-banner">
          <div className="pd-banner__icon"><FaVideo /></div>
          <div className="pd-banner__text">
            <h3>Want to see this animal live?</h3>
            <p>Request a video call with our team to inspect the animal in real-time</p>
          </div>
          <button className="pd-banner__btn" onClick={handleWhatsApp}>
            Request Live Video <FaArrowRight />
          </button>
        </div>

        <CustomerReviewSection />
      </div>

      {/* ── Mobile sticky bar ── */}
      <div className="pd-mobile-bar">
        <div className="pd-mobile-bar__price">
          <span className="pd-mobile-bar__label">Price</span>
          <span className="pd-mobile-bar__value">{formatPrice(productData.price)}</span>
        </div>
        <div className="pd-mobile-bar__actions">
          <button className="pd-mobile-bar__cart" onClick={handleAddToCart} disabled={!isAvailable}>
            <FaShoppingCart />
          </button>
          <button className="pd-mobile-bar__buy" onClick={handleBuyNow} disabled={!isAvailable}>
            {isSold ? 'Sold Out' : isReserved ? 'Reserved' : 'Buy Now'}
          </button>
          <button className="pd-mobile-bar__wa" onClick={handleWhatsApp}>
            <FaWhatsapp />
          </button>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {isLightboxOpen && (
        <div className="pd-lightbox" onClick={() => setIsLightboxOpen(false)}>
          <button className="pd-lightbox__close" onClick={() => setIsLightboxOpen(false)} aria-label="Close">
            <FaTimes />
          </button>
          <button className="pd-lightbox__nav pd-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); handlePrevImage() }}>
            <FaChevronLeft />
          </button>
          <img
            src={images[activeImage]}
            alt={productData.name}
            className="pd-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="pd-lightbox__nav pd-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); handleNextImage() }}>
            <FaChevronRight />
          </button>
          <div className="pd-lightbox__counter">{activeImage + 1} / {images.length}</div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail