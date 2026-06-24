import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaWhatsapp,
  FaArrowRight,
  FaSpinner,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes,
  FaPlay,
  FaRegHeart,
  FaHeart
} from 'react-icons/fa'
import ButcherSection from './ButcherSection'
import LoginRequiredPopup from './LoginRequiredPopup'
import api from '../services/api'
import '../css/CardsGrid.css'
import { useAuth } from '../contexts/authContextCore'
import { useFavourites } from '../contexts/FavouritesContext'
import { buildMediaUrl, isAbsoluteUrl } from '../utils/mediaUrl'
import { WHATSAPP_NUMBER } from '../constants/contact'
import { formatPrice } from '../utils/priceUtils'
const SCROLL_THRESHOLD = 12

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Helpers
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const normalize = (v) => String(v || '').trim().toLowerCase()
const parseNumber = (v) => {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : null
}
const getPriceNumber = (p) =>
  parseNumber(p?.discountPrice || p?.price || p?.oldPrice) ?? 0
const getWeightNumber = (p) => parseNumber(p?.weight)

const parseRange = (id) => {
  const v = String(id || 'all')
  if (!v || v === 'all') return null
  if (v.endsWith('+')) {
    const min = parseNumber(v.slice(0, -1))
    return min == null ? null : { min, max: Infinity }
  }
  const [a, b] = v.split('-')
  const min = parseNumber(a)
  const max = parseNumber(b)
  return min == null || max == null ? null : { min, max }
}

const priceLabel = (id) => {
  const m = {
    all: 'Any Price',
    '0-50000': 'Under 50,000',
    '50000-100000': '50K – 1 Lakh',
    '100000-200000': '1 – 2 Lakh',
    '200000-500000': '2 – 5 Lakh',
    '500000+': '5 Lakh+',
  }
  return m[id] || id
}

