import React, { useEffect, useState, useRef } from 'react'
import {
  FaSearch,
  FaFilter,
  FaWeightHanging,
  FaTag,
  FaShieldAlt,
  FaBalanceScale,
  FaCheckCircle,
  FaStar,
  FaChevronDown,
  FaMapMarkerAlt,
  FaTimes,
  FaSlidersH
} from 'react-icons/fa'
import { GiGoat } from 'react-icons/gi'
import '../css/ShopHeroSection.css'

const categories = [
  { id: 'all', label: 'All Livestock', icon: <FaStar /> },
  { id: 'Bakra', label: 'Bakra', icon: <GiGoat /> },
  { id: 'Patth', label: 'Patth', icon: <GiGoat /> },
  { id: 'Bakri', label: 'Bakri', icon: <GiGoat /> }
]

const priceRanges = [
  { id: 'all', label: 'Any Price' },
  { id: '0-50000', label: 'Under 50,000' },
  { id: '50000-100000', label: '50K – 1 Lakh' },
  { id: '100000-200000', label: '1 Lakh – 2 Lakh' },
  { id: '200000-500000', label: '2 Lakh – 5 Lakh' },
  { id: '500000+', label: '5 Lakh+' }
]

const weightRanges = [
  { id: 'all', label: 'Any Weight' },
  { id: '0-20', label: 'Under 20 KG' },
  { id: '20-40', label: '20 – 40 KG' },
  { id: '40-60', label: '40 – 60 KG' },
  { id: '60-100', label: '60 – 100 KG' },
  { id: '100+', label: '100 KG+' }
]

const trustBadges = [
  { icon: <FaBalanceScale />, text: 'Honest Weight' },
  { icon: <FaShieldAlt />, text: 'Quality Guaranteed' },
  { icon: <FaCheckCircle />, text: 'Transparent Pricing' }
]

