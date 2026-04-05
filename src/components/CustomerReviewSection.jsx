import React, { useEffect, useMemo, useState } from 'react';
import { FaPaperPlane, FaRegStar, FaStar, FaStarHalfAlt, FaSpinner, FaUser, FaCalendarAlt } from 'react-icons/fa';
import '../css/CustomerReviewSection.css';
import { reviewsService } from '../services/reviewsService';

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

const renderStars = (rating) => {
  const r = clampRating(rating);
  const full = Math.floor(r);
  const hasHalf = r - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  const stars = [];
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`full-${i}`} className="cr-star cr-star--filled" />);
  if (hasHalf) stars.push(<FaStarHalfAlt key="half" className="cr-star cr-star--filled" />);
  for (let i = 0; i < empty; i++) stars.push(<FaRegStar key={`empty-${i}`} className="cr-star" />);
  return stars;
};

export default function CustomerReviewSection({
  title = 'Customer Reviews',
  subtitle = 'Share your experience with our website. Your feedback helps us improve.',
  hideWhenEmpty = false,
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: '', rating: 0, text: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await reviewsService.getAll({ signal: controller.signal });
        setReviews(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Failed to load reviews');
        setReviews([]);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const total = reviews.length;

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [reviews]);

  const visibleRating = hoverRating || form.rating;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess('');
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = String(form.name || '').trim();
    const text = String(form.text || '').trim();
    const rating = Number(form.rating);

    if (!name) return setError('Please enter your name.');
    if (!text) return setError('Please write a review message.');
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return setError('Please select a rating (1–5).');

    setSubmitting(true);
    try {
      const result = await reviewsService.create({ name, rating, text });
      const created = result?.data;
      if (created) setReviews((prev) => [created, ...prev]);
      setForm({ name: '', rating: 0, text: '' });
      setHoverRating(0);
      setSuccess('Thanks! Your review has been submitted.');
    } catch (err) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !error && total === 0 && hideWhenEmpty) return null;

  return (
    <section className={`cr-section ${loaded ? 'cr-section--loaded' : ''}`}>
      <div className="cr-container">
        <div className="cr-header">
          <div className="cr-badge">Share Your Thoughts</div>
          <h2 className="cr-title">{title}</h2>
          <p className="cr-subtitle">{subtitle}</p>
        </div>

        <div className="cr-grid">
          {/* Review Form */}
          <div className="cr-form-card">
            <h3 className="cr-form-title">Write a Review</h3>
            <form className="cr-form" onSubmit={handleSubmit}>
              <div className="cr-form-group">
                <label className="cr-label">
                  <FaUser className="cr-label-icon" />
                  Your Name
                </label>
                <input
                  className="cr-input"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g., Ahmed Khan"
                  autoComplete="name"
                />
              </div>

              <div className="cr-form-group">
                <label className="cr-label">Rating</label>
                <div className="cr-stars-input" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`cr-star-btn ${visibleRating >= n ? 'cr-star-btn--active' : ''}`}
                      onMouseEnter={() => setHoverRating(n)}
                      onClick={() => setField('rating', n)}
                      aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
                    >
                      <FaStar />
                    </button>
                  ))}
                  <span className="cr-rating-text">
                    {form.rating ? `${form.rating}/5` : 'Select rating'}
                  </span>
                </div>
              </div>

              <div className="cr-form-group">
                <label className="cr-label">Your Review</label>
                <textarea
                  className="cr-textarea"
                  rows={4}
                  value={form.text}
                  onChange={(e) => setField('text', e.target.value)}
                  placeholder="Share your experience with us..."
                />
              </div>

              {error && <div className="cr-alert cr-alert--error">{error}</div>}
              {success && <div className="cr-alert cr-alert--success">{success}</div>}

              <button className="cr-submit" type="submit" disabled={submitting}>
                {submitting ? <FaSpinner className="cr-submit-spinner" /> : <FaPaperPlane />}
                <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="cr-list-card">
            <div className="cr-list-header">
              <h3 className="cr-list-title">Recent Reviews</h3>
              <span className="cr-list-count">{total} review{total !== 1 ? 's' : ''}</span>
            </div>

            {loading && (
              <div className="cr-state">
                <FaSpinner className="cr-state-spinner" />
                <p>Loading reviews...</p>
              </div>
            )}

            {!loading && error && (
              <div className="cr-state cr-state--error">
                <p>Unable to load reviews. Please try again later.</p>
              </div>
            )}

            {!loading && !error && total === 0 && (
              <div className="cr-state cr-state--empty">
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            )}

            {!loading && !error && total > 0 && (
              <div className="cr-reviews-grid">
                {sorted.map((r, idx) => (
                  <div
                    key={r._id || `${r.name}-${idx}`}
                    className="cr-review-card"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="cr-review-header">
                      <div className="cr-avatar">{getInitials(r.name)}</div>
                      <div className="cr-review-meta">
                        <h4 className="cr-review-name">{r.name}</h4>
                        <div className="cr-review-stars">{renderStars(r.rating)}</div>
                      </div>
                      {r.createdAt && (
                        <div className="cr-review-date">
                          <FaCalendarAlt className="cr-date-icon" />
                          {formatDate(r.createdAt)}
                        </div>
                      )}
                    </div>
                    <p className="cr-review-text">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
