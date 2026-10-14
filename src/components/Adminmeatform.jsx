// AdminMeatForm.jsx — Fully functional · posts to /api/meat-items
// White bg · #800000 red · #d4af37 gold · Bestseller toggle

import { useState, useRef, useEffect } from 'react'
import { useAdminItems } from '../hooks/useMeatItems'
import api from '../services/api'
import '../css/Adminmeatform.css'

const CATEGORIES = [
  { value: '',        label: 'Select a category…' },
  { value: 'mutton',  label: '🐑  Mutton'  },
  { value: 'beef',    label: '🐄  Beef'    },
  { value: 'chicken', label: '🍗  Chicken' },
  { value: 'fish',    label: '🐟  Fish'    },
]

const UNITS = [
  { value: 'kg',    label: 'Per Kg'    },
  { value: '500g',  label: 'Per 500g'  },
  { value: 'piece', label: 'Per Piece' },
]

const BADGES = [
  '#1 Seller', 'Best Seller', 'Popular', 'Top Pick',
  'Daily Fresh', 'Fresh Catch', 'Premium', 'Festive Cut', 'Best Value', 'New',
]

const DEFAULT_FISH_CUTS = [
  'Slices / Steaks',
  'Boneless Cubes',
  'Finger Fish',
  'Whole Cleaned',
  'Fillet',
  'Curry Cut (With Bone)'
]

const DEFAULT_FISH_SIZES = [
  { label: '1.0 - 1.5 kg', minWeight: 1.0, maxWeight: 1.5 },
  { label: '1.5 - 2.0 kg', minWeight: 1.5, maxWeight: 2.0 },
  { label: '2.0 - 3.0 kg', minWeight: 2.0, maxWeight: 3.0 }
]

const INITIAL = {
  name: '',
  category: '',
  badge: '',
  price: '',
  unit: 'kg',
  description: '',
  isBestseller: false,
  isAvailable: true,
  showInHeader: false,
  titleTop: '',
  titleBottom: '',
  imageUrl: '',
  type: 'meat',
  fishOptions: {
    isFish: false,
    availableCuts: DEFAULT_FISH_CUTS.slice(0, 4),
    sizeVariants: DEFAULT_FISH_SIZES
  }
}

const DESC_MAX = 120

export default function Adminmeatform() {
  const { createItem } = useAdminItems()

  const [form,         setForm]         = useState(INITIAL)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver,     setDragOver]     = useState(false)
  const [descLen,      setDescLen]      = useState(0)
  const [newCutInput,  setNewCutInput]  = useState('')

  // Submission state
  const [submitting,   setSubmitting]   = useState(false)
  const [toast,        setToast]        = useState(null) // { type: 'success'|'error', msg }

  const fileRef    = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const handleToggleCut = (cut) => {
    setForm(prev => {
      const current = prev.fishOptions?.availableCuts || []
      const updated = current.includes(cut) ? current.filter(c => c !== cut) : [...current, cut]
      return {
        ...prev,
        fishOptions: {
          ...(prev.fishOptions || {}),
          isFish: prev.category === 'fish',
          availableCuts: updated,
          sizeVariants: prev.fishOptions?.sizeVariants || DEFAULT_FISH_SIZES
        }
      }
    })
  }

  const handleAddCustomCut = (e) => {
    e?.preventDefault?.()
    if (!newCutInput.trim()) return
    const cut = newCutInput.trim()
    setForm(prev => {
      const current = prev.fishOptions?.availableCuts || []
      if (current.includes(cut)) return prev
      return {
        ...prev,
        fishOptions: {
          ...(prev.fishOptions || {}),
          isFish: prev.category === 'fish',
          availableCuts: [...current, cut],
          sizeVariants: prev.fishOptions?.sizeVariants || DEFAULT_FISH_SIZES
        }
      }
    })
    setNewCutInput('')
  }

  const handleToggleSize = (sizeVariant) => {
    setForm(prev => {
      const current = prev.fishOptions?.sizeVariants || []
      const exists = current.some(s => s.label === sizeVariant.label)
      const updated = exists ? current.filter(s => s.label !== sizeVariant.label) : [...current, sizeVariant]
      return {
        ...prev,
        fishOptions: {
          ...(prev.fishOptions || {}),
          isFish: prev.category === 'fish',
          availableCuts: prev.fishOptions?.availableCuts || DEFAULT_FISH_CUTS.slice(0, 4),
          sizeVariants: updated
        }
      }
    })
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const showToast = (type, msg) => {
    setToast({ type, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return

    // Revoke previous blob if exists to prevent memory leaks
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    // Show local preview only (no upload to server, use image URL field)
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    // For now, just show preview, user can use image URL field
    showToast('info', 'Preview shown. Please use image URL field for now.')
  }

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
    set('imageUrl', '')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setForm(f => ({ ...f, imageUrl: url }))
    if (url) setImagePreview(url)
    else setImagePreview(null)
  }

  const handleReset = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setForm(INITIAL)        // ← Reset will use INITIAL state with type: 'meat'
    setImagePreview(null)
    setDescLen(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    const priceNum = parseFloat(form.price)

    if (!form.name.trim())              return showToast('error', 'Item name is required.')
    if (!form.category)                 return showToast('error', 'Please select a category.')
    if (isNaN(priceNum) || priceNum <= 0) return showToast('error', 'Please enter a valid price.')
    if (!form.description.trim())       return showToast('error', 'Description is required.')
    if (form.showInHeader && !form.imageUrl) return showToast('error', 'Image is required for Home Header Slider.')
    if (form.showInHeader && (!form.titleTop.trim() || !form.titleBottom.trim())) {
      return showToast('error', 'Slider titles are required when featured in header.')
    }

    setSubmitting(true)
    try {
      await createItem({
        ...form,
        price: priceNum,
      })
      showToast('success', `"${form.name}" added successfully! 🥩`)
      handleReset()
    } catch (err) {
      console.error('Submit error:', err)
      const message = 
        err.response?.data?.message || 
        (err.response?.data?.errors && Object.values(err.response.data.errors).join(', ')) ||
        err.message || 
        'Failed to add item. Please try again.'
      showToast('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="amf-page">
      <div className="amf-card">

        {/* ── HEADER ── */}
        <div className="amf-header">
          <div className="amf-header-inner">
            <div className="amf-header-icon">🥩</div>
            <div className="amf-header-text">
              <p className="amf-header-eyebrow">Admin Panel</p>
              <h1 className="amf-header-title">Add New Meat Item</h1>
            </div>
          </div>
        </div>

        {/* ── FORM ── */}
        <form className="amf-body" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Basic Info ── */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Basic Info</span>
              <span className="amf-section-label-line" />
            </div>

            <div className="amf-row" style={{ marginBottom: 16 }}>
              <div className="amf-field amf-field--span2">
                <label className="amf-label">Item Name <span>*</span></label>
                <input
                  className="amf-input"
                  type="text"
                  placeholder="e.g. Mutton Chops, Beef Mince…"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="amf-row" style={{ marginBottom: 16 }}>
              <div className="amf-field">
                <label className="amf-label">Category <span>*</span></label>
                <div className="amf-select-wrap">
                  <select
                    className="amf-select"
                    value={form.category}
                    onChange={e => {
                      const newCat = e.target.value
                      setForm(prev => ({
                        ...prev,
                        category: newCat,
                        unit: newCat === 'fish' ? 'kg' : prev.unit,
                        fishOptions: {
                          ...(prev.fishOptions || {}),
                          isFish: newCat === 'fish',
                          availableCuts: prev.fishOptions?.availableCuts?.length ? prev.fishOptions.availableCuts : DEFAULT_FISH_CUTS.slice(0, 4),
                          sizeVariants: prev.fishOptions?.sizeVariants?.length ? prev.fishOptions.sizeVariants : DEFAULT_FISH_SIZES
                        }
                      }))
                    }}
                    required
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="amf-field">
                <label className="amf-label">Card Badge</label>
                <input
                  className="amf-input"
                  type="text"
                  placeholder="e.g. Best Seller, Premium, Fresh"
                  value={form.badge}
                  onChange={e => set('badge', e.target.value)}
                  maxLength={40}
                />
              </div>
            </div>

            <div className="amf-row">
              <div className="amf-field">
                <label className="amf-label">Price <span>*</span></label>
                <div className="amf-input-prefix-wrap">
                  <span className="amf-input-prefix">Rs.</span>
                  <input
                    className="amf-input"
                    type="number"
                    min="1"
                    placeholder="850"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="amf-field">
                <label className="amf-label">Unit</label>
                <div className="amf-select-wrap">
                  <select
                    className="amf-select"
                    value={form.unit}
                    onChange={e => set('unit', e.target.value)}
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fish Specific Options */}
            {form.category === 'fish' && (
              <div style={{
                background: '#f0f9ff',
                border: '1.5px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                marginTop: '16px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🐟</span>
                  <h4 style={{ margin: 0, color: '#0369a1', fontSize: '0.95rem', fontWeight: 700 }}>
                    Fish Options & Cuts Configuration
                  </h4>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#0284c7', margin: '0 0 12px', lineHeight: 1.4 }}>
                  Base price set is <strong>Per KG</strong>. On the customer detail page, the customer will pick their desired fish size bracket and cut.
                </p>

                {/* Available Cuts */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Available Cuts (Select all cuts you offer for this fish):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {Array.from(new Set(DEFAULT_FISH_CUTS.concat(form.fishOptions?.availableCuts || []))).map(cut => {
                      const isSelected = (form.fishOptions?.availableCuts || []).includes(cut)
                      return (
                        <button
                          key={cut}
                          type="button"
                          onClick={() => handleToggleCut(cut)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            background: isSelected ? '#e0f2fe' : '#ffffff',
                            color: isSelected ? '#0369a1' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: isSelected ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '} {cut}
                        </button>
                      )
                    })}
                  </div>

                  {/* Add Custom Cut Input */}
                  <div style={{ display: 'flex', gap: '8px', maxWidth: '360px' }}>
                    <input
                      type="text"
                      value={newCutInput}
                      onChange={e => setNewCutInput(e.target.value)}
                      placeholder="Add new cut (e.g. Tikka Boti)"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCut(e); } }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCut}
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Add Cut
                    </button>
                  </div>
                </div>

                {/* Size Variants */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    Fish Size Brackets (Weights):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {DEFAULT_FISH_SIZES.map(size => {
                      const isSelected = (form.fishOptions?.sizeVariants || []).some(s => s.label === size.label)
                      return (
                        <label
                          key={size.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isSelected ? '#e0f2fe' : '#f8fafc',
                            border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: isSelected ? '#0369a1' : '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSize(size)}
                          />
                          <span>{size.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 2: Description ── */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Description</span>
              <span className="amf-section-label-line" />
            </div>

            <div className="amf-field">
              <label className="amf-label">Short Description <span>*</span></label>
              <textarea
                className="amf-textarea"
                placeholder="e.g. Bone-in chops, perfectly marbled for rich, tender grilling…"
                maxLength={DESC_MAX}
                value={form.description}
                onChange={e => {
                  set('description', e.target.value)
                  setDescLen(e.target.value.length)
                }}
                required
              />
              <p className={`amf-char-counter ${
                descLen > DESC_MAX - 10 && descLen < DESC_MAX ? 'warn' :
                descLen >= DESC_MAX ? 'over' : ''
              }`}>
                {descLen} / {DESC_MAX}
              </p>
            </div>
          </div>

          {/* ── Section 3: Image ── */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Product Image</span>
              <span className="amf-section-label-line" />
            </div>

            {imagePreview ? (
              <div className="amf-img-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  onError={() => setImagePreview(null)}
                />
                <button
                  type="button"
                  className="amf-img-preview-remove"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={`amf-upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFileChange(e.dataTransfer.files[0])
                }}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e.target.files[0])}
                  tabIndex={-1}
                />
                <div className="amf-upload-icon">📸</div>
                <p className="amf-upload-text">
                  <strong>Click to upload</strong> or drag & drop
                </p>
                <p className="amf-upload-hint">PNG, JPG, WEBP — max 5 MB</p>
              </div>
            )}

            <div className="amf-field" style={{ marginTop: 14 }}>
              <label className="amf-label">Or paste image URL</label>
              <input
                className="amf-input"
                type="url"
                placeholder="https://res.cloudinary.com/…"
                value={form.imageUrl}
                onChange={handleUrlChange}
              />
              <p className="amf-helper">Cloudinary or any direct image link works.</p>
            </div>
          </div>

          {/* ── Section 4: Promotional Display ── */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Promotional Display</span>
              <span className="amf-section-label-line" />
            </div>

            <div className="amf-row">
              {/* Home Header toggle */}
              <div
                className={`amf-toggle-card ${form.showInHeader ? 'is-active' : ''}`}
                onClick={() => set('showInHeader', !form.showInHeader)}
              >
                <div className="amf-toggle-left">
                  <div className="amf-toggle-icon-wrap" style={{ background: 'rgba(212,175,55,0.2)' }}>🏠</div>
                  <div className="amf-toggle-info">
                    <p className="amf-toggle-title">
                      Main Header Slider
                      <span className={`amf-toggle-status ${form.showInHeader ? 'on' : ''}`}>
                        {form.showInHeader ? 'ACTIVE' : 'OFF'}
                      </span>
                    </p>
                  </div>
                </div>
                <label className="amf-switch" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={form.showInHeader}
                    onChange={e => set('showInHeader', e.target.checked)}
                  />
                  <span className="amf-switch-track" />
                </label>
              </div>

              {/* Bestseller toggle */}
              <div
                className={`amf-toggle-card ${form.isBestseller ? 'is-active' : ''}`}
                onClick={() => set('isBestseller', !form.isBestseller)}
              >
                <div className="amf-toggle-left">
                  <div className="amf-toggle-icon-wrap">�</div>
                  <div className="amf-toggle-info">
                    <p className="amf-toggle-title">
                      Bestseller Badge
                      <span className={`amf-toggle-status ${form.isBestseller ? 'on' : ''}`}>
                        {form.isBestseller ? 'ON' : 'OFF'}
                      </span>
                    </p>
                  </div>
                </div>
                <label className="amf-switch" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={form.isBestseller}
                    onChange={e => set('isBestseller', e.target.checked)}
                  />
                  <span className="amf-switch-track" />
                </label>
              </div>
            </div>
            
            <p className="amf-helper" style={{ marginTop: '12px' }}>
              Enabling <strong>Main Header Slider</strong> will feature this item in the rotating slider on the top of the homepage.
            </p>

            {form.showInHeader && (
              <div className="amf-header-titles-box" style={{ marginTop: '16px', padding: '16px', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px dashed var(--gold)' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep-red)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✨</span> Slider Custom Titles (Required for Slider)
                </p>
                <div className="amf-row">
                  <div className="amf-field">
                    <label className="amf-label">Slider Top Title</label>
                    <input
                      className="amf-input"
                      type="text"
                      placeholder="e.g. Premium Quality"
                      value={form.titleTop}
                      onChange={e => set('titleTop', e.target.value)}
                      required={form.showInHeader}
                    />
                  </div>
                  <div className="amf-field">
                    <label className="amf-label">Slider Bottom Title</label>
                    <input
                      className="amf-input"
                      type="text"
                      placeholder="e.g. Mutton Chops"
                      value={form.titleBottom}
                      onChange={e => set('titleBottom', e.target.value)}
                      required={form.showInHeader}
                    />
                  </div>
                </div>
                <p className="amf-helper" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                  These titles appear over the image in the home slider.
                </p>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              {/* Availability */}
              <div className="amf-field">
                <label className="amf-label">Availability Status</label>
                <div className="amf-avail-row">
                  <button
                    type="button"
                    className={`amf-avail-btn yes ${form.isAvailable ? 'selected' : ''}`}
                    onClick={() => set('isAvailable', true)}
                  >
                    <span className="amf-avail-dot" />
                    In Stock
                  </button>
                  <button
                    type="button"
                    className={`amf-avail-btn no ${!form.isAvailable ? 'selected' : ''}`}
                    onClick={() => set('isAvailable', false)}
                  >
                    <span className="amf-avail-dot" />
                    Out of Stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Submit Row ── */}
          <div className="amf-submit-row">
            <button
              type="button"
              className="amf-btn-reset"
              onClick={handleReset}
              disabled={submitting}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="amf-btn-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="amf-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  Add Meat Item
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`amf-toast show amf-toast--${toast.type}`}>
          <span className="amf-toast-dot" />
          {toast.msg}
        </div>
      )}
    </div>
  )
}