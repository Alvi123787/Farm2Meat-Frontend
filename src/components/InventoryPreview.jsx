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
  FaDollarSign,
  FaInfoCircle,
  FaUser,
  FaArchive,
} from 'react-icons/fa'
import api from '../services/api'
import '../css/InventoryPreview.css'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/* ── fallback ────────────────────────────────────────── */
const fallbackSrc =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
      <rect fill="#f5f0e8" width="60" height="60" rx="12"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="sans-serif" font-size="22" fill="#ccc">🐐</text>
    </svg>`
  )

const handleImageError = (e) => { e.target.src = fallbackSrc }

/* ── helpers ─────────────────────────────────────────── */
const getThumbnail = (animal) => {
  if (animal.images?.length > 0) return `${API_URL}${animal.images[0]}`
  if (animal.imageUrl) return `${API_URL}${animal.imageUrl}`
  return fallbackSrc
}

const formatPrice = (price) => {
  if (!price) return 'N/A'
  return `Rs ${Number(price).toLocaleString()}`
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

/* ── toggle switch ───────────────────────────────────── */
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

/* ── animated counter ────────────────────────────────── */
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

/* ── skeleton row ────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const InventoryPreview = () => {
  const navigate = useNavigate()

  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteClosing, setDeleteClosing] = useState(false)

  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  /* ── fetch ─────────────────────────────────────── */
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

  /* ── toasts ────────────────────────────────────── */
  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, message, type, exiting: false }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350)
    }, 3200)
  }, [])

  /* ── toggle ────────────────────────────────────── */
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

  /* ── edit ───────────────────────────────────────── */
  const handleEdit = (animal) => navigate(`/admin/edit-animal/${animal._id}`)

  /* ── delete ────────────────────────────────────── */
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

  /* ── sort & filter ─────────────────────────────── */
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

  /* ── counts ────────────────────────────────────── */
  const totalCount = animals.length
  const activeCount = animals.filter((a) => a.visibility !== false).length
  const hiddenCount = totalCount - activeCount

  /* ── body lock for modal ───────────────────────── */
  useEffect(() => {
    if (!deleteModal) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [deleteModal])

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div className="ip-wrapper">
      {/* ── toasts ─────────────────────────────── */}
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
        {/* ── header ───────────────────────────── */}
        <header className="ip-header">
          <div className="ip-header-left">
            <div className="ip-header-icon-wrap">
              <FaBoxOpen className="ip-header-icon" />
            </div>
            <div>
              <h2 className="ip-title">Inventory Management</h2>
              <p className="ip-title-sub">Manage and track your livestock listings</p>
            </div>
          </div>

          {!loading && !error && animals.length > 0 && (
            <button className="ip-add-btn" onClick={() => navigate('/add-animal')}>
              <FaPlusCircle className="ip-add-btn-icon" />
              <span>Add New Animal</span>
              <span className="ip-add-btn-shine" />
            </button>
          )}
        </header>

        {/* ── stats strip ──────────────────────── */}
        {!loading && !error && animals.length > 0 && (
          <div className="ip-stats">
            <div className="ip-stat-card">
              <div className="ip-stat-icon ip-stat-icon--total">
                <FaBox />
              </div>
              <div className="ip-stat-info">
                <AnimCounter value={totalCount} className="ip-stat-num" />
                <span className="ip-stat-label">Total Listings</span>
              </div>
            </div>
            <div className="ip-stat-card ip-stat-card--active">
              <div className="ip-stat-icon ip-stat-icon--active">
                <FaEye />
              </div>
              <div className="ip-stat-info">
                <AnimCounter value={activeCount} className="ip-stat-num ip-stat-num--active" />
                <span className="ip-stat-label">Active</span>
              </div>
            </div>
            <div className="ip-stat-card ip-stat-card--hidden">
              <div className="ip-stat-icon ip-stat-icon--hidden">
                <FaArchive />
              </div>
              <div className="ip-stat-info">
                <AnimCounter value={hiddenCount} className="ip-stat-num ip-stat-num--hidden" />
                <span className="ip-stat-label">Hidden</span>
              </div>
            </div>
          </div>
        )}

        {/* ── search & sort bar ────────────────── */}
        {!loading && !error && animals.length > 0 && (
          <div className="ip-toolbar">
            <div className="ip-search-wrap">
              <FaSearch className="ip-search-icon" />
              <input
                className="ip-search"
                type="text"
                placeholder="Search by name, breed, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="ip-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <FaTimes />
                </button>
              )}
              <span className="ip-search-glow" />
            </div>
            <span className="ip-result-count">
              {filtered.length} result{filtered.length !== 1 && 's'}
            </span>
          </div>
        )}

        {/* ── loading skeleton ─────────────────── */}
        {loading && (
          <>
            <div className="ip-table-wrap">
              <table className="ip-table">
                <thead>
                  <tr>
                    <th className="ip-col-thumb">Photo</th>
                    <th>Name</th>
                    <th>Breed</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="ip-col-toggle">Visibility</th>
                    <th className="ip-col-actions">Actions</th>
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

        {/* ── error state ──────────────────────── */}
        {error && !loading && (
          <div className="ip-state">
            <div className="ip-state-icon-wrap ip-state-icon-wrap--error">
              <FaExclamationTriangle className="ip-state-icon" />
            </div>
            <h3 className="ip-state-title">Connection Error</h3>
            <p className="ip-state-text">{error}</p>
            <button className="ip-state-btn" onClick={fetchAnimals}>
              <span className="ip-state-btn-shine" />
              Try Again
            </button>
          </div>
        )}

        {/* ── empty state ──────────────────────── */}
        {!loading && !error && animals.length === 0 && (
          <div className="ip-state">
            <div className="ip-state-icon-wrap ip-state-icon-wrap--empty">
              <FaBoxOpen className="ip-state-icon" />
            </div>
            <h3 className="ip-state-title">No Listings Yet</h3>
            <p className="ip-state-text">Your inventory is empty. Add your first animal to get started.</p>
            <button className="ip-state-btn" onClick={() => navigate('/add-animal')}>
              <FaPlusCircle />
              <span>Add First Listing</span>
              <span className="ip-state-btn-shine" />
            </button>
          </div>
        )}

        {/* ── no results ───────────────────────── */}
        {!loading && !error && animals.length > 0 && filtered.length === 0 && (
          <div className="ip-state ip-state--compact">
            <FaSearch className="ip-state-search-icon" />
            <p className="ip-state-text">No animals match "<strong>{searchQuery}</strong>"</p>
            <button className="ip-state-btn ip-state-btn--ghost" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          </div>
        )}

        {/* ── data loaded ──────────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {/* ═══════ DESKTOP TABLE ═══════ */}
            <div className="ip-table-wrap">
              <table className="ip-table">
                <thead>
                  <tr>
                    <th className="ip-col-thumb">Photo</th>
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
                    <th className="ip-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((animal, idx) => {
                    const status = getStatusInfo(animal)
                    const StatusIcon = status.icon
                    return (
                      <tr key={animal._id} className="ip-row" style={{ '--row-i': idx }}>
                        <td className="ip-col-thumb">
                          <div className="ip-thumb-wrap">
                            <img
                              className="ip-thumb"
                              src={getThumbnail(animal)}
                              alt={animal.name}
                              onError={handleImageError}
                              loading="lazy"
                            />
                            <span className="ip-thumb-overlay">
                              <FaEye />
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="ip-name">{animal.name}</span>
                          {animal.category && <span className="ip-name-sub">{animal.category}</span>}
                        </td>
                        <td><span className="ip-breed">{animal.breed}</span></td>
                        <td>
                          <span className="ip-price">{formatPrice(animal.price)}</span>
                          {animal.discountPrice && (
                            <span className="ip-price-old">{formatPrice(animal.discountPrice)}</span>
                          )}
                        </td>
                        <td>
                          <span className={`ip-status ${status.className}`}>
                            <StatusIcon className="ip-status-icon" />
                            {status.label}
                          </span>
                        </td>
                        <td className="ip-col-toggle">
                          <ToggleSwitch isActive={status.isActive} onToggle={() => handleToggle(animal)} />
                        </td>
                        <td className="ip-col-actions">
                          <div className="ip-actions">
                            <button className="ip-act ip-act--edit" onClick={() => handleEdit(animal)} title="Edit">
                              <FaPen />
                              <span className="ip-act-tooltip">Edit</span>
                            </button>
                            <button className="ip-act ip-act--delete" onClick={() => openDeleteModal(animal)} title="Delete">
                              <FaTrashAlt />
                              <span className="ip-act-tooltip">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ═══════ MOBILE CARDS ═══════ */}
            <div className="ip-cards-mobile">
              {filtered.map((animal, idx) => {
                const status = getStatusInfo(animal)
                const StatusIcon = status.icon
                return (
                  <div key={animal._id} className="ip-card" style={{ '--card-i': idx }}>
                    <div className="ip-card-thumb-wrap">
                      <img
                        className="ip-card-thumb"
                        src={getThumbnail(animal)}
                        alt={animal.name}
                        onError={handleImageError}
                        loading="lazy"
                      />
                      <span className={`ip-card-badge ${status.className}`}>
                        <StatusIcon />
                        {status.label}
                      </span>
                    </div>
                    <div className="ip-card-body">
                      <div className="ip-card-row-top">
                        <div>
                          <h3 className="ip-card-name">{animal.name}</h3>
                          <span className="ip-card-breed">{animal.breed}</span>
                        </div>
                        <span className="ip-card-price">{formatPrice(animal.price)}</span>
                      </div>
                      <div className="ip-card-row-bottom">
                        <ToggleSwitch isActive={status.isActive} onToggle={() => handleToggle(animal)} size="sm" />
                        <div className="ip-card-actions">
                          <button className="ip-act ip-act--edit" onClick={() => handleEdit(animal)}><FaPen /></button>
                          <button className="ip-act ip-act--delete" onClick={() => openDeleteModal(animal)}><FaTrashAlt /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ═══════ FOOTER ═══════ */}
            <footer className="ip-footer">
              <p className="ip-footer-text">
                <strong>{totalCount}</strong> total listings ·{' '}
                <strong className="ip-c-active">{activeCount}</strong> active,{' '}
                <strong className="ip-c-hidden">{hiddenCount}</strong> hidden
              </p>
              <button className="ip-footer-btn" onClick={() => navigate('/add-animal')}>
                Add New Listing
                <FaChevronRight className="ip-footer-btn-arrow" />
              </button>
            </footer>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          DELETE MODAL
          ═══════════════════════════════════════════ */}
      {deleteModal && deleteTarget && (
        <div className={`ip-modal-overlay ${deleteClosing ? 'ip-modal-overlay--closing' : ''}`} onClick={closeDeleteModal}>
          <div className={`ip-modal ${deleteClosing ? 'ip-modal--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="ip-modal-close" onClick={closeDeleteModal} disabled={deleteLoading} aria-label="Close">
              <FaTimes />
            </button>

            <div className="ip-modal-body">
              <div className="ip-modal-preview">
                <img
                  className="ip-modal-preview-img"
                  src={getThumbnail(deleteTarget)}
                  alt={deleteTarget.name}
                  onError={handleImageError}
                />
                <div className="ip-modal-preview-overlay">
                  <FaTrashAlt />
                </div>
              </div>

              <div className="ip-modal-danger-icon">
                <FaShieldAlt className="ip-modal-danger-svg" />
              </div>

              <h3 className="ip-modal-title">Delete Listing</h3>

              <p className="ip-modal-msg">
                Are you sure you want to permanently delete
                <strong> {deleteTarget.name}</strong>?
              </p>

              {((deleteTarget.images?.length > 0) || (deleteTarget.videos?.length > 0)) && (
                <div className="ip-modal-file-info">
                  {deleteTarget.images?.length > 0 && (
                    <span className="ip-modal-file-tag">
                      <FaTag /> {deleteTarget.images.length} photo{deleteTarget.images.length > 1 && 's'}
                    </span>
                  )}
                  {deleteTarget.videos?.length > 0 && (
                    <span className="ip-modal-file-tag">
                      <FaInfoCircle /> {deleteTarget.videos.length} video{deleteTarget.videos.length > 1 && 's'}
                    </span>
                  )}
                </div>
              )}

              <p className="ip-modal-warning">
                <FaExclamationTriangle /> This action cannot be undone. All data will be permanently removed.
              </p>
            </div>

            <div className="ip-modal-actions">
              <button className="ip-modal-btn ip-modal-btn--cancel" onClick={closeDeleteModal} disabled={deleteLoading}>
                Cancel
              </button>
              <button className="ip-modal-btn ip-modal-btn--delete" onClick={handleDelete} disabled={deleteLoading}>
                <span className="ip-modal-btn-shine" />
                {deleteLoading ? (
                  <><FaSpinner className="ip-modal-btn-spin" /> Deleting...</>
                ) : (
                  <><FaTrashAlt /> Delete Listing</>
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
