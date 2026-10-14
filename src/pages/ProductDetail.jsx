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
import ReactGA from 'react-ga4'
import '../css/ProductDetail.css'
import CustomerReviewSection from '../components/CustomerReviewSection'
import LoginRequiredPopup from '../components/LoginRequiredPopup'
import { useCart } from '../contexts/cartContextCore'
import { useAuth } from '../contexts/authContextCore'
import { useFavourites } from '../contexts/FavouritesContext'
import api from '../services/api'
import { buildMediaUrl, isAbsoluteUrl } from '../utils/mediaUrl'
import { WHATSAPP_NUMBER } from '../constants/contact'
import { formatPrice } from '../utils/priceUtils'

const trustElements = [
  { icon: <FaBalanceScale />, title: 'Honest Weight', desc: 'Guaranteed accurate weight' },
  { icon: <FaShieldAlt />, title: 'No Hidden Charges', desc: 'Price is what you see' },
  { icon: <FaHistory />, title: '30+ Years Legacy', desc: 'Trusted since 1994' },
  { icon: <FaVideo />, title: 'Live Video', desc: 'Available on request' },
  { icon: <FaTruck />, title: 'Delivery in 49 Rs', desc: 'Within RYK city' },
  { icon: <FaMoneyBillWave />, title: 'Cash on Delivery', desc: 'Pay when you receive' }
]

const DEFAULT_FISH_SIZES = [
  { label: '1.0 - 1.5 kg', minWeight: 1.0, maxWeight: 1.5 },
  { label: '1.5 - 2.0 kg', minWeight: 1.5, maxWeight: 2.0 },
  { label: '2.0 - 3.0 kg', minWeight: 2.0, maxWeight: 3.0 }
]

