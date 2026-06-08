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

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const fileRef = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/api/meat-items/${id}`)
        if (response.data && response.data.success) {
          const item = response.data.data
          setForm({
            ...item,
            price: String(item.price) // Form expects string for input
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