const ShopHeroSection = ({
  onFilter,
  activeCategory: activeCategoryProp,
  onCategoryChange,
  showHero = true,
  searchValue,
  priceValue,
  weightValue
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [internalActiveCategory, setInternalActiveCategory] = useState('all')
  const [internalSelectedPrice, setInternalSelectedPrice] = useState('all')
  const [internalSelectedWeight, setInternalSelectedWeight] = useState('all')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [priceDropdown, setPriceDropdown] = useState(false)
  const [weightDropdown, setWeightDropdown] = useState(false)
  const priceRef = useRef(null)
  const weightRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const activeCategory = activeCategoryProp !== undefined
    ? (activeCategoryProp || 'all')
    : internalActiveCategory

  const selectedPrice = priceValue !== undefined ? priceValue : internalSelectedPrice
  const selectedWeight = weightValue !== undefined ? weightValue : internalSelectedWeight
  const searchQuery = searchValue !== undefined ? searchValue : internalSearchQuery

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (priceRef.current && !priceRef.current.contains(e.target)) {
        setPriceDropdown(false)
      }
      if (weightRef.current && !weightRef.current.contains(e.target)) {
        setWeightDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (onFilter) {
      onFilter({
        category: activeCategory,
        price: selectedPrice,
        weight: selectedWeight,
        search: searchQuery
      })
    }
  }

  const handleReset = () => {
    setInternalActiveCategory('all')
    if (onCategoryChange) onCategoryChange('all')
    setInternalSelectedPrice('all')
    setInternalSelectedWeight('all')
    setInternalSearchQuery('')
    if (onFilter) {
      onFilter({ category: 'all', price: 'all', weight: 'all', search: '' })
    }
  }

  const hasActiveFilters =
    activeCategory !== 'all' ||
    selectedPrice !== 'all' ||
    selectedWeight !== 'all' ||
    searchQuery !== ''

  const getPriceLabel = () =>
    priceRanges.find((p) => p.id === selectedPrice)?.label || 'Any Price'

  const getWeightLabel = () =>
    weightRanges.find((w) => w.id === selectedWeight)?.label || 'Any Weight'

  return (
    <section className={`shf-section ${isVisible ? 'shf-section--visible' : ''} ${showHero ? '' : 'shf-section--compact'}`}>
      {showHero && (
        <>
          <div className="shf-bg">
            <div className="shf-bg-image">
              <img
                src="../uploads/FarmHeroimage.jpg"
                alt="Premium Livestock"
                className="shf-bg-img"
              />
              <div className="shf-bg-overlay"></div>
              <div className="shf-bg-gradient"></div>
            </div>
            <div className="shf-bg-pattern"></div>
            <div className="shf-bg-particles">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="shf-bg-particle"
                  style={{
                    '--shf-p-delay': `${i * 0.5}s`,
                    '--shf-p-x': `${(i * 37) % 100}%`,
                    '--shf-p-y': `${(i * 53) % 100}%`,
                    '--shf-p-size': `${(i % 3) + 1}px`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {showHero && (
              <div className="shf-content">
                <div className="shf-breadcrumb">
                  <a href="/" className="shf-breadcrumb-link">Home</a>
                  <span className="shf-breadcrumb-sep">/</span>
                  <span className="shf-breadcrumb-current">Livestock</span>
                </div>

                <div className="shf-badge">
                  <div className="shf-badge-dot"></div>
                  <span>PREMIUM COLLECTION • SINCE 1994</span>
                </div>

                <h1 className="shf-title">
                  <span className="shf-title-line">Our Premium</span>
                  <span className="shf-title-accent">Livestock</span>
                </h1>

                <p className="shf-tagline">
                  <span className="shf-tagline-item">
                    <FaCheckCircle className="shf-tagline-icon" />
                    Healthy bakray
                  </span>
                  <span className="shf-tagline-dot">•</span>
                  <span className="shf-tagline-item">
                    <FaBalanceScale className="shf-tagline-icon" />
                    Honest weight
                  </span>
                  <span className="shf-tagline-dot">•</span>
                  <span className="shf-tagline-item">
                    <FaTag className="shf-tagline-icon" />
                    Transparent pricing
                  </span>
                </p>

                <div className="shf-trust">
                  {trustBadges.map((badge, i) => (
                    <div
                      key={i}
                      className="shf-trust-item"
                      style={{ '--shf-trust-delay': `${0.6 + i * 0.15}s` }}
                    >
                      <div className="shf-trust-icon">{badge.icon}</div>
                      <span className="shf-trust-text">{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════════ FILTER SECTION ══════════ */}
            <div className="shf-filter">
              {/* Category Tabs */}
              <div className="shf-filter-categories">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`shf-filter-cat ${activeCategory === cat.id ? 'shf-filter-cat--active' : ''}`}
                    onClick={() => {
                      setInternalActiveCategory(cat.id)
                      if (onCategoryChange) onCategoryChange(cat.id)
                    }}
                  >
                    <span className="shf-filter-cat-icon">{cat.icon}</span>
                    <span className="shf-filter-cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Filter Bar */}
              <div className="shf-filter-bar">
                {/* Search */}
                <div className="shf-filter-search">
                  <FaSearch className="shf-filter-search-icon" />
                  <input
                    type="text"
                    className="shf-filter-search-input"
                    placeholder="Search by breed, name..."
                    value={searchQuery}
                    onChange={(e) => {
                      const next = e.target.value
                      setInternalSearchQuery(next)
                      if (onFilter) {
                        onFilter({ category: activeCategory, price: selectedPrice, weight: selectedWeight, search: next })
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  {searchQuery && (
                    <button
                      className="shf-filter-search-clear"
                      onClick={() => {
                        setInternalSearchQuery('')
                        if (onFilter) {
                          onFilter({ category: activeCategory, price: selectedPrice, weight: selectedWeight, search: '' })
                        }
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <div className="shf-filter-divider"></div>

                {/* Price Dropdown */}
                <div className="shf-filter-dropdown" ref={priceRef}>
                  <button
                    className={`shf-filter-dropdown-btn ${priceDropdown ? 'shf-filter-dropdown-btn--open' : ''} ${selectedPrice !== 'all' ? 'shf-filter-dropdown-btn--selected' : ''}`}
                    onClick={() => { setPriceDropdown(!priceDropdown); setWeightDropdown(false) }}
                  >
                    <FaTag className="shf-filter-dropdown-icon" />
                    <div className="shf-filter-dropdown-text">
                      <span className="shf-filter-dropdown-label">Price</span>
                      <span className="shf-filter-dropdown-value">{getPriceLabel()}</span>
                    </div>
                    <FaChevronDown className="shf-filter-dropdown-arrow" />
                  </button>
                  {priceDropdown && (
                    <div className="shf-filter-dropdown-menu">
                      {priceRanges.map((range) => (
                        <button
                          key={range.id}
                          className={`shf-filter-dropdown-option ${selectedPrice === range.id ? 'shf-filter-dropdown-option--active' : ''}`}
                          onClick={() => {
                            setInternalSelectedPrice(range.id)
                            setPriceDropdown(false)
                            if (onFilter) {
                              onFilter({ category: activeCategory, price: range.id, weight: selectedWeight, search: searchQuery })
                            }
                          }}
                        >
                          <span>{range.label}</span>
                          {selectedPrice === range.id && <FaCheckCircle />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shf-filter-divider"></div>

                {/* Weight Dropdown */}
                <div className="shf-filter-dropdown" ref={weightRef}>
                  <button
                    className={`shf-filter-dropdown-btn ${weightDropdown ? 'shf-filter-dropdown-btn--open' : ''} ${selectedWeight !== 'all' ? 'shf-filter-dropdown-btn--selected' : ''}`}
                    onClick={() => { setWeightDropdown(!weightDropdown); setPriceDropdown(false) }}
                  >
                    <FaWeightHanging className="shf-filter-dropdown-icon" />
                    <div className="shf-filter-dropdown-text">
                      <span className="shf-filter-dropdown-label">Weight (Zinda)</span>
                      <span className="shf-filter-dropdown-value">{getWeightLabel()}</span>
                    </div>
                    <FaChevronDown className="shf-filter-dropdown-arrow" />
                  </button>
                  {weightDropdown && (
                    <div className="shf-filter-dropdown-menu">
                      {weightRanges.map((range) => (
                        <button
                          key={range.id}
                          className={`shf-filter-dropdown-option ${selectedWeight === range.id ? 'shf-filter-dropdown-option--active' : ''}`}
                          onClick={() => {
                            setInternalSelectedWeight(range.id)
                            setWeightDropdown(false)
                            if (onFilter) {
                              onFilter({ category: activeCategory, price: selectedPrice, weight: range.id, search: searchQuery })
                            }
                          }}
                        >
                          <span>{range.label}</span>
                          {selectedWeight === range.id && <FaCheckCircle />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shf-filter-divider"></div>

                {/* Search Button */}
                <button className="shf-filter-submit" onClick={handleSearch}>
                  <FaSearch className="shf-filter-submit-icon" />
                  <span>Search</span>
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                className="shf-filter-mob-toggle"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <FaSlidersH />
                <span>Filters</span>
                {hasActiveFilters && <div className="shf-filter-mob-dot"></div>}
              </button>

              {/* Mobile Filter Panel */}
              {showMobileFilters && (
                <div className="shf-filter-mob">
                  <div className="shf-filter-mob-header">
                    <h4>Filter Livestock</h4>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <FaTimes />
                    </button>
                  </div>

                  <div className="shf-filter-mob-group">
                    <label className="shf-filter-mob-label">
                      <FaSearch /> Search
                    </label>
                    <input
                      type="text"
                      className="shf-filter-mob-input"
                      placeholder="Search breed, name..."
                      value={searchQuery}
                      onChange={(e) => {
                        const next = e.target.value
                        setInternalSearchQuery(next)
                        if (onFilter) {
                          onFilter({ category: activeCategory, price: selectedPrice, weight: selectedWeight, search: next })
                        }
                      }}
                    />
                  </div>

                  <div className="shf-filter-mob-group">
                    <label className="shf-filter-mob-label">
                      <FaTag /> Price Range
                    </label>
                    <div className="shf-filter-mob-options">
                      {priceRanges.map((range) => (
                        <button
                          key={range.id}
                          className={`shf-filter-mob-option ${selectedPrice === range.id ? 'shf-filter-mob-option--active' : ''}`}
                          onClick={() => {
                            setInternalSelectedPrice(range.id)
                            if (onFilter) {
                              onFilter({ category: activeCategory, price: range.id, weight: selectedWeight, search: searchQuery })
                            }
                          }}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="shf-filter-mob-group">
                    <label className="shf-filter-mob-label">
                      <FaWeightHanging /> Weight Range
                    </label>
                    <div className="shf-filter-mob-options">
                      {weightRanges.map((range) => (
                        <button
                          key={range.id}
                          className={`shf-filter-mob-option ${selectedWeight === range.id ? 'shf-filter-mob-option--active' : ''}`}
                          onClick={() => {
                            setInternalSelectedWeight(range.id)
                            if (onFilter) {
                              onFilter({ category: activeCategory, price: selectedPrice, weight: range.id, search: searchQuery })
                            }
                          }}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="shf-filter-mob-actions">
                    <button
                      className="shf-filter-mob-btn shf-filter-mob-btn--apply"
                      onClick={() => { handleSearch(); setShowMobileFilters(false) }}
                    >
                      <FaSearch /> Apply Filters
                    </button>
                    <button
                      className="shf-filter-mob-btn shf-filter-mob-btn--reset"
                      onClick={handleReset}
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="shf-filter-active">
                  <span className="shf-filter-active-label">
                    <FaFilter /> Active:
                  </span>
                  {activeCategory !== 'all' && (
                    <span className="shf-filter-active-tag">
                      {categories.find((c) => c.id === activeCategory)?.label}
                      <button onClick={() => { setInternalActiveCategory('all'); if (onCategoryChange) onCategoryChange('all') }}>
                        <FaTimes />
                      </button>
                    </span>
                  )}
                  {selectedPrice !== 'all' && (
                    <span className="shf-filter-active-tag">
                      {getPriceLabel()}
                      <button onClick={() => {
                        setInternalSelectedPrice('all')
                        if (onFilter) onFilter({ category: activeCategory, price: 'all', weight: selectedWeight, search: searchQuery })
                      }}>
                        <FaTimes />
                      </button>
                    </span>
                  )}
                  {selectedWeight !== 'all' && (
                    <span className="shf-filter-active-tag">
                      {getWeightLabel()}
                      <button onClick={() => {
                        setInternalSelectedWeight('all')
                        if (onFilter) onFilter({ category: activeCategory, price: selectedPrice, weight: 'all', search: searchQuery })
                      }}>
                        <FaTimes />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="shf-filter-active-tag">
                      "{searchQuery}"
                      <button onClick={() => {
                        setInternalSearchQuery('')
                        if (onFilter) onFilter({ category: activeCategory, price: selectedPrice, weight: selectedWeight, search: '' })
                      }}>
                        <FaTimes />
                      </button>
                    </span>
                  )}
                  <button className="shf-filter-active-clear" onClick={handleReset}>
                    Clear All
                  </button>
                </div>
              )}

              {/* Location Note */}
              <div className="shf-filter-note">
                <FaMapMarkerAlt />
                <span>
                  All livestock available at our farm in
                  <strong> Rahim Yar Khan</strong>. Visit or call for live inspection.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopHeroSection
