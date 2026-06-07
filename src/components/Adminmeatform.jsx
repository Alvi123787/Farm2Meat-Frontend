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
  imageUrl: '',
  item_type_id: 2,   // ← Approach 1: Hardcoded as 2 (Meat Item) for this form
}

const DESC_MAX = 120

export default function Adminmeatform() {
  const { createItem } = useAdminItems()

  const [form,         setForm]         = useState(INITIAL)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver,     setDragOver]     = useState(false)
  const [descLen,      setDescLen]      = useState(0)

  // Submission state
  const [submitting,   setSubmitting]   = useState(false)
  const [toast,        setToast]        = useState(null) // { type: 'success'|'error', msg }

  const fileRef    = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const showToast = (type, msg) => {
    setToast({ type, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  const handleFileChange = async (file) => {
    if (!file || !file.type.startsWith('image/')) return

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await api.post('/api/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        set('imageUrl', response.data.url)
        showToast('success', 'Image uploaded successfully!')
      }
    } catch (err) {
      console.error('Upload error:', err)
      showToast('error', 'Failed to upload image. Please try again.')
      setImagePreview(null)
      set('imageUrl', '')
    } finally {
      setSubmitting(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    set('imageUrl', '')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setForm(f => ({ ...f, imageUrl: url }))
    if (url) setImagePreview(url)
    else setImagePreview(null)
  }

  const handleReset = () => {
    setForm(INITIAL)        // ← Reset bhi INITIAL use karta hai, so item_type_id: 2 reset mein bhi safe hai
    setImagePreview(null)
    setDescLen(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim())              return showToast('error', 'Item name is required.')
    if (!form.category)                 return showToast('error', 'Please select a category.')
    if (!form.price || Number(form.price) <= 0) return showToast('error', 'Please enter a valid price.')
    if (!form.description.trim())       return showToast('error', 'Description is required.')

    setSubmitting(true)
    try {
      await createItem({
        ...form,
        price:        Number(form.price),
        item_type_id: 2,   // ← Explicitly ensure item_type_id = 2 (Meat) on submit
      })
      showToast('success', `"${form.name}" added successfully! 🥩`)
      handleReset()
    } catch (err) {
      console.error('Submit error:', err)
      const message = err.response?.data?.message || err.message || 'Failed to add item. Please try again.'
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
                    onChange={e => set('category', e.target.value)}
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
                <div className="amf-select-wrap">
                  <select
                    className="amf-select"
                    value={form.badge}
                    onChange={e => set('badge', e.target.value)}
                  >
                    <option value="">Select a badge…</option>
                    {BADGES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
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