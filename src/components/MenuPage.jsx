// MenuPage.jsx — Dynamic · fetches from /api/meat-items/by-category
// White bg · #800000 red · #d4af37 gold

import { useState, useMemo } from 'react'
import { useMenuItems } from '../hooks/useMeatItems'
import '../css/MenuPage.css'

const FILTERS = [
  { id: 'all',     label: 'All Cuts' },
  { id: 'mutton',  label: 'Mutton'   },
  { id: 'beef',    label: 'Beef'     },
  { id: 'chicken', label: 'Chicken'  },
  { id: 'fish',    label: 'Fish'     },
]

const CATEGORY_META = {
  mutton:  { label: 'Farm Fresh',    number: '01' },
  beef:    { label: 'Premium Grade', number: '02' },
  chicken: { label: 'Free Range',    number: '03' },
  fish:    { label: 'Ocean Catch',   number: '04' },
}

// WhatsApp order handler
const handleOrder = (item) => {
  const phone = import.meta.env.VITE_WA_NUMBER || '923001234567'
  const msg   = encodeURIComponent(
    `Assalam o Alaikum! I'd like to order:\n\n🥩 *${item.name}*\nPrice: Rs. ${item.price}${item.unit === 'kg' ? '/kg' : `/${item.unit}`}\n\nKindly confirm availability.`
  )
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
}

/* ── Skeleton card ─────────────────────────────── */
const SkeletonCard = () => (
  <div className="menu-card menu-card--skeleton">
    <div className="menu-card__img-wrap skeleton-box" />
    <div className="menu-card__body">
      <div className="skeleton-line skeleton-line--short" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--med" />
      <div className="skeleton-line skeleton-line--short" style={{ marginTop: 14 }} />
    </div>
  </div>
)

/* ── Product Card ──────────────────────────────── */
const MenuCard = ({ item, index }) => (
  <div
    className="menu-card"
    style={{ '--card-i': index }}
    onClick={() => handleOrder(item)}
  >
    <div className="menu-card__img-wrap">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="menu-card__img"
        loading="lazy"
      />
      {item.badge && (
        <span className="menu-card__badge">{item.badge}</span>
      )}
      <button
        className="menu-card__action"
        onClick={e => { e.stopPropagation(); handleOrder(item) }}
        aria-label={`Order ${item.name}`}
      >
        ♥
      </button>
    </div>

    <div className="menu-card__body">
      <p className="menu-card__category-tag">
        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
      </p>
      <h3 className="menu-card__name">{item.name}</h3>
      <p className="menu-card__desc">{item.description}</p>

      <div className="menu-card__footer">
        <div>
          <span className="menu-card__price">
            Rs. {item.price.toLocaleString('en-PK')}
          </span>
          <span className="menu-card__price-unit">
            /{item.unit}
          </span>
        </div>
        <button
          className="menu-card__order-btn"
          onClick={e => { e.stopPropagation(); handleOrder(item) }}
        >
          Order
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m0 0-6-6m6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
)

/* ── Page ──────────────────────────────────────── */
export default function MenuPage() {
  const { grouped, loading, error, refetch } = useMenuItems()
  const [activeFilter, setActiveFilter] = useState('all')

  // Categories to display (filtered)
  const categoriesToRender = useMemo(() => {
    if (activeFilter !== 'all') return [activeFilter]
    return ['mutton', 'beef', 'chicken', 'fish']
  }, [activeFilter])

  // Count per category
  const countOf = (cat) => (grouped[cat] || []).length

  return (
    <div className="menu-page">

      {/* ── HERO ── */}
      <header className="menu-hero">
        <div className="menu-hero__inner">
          <div className="menu-hero__eyebrow">
            <span className="menu-hero__eyebrow-line" />
            <span className="menu-hero__eyebrow-text">Our Full Menu</span>
            <span className="menu-hero__eyebrow-line" />
          </div>
          <h1 className="menu-hero__title">
            Fresh <em>Cuts,</em><br />Every Day
          </h1>
          <p className="menu-hero__subtitle">
            Handpicked mutton, beef, chicken & fish — sourced fresh daily
            and delivered to your door.
          </p>
        </div>
        <div className="menu-hero__rule">
          <span className="menu-hero__rule-line" />
          <span className="menu-hero__rule-diamond" />
          <span className="menu-hero__rule-line" />
        </div>
      </header>

      {/* ── FILTER TABS ── */}
      <nav className="menu-filters">
        <div className="menu-filters__inner">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`menu-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
              {f.id !== 'all' && (
                <span className="filter-count">{countOf(f.id)}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main className="menu-content">

        {/* Error state */}
        {error && (
          <div className="menu-error">
            <p>⚠️ Could not load menu: {error}</p>
            <button onClick={refetch} className="menu-error__retry">Try again</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <div className="menu-category">
            <div className="menu-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Loaded content */}
        {!loading && !error && categoriesToRender.map(cat => {
          const items = grouped[cat] || []
          if (!items.length) return null
          const meta = CATEGORY_META[cat] || { label: '', number: '0' + (Object.keys(CATEGORY_META).indexOf(cat) + 1) }

          return (
            <section key={cat} className="menu-category">
              <div className="menu-cat-header">
                <div className="menu-cat-header__left">
                  <span className="menu-cat-header__number">{meta.number}</span>
                  <div className="menu-cat-header__info">
                    <p className="menu-cat-header__label">{meta.label}</p>
                    <h2 className="menu-cat-header__title">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </h2>
                  </div>
                </div>
                <span className="menu-cat-header__count">
                  {items.length} cut{items.length !== 1 ? 's' : ''} available
                </span>
              </div>

              <div className="menu-grid">
                {items.map((item, idx) => (
                  <MenuCard key={item._id} item={item} index={idx} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Empty state */}
        {!loading && !error && categoriesToRender.every(cat => !(grouped[cat] || []).length) && (
          <div className="menu-empty">
            <div className="menu-empty__icon">🥩</div>
            <p className="menu-empty__text">No cuts found in this category.</p>
          </div>
        )}
      </main>

      {/* ── FOOTER NOTE ── */}
      <footer className="menu-footer-note">
        <p className="menu-footer-note__text">
          All prices are per kilogram. Availability may vary daily.
          Contact us on WhatsApp to confirm your order or ask about custom cuts.
        </p>
        <button
          className="menu-footer-note__wa"
          onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_WA_NUMBER || '923001234567'}`, '_blank')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Order via WhatsApp
        </button>
      </footer>

    </div>
  )
}