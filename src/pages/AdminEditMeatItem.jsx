// AdminEditMeatItem.jsx — Fully functional edit page for meat items
// Reuses styles from Adminmeatform.css

import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminItems, useMeatItems } from '../hooks/useMeatItems'
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

const DESC_MAX = 120

export default function AdminEditMeatItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateItem } = useAdminItems()

  const [form, setForm] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [descLen, setDescLen] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newCutInput, setNewCutInput] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const fileRef = useRef(null)
  const toastTimer = useRef(null)

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

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/api/meat-items/${id}`)
        if (response.data && response.data.success) {
          const item = response.data.data
          setForm({
            ...item,
            price: String(item.price), // Form expects string for input
            fishOptions: item.fishOptions || {
              isFish: item.category === 'fish',
              availableCuts: DEFAULT_FISH_CUTS.slice(0, 4),
              sizeVariants: DEFAULT_FISH_SIZES
            }
          })
          setImagePreview(item.imageUrl)
          setDescLen(item.description?.length || 0)
        } else {
          showToast('error', 'Item not found.')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        showToast('error', 'Failed to load item details.')
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
    return () => clearTimeout(toastTimer.current)
  }, [id])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const showToast = (type, msg) => {
    setToast({ type, msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  const handleFileChange = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)

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
      showToast('error', 'Failed to upload image.')
      setImagePreview(form.imageUrl)
    } finally {
      setSubmitting(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    set('imageUrl', '')
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    set('imageUrl', url)
    setImagePreview(url || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const priceNum = parseFloat(form.price)

    if (!form.name.trim())              return showToast('error', 'Item name is required.')
    if (!form.category)                 return showToast('error', 'Please select a category.')
    if (isNaN(priceNum) || priceNum <= 0) return showToast('error', 'Please enter a valid price.')
    if (!form.description.trim())       return showToast('error', 'Description is required.')
    if (form.showInHeader && !form.imageUrl) return showToast('error', 'Image is required for Home Header Slider.')
    if (form.showInHeader && (!form.titleTop?.trim() || !form.titleBottom?.trim())) {
      return showToast('error', 'Slider titles are required when featured in header.')
    }

    setSubmitting(true)
    try {
      await updateItem(id, {
        ...form,
        price: priceNum,
      })
      showToast('success', 'Item updated successfully!')
      setTimeout(() => navigate('/admin/meat-items'), 1500)
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="amf-loading">Loading item details...</div>
  if (!form) return <div className="amf-error">Item not found.</div>

  return (
    <div className="amf-page">
      {toast && (
        <div className={`amf-toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}
      <div className="amf-card">
        <div className="amf-header">
          <div className="amf-header-inner">
            <div className="amf-header-icon">✏️</div>
            <div className="amf-header-text">
              <p className="amf-header-eyebrow">Admin Panel</p>
              <h1 className="amf-header-title">Edit Meat Item</h1>
            </div>
          </div>
        </div>

        <form className="amf-body" onSubmit={handleSubmit} noValidate>
          {/* Section 1: Basic Info */}
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

          {/* Section 2: Description */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Description</span>
              <span className="amf-section-label-line" />
            </div>

            <div className="amf-field">
              <label className="amf-label">Short Description <span>*</span></label>
              <textarea
                className="amf-textarea"
                maxLength={DESC_MAX}
                value={form.description}
                onChange={e => {
                  set('description', e.target.value)
                  setDescLen(e.target.value.length)
                }}
                required
              />
              <p className={`amf-char-counter ${descLen >= DESC_MAX ? 'over' : ''}`}>
                {descLen} / {DESC_MAX}
              </p>
            </div>
          </div>

          {/* Section 3: Image */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Product Image</span>
              <span className="amf-section-label-line" />
            </div>

            {imagePreview ? (
              <div className="amf-img-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="amf-img-preview-remove" onClick={removeImage}>✕</button>
              </div>
            ) : (
              <div className="amf-upload-zone" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFileChange(e.target.files[0])} style={{display:'none'}}/>
                <div className="amf-upload-icon">📸</div>
                <p><strong>Click to upload</strong> or drag & drop</p>
              </div>
            )}
            
            <div className="amf-field" style={{ marginTop: 14 }}>
              <label className="amf-label">Or paste image URL</label>
              <input
                className="amf-input"
                type="url"
                value={form.imageUrl}
                onChange={handleUrlChange}
              />
            </div>
          </div>

          {/* Section 4: Promotional Display */}
          <div className="amf-section">
            <div className="amf-section-label">
              <span className="amf-section-label-text">Promotional Display</span>
              <span className="amf-section-label-line" />
            </div>

            <div className="amf-row">
              <div className={`amf-toggle-card ${form.showInHeader ? 'is-active' : ''}`} onClick={() => set('showInHeader', !form.showInHeader)}>
                <p>Main Header Slider</p>
                <input type="checkbox" checked={form.showInHeader} readOnly />
              </div>
              <div className={`amf-toggle-card ${form.isBestseller ? 'is-active' : ''}`} onClick={() => set('isBestseller', !form.isBestseller)}>
                <p>Bestseller Badge</p>
                <input type="checkbox" checked={form.isBestseller} readOnly />
              </div>
            </div>

            {form.showInHeader && (
              <div className="amf-header-titles-box">
                <div className="amf-row">
                  <div className="amf-field">
                    <label className="amf-label">Slider Top Title</label>
                    <input className="amf-input" type="text" value={form.titleTop} onChange={e => set('titleTop', e.target.value)} />
                  </div>
                  <div className="amf-field">
                    <label className="amf-label">Slider Bottom Title</label>
                    <input className="amf-input" type="text" value={form.titleBottom} onChange={e => set('titleBottom', e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="amf-submit-row">
            <button type="button" className="amf-btn-cancel" onClick={() => navigate('/admin/meat-items')}>Cancel</button>
            <button type="submit" className="amf-btn-submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
