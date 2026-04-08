import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaQuoteLeft, FaRegStar, FaStar, FaStarHalfAlt, FaMapMarkerAlt, FaArrowRight, FaSpinner } from 'react-icons/fa'
import '../css/ReviewsSection.css'
import { reviewsService } from '../services/reviewsService'

const clampRating = (r) => {
  const v = Number(r)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(5, v))
}

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  return (first + last).toUpperCase()
}

const renderStars = (rating) => {
  const r = clampRating(rating)
  const full = Math.floor(r)
  const hasHalf = r - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)

  const stars = []
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`full-${i}`} className="rv-star rv-star-filled" />)
  if (hasHalf) stars.push(<FaStarHalfAlt key="half" className="rv-star rv-star-filled" />)
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`empty-${i}`} className="rv-star" />)
  return stars
}

const ReviewsSection = ({ mode = 'home', limit = 4, hideWhenEmpty = true } = {}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await reviewsService.getAll()
        if (isMounted) {
          setReviews(Array.isArray(result?.data) ? result.data : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to load reviews')
          setReviews([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setLoaded(true)
        }
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  const total = reviews.length
  const isHome = mode === 'home'
  const showLimit = isHome ? Number(limit || 4) : null

  const visibleReviews = useMemo(() => {
    if (!showLimit) return reviews
    return reviews.slice(0, showLimit)
  }, [reviews, showLimit])

  const shouldShowReadAll = isHome && total > (showLimit || 0)

  if (!loading && !error && total === 0 && hideWhenEmpty) return null

  return (
    <section className={`rv-section ${loaded ? 'rv-section--loaded' : ''}`}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">

            {/* ── Header ── */}
            <span className="rv-badge">REVIEWS</span>
            <h2 className="rv-title">
              {isHome ? (
                <>
                  What Our <span className="rv-title-highlight">Customers Say</span>
                </>
              ) : (
                <>
                  All <span className="rv-title-highlight">Customer Reviews</span>
                </>
              )}
            </h2>
            <p className="rv-subtitle">
              {isHome
                ? 'RYK ke mutmaen customers ki apni zubani — jo bharosa kiya, wo raha sahi!'
                : `Showing ${total} review${total === 1 ? '' : 's'} from customers.`}
            </p>
            <div className="rv-title-divider">
              <span className="rv-divider-dot"></span>
              <span className="rv-divider-line"></span>
              <span className="rv-divider-dot"></span>
            </div>

            {loading && (
              <div className="rv-loading">
                <FaSpinner className="rv-loading-spinner" />
                <p>Loading reviews...</p>
              </div>
            )}

            {error && !loading && (
              <div className="rv-error">
                <p>{error}</p>
              </div>
            )}

            {/* ── Review Cards Grid ── */}
            {!loading && !error && total > 0 && (
              <div className={`rv-grid ${visibleReviews.length < 4 ? 'rv-grid--center' : ''}`}>
                {visibleReviews.map((review, idx) => (
                  <div
                    className="rv-card rv-card--enter"
                    key={review._id || `${review.name}-${idx}`}
                    style={{ animationDelay: `${0.08 * idx}s` }}
                  >

                    {/* Quote Icon */}
                    <div className="rv-quote-icon">
                      <FaQuoteLeft />
                    </div>

                    {/* Stars */}
                    <div className="rv-stars">
                      {renderStars(review.rating)}
                    </div>

                    {/* Review Text */}
                    <p className="rv-text">"{review.text}"</p>

                    {/* Divider */}
                    <div className="rv-divider"></div>

                    {/* Customer Info */}
                    <div className="rv-customer">
                      <div className="rv-avatar">
                        <span>{getInitials(review.name)}</span>
                      </div>
                      <div className="rv-info">
                        <h4 className="rv-name">{review.name}</h4>
                        {review.location && (
                          <p className="rv-location">
                            <FaMapMarkerAlt className="rv-loc-icon" />
                            {review.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Decorative Corner */}
                    <div className="rv-corner-accent"></div>
                  </div>
                ))}
              </div>
            )}

            {/* ── View All Button ── */}
            {shouldShowReadAll && (
              <button
                type="button"
                className="rv-view-all-btn"
                onClick={() => navigate('/all-reviews')}
              >
                <span className="rv-btn-text">Read All Reviews</span>
                <FaArrowRight className="rv-btn-arrow" />
              </button>
            )}

            {/* ── Trust Line ── */}
            {!loading && !error && total > 0 && (
              <div className="rv-trust-line">
                <span className="rv-trust-icon">⭐</span>
                <span className="rv-trust-text">
                  {total}+ customer review{total === 1 ? '' : 's'} shared
                </span>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}

export default ReviewsSection
