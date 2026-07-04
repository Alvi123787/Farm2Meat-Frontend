import React, { useEffect, useMemo, useState } from 'react';
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
  title = 'Customer Reviews',
  subtitle = 'Your feedback shapes the way we serve. We read every word.',
  hideWhenEmpty = false,
}) {
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [reviews, setReviews]     = useState([]);
  const [form, setForm]           = useState({ name: '', rating: 0, text: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [loaded, setLoaded]       = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
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
    })();
    return () => controller.abort();
  }, []);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [reviews]
  );

  const visibleRating = hoverRating || form.rating;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess('');
    if (error)   setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const name   = String(form.name || '').trim();
    const text   = String(form.text || '').trim();
    const rating = Number(form.rating);
    if (!name) return setError('Please enter your name.');
    if (!text) return setError('Please write a review message.');
    if (!Number.isFinite(rating) || rating < 1 || rating > 5)
      return setError('Please select a rating (1–5).');
    setSubmitting(true);
    try {
      const result = await reviewsService.create({ name, rating, text });
      const created = result?.data;
      if (created) setReviews((prev) => [created, ...prev]);
      setForm({ name: '', rating: 0, text: '' });
      setHoverRating(0);
      setSuccess('Thank you — your review has been published.');
    } catch (err) {
      setError(err?.message || 'Failed to submit review');
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
            Share Your Experience
            <span className="cr-kicker-line" />
          </p>
          <h2 className="cr-title">{title.split(' ').slice(0, -1).join(' ')} <em>{title.split(' ').slice(-1)}</em></h2>
          <p className="cr-sub">{subtitle}</p>
        </header>

        <div className="cr-divider" aria-hidden="true">
          <span /><span className="cr-divider-gem" /><span />
        </div>

        <div className="cr-grid">

          {/* ── Form panel ── */}
          <div className="cr-panel">
            <div className="cr-panel-head">
              <p className="cr-panel-eyebrow">Leave a note</p>
              <h3 className="cr-panel-title">Write a Review</h3>
            </div>
            <form className="cr-form" onSubmit={handleSubmit} noValidate>

              <div className="cr-field">
                <label className="cr-label" htmlFor="cr-name">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Your Name
                </label>
                <input
                  id="cr-name"
                  className="cr-input"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Ahmed Khan"
                  autoComplete="name"
                />
              </div>

              <div className="cr-field">
                <label className="cr-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Rating
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
                      onClick={() => setField('rating', n)}
                      aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
                    >★</button>
                  ))}
                  <span className="cr-star-txt">
                    {form.rating ? `${form.rating} / 5` : 'Select rating'}
                  </span>
                </div>
              </div>

              <div className="cr-field">
                <label className="cr-label" htmlFor="cr-text">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Your Review
                </label>
                <textarea
                  id="cr-text"
                  className="cr-textarea"
                  rows={4}
                  value={form.text}
                  onChange={(e) => setField('text', e.target.value)}
                  placeholder="Share your experience with us…"
                />
              </div>

              {error   && <div className="cr-alert cr-alert--err" role="alert">{error}</div>}
              {success && <div className="cr-alert cr-alert--ok"  role="status">{success}</div>}

              <button className="cr-submit" type="submit" disabled={submitting}>
                {submitting ? (
                  <svg className="cr-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                )}
                <span>{submitting ? 'Submitting…' : 'Submit Review'}</span>
              </button>
            </form>
          </div>

          {/* ── Reviews panel ── */}
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
                  <p>Loading reviews…</p>
                </div>
              )}

              {!loading && error && (
                <div className="cr-state cr-state--err" role="alert">
                  <p>Unable to load reviews. Please try again later.</p>
                </div>
              )}

              {!loading && !error && reviews.length === 0 && (
                <div className="cr-state">
                  <p>No reviews yet — be the first to share your experience.</p>
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
                      <h4 className="cr-rc-name">{r.name}</h4>
                      <StarDisplay rating={r.rating} />
                    </div>
                  </div>
                  <p className="cr-rc-text">{r.text}</p>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}