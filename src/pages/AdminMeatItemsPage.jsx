import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMeatItems, useAdminItems } from '../hooks/useMeatItems'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/authContextCore'
import { Navigate } from 'react-router-dom'
import '../css/AdminMeatItemsPage.css'

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSearch,
  faPlus,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faDrumstickBite,
  faArrowLeft,
  faTimes,
  faSave,
  faCloudUploadAlt,
  faSync,
  faBoxes,
  faCalendarAlt,
  faImage
} from '@fortawesome/free-solid-svg-icons'

const CATEGORIES = [
  { value: 'all',     label: 'All Categories' },
  { value: 'mutton',  label: 'Mutton' },
  { value: 'beef',    label: 'Beef' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'fish',    label: 'Fish' },
  { value: 'seafood', label: 'Seafood' },
]

const FORM_CATEGORIES = CATEGORIES.filter(c => c.value !== 'all')

const UNITS = [
  { value: 'kg',    label: 'Per Kg'    },
  { value: '500g',  label: 'Per 500g'  },
  { value: 'piece', label: 'Per Piece' },
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

const INITIAL_FORM = {
  name: '',
  category: 'mutton',
  price: '',
  unit: 'kg',
  expirationDate: '',
  description: '',
  imageUrl: '',
  isAvailable: true,
  isBestseller: false,
  showInHeader: false,
  titleTop: '',
  titleBottom: '',
  fishOptions: {
    isFish: false,
    availableCuts: DEFAULT_FISH_CUTS.slice(0, 4),
    sizeVariants: DEFAULT_FISH_SIZES
  }
}

export default function AdminMeatItemsPage() {
  const { role, token, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [newCutInput, setNewCutInput] = useState('')

  const fileRef = useRef(null)

  const { getAllItems } = useMeatItems()
  const { createItem, updateItem, deleteItem, toggleAvailability, toggleBestseller } = useAdminItems()

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

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllItems({ limit: 500 })
      setItems(res?.data || [])
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      if (err.response?.status === 503) {
        toast.error('Inventory service temporarily unavailable. Retrying...')
      } else {
        toast.error(`Failed to fetch meat items: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }, [getAllItems])

  useEffect(() => {
    let isMounted = true
    if (token && role === 'admin') {
      if (isMounted) fetchItems()
    }
    return () => { isMounted = false }
  }, [fetchItems, token, role])

  // RBAC Guard
  if (authLoading) return <div className="amip-loading">Verifying authentication...</div>
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  // Filtering
  const filtered = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Handlers
  const handleOpenAdd = () => {
    setForm(INITIAL_FORM)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    navigate(`/admin/edit-meat/${item._id}`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setForm(INITIAL_FORM)
    setImagePreview(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => {
      const nextVal = type === 'checkbox' ? checked : value
      const updated = {
        ...prev,
        [name]: nextVal
      }

      if (name === 'category') {
        if (value === 'fish') {
          updated.unit = 'kg'
          updated.fishOptions = {
            ...(prev.fishOptions || {}),
            isFish: true,
            availableCuts: prev.fishOptions?.availableCuts?.length ? prev.fishOptions.availableCuts : DEFAULT_FISH_CUTS.slice(0, 4),
            sizeVariants: prev.fishOptions?.sizeVariants?.length ? prev.fishOptions.sizeVariants : DEFAULT_FISH_SIZES
          }
        } else {
          updated.fishOptions = {
            ...(prev.fishOptions || {}),
            isFish: false
          }
        }
      }

      return updated
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/api/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success) {
        setForm(prev => ({ ...prev, imageUrl: res.data.url }))
        toast.success('Image uploaded')
      }
    } catch (err) {
      toast.error('Image upload failed')
      setImagePreview(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.price || form.price <= 0) return toast.error('Valid price is required')

    setSubmitting(true)
    try {
      await createItem(form)
      toast.success('Item added successfully')
      handleCloseModal()
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAvail = async (id) => {
    try {
      await toggleAvailability(id)
      fetchItems()
    } catch (e) {
      toast.error('Failed to update availability')
    }
  }

  const handleToggleBest = async (id) => {
    try {
      await toggleBestseller(id)
      fetchItems()
    } catch (e) {
      toast.error('Failed to update bestseller status')
    }
  }

  const confirmDelete = (item) => setDeleteTarget(item)
  
  const executeDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteItem(deleteTarget._id)
      toast.success('Item deleted')
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="amip-container">
      {/* Header */}
      <header className="amip-header">
        <div className="amip-title-section">
          <FontAwesomeIcon icon={faDrumstickBite} className="amip-title-icon" />
          <h1>Meat Inventory Management</h1>
        </div>
        <div className="amip-header-actions">
          <button className="amip-btn amip-btn-refresh" onClick={fetchItems}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </button>
          <button className="amip-btn amip-btn-primary" onClick={handleOpenAdd}>
            <FontAwesomeIcon icon={faPlus} /> Add New Meat Item
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="amip-toolbar">
        <div className="amip-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search items by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="amip-filter-group">
          <select
            className="amip-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="amip-table-wrapper">
        {loading && items.length === 0 ? (
          <div className="amip-loading-state">
            <div className="amip-spinner"></div>
            <p>Fetching inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="amip-empty">
            <FontAwesomeIcon icon={faBoxes} size="3x" />
            <p>No meat items found matching your criteria.</p>
          </div>
        ) : (
          <table className="amip-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price & Unit</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id}>
                  <td>
                    <div className="amip-product-cell">
                      <img
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        className="amip-item-img"
                      />
                      <div className="amip-product-info">
                        <span className="amip-name">{item.name}</span>
                        {item.isBestseller && <span className="amip-best-badge">Bestseller</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`amip-category-badge cat-${item.category}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <div className="amip-price-info">
                      <strong>Rs. {item.price}</strong>
                      <span>/ {item.unit}</span>
                    </div>
                  </td>
                  <td>
                    <div className="amip-expiry">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <button
                      className={`amip-status-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
                      onClick={() => handleToggleAvail(item._id)}
                    >
                      <FontAwesomeIcon icon={item.isAvailable ? faCheckCircle : faTimesCircle} />
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td>
                    <div className="amip-actions">
                      <button className="amip-btn-icon" onClick={() => handleOpenEdit(item)} title="Edit">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="amip-btn-icon delete" onClick={() => confirmDelete(item)} title="Delete">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="amip-modal-overlay">
          <div className="amip-modal-form" onClick={e => e.stopPropagation()}>
            <div className="amip-modal-header">
              <h3>
                <FontAwesomeIcon icon={faPlus} />
                Add New Meat Item
              </h3>
              <button className="amip-close-btn" onClick={handleCloseModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="amip-form">
              <div className="amip-form-grid">
                <div className="amip-form-group full">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Mutton Chops"
                    required
                  />
                </div>

                <div className="amip-form-group">
                  <label>Category *</label>
                  <select name="category" value={form.category} onChange={handleInputChange}>
                    {FORM_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="amip-form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="850"
                    required
                  />
                </div>

                <div className="amip-form-group">
                  <label>Unit</label>
                  <select name="unit" value={form.unit} onChange={handleInputChange}>
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div className="amip-form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={form.expirationDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="amip-form-group full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Brief product description..."
                    rows="3"
                  ></textarea>
                </div>

                {/* Fish Specific Options */}
                {form.category === 'fish' && (
                  <div className="amip-form-group full" style={{
                    background: '#f0f9ff',
                    border: '1.5px solid #bae6fd',
                    borderRadius: '10px',
                    padding: '16px',
                    marginTop: '6px',
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

                <div className="amip-form-group full">
                  <label>Product Image</label>
                  <div className="amip-image-upload">
                    <div className="amip-preview-box" onClick={() => fileRef.current.click()}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" />
                      ) : (
                        <div className="amip-upload-placeholder">
                          <FontAwesomeIcon icon={faCloudUploadAlt} size="2x" />
                          <span>Click to upload image</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="amip-form-toggles full">
                  <label className="amip-checkbox-label">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={form.isAvailable}
                      onChange={handleInputChange}
                    />
                    <span>In Stock / Available</span>
                  </label>
                  <label className="amip-checkbox-label">
                    <input
                      type="checkbox"
                      name="isBestseller"
                      checked={form.isBestseller}
                      onChange={handleInputChange}
                    />
                    <span>Mark as Bestseller</span>
                  </label>
                  <label className="amip-checkbox-label">
                    <input
                      type="checkbox"
                      name="showInHeader"
                      checked={form.showInHeader}
                      onChange={handleInputChange}
                    />
                    <span>Show in Home Slider</span>
                  </label>
                </div>

                {form.showInHeader && (
                  <div className="amip-form-group full" style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '10px' }}>Slider Text Configuration</p>
                    <div className="amip-form-grid">
                      <div className="amip-form-group">
                        <label>Slider Top Title</label>
                        <input
                          type="text"
                          name="titleTop"
                          value={form.titleTop}
                          onChange={handleInputChange}
                          placeholder="e.g. Premium Quality"
                          required={form.showInHeader}
                        />
                      </div>
                      <div className="amip-form-group">
                        <label>Slider Bottom Title</label>
                        <input
                          type="text"
                          name="titleBottom"
                          value={form.titleBottom}
                          onChange={handleInputChange}
                          placeholder="e.g. Mutton Chops"
                          required={form.showInHeader}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="amip-form-actions">
                <button type="button" className="amip-btn amip-btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="amip-btn amip-btn-primary" disabled={submitting}>
                  {submitting ? 'Processing...' : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="amip-modal-overlay">
          <div className="amip-modal-delete" onClick={e => e.stopPropagation()}>
            <div className="amip-delete-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3>Remove Product?</h3>
            <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div className="amip-delete-actions">
              <button className="amip-btn amip-btn-secondary" onClick={() => setDeleteTarget(null)}>
                Keep Item
              </button>
              <button className="amip-btn amip-btn-danger" onClick={executeDelete}>
                Yes, Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
