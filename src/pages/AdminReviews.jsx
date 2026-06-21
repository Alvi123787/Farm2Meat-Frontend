import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaRegStar, FaStar, FaStarHalfAlt, FaSpinner, FaTrashAlt } from 'react-icons/fa'
import '../css/AdminReviews.css'
import { reviewsService } from '../services/reviewsService'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { useAuth } from '../contexts/authContextCore' // ✅ Step 1: Import useAuth

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
  const { loading: authLoading } = useAuth() // ✅ Step 1: Auth ready hone ka wait karo
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [deletingId, setDeletingId] = useState('')

  const load = useCallback(async ({ signal } = {}) => {
    // ✅ Step 2 & Bonus: Early returns for auth loading
    if (authLoading) return // ⛔ wait for auth
    
    setLoading(true)
    setError('')
    try {
      const result = await reviewsService.getAll({ signal })
      setReviews(Array.isArray(result?.data) ? result.data : [])
    } catch (err) {
      // ✅ Bonus Improvement: Ignore abort errors
      if (err?.name === 'AbortError') return
      
      // ✅ Step 4: Don't redirect immediately - check auth state first
      if (err?.code === 'UNAUTHORIZED') {
        // agar auth ready hai tabhi redirect karo
        if (!authLoading) {
          navigate('/login')
        }
        return
      }
      
      // ✅ Bonus: Ignore early auth errors
      if (authLoading) return
      
      setError(err?.message || 'Failed to load reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [navigate, authLoading])

  // ✅ Step 2: useEffect guard karo
  useEffect(() => {
    if (authLoading) return // ⛔ wait for auth
    
    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [load, authLoading])

  // ✅ Step 3: Live refresh disabled (only manual refresh)
  useAdminLiveRefresh(() => load({}), { 
    intervalMs: 8000, 
    enabled: false
  })

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [reviews])

  const handleDelete = async (review) => {
    const id = String(review?._id || '').trim()
    if (!id || deletingId) return
    const ok = window.confirm(`Delete review by "${review?.name || 'Unknown'}"?`)
    if (!ok) return

    setDeletingId(id)
    try {
      await reviewsService.remove(id)
      setReviews((prev) => prev.filter((r) => String(r?._id || '') !== id))
    } catch (err) {
      // ✅ Step 4: Handle unauthorized in delete as well
      if (err?.code === 'UNAUTHORIZED') {
        if (!authLoading) {
          navigate('/login')
        }
        return
      }
      setError(err?.message || 'Failed to delete review')
    } finally {
      setDeletingId('')
    }
  }

  // ✅ Show auth loading state
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
      <header className="arv-header">
        <div className="arv-header-left">
          <h1 className="arv-title">Reviews</h1>
          <p className="arv-subtitle">Manage customer website reviews.</p>
        </div>
        <div className="arv-header-right">
          <div className="arv-count">
            <span className="arv-count-label">Total</span>
            <span className="arv-count-value">{reviews.length}</span>
          </div>
          <button className="arv-refresh" type="button" onClick={() => load({})} disabled={loading || authLoading}>
            Refresh
          </button>
        </div>
      </header>

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
          <span>No reviews yet.</span>
        </div>
      )}

      {!loading && !authLoading && !error && reviews.length > 0 && (
        <div className="arv-table-wrap">
          <div className="arv-table">
            <div className="arv-row arv-row--head">
              <div className="arv-cell arv-cell--name">User</div>
              <div className="arv-cell arv-cell--rating">Rating</div>
              <div className="arv-cell arv-cell--message">Message</div>
              <div className="arv-cell arv-cell--date">Date</div>
              <div className="arv-cell arv-cell--actions">Actions</div>
            </div>

            {sorted.map((r) => (
              <div key={r._id} className={`arv-row ${deletingId === r._id ? 'arv-row--deleting' : ''}`}>
                <div className="arv-cell arv-cell--name">
                  <div className="arv-user">
                    <div className="arv-avatar">{String(r.name || '?').trim().slice(0, 2).toUpperCase()}</div>
                    <div className="arv-user-meta">
                      <div className="arv-user-name">{r.name}</div>
                      {r.orderId ? (
                        <div className="arv-order-tag" title="Order feedback">
                          Order: {r.orderId}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="arv-cell arv-cell--rating">
                  <div className="arv-stars">{renderStars(r.rating)}</div>
                </div>

                <div className="arv-cell arv-cell--message">
                  <div className="arv-message">{r.text}</div>
                </div>

                <div className="arv-cell arv-cell--date">
                  <span className="arv-date">{formatDate(r.createdAt)}</span>
                </div>

                <div className="arv-cell arv-cell--actions">
                  <button
                    className="arv-del"
                    type="button"
                    onClick={() => handleDelete(r)}
                    disabled={Boolean(deletingId) || authLoading}
                    aria-label="Delete review"
                  >
                    <FaTrashAlt />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}