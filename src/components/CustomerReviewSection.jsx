import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CustomerReviewSection.css';
import { reviewsService } from '../services/reviewsService';
import { useAuth } from '../contexts/authContextCore';

const clampRating = (r) => {
  const v = Number(r);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(5, v));
};

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '';
  return (first + last).toUpperCase();
};

const formatDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: '2-digit' });
};

const StarDisplay = ({ rating }) => {
  const r = clampRating(rating);
  return (
    <div className="cr-star-display" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`cr-ds ${r >= n ? 'cr-ds--on' : ''}`} aria-hidden="true">★</span>
      ))}
    </div>
  );
};

export default function CustomerReviewSection({
  productId = null,
  productType = 'livestock',
  productName = '',
  title = 'Customer Reviews',
  subtitle = 'Genuine reviews from verified customers who purchased our farm products.',
  hideWhenEmpty = false,
}) {
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0, verifiedCount: 0 });

  // Eligibility state
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibility, setEligibility] = useState({
    canReview: false,
    reason: null,
    message: '',
    eligibleOrders: []
  });

  // Review Form
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [form, setForm] = useState({ rating: 0, text: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // 1. Fetch Reviews (Product-specific if productId provided, else all)
  const fetchReviews = async (signal) => {
    try {
      setLoading(true);
      setError('');
      if (productId) {
        const result = await reviewsService.getByProduct(productId, { signal });
        setReviews(Array.isArray(result?.data) ? result.data : []);
        if (result?.stats) setStats(result.stats);
      } else {
        const result = await reviewsService.getAll({ signal });
        const list = Array.isArray(result?.data) ? result.data : [];
        setReviews(list);
        const verified = list.filter((r) => r.isVerifiedPurchase);
        const avg = list.length > 0 ? (list.reduce((acc, r) => acc + (r.rating || 0), 0) / list.length) : 0;
        setStats({
          averageRating: Math.round(avg * 10) / 10,
          reviewCount: list.length,
          verifiedCount: verified.length
        });
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  // 2. Check Eligibility if user is logged in & viewing a product
  const checkUserEligibility = async (signal) => {
    if (!productId) {
      setEligibility({ canReview: false, reason: null, message: '', eligibleOrders: [] });
      return;
    }

    if (!token) {
      setEligibility({
        canReview: false,
        reason: 'not_logged_in',
        message: 'Only verified customers who have purchased this product can leave a review.',
        eligibleOrders: []
      });
      return;
    }

    try {
      setEligibilityLoading(true);
      const res = await reviewsService.checkEligibility(productId, { signal });
      if (res.canReview) {
        setEligibility({
          canReview: true,
          reason: null,
          message: res.message || 'You are eligible to review this verified purchase.',
          eligibleOrders: res.eligibleOrders || []
        });
        if (res.eligibleOrders?.length > 0) {
          setSelectedOrderId(res.eligibleOrders[0].inquiryId || res.eligibleOrders[0]._id);
        }
      } else {
        setEligibility({
          canReview: false,
          reason: res.reason || 'not_purchased',
          message: res.message || 'Only verified customers who have purchased this product can leave a review.',
          eligibleOrders: []
        });
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setEligibility({
        canReview: false,
        reason: 'error',
        message: err?.response?.data?.message || 'Unable to check review eligibility.',
        eligibleOrders: []
      });
    } finally {
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(controller.signal);
    if (!authLoading) {
      checkUserEligibility(controller.signal);
    }
    return () => controller.abort();
  }, [productId, token, authLoading]);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [reviews]
  );

  const visibleRating = hoverRating || form.rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const text = String(form.text || '').trim();
    const rating = Number(form.rating);

    if (!rating || rating < 1 || rating > 5) {
      return setError('Please select a star rating (1–5).');
    }
    if (!text || text.length < 3) {
      return setError('Please write a review message (at least 3 characters).');
    }
    if (productId && !selectedOrderId) {
      return setError('Please select your delivered order.');
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await reviewsService.submitVerifiedReview({
        productId,
        orderId: selectedOrderId,
        rating,
        comment: text
      });

      const created = result?.data;
      if (created) {
        setReviews((prev) => [created, ...prev]);
        setStats((prev) => ({
          ...prev,
          reviewCount: (prev.reviewCount || 0) + 1,
          verifiedCount: (prev.verifiedCount || 0) + 1
        }));
      }

      setForm({ rating: 0, text: '' });
      setHoverRating(0);
      setSuccess('Thank you! Your verified purchase review has been published.');
      setEligibility((prev) => ({
        ...prev,
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have submitted a verified review for this purchase.'
      }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !error && reviews.length === 0 && hideWhenEmpty) return null;

  return (
    <section className={`cr${loaded ? ' cr--loaded' : ''}`}>
      <div className="cr-wrap">

        {/* Header */}
        <header className="cr-hdr">
          <p className="cr-kicker">
            <span className="cr-kicker-line" />
            Verified Customer Reviews
            <span className="cr-kicker-line" />
          </p>
          <h2 className="cr-title">
            {title.split(' ').slice(0, -1).join(' ')} <em>{title.split(' ').slice(-1)}</em>
          </h2>
          <p className="cr-sub">{subtitle}</p>

          {/* Rating Summary Bar */}
          {stats.reviewCount > 0 && (
            <div className="cr-summary-pill">
              <span className="cr-summary-score">{stats.averageRating}</span>
              <div className="cr-summary-stars">
                <StarDisplay rating={stats.averageRating} />
              </div>
              <span className="cr-summary-counts">
                Based on {stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}
                {stats.verifiedCount > 0 && (
                  <span className="cr-summary-verified-tag">
                    • {stats.verifiedCount} Verified {stats.verifiedCount === 1 ? 'Purchase' : 'Purchases'}
                  </span>
                )}
              </span>
            </div>
          )}
        </header>

        <div className="cr-divider" aria-hidden="true">
          <span /><span className="cr-divider-gem" /><span />
        </div>

        <div className="cr-grid">

          {/* ── Left panel: Write a Review or Eligibility Prompt ── */}
          <div className="cr-panel">
            <div className="cr-panel-head">
              <p className="cr-panel-eyebrow">Customer Feedback</p>
              <h3 className="cr-panel-title">Write a Review</h3>
            </div>

            {/* Case A: User has eligible delivered order -> Show form */}
            {eligibility.canReview ? (
              <form className="cr-form" onSubmit={handleSubmit} noValidate>
                {/* Order Selector (if customer purchased product multiple times) */}
                {eligibility.eligibleOrders.length > 1 && (
                  <div className="cr-field">
                    <label className="cr-label" htmlFor="cr-order-select">
                      Select Delivered Order
                    </label>
                    <select
                      id="cr-order-select"
                      className="cr-input cr-select"
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                    >
                      {eligibility.eligibleOrders.map((ord) => (
                        <option key={ord._id} value={ord.inquiryId || ord._id}>
                          Order {ord.inquiryId || ord.orderGroupId} ({formatDate(ord.date)}) — Delivered
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating Stars */}
                <div className="cr-field">
                  <label className="cr-label">
                    Rating <span className="cr-req">*</span>
                  </label>
                  <div
                    className="cr-star-row"
                    onMouseLeave={() => setHoverRating(0)}
                    role="group"
                    aria-label="Star rating"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`cr-sstar${visibleRating >= n ? ' cr-sstar--on' : ''}`}
                        onMouseEnter={() => setHoverRating(n)}
                        onClick={() => setForm((prev) => ({ ...prev, rating: n }))}
                        aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
                      >★</button>
                    ))}
                    <span className="cr-star-txt">
                      {form.rating ? `${form.rating} / 5 Stars` : 'Select rating'}
                    </span>
                  </div>
                </div>

                {/* Review Textarea */}
                <div className="cr-field">
                  <label className="cr-label" htmlFor="cr-text">
                    Your Review <span className="cr-req">*</span>
                  </label>
                  <textarea
                    id="cr-text"
                    className="cr-textarea"
                    rows={4}
                    value={form.text}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, text: e.target.value }));
                      if (error) setError('');
                      if (success) setSuccess('');
                    }}
                    placeholder={`Tell us about your experience with ${productName || 'this product'}...`}
                    maxLength={1000}
                  />
                  <div className="cr-char-count">
                    {form.text.length}/1000
                  </div>
                </div>

                {/* Verified Purchase Notice */}
                <div className="cr-verified-prompt-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>This review will be published with a <strong>Verified Purchase</strong> badge.</span>
                </div>

                {error && <div className="cr-alert cr-alert--err" role="alert">{error}</div>}
                {success && <div className="cr-alert cr-alert--ok" role="status">{success}</div>}

                <button className="cr-submit" type="submit" disabled={submitting}>
                  {submitting ? (
                    <svg className="cr-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  )}
                  <span>{submitting ? 'Submitting…' : 'Submit Verified Review'}</span>
                </button>
              </form>
            ) : (
              /* Case B: User cannot review -> Show clear, friendly explanation */
              <div className="cr-eligibility-box">
                {eligibilityLoading ? (
                  <div className="cr-state">
                    <svg className="cr-spin cr-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    <p>Checking purchase verification...</p>
                  </div>
                ) : eligibility.reason === 'not_logged_in' ? (
                  <div className="cr-elig-card">
                    <div className="cr-elig-icon cr-elig-icon--lock">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <h4>Verified Customers Only</h4>
                    <p>Only customers who have purchased and received this product can leave a review. Please log in to your account to review your purchase.</p>
                    <button
                      type="button"
                      className="cr-login-btn"
                      onClick={() => navigate('/login')}
                    >
                      Log In to Review
                    </button>
                  </div>
                ) : eligibility.reason === 'not_delivered' ? (
                  <div className="cr-elig-card">
                    <div className="cr-elig-icon cr-elig-icon--truck">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13"/>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </div>
                    <h4>Order In Progress</h4>
                    <p>We found your order for this item, but it has not been delivered yet. You will be able to review this product once your order is delivered!</p>
                  </div>
                ) : eligibility.reason === 'already_reviewed' ? (
                  <div className="cr-elig-card cr-elig-card--success">
                    <div className="cr-elig-icon cr-elig-icon--check">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <h4>Review Published</h4>
                    <p>Thank you! You have already submitted a verified review for this purchase.</p>
                  </div>
                ) : (
                  <div className="cr-elig-card">
                    <div className="cr-elig-icon cr-elig-icon--shield">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h4>Verified Purchase Required</h4>
                    <p>Only verified customers who have purchased this product can leave a review. To maintain honest reviews, spam or unverified submissions are not accepted.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right panel: Reviews list ── */}
          <div className="cr-rev-panel">
            <div className="cr-rev-head">
              <h3 className="cr-rev-title">Recent Reviews</h3>
              <span className="cr-rev-count">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="cr-rev-body">
              {loading && (
                <div className="cr-state">
                  <svg className="cr-spin cr-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <p>Loading genuine reviews…</p>
                </div>
              )}

              {!loading && error && (
                <div className="cr-state cr-state--err" role="alert">
                  <p>Unable to load reviews. Please try again later.</p>
                </div>
              )}

              {!loading && !error && reviews.length === 0 && (
                <div className="cr-state">
                  <p>No reviews yet for this item. Verified buyers can share their experience after delivery.</p>
                </div>
              )}

              {!loading && !error && sorted.map((r, idx) => (
                <article
                  key={r._id || `${r.name}-${idx}`}
                  className="cr-rc"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="cr-rc-top">
                    <div className="cr-avatar">{getInitials(r.name)}</div>
                    <div className="cr-rc-meta">
                      <div className="cr-rc-header-line">
                        <h4 className="cr-rc-name">{r.name}</h4>
                        {r.isVerifiedPurchase && (
                          <span className="cr-verified-badge" title="Verified Customer Purchase">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="cr-rc-rating-line">
                        <StarDisplay rating={r.rating} />
                        <span className="cr-rc-date">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="cr-rc-text">{r.comment || r.text}</p>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}