const weightLabel = (id) => {
  const m = {
    all: 'Any Weight',
    '0-20': 'Under 20 KG',
    '20-40': '20 – 40 KG',
    '40-60': '40 – 60 KG',
    '60-100': '60 – 100 KG',
    '100+': '100 KG+',
  }
  return m[id] || id
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ProductCard
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ProductCard = ({ product, index, isAnimated, isFav, onFavouriteClick }) => {
  const needsScroll = index >= SCROLL_THRESHOLD
  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'
  const isUnavailable = isSold || isReserved

  const getImageUrl = () => {
    const firstImg = product.images?.[0] || product.imageUrl || product.img
    if (!firstImg) return '/placeholder.jpg'
    
    // If it's already a full URL, return it
    if (isAbsoluteUrl(firstImg)) {
      return firstImg
    }

    return buildMediaUrl(firstImg) || '/placeholder.jpg'
  }

  const getFirstVideoUrl = () => {
    const firstVid = product.videos?.[0]
    if (!firstVid) return null

    if (isAbsoluteUrl(firstVid)) {
      return firstVid
    }

    return buildMediaUrl(firstVid)
  }

  const firstVideo = getFirstVideoUrl()

  const handleWhatsApp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const msg =
      product.whatsappMsg ||
      `Assalam o Alaikum! Mujhe *${product.name}* (${formatPrice(product.price)}) ke baare mein maloomat chahiye.`
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      '_blank'
    )
  }

  const detailUrl = `/shop/${product._id || product.id}`

  return (
    <div
      className={`cg-wrap ${needsScroll ? 'cg-wrap--scroll' : ''} ${
        needsScroll && isAnimated ? 'cg-wrap--show' : ''
      }`}
      style={{ '--cg-i': index % 4 }}
    >
      <a
        href={detailUrl}
        className={`cg-card ${isSold ? 'cg-card--sold' : ''} ${
          isReserved ? 'cg-card--reserved' : ''
        }`}
      >
        {/* ══════ IMAGE ══════ */}
        <div className="cg-visual">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="cg-img"
            loading={index > 7 ? 'lazy' : 'eager'}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = '/placeholder.jpg'
            }}
          />
          <div className="cg-img-overlay"></div>

          {/* Video Indicator */}
          {firstVideo && (
            <div className="cg-video-badge" title="Video available">
              <FaPlay />
            </div>
          )}

          {/* Sold / Reserved Badge */}
          {isSold && (
            <div className="cg-sold-badge">
              <span>Sold</span>
            </div>
          )}
          {isReserved && (
            <div className="cg-sold-badge cg-sold-badge--reserved">
              <span>Reserved</span>
            </div>
          )}

          {/* Favourite Button */}
          <button
            className="mc__wishlist"
            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavouriteClick(); }}
            aria-label={isFav ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* Hover CTA */}
          <div className="cg-hover-cta">
            <span>View Details</span>
            <FaArrowRight />
          </div>
        </div>

        {/* ══════ BODY ══════ */}
        <div className="cg-body">
          {/* Category */}
          {product.category && (
            <span className="cg-category">{product.category}</span>
          )}

          {/* Name */}
          <h3 className="cg-name">{product.name}</h3>

          {/* Description */}
          {product.shortDescription && (
            <p className="cg-desc">{product.shortDescription}</p>
          )}

          {/* Bottom: Price + WhatsApp */}
          <div className="cg-bottom">
            <div className="cg-price-block">
              <span className="cg-price">
                {formatPrice(product.price)}
              </span>
              {(product.discountPrice || product.oldPrice) && (
                <span className="cg-price-old">
                  {formatPrice(product.discountPrice || product.oldPrice)}
                </span>
              )}
            </div>

            <button
              className="cg-wa-btn"
              onClick={handleWhatsApp}
              disabled={isUnavailable}
              aria-label={`WhatsApp inquiry for ${product.name}`}
            >
              <FaWhatsapp />
            </button>
          </div>
        </div>
      </a>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CardsGrid
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CardsGrid = ({ filters, onClearFilters, showAllHref = '/shop', showButcher = false }) => {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scrollRevealed, setScrollRevealed] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const scrollRef = useRef(null)
  const { role } = useAuth()
  const { isFavourited, toggleFavourite } = useFavourites()
  const [showLoginPopup, setShowLoginPopup] = useState(false)

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/api/animals')
        const data = res.data
        if (data.success) {
          setAnimals(data.data.filter((a) => a.visibility !== false))
        } else {
          setError('Failed to load animals')
        }
      } catch {
        setError('Could not connect to server.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnimals()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setScrollRevealed(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (scrollRef.current) obs.observe(scrollRef.current)
    return () => obs.disconnect()
  }, [])

  const activeCategory =
    normalize(filters?.category) !== 'all'
      ? String(filters?.category || '').trim()
      : ''
  const activeSearch = String(filters?.search || '').trim()
  const activePrice = String(filters?.price || 'all').trim() || 'all'
  const activeWeight = String(filters?.weight || 'all').trim() || 'all'

  // Additional Smart Navigation filters
  const activeBreed = normalize(filters?.breed)
  const activeGender = normalize(filters?.gender)
  const activeCity = normalize(filters?.city)
  const activeStatus = normalize(filters?.status)
  const activeWeightRaw = normalize(filters?.weightRaw)

  const filteredAnimals = useMemo(() => {
    const catTarget = activeCategory ? normalize(activeCategory) : ''
    const pr = parseRange(activePrice)
    const wr = parseRange(activeWeight)
    const q = normalize(activeSearch)
    return (animals || []).filter((a) => {
      // 1. Basic Filters
      if (catTarget && normalize(a?.category) !== catTarget) return false
      if (pr) {
        const p = getPriceNumber(a)
        if (p < pr.min || p > pr.max) return false
      }
      if (wr) {
        const w = getWeightNumber(a)
        if (w == null || w < wr.min || w > wr.max) return false
      }

      // 2. Smart Navigation Filters (Strict matches)
      if (activeBreed && normalize(a?.breed) !== activeBreed) return false
      if (activeGender && normalize(a?.gender) !== activeGender) return false
      if (activeCity && normalize(a?.city) !== activeCity) return false
      if (activeStatus && normalize(a?.status) !== activeStatus) return false
      if (activeWeightRaw && normalize(a?.weight) !== activeWeightRaw) return false

      // 3. Search Filter
      if (q) {
        const hay = [
          normalize(a?.name),
          normalize(a?.shortDescription),
          normalize(a?.breed),
          String(getPriceNumber(a)),
        ].join(' ')
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [
    activeCategory,
    activePrice,
    activeSearch,
    activeWeight,
    activeBreed,
    activeGender,
    activeCity,
    activeStatus,
    activeWeightRaw,
    animals,
  ])

  const sortedAnimals = useMemo(
    () =>
      [...filteredAnimals].sort((a, b) => {
        if (a.listingType === 'featured' && b.listingType !== 'featured')
          return -1
        if (a.listingType !== 'featured' && b.listingType === 'featured')
          return 1
        return 0
      }),
    [filteredAnimals]
  )

  useEffect(() => {
    setIsSwitching(true)
    const t = setTimeout(() => setIsSwitching(false), 220)
    return () => clearTimeout(t)
  }, [activeCategory, activePrice, activeSearch, activeWeight])

  const totalCount = sortedAnimals.length
  const hasFilters =
    activeCategory ||
    activeSearch ||
    activePrice !== 'all' ||
    activeWeight !== 'all' ||
    activeBreed ||
    activeGender ||
    activeCity ||
    activeStatus ||
    activeWeightRaw

  return (
    <section className="cg-section">
      {/* Subtle BG */}
      <div className="cg-section-bg">
        <div className="cg-bg-glow cg-bg-glow--1"></div>
        <div className="cg-bg-glow cg-bg-glow--2"></div>
      </div>

      <div className="container-fluid px-lg-5">
        <div className="row">
          <div className="col-12">
            {/* Loading */}
            {loading && (
              <div className="cg-state">
                <div className="cg-state-icon">
                  <FaSpinner className="cg-spin" />
                </div>
                <h4>Loading Livestock</h4>
                <p>Finding the best animals for you...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="cg-state cg-state--err">
                <div className="cg-state-icon cg-state-icon--err">
                  <FaExclamationTriangle />
                </div>
                <h4>Something Went Wrong</h4>
                <p>{error}</p>
                <button
                  className="cg-state-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty — no animals */}
            {!loading && !error && totalCount === 0 && !hasFilters && (
              <div className="cg-state">
                <div className="cg-state-icon">
                  <FaShieldAlt />
                </div>
                <h4>No Animals Listed Yet</h4>
                <p>Check back soon for new listings</p>
              </div>
            )}

            {/* Empty — with filters */}
            {!loading && !error && totalCount === 0 && hasFilters && (
              <div className="cg-state">
                <div className="cg-state-icon">
                  <FaShieldAlt />
                </div>
                <h4>No Results Found</h4>
                <p>Try adjusting your filters</p>
                <div className="cg-state-actions">
                  <button
                    className="cg-state-btn"
                    onClick={() => onClearFilters?.()}
                  >
                    Clear Filters
                  </button>
                  <a
                    href={showAllHref}
                    className="cg-state-btn cg-state-btn--outline"
                  >
                    Browse All
                  </a>
                </div>
              </div>
            )}

            {/* Results */}
            {!loading && !error && totalCount > 0 && (
              <>
                {/* Filter Bar */}
                {hasFilters && (
                  <div className="cg-filter-bar">
                    <span className="cg-filter-count">
                      <strong>{totalCount}</strong> result
                      {totalCount !== 1 ? 's' : ''}
                    </span>

                    <div className="cg-filter-tags">
                      {activeCategory && (
                        <span className="cg-filter-tag">
                          {activeCategory}
                          <button onClick={() => onClearFilters?.()}>
                            <FaTimes />
                          </button>
                        </span>
                      )}
                      {activeSearch && (
                        <span className="cg-filter-tag">
                          "{activeSearch}"
                        </span>
                      )}
                      {activePrice !== 'all' && (
                        <span className="cg-filter-tag">
                          {priceLabel(activePrice)}
                        </span>
                      )}
                      {activeWeight !== 'all' && (
                        <span className="cg-filter-tag">
                          {weightLabel(activeWeight)}
                        </span>
                      )}
                      {activeBreed && (
                        <span className="cg-filter-tag">
                          Breed: {activeBreed}
                        </span>
                      )}
                      {activeGender && (
                        <span className="cg-filter-tag">
                          Gender: {activeGender}
                        </span>
                      )}
                      {activeCity && (
                        <span className="cg-filter-tag">
                          City: {activeCity}
                        </span>
                      )}
                      {activeStatus && (
                        <span className="cg-filter-tag">
                          Status: {activeStatus}
                        </span>
                      )}
                      {activeWeightRaw && (
                        <span className="cg-filter-tag">
                          Weight: {activeWeightRaw} KG
                        </span>
                      )}
                      <button
                        className="cg-filter-clear"
                        onClick={() => onClearFilters?.()}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid */}
                <div
                  className={`cg-grid ${isSwitching ? 'cg-grid--switching' : ''}`}
                >
                  {sortedAnimals.map((product, i) => {
                  const productId = product._id || product.id
                  const handleFavClick = () => {
                    if (role === 'guest') {
                      setShowLoginPopup(true)
                    } else {
                      toggleFavourite({ ...product, id: productId }, 'animal')
                    }
                  }
                  return (
                    <React.Fragment key={productId || i}>
                      <ProductCard
                        product={product}
                        index={i}
                        isAnimated={scrollRevealed}
                        isFav={isFavourited(productId, 'animal')}
                        onFavouriteClick={handleFavClick}
                      />
                      {showButcher && i === 7 && (
                        <div className="cg-full-width">
                          <ButcherSection />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
                  {showButcher && sortedAnimals.length > 0 && sortedAnimals.length <= 7 && (
                    <div className="cg-full-width">
                      <ButcherSection />
                    </div>
                  )}
                  <div ref={scrollRef} className="cg-scroll-trigger"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginRequiredPopup 
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Please login first to add to favourites"
      />
    </section>
  )
}

export default CardsGrid
