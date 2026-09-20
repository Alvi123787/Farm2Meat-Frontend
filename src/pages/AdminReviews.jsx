import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaRegStar, 
  FaStar, 
  FaStarHalfAlt, 
  FaSpinner, 
  FaTrashAlt, 
  FaEyeSlash, 
  FaEye, 
  FaCheckCircle, 
  FaSearch, 
  FaFilter 
} from 'react-icons/fa'
import '../css/AdminReviews.css'
import { reviewsService } from '../services/reviewsService'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { useAuth } from '../contexts/authContextCore'

const clampRating = (r) => {
  const v = Number(r)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(5, v))
}

const renderStars = (rating) => {
  const r = clampRating(rating)
  const full = Math.floor(r)
  const hasHalf = r - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)

  const stars = []
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`full-${i}`} className="arv-star arv-star--filled" />)
  if (hasHalf) stars.push(<FaStarHalfAlt key="half" className="arv-star arv-star--filled" />)
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`empty-${i}`} className="arv-star" />)
  return stars
}

const formatDate = (value) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AdminReviews() {
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [deletingId, setDeletingId] = useState('')
  const [togglingId, setTogglingId] = useState('')

  // Filters
  const [filterVerified, setFilterVerified] = useState('all') // 'all' | 'true' | 'false'
  const [filterHidden, setFilterHidden] = useState('all') // 'all' | 'true' | 'false'
  const [searchTerm, setSearchTerm] = useState('')

  const load = useCallback(async ({ signal } = {}) => {
    if (authLoading) return

    setLoading(true)
    setError('')
    try {
      const result = await reviewsService.getAdminReviews({
        signal,
        verifiedOnly: filterVerified,
        hidden: filterHidden,
        search: searchTerm.trim()
      })
      setReviews(Array.isArray(result?.data) ? result.data : [])
    } catch (err) {
      if (err?.name === 'AbortError') return

      if (err?.code === 'UNAUTHORIZED' || err?.response?.status === 401) {
        if (!authLoading) {
          navigate('/login')
        }
        return
      }

      setError(err?.message || 'Failed to load reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [navigate, authLoading, filterVerified, filterHidden, searchTerm])

  useEffect(() => {
    if (authLoading) return

    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [load, authLoading])

  useAdminLiveRefresh(() => load({}), {
    intervalMs: 15000,
    enabled: false
  })

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [reviews])

  const verifiedCount = useMemo(() => {
    return reviews.filter(r => r.isVerifiedPurchase).length
  }, [reviews])

  const handleDelete = async (review) => {
    const id = String(review?._id || '').trim()
    if (!id || deletingId) return
    const ok = window.confirm(`Delete review by "${review?.name || 'Customer'}"? This action cannot be undone.`)
    if (!ok) return

    setDeletingId(id)
    try {
      await reviewsService.remove(id)
      setReviews((prev) => prev.filter((r) => String(r?._id || '') !== id))
    } catch (err) {
      if (err?.code === 'UNAUTHORIZED') {
        if (!authLoading) navigate('/login')
        return
      }
      setError(err?.message || 'Failed to delete review')
    } finally {
      setDeletingId('')
    }
  }

  const handleToggleHidden = async (review) => {
    const id = String(review?._id || '').trim()
    if (!id || togglingId) return

    setTogglingId(id)
    try {
      const result = await reviewsService.toggleHidden(id)
      setReviews((prev) => prev.map((r) =>
        String(r?._id || '') === id ? { ...r, hidden: result?.data?.hidden ?? !r.hidden } : r
      ))
    } catch (err) {
      if (err?.code === 'UNAUTHORIZED') {
        if (!authLoading) navigate('/login')
        return
      }
      setError(err?.message || 'Failed to update review')
    } finally {
      setTogglingId('')
    }
  }

  if (authLoading) {
    return (
      <div className="arv-page">
        <div className="arv-state">
          <FaSpinner className="arv-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="arv-page">
      {/* ── Top Header ── */}
      <header className="arv-header">
        <div className="arv-header-left">
          <h1 className="arv-title">Review Management</h1>
          <p className="arv-subtitle">Verify, moderate, and monitor authentic customer product reviews.</p>
        </div>
        <div className="arv-header-right">
          <div className="arv-count">
            <span className="arv-count-label">Total</span>
            <span className="arv-count-value">{reviews.length}</span>
          </div>
          <div className="arv-count arv-count--verified">
            <span className="arv-count-label">Verified</span>
            <span className="arv-count-value">{verifiedCount}</span>
          </div>
          <button className="arv-refresh" type="button" onClick={() => load({})} disabled={loading || authLoading}>
            Refresh
          </button>
        </div>
      </header>

      {/* ── Filters & Search Toolbar ── */}
      <div className="arv-toolbar">
        <div className="arv-search-box">
          <FaSearch className="arv-search-icon" />
          <input
            type="text"
            className="arv-search-input"
            placeholder="Search by customer, product, order ID, or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="arv-filter-group">
          <div className="arv-select-wrap">
            <FaFilter className="arv-filter-icon" />
            <select
              className="arv-select"
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
            >
              <option value="all">All Purchases</option>
              <option value="true">Verified Purchases Only</option>
              <option value="false">Unverified Reviews</option>
            </select>
          </div>

          <div className="arv-select-wrap">
            <select
              className="arv-select"
              value={filterHidden}
              onChange={(e) => setFilterHidden(e.target.value)}
            >
              <option value="all">All Visibility</option>
              <option value="false">Visible Reviews</option>
              <option value="true">Hidden Reviews</option>
            </select>
          </div>
        </div>
      </div>

      {loading && !authLoading && (
        <div className="arv-state">
          <FaSpinner className="arv-spin" />
          <span>Loading reviews...</span>
        </div>
      )}

      {!loading && !authLoading && error && (
        <div className="arv-error">
          <span>{error}</span>
        </div>
      )}

      {!loading && !authLoading && !error && reviews.length === 0 && (
        <div className="arv-empty">
          <span>No reviews found matching the selected criteria.</span>
        </div>
      )}

      {!loading && !authLoading && !error && reviews.length > 0 && (
        <div className="arv-table-wrap">
          <div className="arv-table">
            <div className="arv-row arv-row--head">
              <div className="arv-cell arv-cell--customer">Customer</div>
              <div className="arv-cell arv-cell--product">Product & Order</div>
              <div className="arv-cell arv-cell--rating">Rating</div>
              <div className="arv-cell arv-cell--message">Review Message</div>
              <div className="arv-cell arv-cell--date">Date</div>
              <div className="arv-cell arv-cell--actions">Actions</div>
            </div>

            {sorted.map((r) => {
              const customerName = r.user?.fullName || r.name || 'Customer'
              const customerEmail = r.user?.email || r.email || ''
              const productName = r.product?.name || r.productName || 'General Feedback'
              const orderRef = r.order?.inquiryId || r.orderId || ''

              return (
                <div 
                  key={r._id} 
                  className={`arv-row ${deletingId === r._id ? 'arv-row--deleting' : ''} ${r.hidden ? 'arv-row--hidden' : ''}`}
                >
                  {/* Customer Column */}
                  <div className="arv-cell arv-cell--customer">
                    <div className="arv-user">
                      <div className="arv-avatar">{String(customerName).trim().slice(0, 2).toUpperCase()}</div>
                      <div className="arv-user-meta">
                        <div className="arv-user-name">{customerName}</div>
                        {customerEmail && (
                          <div className="arv-user-email">{customerEmail}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product & Order Column with Verified Badge */}
                  <div className="arv-cell arv-cell--product">
                    <div className="arv-product-meta">
                      <div className="arv-product-name">{productName}</div>
                      <div className="arv-badge-row">
                        {r.isVerifiedPurchase ? (
                          <span className="arv-badge arv-badge--verified" title="Delivered Order Verified">
                            <FaCheckCircle /> Verified Purchase
                          </span>
                        ) : (
                          <span className="arv-badge arv-badge--unverified" title="Legacy / Unverified review">
                            Unverified
                          </span>
                        )}
                        {orderRef && (
                          <span className="arv-order-chip" title="Linked Order">
                            {orderRef}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Column */}
                  <div className="arv-cell arv-cell--rating">
                    <div className="arv-stars">{renderStars(r.rating)}</div>
                    <span className="arv-rating-num">{r.rating}/5</span>
                  </div>

                  {/* Message Column */}
                  <div className="arv-cell arv-cell--message">
                    <div className="arv-message">{r.comment || r.text}</div>
                  </div>

                  {/* Date Column */}
                  <div className="arv-cell arv-cell--date">
                    <span className="arv-date">{formatDate(r.createdAt)}</span>
                  </div>

                  {/* Actions Column */}
                  <div className="arv-cell arv-cell--actions">
                    <button
                      className={`arv-toggle ${r.hidden ? 'arv-toggle--hidden' : ''}`}
                      type="button"
                      onClick={() => handleToggleHidden(r)}
                      disabled={Boolean(togglingId) || authLoading}
                      title={r.hidden ? "Unhide review" : "Hide review"}
                    >
                      {r.hidden ? <FaEye /> : <FaEyeSlash />}
                      <span>{r.hidden ? "Unhide" : "Hide"}</span>
                    </button>
                    <button
                      className="arv-del"
                      type="button"
                      onClick={() => handleDelete(r)}
                      disabled={Boolean(deletingId) || authLoading}
                      title="Delete review"
                    >
                      <FaTrashAlt />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}