const DEFAULT_FISH_CUTS = [
  'Slices / Steaks',
  'Boneless Cubes',
  'Finger Fish',
  'Whole Cleaned'
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
  const { role } = useAuth()
  const { isFavourited, toggleFavourite } = useFavourites()

  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)

  // Fish customization states
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedCut, setSelectedCut] = useState('')
  const [isCustomCut, setIsCustomCut] = useState(false)
  const [customCutText, setCustomCutText] = useState('')
  const [includeHead, setIncludeHead] = useState(false) // Default OFF
  const [pieces, setPieces] = useState(1)

  useEffect(() => {
    const fetchProduct = async (isManualCheck = false) => {
      try {
        if (!isManualCheck) {
          setLoading(true)
          setError('')
        }
        let product = null

        // Try animal first
        try {
          const response = await api.get(`/api/animals/${id}`)
          if (response.data?.success && response.data?.data) {
            product = response.data.data
          }
        } catch (e) {
          // not found in animals
        }

        // If not found in animal, try meat-items
        if (!product) {
          try {
            const meatResponse = await api.get(`/api/meat-items/${id}`)
            if (meatResponse.data?.success && meatResponse.data?.data) {
              const meatItem = meatResponse.data.data
              product = {
                ...meatItem,
                type: 'meat',
                itemType: 'meat',
                status: meatItem.isAvailable ? 'available' : 'sold'
              }
            }
          } catch (e) {
            // not found in meat items either
          }
        }

        if (product) {
          const status = product.status || 'available'
          const isSold = status === 'sold' || status === 'Sold'
          const isReserved = status === 'reserved' || status === 'Reserved'

          if (isSold || isReserved) {
            navigate('/unavailable-item', {
              replace: true,
              state: { productName: product.name }
            })
            return
          }
          setProductData(product)
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

  useEffect(() => {
    if (productData?.category === 'fish') {
      const sizes = productData.fishOptions?.sizeVariants?.length
        ? productData.fishOptions.sizeVariants
        : DEFAULT_FISH_SIZES
      const cuts = productData.fishOptions?.availableCuts?.length
        ? productData.fishOptions.availableCuts
        : DEFAULT_FISH_CUTS
      if (!selectedSize && sizes.length > 0) {
        setSelectedSize(sizes[0])
      }
      if (!selectedCut && cuts.length > 0) {
        setSelectedCut(cuts[0])
      }
    }
  }, [productData, selectedSize, selectedCut])

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <p>Loading product details…</p>
      </div>
    )
  }

  if (error || !productData) {
    return (
      <div className="pd-error">
        <div className="pd-error__card">
          <div className="pd-error__icon"><FaExclamationTriangle /></div>
          <h2>{error || 'Product Not Found'}</h2>
          <p>The product you're looking for might have been removed or doesn't exist.</p>
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

  const isFish = productData.category === 'fish'

  const availableSizes = productData.fishOptions?.sizeVariants?.length
    ? productData.fishOptions.sizeVariants
    : DEFAULT_FISH_SIZES

  const availableCuts = productData.fishOptions?.availableCuts?.length
    ? productData.fishOptions.availableCuts
    : DEFAULT_FISH_CUTS

  const currentBasePrice = priceToNumber(productData.price)
  const currentMinWeight = selectedSize?.minWeight || availableSizes[0]?.minWeight || 1.0
  const currentMaxWeight = selectedSize?.maxWeight || availableSizes[0]?.maxWeight || 1.5

  const estimatedMinTotal = isFish
    ? Math.round(currentMinWeight * currentBasePrice * pieces)
    : currentBasePrice

  const estimatedMaxTotal = isFish
    ? Math.round(currentMaxWeight * currentBasePrice * pieces)
    : currentBasePrice

  const stockStatus = productData.status || 'available'
  const isAvailable = stockStatus === 'available' || stockStatus === 'new' || stockStatus === 'Available'
  const isSold = stockStatus === 'sold' || stockStatus === 'Sold'
  const isReserved = stockStatus === 'reserved' || stockStatus === 'Reserved'

  const handlePrevImage = () => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const handleNextImage = () => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))

  const handleWhatsApp = () => {
    let msg = productData.whatsappMsg
    if (!msg) {
      if (isFish) {
        const cut = isCustomCut ? customCutText.trim() : (selectedCut || availableCuts[0])
        const size = selectedSize?.label || '1.0 - 1.5 kg'
        const head = includeHead ? 'Included (Yes)' : 'Not Included (No)'
        msg = `Assalam o Alaikum!%0A%0AI want to order *${productData.name}*%0A%0A*Category:* Fish%0A*Cut:* ${cut}%0A*Size Bracket:* ${size}%0A*Pieces:* ${pieces}%0A*Fish Head:* ${head}%0A*Estimated Total:* Rs ${formatPrice(estimatedMinTotal)} - ${formatPrice(estimatedMaxTotal)} (Rate: Rs ${formatPrice(productData.price)}/kg)%0A%0APlease confirm my order.`
      } else {
        msg = `Assalam o Alaikum!%0A%0AI'm interested in *${productData.name}*%0A%0ABreed: ${productData.breed}%0AWeight: ${productData.weight}%0APrice: Rs ${formatPrice(productData.price)}%0A%0APlease share more details.`
      }
    }
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const getFishPayload = () => {
    if (!isFish) return null
    const finalCut = isCustomCut ? customCutText.trim() : (selectedCut || availableCuts[0])
    return {
      selectedCut: finalCut || 'Standard Cut',
      isCustomCut,
      customCutNote: isCustomCut ? customCutText.trim() : '',
      sizeBracket: selectedSize?.label || availableSizes[0]?.label || '1.0 - 1.5 kg',
      minWeight: selectedSize?.minWeight || 1.0,
      maxWeight: selectedSize?.maxWeight || 1.5,
      estimatedPriceMin: estimatedMinTotal,
      estimatedPriceMax: estimatedMaxTotal,
      includeHead,
      pieces
    }
  }

  const handleAddToCart = () => {
    if (!productData) return
    if (isFish && isCustomCut && !customCutText.trim()) {
      alert('Please enter your custom cut instructions.')
      return
    }

    const fishDetails = getFishPayload()
    const itemToAdd = {
      ...productData,
      quantity: isFish ? pieces : 1,
      fishDetails
    }

    // Auto-save custom cut to backend repository if custom
    if (isFish && isCustomCut && customCutText.trim()) {
      api.post('/api/fish-cuts', { name: customCutText.trim(), isCustom: true }).catch(() => {})
    }

    addItem(itemToAdd)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
    ReactGA.event({
      category: 'Ecommerce',
      action: 'add_to_cart',
      label: productData.name,
      value: isFish ? estimatedMinTotal : priceToNumber(productData.price),
      item_id: productData._id,
      item_type: productData.itemType || 'livestock'
    })
    console.log('✅ [GA4] Add to cart event tracked')
    
    // Meta Pixel - AddToCart event
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        value: isFish ? estimatedMinTotal : priceToNumber(productData.price),
        currency: 'PKR',
        content_name: productData.name,
        content_ids: [productData._id],
        content_type: 'product'
      })
      console.log('✅ [Meta Pixel] AddToCart event tracked')
    }
  }

  const handleBuyNow = async () => {
    if (!productData) return
    if (isFish && isCustomCut && !customCutText.trim()) {
      alert('Please enter your custom cut instructions.')
      return
    }

    const fishDetails = getFishPayload()
    const itemToAdd = {
      ...productData,
      quantity: isFish ? pieces : 1,
      fishDetails
    }

    if (isFish && isCustomCut && customCutText.trim()) {
      api.post('/api/fish-cuts', { name: customCutText.trim(), isCustom: true }).catch(() => {})
    }

    ReactGA.event({
      category: 'Ecommerce',
      action: 'begin_checkout',
      label: productData.name,
      value: isFish ? estimatedMinTotal : priceToNumber(productData.price),
      item_id: productData._id,
      item_type: productData.itemType || 'livestock'
    })
    console.log('✅ [GA4] Begin checkout event tracked')

    addItem(itemToAdd)
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
                    className={`pd-icon-btn ${isFavourited(id, 'animal') ? 'pd-icon-btn--active' : ''}`}
                    onClick={() => {
                      if (role === 'guest') {
                        setShowLoginPopup(true);
                      } else {
                        toggleFavourite({ ...productData, id }, 'animal');
                      }
                    }}
                    title="Add to Wishlist"
                  >
                    {isFavourited(id, 'animal') ? <FaHeart /> : <FaRegHeart />}
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

              {isFish ? (
                <div className="pd-price" style={{ background: '#f0f9ff', borderColor: '#bae6fd', padding: '16px', borderRadius: '12px' }}>
                  <div className="pd-price__top">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
                      <span className="pd-price__label" style={{ color: '#0369a1', fontWeight: 700 }}>
                        Estimated Bill ({pieces} {pieces > 1 ? 'Pieces' : 'Piece'})
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        Rate: Rs {formatPrice(productData.price)} / kg
                      </span>
                    </div>
                    <div className="pd-price__row">
                      <span className="pd-price__current" style={{ color: '#0284c7', fontSize: '1.75rem' }}>
                        Rs {formatPrice(estimatedMinTotal)} – {formatPrice(estimatedMaxTotal)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Selected Size Bracket: <strong>{selectedSize?.label || '1.0 - 1.5 kg'}</strong>
                    </span>
                  </div>
                </div>
              ) : (
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
              )}

              {/* Fish Customization Section */}
              {isFish ? (
                <div className="pd-fish-config" style={{
                  margin: '16px 0',
                  padding: '16px',
                  background: '#ffffff',
                  border: '1.5px solid #e0f2fe',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.05)'
                }}>
                  {/* Step 1: Size Bracket */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      1. Select Fish Piece Size (Weight):
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {availableSizes.map(size => {
                        const isSelected = selectedSize?.label === size.label
                        return (
                          <button
                            key={size.label}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                              background: isSelected ? '#e0f2fe' : '#ffffff',
                              color: isSelected ? '#0369a1' : '#334155',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>⚖️</span>
                            <span>{size.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2: Available Cuts */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      2. Select Desired Cut:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      {availableCuts.map(cut => {
                        const isSelected = !isCustomCut && selectedCut === cut
                        return (
                          <button
                            key={cut}
                            type="button"
                            onClick={() => {
                              setSelectedCut(cut)
                              setIsCustomCut(false)
                            }}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                              background: isSelected ? '#e0f2fe' : '#ffffff',
                              color: isSelected ? '#0369a1' : '#334155',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected ? '✓ ' : ''}{cut}
                          </button>
                        )
                      })}
                      
                      {/* Custom Cut Button */}
                      <button
                        type="button"
                        onClick={() => setIsCustomCut(true)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: isCustomCut ? '2px solid #0284c7' : '1px dashed #0284c7',
                          background: isCustomCut ? '#e0f2fe' : '#f0f9ff',
                          color: '#0369a1',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isCustomCut ? '✓ ' : '+ '} Custom Cut / Other
                      </button>
                    </div>

                    {/* Custom Cut Input Box */}
                    {isCustomCut && (
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                          Describe your cut (e.g. Skinless finger fish, 1-inch tikka boti, deep fry cut):
                        </label>
                        <input
                          type="text"
                          value={customCutText}
                          onChange={e => setCustomCutText(e.target.value)}
                          placeholder="Type your desired cutting style here..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1.5px solid #0284c7',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 3: Fish Head Option (Toggle Switch) */}
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px 14px',
                    background: includeHead ? '#ecfdf5' : '#f8fafc',
                    border: includeHead ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setIncludeHead(prev => !prev)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🐟</span>
                        <strong style={{ fontSize: '0.85rem', color: includeHead ? '#065f46' : '#1e293b' }}>
                          Include Fish Head (Machli ka Sar)
                        </strong>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: includeHead ? '#047857' : '#64748b' }}>
                        {includeHead ? 'Head will be cleaned and packed with your order' : 'Default is OFF (sar nahi bheja jayega). Click to include.'}
                      </p>
                    </div>

                    <div style={{
                      width: '44px',
                      height: '24px',
                      background: includeHead ? '#10b981' : '#cbd5e1',
                      borderRadius: '12px',
                      position: 'relative',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: includeHead ? '22px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>

                  {/* Step 4: Number of Fish Pieces */}
                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        Quantity (Fish Pieces):
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        How many fish of this size bracket do you need?
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setPieces(prev => Math.max(1, prev - 1))}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '6px 14px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 16px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {pieces}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPieces(prev => Math.min(20, prev + 1))}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '6px 14px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Educational Yield Note Banner */}
                  <div style={{
                    padding: '10px 12px',
                    background: '#fefce8',
                    border: '1px solid #fef08a',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: '#854d0e',
                    lineHeight: 1.45
                  }}>
                    ⚖️ <strong>Important Weight Note:</strong> Fish is weighed as a whole (gross weight) before cutting and cleaning. Wastage (scales, gills, internal organs, and head if toggled OFF) will be removed according to your selected cut. Final bill will reflect the exact weight of fresh fish.
                  </div>
                </div>
              ) : (
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
              )}

              <div className="pd-delivery">
                <div className="pd-delivery__item"><FaTruck /><span>Delivery in 49 Rs within RYK</span></div>
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

        <CustomerReviewSection
          productId={productData?._id || id}
          productType="livestock"
          productName={productData?.name || ''}
        />
      </div>

      {/* ── Mobile sticky bar ── */}
      <div className="pd-mobile-bar">
        <div className="pd-mobile-bar__price">
          <span className="pd-mobile-bar__label">{isFish ? 'Est. Total' : 'Price'}</span>
          <span className="pd-mobile-bar__value">
            {isFish ? `Rs ${formatPrice(estimatedMinTotal)} – ${formatPrice(estimatedMaxTotal)}` : formatPrice(productData.price)}
          </span>
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

      <LoginRequiredPopup 
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Please login first to add to favourites"
      />
    </div>
  )
}

export default ProductDetail