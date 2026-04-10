import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaSpinner,
  FaExclamationTriangle,
  FaPen,
  FaTrashAlt,
  FaTimes,
  FaCheckCircle,
  FaBoxOpen,
  FaPlusCircle,
  FaExclamationCircle,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronRight,
  FaShieldAlt,
  FaTag,
  FaClipboardList,
  FaBox,
  FaInfoCircle,
  FaArchive,
  FaFilter,
  FaThLarge,
  FaList,
} from 'react-icons/fa'
import api from '../services/api'
import '../css/InventoryPreview.css'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { buildMediaUrl } from '../utils/mediaUrl'
import { formatPrice } from '../utils/priceUtils'

const fallbackSrc =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <rect fill="#f8f6f2" width="60" height="60" rx="12"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="sans-serif" font-size="22" fill="#cbd5e1">🐐</text>
    </svg>`
  )

const handleImageError = (e) => { e.target.src = fallbackSrc }

const getThumbnail = (animal) => {
  if (animal.images?.length > 0) return buildMediaUrl(animal.images[0]) || fallbackSrc
  if (animal.imageUrl) return buildMediaUrl(animal.imageUrl) || fallbackSrc
  return fallbackSrc
}

const getStatusInfo = (animal) => {
  if (animal.status === 'sold') return { isActive: false, label: 'Sold', className: 'ip-status--sold', icon: FaTag }
  if (animal.status === 'reserved') return { isActive: true, label: 'Reserved', className: 'ip-status--reserved', icon: FaClipboardList }
  const isActive = animal.visibility !== false
  return {
    isActive,
    label: isActive ? 'Active' : 'Hidden',
    className: isActive ? 'ip-status--active' : 'ip-status--hidden',
    icon: isActive ? FaEye : FaEyeSlash,
  }
}

const ToggleSwitch = ({ isActive, onToggle, disabled, size = 'md' }) => (
  <button
    className={`ip-toggle ${isActive ? 'ip-toggle--on' : ''} ${disabled ? 'ip-toggle--disabled' : ''} ip-toggle--${size}`}
    onClick={onToggle}
    disabled={disabled}
    aria-label={isActive ? 'Deactivate listing' : 'Activate listing'}
    role="switch"
    aria-checked={isActive}
  >
    <span className="ip-toggle-track">
      <span className="ip-toggle-glow" />
    </span>
    <span className="ip-toggle-thumb">
      {isActive ? <FaEye className="ip-toggle-icon" /> : <FaEyeSlash className="ip-toggle-icon" />}
    </span>
  </button>
)

const AnimCounter = ({ value, className = '' }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    if (end === 0) {
      const t = setTimeout(() => setDisplay(0), 0)
      return () => clearTimeout(t)
    }
    const dur = 600
    const step = Math.max(1, Math.floor(end / (dur / 16)))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span className={className}>{display}</span>
}

const SkeletonRow = ({ delay = 0 }) => (
  <tr className="ip-skeleton-row" style={{ '--sk-delay': `${delay}s` }}>
    <td className="ip-col-thumb"><div className="ip-sk ip-sk--circle" /></td>
    <td><div className="ip-sk ip-sk--text ip-sk--w70" /></td>
    <td><div className="ip-sk ip-sk--text ip-sk--w50" /></td>
    <td><div className="ip-sk ip-sk--text ip-sk--w40" /></td>
    <td><div className="ip-sk ip-sk--badge" /></td>
    <td className="ip-col-toggle"><div className="ip-sk ip-sk--toggle" /></td>
    <td className="ip-col-actions"><div className="ip-sk ip-sk--actions" /></td>
  </tr>
)

const SkeletonCard = ({ delay = 0 }) => (
  <div className="ip-card ip-card--skeleton" style={{ '--sk-delay': `${delay}s` }}>
    <div className="ip-sk ip-sk--card-thumb" />
    <div className="ip-card-body">
      <div className="ip-sk ip-sk--text ip-sk--w70" />
      <div className="ip-sk ip-sk--text ip-sk--w40" style={{ height: 10 }} />
      <div className="ip-sk ip-sk--text ip-sk--w50" />
    </div>
  </div>
)

const InventoryPreview = () => {
  const navigate = useNavigate()

  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [viewMode, setViewMode] = useState('table')

  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteClosing, setDeleteClosing] = useState(false)

  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const fetchAnimals = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/api/animals')
      const result = res.data
      if (result.success) setAnimals(result.data)
      else setError('Failed to load inventory')
    } catch {
      setError('Cannot connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnimals() }, [fetchAnimals])

  useAdminLiveRefresh(fetchAnimals, { intervalMs: 8000, enabled: true })

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, message, type, exiting: false }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350)
    }, 3200)
  }, [])

  const handleToggle = async (animal) => {
    const newVis = !animal.visibility
    setAnimals((prev) => prev.map((a) => (a._id === animal._id ? { ...a, visibility: newVis } : a)))
    try {
      const res = await api.patch(`/api/animals/${animal._id}/visibility`, { visibility: newVis })
      const result = res.data
      if (result.success) showToast(newVis ? `${animal.name} is now visible` : `${animal.name} is now hidden`)
      else {
        setAnimals((prev) => prev.map((a) => (a._id === animal._id ? { ...a, visibility: !newVis } : a)))
        showToast('Failed to update visibility', 'error')
      }
    } catch {
      setAnimals((prev) => prev.map((a) => (a._id === animal._id ? { ...a, visibility: !newVis } : a)))
      showToast('Network error', 'error')
    }
  }

  const handleEdit = (animal) => navigate(`/admin/edit-animal/${animal._id}`)

  const openDeleteModal = (animal) => { setDeleteTarget(animal); setDeleteModal(true); setDeleteClosing(false) }

  const closeDeleteModal = useCallback(() => {
    setDeleteClosing(true)
    setTimeout(() => { setDeleteModal(false); setDeleteTarget(null); setDeleteClosing(false) }, 280)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await api.delete(`/api/animals/${deleteTarget._id}`)
      const result = res.data
      if (result.success) {
        setAnimals((prev) => prev.filter((a) => a._id !== deleteTarget._id))
        closeDeleteModal()
        showToast(`${deleteTarget.name} deleted successfully`)
      } else showToast('Failed to delete animal', 'error')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = [...animals]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((a) => a.name?.toLowerCase().includes(q) || a.breed?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      let va = a[sortField] || ''
      let vb = b[sortField] || ''
      if (sortField === 'price') { va = Number(va) || 0; vb = Number(vb) || 0 }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase() }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [animals, searchQuery, sortField, sortDir])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc'
      ? <FaSortAmountUp className="ip-sort-icon" />
      : <FaSortAmountDown className="ip-sort-icon" />
  }

  const totalCount = animals.length
  const activeCount = animals.filter((a) => a.visibility !== false).length
  const hiddenCount = totalCount - activeCount

  useEffect(() => {
    if (!deleteModal) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [deleteModal])

  return (
    <div className="ip-wrapper">
      <div className="ip-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`ip-toast ip-toast--${t.type} ${t.exiting ? 'ip-toast--exit' : ''}`}>
            <span className="ip-toast-bar" />
            {t.type === 'error'
              ? <FaExclamationCircle className="ip-toast-icon" />
              : <FaCheckCircle className="ip-toast-icon" />}
            <span className="ip-toast-msg">{t.message}</span>
            <button className="ip-toast-close" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} aria-label="Dismiss">
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <div className="ip-container">
        <header className="ip-header">
          <div className="ip-header-content">
            <div className="ip-header-title-wrap">
              <div className="ip-header-icon">
                <FaBoxOpen />
              </div>
              <div className="ip-header-text">
                <h1 className="ip-title">Inventory</h1>
                <p className="ip-subtitle">Manage your livestock collection</p>
              </div>
            </div>
            {!loading && !error && animals.length > 0 && (
              <button className="ip-add-btn" onClick={() => navigate('/add-animal')}>
                <FaPlusCircle />
                <span>Add Animal</span>
              </button>
            )}
          </div>
        </header>

        {!loading && !error && animals.length > 0 && (
          <div className="ip-stats-grid">
            <div className="ip-stat-item">
              <div className="ip-stat-icon-wrap ip-stat-icon-wrap--total">
                <FaBox />
              </div>
              <div className="ip-stat-content">
                <AnimCounter value={totalCount} className="ip-stat-value" />
                <span className="ip-stat-label">Total</span>
              </div>
            </div>
            <div className="ip-stat-item">
              <div className="ip-stat-icon-wrap ip-stat-icon-wrap--active">
                <FaEye />
              </div>
              <div className="ip-stat-content">
                <AnimCounter value={activeCount} className="ip-stat-value ip-stat-value--active" />
                <span className="ip-stat-label">Active</span>
              </div>
            </div>
            <div className="ip-stat-item">
              <div className="ip-stat-icon-wrap ip-stat-icon-wrap--hidden">
                <FaArchive />
              </div>
              <div className="ip-stat-content">
                <AnimCounter value={hiddenCount} className="ip-stat-value ip-stat-value--hidden" />
                <span className="ip-stat-label">Hidden</span>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && animals.length > 0 && (
          <div className="ip-control-bar">
            <div className="ip-search-wrapper">
              <FaSearch className="ip-search-icon" />
              <input
                className="ip-search-input"
                type="text"
                placeholder="Search animals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="ip-search-clear" onClick={() => setSearchQuery('')}>
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="ip-control-right">
              <span className="ip-result-badge">{filtered.length} items</span>
              <div className="ip-view-toggle">
                <button 
                  className={`ip-view-btn ${viewMode === 'table' ? 'ip-view-btn--active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <FaList />
                </button>
                <button 
                  className={`ip-view-btn ${viewMode === 'grid' ? 'ip-view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <>
            <div className="ip-table-wrap">
              <table className="ip-table">
                <thead>
                  <tr>
                    <th className="ip-col-thumb"></th>
                    <th>Name</th>
                    <th>Breed</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="ip-col-toggle">Visibility</th>
                    <th className="ip-col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} delay={i * 0.08} />)}
                </tbody>
              </table>
            </div>
            <div className="ip-cards-mobile">
              {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} delay={i * 0.1} />)}
            </div>
          </>
        )}

        {error && !loading && (
          <div className="ip-empty-state">
            <div className="ip-empty-icon ip-empty-icon--error">
              <FaExclamationTriangle />
            </div>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="ip-btn ip-btn--primary" onClick={fetchAnimals}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && animals.length === 0 && (
          <div className="ip-empty-state">
            <div className="ip-empty-icon">
              <FaBoxOpen />
            </div>
            <h3>No listings yet</h3>
            <p>Start by adding your first animal to the inventory.</p>
            <button className="ip-btn ip-btn--primary" onClick={() => navigate('/add-animal')}>
              <FaPlusCircle />
              <span>Add First Listing</span>
            </button>
          </div>
        )}

        {!loading && !error && animals.length > 0 && filtered.length === 0 && (
          <div className="ip-empty-state ip-empty-state--compact">
            <FaSearch className="ip-empty-search-icon" />
            <p>No results for "<strong>{searchQuery}</strong>"</p>
            <button className="ip-btn ip-btn--ghost" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            {viewMode === 'table' ? (
              <div className="ip-table-wrap">
                <table className="ip-table">
                  <thead>
                    <tr>
                      <th className="ip-col-thumb"></th>
                      <th className="ip-th-sortable" onClick={() => toggleSort('name')}>
                        Name <SortIcon field="name" />
                      </th>
                      <th className="ip-th-sortable" onClick={() => toggleSort('breed')}>
                        Breed <SortIcon field="breed" />
                      </th>
                      <th className="ip-th-sortable" onClick={() => toggleSort('price')}>
                        Price <SortIcon field="price" />
                      </th>
                      <th>Status</th>
                      <th className="ip-col-toggle">Visibility</th>
                      <th className="ip-col-actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((animal, idx) => {
                      const status = getStatusInfo(animal)
                      const StatusIcon = status.icon
                      return (
                        <tr key={animal._id} className="ip-row" style={{ '--row-i': idx }}>
                          <td className="ip-col-thumb">
                            <div className="ip-thumb-wrapper">
                              <img
                                className="ip-thumb-img"
                                src={getThumbnail(animal)}
                                alt={animal.name}
                                onError={handleImageError}
                                loading="lazy"
                              />
                            </div>
                          </td>
                          <td>
                            <div className="ip-name-cell">
                              <span className="ip-name">{animal.name}</span>
                              {animal.category && <span className="ip-category">{animal.category}</span>}
                            </div>
                          </td>
                          <td><span className="ip-breed">{animal.breed || '—'}</span></td>
                          <td>
                            <span className="ip-price">{formatPrice(animal.price)}</span>
                            {animal.discountPrice && (
                              <span className="ip-price-discount">{formatPrice(animal.discountPrice)}</span>
                            )}
                          </td>
                          <td>
                            <span className={`ip-status ${status.className}`}>
                              <StatusIcon />
                              {status.label}
                            </span>
                          </td>
                          <td className="ip-col-toggle">
                            <ToggleSwitch isActive={status.isActive} onToggle={() => handleToggle(animal)} />
                          </td>
                          <td className="ip-col-actions">
                            <div className="ip-actions">
                              <button className="ip-action ip-action--edit" onClick={() => handleEdit(animal)} title="Edit">
                                <FaPen />
                              </button>
                              <button className="ip-action ip-action--delete" onClick={() => openDeleteModal(animal)} title="Delete">
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="ip-grid-view">
                {filtered.map((animal, idx) => {
                  const status = getStatusInfo(animal)
                  const StatusIcon = status.icon
                  return (
                    <div key={animal._id} className="ip-grid-card" style={{ '--card-i': idx }}>
                      <div className="ip-grid-thumb">
                        <img
                          src={getThumbnail(animal)}
                          alt={animal.name}
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <span className={`ip-grid-badge ${status.className}`}>
                          <StatusIcon />
                          {status.label}
                        </span>
                      </div>
                      <div className="ip-grid-content">
                        <div className="ip-grid-header">
                          <h3 className="ip-grid-name">{animal.name}</h3>
                          <span className="ip-grid-price">{formatPrice(animal.price)}</span>
                        </div>
                        <div className="ip-grid-meta">
                          <span className="ip-grid-breed">{animal.breed || '—'}</span>
                          {animal.category && <span className="ip-grid-category">{animal.category}</span>}
                        </div>
                        <div className="ip-grid-footer">
                          <ToggleSwitch isActive={status.isActive} onToggle={() => handleToggle(animal)} size="sm" />
                          <div className="ip-grid-actions">
                            <button className="ip-action ip-action--edit" onClick={() => handleEdit(animal)}>
                              <FaPen />
                            </button>
                            <button className="ip-action ip-action--delete" onClick={() => openDeleteModal(animal)}>
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <footer className="ip-footer">
              <div className="ip-footer-stats">
                <span className="ip-footer-stat">
                  <strong>{totalCount}</strong> total
                </span>
                <span className="ip-footer-divider">·</span>
                <span className="ip-footer-stat ip-footer-stat--active">
                  <strong>{activeCount}</strong> active
                </span>
                <span className="ip-footer-divider">·</span>
                <span className="ip-footer-stat ip-footer-stat--hidden">
                  <strong>{hiddenCount}</strong> hidden
                </span>
              </div>
              <button className="ip-footer-add" onClick={() => navigate('/add-animal')}>
                <FaPlusCircle />
                <span>Add New</span>
                <FaChevronRight className="ip-footer-arrow" />
              </button>
            </footer>
          </>
        )}
      </div>

      {deleteModal && deleteTarget && (
        <div className={`ip-modal-overlay ${deleteClosing ? 'ip-modal-overlay--closing' : ''}`} onClick={closeDeleteModal}>
          <div className={`ip-modal ${deleteClosing ? 'ip-modal--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="ip-modal-close" onClick={closeDeleteModal} disabled={deleteLoading}>
              <FaTimes />
            </button>

            <div className="ip-modal-body">
              <div className="ip-modal-thumb">
                <img
                  src={getThumbnail(deleteTarget)}
                  alt={deleteTarget.name}
                  onError={handleImageError}
                />
                <div className="ip-modal-thumb-overlay">
                  <FaTrashAlt />
                </div>
              </div>

              <div className="ip-modal-warning-icon">
                <FaShieldAlt />
              </div>

              <h3 className="ip-modal-title">Delete "{deleteTarget.name}"?</h3>
              <p className="ip-modal-message">
                This action cannot be undone. All data will be permanently removed.
              </p>

              {((deleteTarget.images?.length > 0) || (deleteTarget.videos?.length > 0)) && (
                <div className="ip-modal-file-tags">
                  {deleteTarget.images?.length > 0 && (
                    <span className="ip-modal-tag">
                      <FaTag /> {deleteTarget.images.length} photo{deleteTarget.images.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {deleteTarget.videos?.length > 0 && (
                    <span className="ip-modal-tag">
                      <FaInfoCircle /> {deleteTarget.videos.length} video{deleteTarget.videos.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="ip-modal-actions">
              <button className="ip-modal-btn ip-modal-btn--secondary" onClick={closeDeleteModal} disabled={deleteLoading}>
                Cancel
              </button>
              <button className="ip-modal-btn ip-modal-btn--danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? (
                  <><FaSpinner className="ip-spinner" /> Deleting...</>
                ) : (
                  <><FaTrashAlt /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPreview
