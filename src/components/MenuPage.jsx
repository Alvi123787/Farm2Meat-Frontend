// MenuPage.jsx — Premium Editorial Redesign
// Palette: #0d0d0d near-black · #c8a96e warm gold · #fff ivory

import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMenuItems } from '../hooks/useMeatItems'
import { useCart } from '../contexts/cartContextCore'
import { useAuth } from '../contexts/authContextCore'
import { useFavourites } from '../contexts/FavouritesContext'
import CustomerReviewSection from './CustomerReviewSection'
import ButcherSection from './ButcherSection'
import LoginRequiredPopup from './LoginRequiredPopup'
import { WHATSAPP_NUMBER } from '../constants/contact'
import '../css/MenuPage.css'

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'mutton',  label: 'Mutton' },
  { id: 'beef',    label: 'Beef' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'fish',    label: 'Fish' },
]

const CATEGORY_META = {
  mutton:  { label: 'Farm Fresh',    number: '01', accent: 'M' },
  beef:    { label: 'Premium Grade', number: '02', accent: 'B' },
  chicken: { label: 'Free Range',    number: '03', accent: 'C' },
  fish:    { label: 'Ocean Catch',   number: '04', accent: 'F' },
}

/* ── Skeleton ─────────────────────────────────── */
const SkeletonCard = () => (
  <div className="mc mc--skeleton">
    <div className="mc__media sk-box" />
    <div className="mc__body">
      <div className="sk-line sk-line--xs" />
      <div className="sk-line sk-line--lg" />
      <div className="sk-line sk-line--md" />
      <div className="sk-line sk-line--sm" style={{ marginTop: 18 }} />
    </div>
  </div>
)

