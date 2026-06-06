// Bestsellers.jsx — Dynamic · fetches from /api/meat-items/bestsellers
// Dark section — same styling as before, now API-powered

import { useNavigate } from 'react-router-dom'
import { useBestsellers } from '../hooks/useMeatItems'
import { useCart } from '../contexts/cartContextCore'
import '../css/Bestsellers.css'

/* ── Skeleton card ─────────────────────────────── */
const SkeletonCard = ({ index }) => (
  <div className="bsc__card bsc__card--skeleton" style={{ '--i': index }}>
    <div className="bsc__card-img-wrap bsc-skeleton-img" />
    <div className="bsc__card-body">
      <div className="bsc-skeleton-line bsc-skeleton-line--short" />
      <div className="bsc-skeleton-line" />
      <div className="bsc-skeleton-line bsc-skeleton-line--med" />
    </div>
  </div>
)

/* ── Bestsellers section ───────────────────────── */
const Bestsellers = () => {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { items, loading, error } = useBestsellers(6)

  const handleOrderNow = (e, item) => {
    e.stopPropagation()
    addItem({
      ...item,
      itemType: 'meat'
    })
    navigate('/cart', { state: { fromBuyNow: true } })
  }

  // Always render 6 skeletons while loading
  const showSkeletons = loading
  const showError     = !loading && !!error
  const showItems     = !loading && !error && items.length > 0
  const showEmpty     = !loading && !error && items.length === 0

  return (
    <section className="bsc">
      {/* Header */}
      <div className="bsc__header">
        <div className="bsc__header-badge">
          <span className="bsc__header-line" />
          <span className="bsc__header-label">Customer Favourites</span>
          <span className="bsc__header-line" />
        </div>
        <h2 className="bsc__title">Bestseller Cuts</h2>
        <p className="bsc__subtitle">
          Our most-loved cuts, ordered again and again — for good reason
        </p>
      </div>

      {/* Grid */}
      <div className="bsc__grid">
        {showSkeletons && Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}

        {showError && (
          <p className="bsc__error">⚠️ Could not load bestsellers.</p>
        )}

        {showEmpty && (
          <p className="bsc__empty">No bestsellers configured yet.</p>
        )}

        {showItems && items.slice(0, 6).map((item, index) => (
          <div
            key={item._id}
            className="bsc__card"
            style={{ '--i': index }}
            onClick={(e) => handleOrderNow(e, item)}
          >
            {/* Image */}
            <div className="bsc__card-img-wrap">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="bsc__card-img"
                loading="lazy"
              />
              <div className="bsc__card-img-overlay" />
              {item.badge && (
                <span className="bsc__card-tag">{item.badge}</span>
              )}
            </div>

            {/* Content */}
            <div className="bsc__card-body">
              <div className="bsc__card-meta">
                <span className="bsc__card-label">
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
              </div>
              <h3 className="bsc__card-name">{item.name}</h3>
              <p className="bsc__card-desc">{item.description}</p>

              <div className="bsc__card-footer">
                <span className="bsc__card-price">
                  Rs. {item.price.toLocaleString('en-PK')}
                  <span className="bsc__card-price-unit">/{item.unit}</span>
                </span>
                <span className="bsc__card-cta">
                  Order Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all CTA */}
      {showItems && (
        <div className="bsc__view-all">
          <button className="bsc__view-all-btn" onClick={() => navigate('/menu-page')}>
            View Full Menu
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14m0 0-6-6m6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}

export default Bestsellers