/* ── Product Card ──────────────────────────────── */
const MenuCard = ({ item, index, onOrder, onFavouriteClick, isFav }) => {
  const isAvailable = item.isAvailable !== false;

  return (
    <article
      className={`mc ${!isAvailable ? 'mc--unavailable' : ''}`}
      style={{ '--i': index }}
      onClick={() => isAvailable && onOrder(item)}
      tabIndex={isAvailable ? 0 : -1}
      role="button"
      onKeyDown={e => e.key === 'Enter' && isAvailable && onOrder(item)}
      aria-label={isAvailable ? `Order ${item.name}` : `${item.name} is currently unavailable`}
    >
      <div className="mc__media">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="mc__img"
          loading="lazy"
        />
        <div className="mc__media-overlay" />
        {item.badge && <span className="mc__badge">{item.badge}</span>}
        {!isAvailable && (
          <div className="mc__unavailable-badge">
            Currently Unavailable
          </div>
        )}
        <button
          className="mc__wishlist"
          onClick={(e) => { e.stopPropagation(); onFavouriteClick(); }}
          aria-label={isFav ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
          tabIndex={0}
        >
          <svg viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="mc__body">
        <span className="mc__tag">
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </span>
        <h3 className="mc__name">{item.name}</h3>
        <p className="mc__desc">{item.description}</p>

        <footer className="mc__foot">
          <div className="mc__pricing">
            <span className="mc__price">Rs. {item.price.toLocaleString('en-PK')}</span>
            <span className="mc__unit">/ {item.unit}</span>
          </div>
          <button
            className={`mc__cta ${!isAvailable ? 'mc__cta--disabled' : ''}`}
            onClick={e => { e.stopPropagation(); if (isAvailable) onOrder(item); }}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Order' : 'Unavailable'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14m0 0-6-6m6 6-6 6"/>
            </svg>
          </button>
        </footer>
      </div>
    </article>
  );
}

/* ── Page ──────────────────────────────────────── */
export default function MenuPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem } = useCart()
  const { role } = useAuth()
  const { isFavourited, toggleFavourite } = useFavourites()
  const { grouped, loading, error, refetch } = useMenuItems()
  const [activeFilter, setActiveFilter] = useState('all')
  const [showLoginPopup, setShowLoginPopup] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      const valid = FILTERS.find(f => f.id === cat.toLowerCase())
      if (valid) setActiveFilter(valid.id)
    }
  }, [searchParams])

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId)
    const sp = new URLSearchParams(searchParams)
    if (filterId === 'all') sp.delete('category')
    else sp.set('category', filterId)
    
    // Exclusively apply all filter actions to the /menu-page route
    const query = sp.toString()
    navigate(query ? `/menu-page?${query}` : '/menu-page', { replace: true })
  }

  const handleOrder = (item) => {
    addItem({ ...item, itemType: 'meat' })
    navigate('/cart', { state: { fromBuyNow: true } })
  }

  const categoriesToRender = useMemo(() => {
    if (activeFilter !== 'all') return [activeFilter]
    return ['mutton', 'beef', 'chicken', 'fish']
  }, [activeFilter])

  const countOf = (cat) => (grouped[cat] || []).length

  return (
    <div className="mp">

      {/* ── HERO ── */}
      <header className="mp-hero">
        <div className="mp-hero__bg-text" aria-hidden="true">MEAT</div>
        <div className="mp-hero__content">
          <p className="mp-hero__kicker">
            <span className="mp-hero__kicker-dash" />
            Established Quality
            <span className="mp-hero__kicker-dash" />
          </p>
          <h1 className="mp-hero__title">
            The&nbsp;<em>Finest</em><br />Cuts, Daily.
          </h1>
          <p className="mp-hero__body">
            Handpicked mutton, beef, chicken &amp; fish — sourced fresh every morning and delivered to your door.
          </p>
          <div className="mp-hero__ornament" aria-hidden="true">
            <span /><svg viewBox="0 0 16 16" width="10" height="10"><path d="M8 0 L16 8 L8 16 L0 8 Z" fill="#c8a96e"/></svg><span />
          </div>
        </div>
      </header>

      {/* ── FILTER NAV ── */}
      <nav className="mp-nav" aria-label="Category filters">
        <div className="mp-nav__track">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`mp-nav__btn${activeFilter === f.id ? ' is-active' : ''}`}
              onClick={() => handleFilterChange(f.id)}
              aria-pressed={activeFilter === f.id}
            >
              {f.label}
              {f.id !== 'all' && (
                <span className="mp-nav__count">{countOf(f.id)}</span>
              )}
            </button>
          ))}
        </div>
        <div className="mp-nav__border" aria-hidden="true" />
      </nav>

      {/* ── CONTENT ── */}
      <main className="mp-main">

        {error && (
          <div className="mp-error" role="alert">
            <p>Could not load menu — {error}</p>
            <button onClick={refetch} className="mp-error__btn">Retry</button>
          </div>
        )}

        {loading && !error && (
          <div className="mp-section">
            <div className="mp-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {!loading && !error && categoriesToRender.map(cat => {
          const items = grouped[cat] || []
          if (!items.length) return null
          const meta = CATEGORY_META[cat] || { label: '', number: '0' + (Object.keys(CATEGORY_META).indexOf(cat) + 1), accent: cat[0].toUpperCase() }

          return (
            <section key={cat} className="mp-section" aria-labelledby={`cat-${cat}`}>
              <div className="mp-section__head">
                <div className="mp-section__left">
                  <span className="mp-section__num" aria-hidden="true">{meta.number}</span>
                  <div>
                    <p className="mp-section__label">{meta.label}</p>
                    <h2 className="mp-section__title" id={`cat-${cat}`}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </h2>
                  </div>
                </div>
                <span className="mp-section__tally">
                  {items.length}&thinsp;cut{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="mp-grid">
                {items.map((item, idx) => {
                  const handleFavClick = () => {
                    if (role === 'guest') {
                      setShowLoginPopup(true);
                    } else {
                      toggleFavourite({ ...item, id: item._id }, 'meat');
                    }
                  };
                  return (
                    <MenuCard 
                      key={item._id} 
                      item={item} 
                      index={idx} 
                      onOrder={handleOrder} 
                      onFavouriteClick={handleFavClick}
                      isFav={isFavourited(item._id, 'meat')}
                    />
                  );
                })}
              </div>
            </section>
          )
        })}

        {!loading && !error && categoriesToRender.every(cat => !(grouped[cat] || []).length) && (
          <div className="mp-empty" role="status">
            <span className="mp-empty__icon">🥩</span>
            <p>No cuts in this category right now.</p>
          </div>
        )}
      </main>

      {/* ── BUTCHER CTA ── */}
      <ButcherSection />

      {/* ── REVIEWS ── */}
      <section className="mp-reviews">
        <div className="container">
          <CustomerReviewSection />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mp-foot">
        <div className="mp-foot__inner">
          <p className="mp-foot__note">
            All prices are per kilogram. Availability may vary daily. Contact us on WhatsApp for custom cuts or bulk orders.
          </p>
          <button
            className="mp-foot__wa"
            onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
            aria-label="Order via WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order via WhatsApp
          </button>
        </div>
      </footer>

      <LoginRequiredPopup 
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Please login first to add to favourites"
      />
    </div>
  )
}