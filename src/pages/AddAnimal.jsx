import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/authContextCore'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import DOMPurify from 'dompurify'
import {
  FaArrowLeft,
  FaPlusCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaInfoCircle,
  FaMoneyBillWave,
  FaHeartbeat,
  FaCamera,
  FaFileAlt,
  FaCloudUploadAlt,
  FaTimes,
  FaPlay,
  FaStar,
  FaEye,
  FaEyeSlash,
  FaTruck,
  FaHandshake,
  FaSave
} from 'react-icons/fa'
import api from '../services/api'
import '../css/AddAnimal.css'
import { buildMediaUrl } from '../utils/mediaUrl'

// ── Dropdown options ──
const categoryOptions = [
  { value: '', label: 'Select Category' },
  { value: 'Bakra', label: 'Bakra' },
  { value: 'Patth', label: 'Patth' },
  { value: 'Bakri', label: 'Bakri' }
]

const healthOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' }
]

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'new', label: 'New Arrival' }
]

// ── Default empty form state ──
const defaultFormState = {
  name: '',
  type: 'animal',
  item_type_id: 1,        // ← Approach 1: Hardcoded as 1 (Livestock) for this form
  category: '',
  breed: '',
  gender: 'male',
  age: '',
  ageUnit: 'months',
  weight: '',
  purchasePrice: '',
  price: '',
  discountPrice: '',
  status: 'available',
  visibility: true,
  color: '',
  teeth: '',
  healthStatus: 'good',
  farmLocation: '',
  city: '',
  shortDescription: '',
  fullDescription: '',
  specialNotes: '',
  deliveryAvailable: false,
  negotiable: false,
  // Meat Integration
  isForMeat: false,
  slaughterWeight: '',
  meatYieldEstimate: ''
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: Clean Price (Remove commas/letters)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cleanPrice = (val) => {
  if (val === null || val === undefined) return 0
  const cleaned = String(val).replace(/[^0-9.]/g, '')
  return cleaned ? parseFloat(cleaned) : 0
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: Format Price for UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const formatPrice = (val) => {
  if (!val) return ''
  return new Intl.NumberFormat('en-PK').format(val)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: Parse age string back to number
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const parseAge = (animal) => {
  if (!animal) return { age: '', ageUnit: 'months' }
  return {
    age: animal.age !== undefined && animal.age !== null ? animal.age : '',
    ageUnit: animal.ageUnit || 'months'
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: Parse weight string back to number
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const parseWeight = (weightValue) => {
  if (weightValue === null || weightValue === undefined || weightValue === '') return ''
  return String(weightValue).replace(/[^0-9.]/g, '').trim()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AddAnimal = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token, role, loading: authLoading } = useAuth()

  // Detect mode: if URL has :id param → edit mode
  const isEditMode = Boolean(id)

  // ── Form data state ──
  const [animalData, setAnimalData] = useState({ ...defaultFormState })

  // ── Media state ──
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [removedImages, setRemovedImages] = useState([])

  const [existingVideos, setExistingVideos] = useState([])
  const [newVideos, setNewVideos] = useState([])
  const [newVideoPreviews, setNewVideoPreviews] = useState([])
  const [removedVideos, setRemovedVideos] = useState([])

  // ── URL-based media state ──
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [urlImages, setUrlImages] = useState([])
  const [urlVideos, setUrlVideos] = useState([])

  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // ── Drag state ──
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [isDraggingVideo, setIsDraggingVideo] = useState(false)

  // ── UI state ──
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // ════════════════════════════════════════════
  // Fetch animal data when in edit mode
  // ════════════════════════════════════════════

  const fetchAnimalData = useCallback(async () => {
    setFetchLoading(true)
    setFetchError('')

    try {
      const response = await api.get(`/api/animals/${id}`)
      const result = response.data

      if (result.success && result.data) {
        const animal = result.data

        const { age, ageUnit } = parseAge(animal)
        const weight = parseWeight(animal.weight)

        setAnimalData({
          name: animal.name || '',
          type: animal.type || 'animal',
          item_type_id: 1,          // ← Always 1 (Livestock) even in edit mode
          category: animal.category || '',
          breed: animal.breed || '',
          gender: animal.gender || 'male',
          age,
          ageUnit,
          weight,
          purchasePrice: animal.purchasePrice || '',
          price: animal.price || '',
          discountPrice: animal.discountPrice || '',
          status: animal.status || 'available',
          visibility: animal.visibility !== false,
          color: animal.color || '',
          teeth: animal.teeth || '',
          healthStatus: animal.healthStatus || 'good',
          farmLocation: animal.farmLocation || '',
          city: animal.city || '',
          shortDescription: animal.shortDescription || '',
          fullDescription: animal.fullDescription || '',
          specialNotes: animal.specialNotes || '',
          deliveryAvailable: animal.deliveryAvailable === true,
          negotiable: animal.negotiable === true,
          // Meat Integration
          isForMeat: animal.isForMeat === true,
          slaughterWeight: animal.slaughterWeight || '',
          meatYieldEstimate: animal.meatYieldEstimate || ''
        })

        setExistingImages(animal.images || [])
        setExistingVideos(animal.videos || [])
      } else {
        setFetchError('Animal not found. It may have been deleted.')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setFetchError('Cannot connect to server. Make sure backend is running.')
    } finally {
      setFetchLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (authLoading) return

    if (!token || role !== 'admin') {
      navigate('/login', {
        state: {
          from: isEditMode ? `/admin/edit-animal/${id}` : '/admin/add-animal',
          message: !token ? 'Please login to continue.' : 'Admin access required.'
        }
      })
      return
    }

    if (isEditMode && id) {
      fetchAnimalData()
    }
  }, [id, navigate, isEditMode, token, role, authLoading, fetchAnimalData])

  // ════════════════════════════════════════════
  // Form Input Handlers
  // ════════════════════════════════════════════

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setAnimalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleToggle = (field) => {
    setAnimalData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // ════════════════════════════════════════════
  // URL Media Handlers
  // ════════════════════════════════════════════

  const addImageUrl = () => {
    const val = String(imageUrlInput || '')
    if (!val.trim()) return

    try {
      new URL(val)
    } catch {
      setErrorMsg('Please enter a valid image URL.')
      return
    }

    if (urlImages.includes(val)) {
      setErrorMsg('This image URL is already added.')
      return
    }

    setUrlImages(prev => [...prev, val])
    setImageUrlInput('')
    setErrorMsg('')
  }

  const addVideoUrl = () => {
    const val = String(videoUrlInput || '')
    if (!val.trim()) return

    try {
      new URL(val)
    } catch {
      setErrorMsg('Please enter a valid video URL.')
      return
    }

    if (urlVideos.includes(val)) {
      setErrorMsg('This video URL is already added.')
      return
    }

    setUrlVideos(prev => [...prev, val])
    setVideoUrlInput('')
    setErrorMsg('')
  }

  const removeUrlImage = (index) => {
    setUrlImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeUrlVideo = (index) => {
    setUrlVideos(prev => prev.filter((_, i) => i !== index))
  }

  // ════════════════════════════════════════════
  // Image Handlers
  // ════════════════════════════════════════════

  const addImages = (fileList) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024
    const maxImagesAllowed = 8

    if (newImages.length + existingImages.length + urlImages.length >= maxImagesAllowed) {
      setErrorMsg(`Max ${maxImagesAllowed} images allowed.`)
      return
    }

    const validFiles = Array.from(fileList).filter(file => {
      if (!validTypes.includes(file.type)) return false
      if (file.size > maxSize) return false
      return true
    })

    if (validFiles.length === 0 && fileList.length > 0) {
      setErrorMsg('Invalid files. Only JPEG, PNG, WebP under 5MB allowed.')
      return
    }

    setErrorMsg('')
    const spaceLeft = maxImagesAllowed - (newImages.length + existingImages.length + urlImages.length)
    const filesToAdd = validFiles.slice(0, spaceLeft)

    setNewImages(prev => [...prev, ...filesToAdd])
    const previews = filesToAdd.map(f => URL.createObjectURL(f))
    setNewImagePreviews(prev => [...prev, ...previews])
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    setRemovedImages(prev => [...prev, imageToRemove])
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // ════════════════════════════════════════════
  // Video Handlers
  // ════════════════════════════════════════════

  const addVideos = (fileList) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    const maxSize = 50 * 1024 * 1024
    const maxVideosAllowed = 1

    if (newVideos.length + existingVideos.length + urlVideos.length >= maxVideosAllowed) {
      setErrorMsg(`Max ${maxVideosAllowed} video allowed.`)
      return
    }

    const validFiles = Array.from(fileList).filter(file => {
      if (!validTypes.includes(file.type)) return false
      if (file.size > maxSize) return false
      return true
    })

    if (validFiles.length === 0 && fileList.length > 0) {
      setErrorMsg('Invalid files. Only MP4, WebM under 50MB allowed.')
      return
    }

    setErrorMsg('')
    const spaceLeft = maxVideosAllowed - (newVideos.length + existingVideos.length + urlVideos.length)
    const filesToAdd = validFiles.slice(0, spaceLeft)

    setNewVideos(prev => [...prev, ...filesToAdd])
    const previews = filesToAdd.map(f => URL.createObjectURL(f))
    setNewVideoPreviews(prev => [...prev, ...previews])
  }

  const removeExistingVideo = (index) => {
    const videoToRemove = existingVideos[index]
    setRemovedVideos(prev => [...prev, videoToRemove])
    setExistingVideos(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewVideo = (index) => {
    URL.revokeObjectURL(newVideoPreviews[index])
    setNewVideos(prev => prev.filter((_, i) => i !== index))
    setNewVideoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // ── Drag & Drop ──
  const handleImageDragOver = (e) => { e.preventDefault(); setIsDraggingImage(true) }
  const handleImageDragLeave = (e) => { e.preventDefault(); setIsDraggingImage(false) }
  const handleImageDrop = (e) => {
    e.preventDefault(); setIsDraggingImage(false)
    addImages(e.dataTransfer.files)
  }

  const handleVideoDragOver = (e) => { e.preventDefault(); setIsDraggingVideo(true) }
  const handleVideoDragLeave = (e) => { e.preventDefault(); setIsDraggingVideo(false) }
  const handleVideoDrop = (e) => {
    e.preventDefault(); setIsDraggingVideo(false)
    addVideos(e.dataTransfer.files)
  }

  // ════════════════════════════════════════════
  // Validation
  // ════════════════════════════════════════════

  const validate = () => {
    if (!String(animalData.name || '').trim()) return 'Animal name is required'
    if (!animalData.category) return 'Please select a category'
    if (!String(animalData.breed || '').trim()) return 'Breed is required'
    if (!animalData.age) return 'Age is required'
    if (!animalData.weight) return 'Weight (Zinda) is required'
    if (!String(animalData.price || '').trim()) return 'Price is required'
    if (!String(animalData.farmLocation || '').trim()) return 'Farm location is required'
    if (!String(animalData.city || '').trim()) return 'City is required'

    const totalImages = existingImages.length + newImages.length + urlImages.length
    if (totalImages === 0) return 'Please upload at least one image'

    return null
  }

  // ════════════════════════════════════════════
  // Reset Form (for add mode after success)
  // ════════════════════════════════════════════

  const resetForm = () => {
    setAnimalData({ ...defaultFormState })
    newImagePreviews.forEach(url => URL.revokeObjectURL(url))
    newVideoPreviews.forEach(url => URL.revokeObjectURL(url))
    setExistingImages([])
    setNewImages([])
    setNewImagePreviews([])
    setRemovedImages([])
    setExistingVideos([])
    setNewVideos([])
    setNewVideoPreviews([])
    setRemovedVideos([])
    setUrlImages([])
    setUrlVideos([])
    setImageUrlInput('')
    setVideoUrlInput('')
  }

  // ════════════════════════════════════════════
  // Submit — Handles both Add and Edit
  // ════════════════════════════════════════════

  const handleSubmit = async (e) => {
    e.preventDefault()

    const error = validate()
    if (error) {
      setErrorMsg(error)
      setSuccessMsg('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const formData = new FormData()

      // Append all text/boolean fields
      Object.entries(animalData).forEach(([key, value]) => {
        if (key === 'fullDescription') {
          formData.append(key, DOMPurify.sanitize(value))
        } else if (key === 'price' || key === 'purchasePrice' || key === 'discountPrice') {
          formData.append(key, cleanPrice(value))
        } else {
          formData.append(key, value)
        }
      })

      // Append new image files
      newImages.forEach(file => formData.append('images', file))

      // Append new video files
      newVideos.forEach(file => formData.append('video', file))

      // Append URL-based media
      formData.append('urlImages', JSON.stringify(urlImages))
      formData.append('urlVideos', JSON.stringify(urlVideos))

      // In edit mode, send which existing files to keep and remove
      if (isEditMode) {
        formData.append('keepImages', JSON.stringify(existingImages))
        formData.append('removedImages', JSON.stringify(removedImages))
        formData.append('keepVideos', JSON.stringify(existingVideos))
        formData.append('removedVideos', JSON.stringify(removedVideos))
      }

      const url = isEditMode ? `/api/animals/${id}` : '/api/animals'
      const method = isEditMode ? 'put' : 'post'

      const response = await api({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const result = response.data

      if (result.success) {
        const msg = isEditMode
          ? 'Animal updated successfully! Redirecting...'
          : 'Animal added successfully! Redirecting...'
        setSuccessMsg(msg)

        if (!isEditMode) resetForm()

        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => navigate('/shop'), 2500)
      } else {
        setErrorMsg(result.message || 'Something went wrong.')
      }
    } catch (err) {
      console.error('Submit error:', err)
      const msg = err.response?.data?.message || 'Cannot connect to server. Make sure backend is running.'
      setErrorMsg(msg)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  // ════════════════════════════════════════════
  // Counts for display
  // ════════════════════════════════════════════

  const totalImageCount = existingImages.length + newImages.length + urlImages.length
  const totalVideoCount = existingVideos.length + newVideos.length + urlVideos.length
  const isFirstImageExisting = existingImages.length > 0

  // ════════════════════════════════════════════
  // Loading State (Edit Mode)
  // ════════════════════════════════════════════

  if (fetchLoading) {
    return (
      <div className="aa-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              <div className="aa-fetch-state">
                <FaSpinner className="aa-fetch-spinner" />
                <p>Loading animal data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // Error State — Animal Not Found
  // ════════════════════════════════════════════

  if (fetchError) {
    return (
      <div className="aa-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              <div className="aa-fetch-state aa-fetch-state--error">
                <FaExclamationCircle className="aa-fetch-error-icon" />
                <h3>Could Not Load Animal</h3>
                <p>{fetchError}</p>
                <button
                  className="aa-btn aa-btn--primary"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft />
                  <span>Go Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // Main Render
  // ════════════════════════════════════════════

  return (
    <div className="aa-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">

            {/* ── Breadcrumb ── */}
            <nav className="aa-breadcrumb">
              <a href="/">Home</a>
              <span className="aa-breadcrumb-sep">/</span>
              <a href="/shop">Shop</a>
              <span className="aa-breadcrumb-sep">/</span>
              <span className="aa-breadcrumb-current">
                {isEditMode ? 'Edit Animal' : 'Add Animal'}
              </span>
            </nav>

            {/* ── Page Header ── */}
            <div className="aa-page-header">
              <button
                className="aa-back-btn"
                onClick={() => navigate(isEditMode ? -1 : '/shop')}
              >
                <FaArrowLeft />
                <span>{isEditMode ? 'Back to Inventory' : 'Back to Shop'}</span>
              </button>
              <div className="aa-page-header-content">
                <div className={`aa-page-header-icon ${isEditMode ? 'aa-page-header-icon--edit' : ''}`}>
                  {isEditMode ? <FaSave /> : <FaPlusCircle />}
                </div>
                <div>
                  <h1 className="aa-page-title">
                    {isEditMode ? 'Edit Animal' : 'Add New Animal'}
                  </h1>
                  <p className="aa-page-subtitle">
                    {isEditMode
                      ? 'Update the details below. Changes will reflect on the shop immediately.'
                      : 'Fill in the details below to create a new livestock listing.'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Alerts ── */}
            {successMsg && (
              <div className="aa-alert aa-alert--success">
                <FaCheckCircle className="aa-alert-icon" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="aa-alert aa-alert--error">
                <FaExclamationCircle className="aa-alert-icon" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ══════════ FORM START ══════════ */}
            <form className="aa-form" onSubmit={handleSubmit}>

              {/* ┌─────────────────────────────────────┐ */}
              {/* │  SECTION 1: Basic Information        │ */}
              {/* └─────────────────────────────────────┘ */}
              <div className="aa-section">
                <div className="aa-section-header">
                  <div className="aa-section-icon"><FaInfoCircle /></div>
                  <div>
                    <h2 className="aa-section-title">Basic Information</h2>
                    <p className="aa-section-desc">Enter the primary details of the animal.</p>
                  </div>
                </div>

                <div className="aa-section-body">
                  {/* Name */}
                  <div className="aa-grid">
                    <div className="aa-field">
                      <label className="aa-label">
                        Animal Name <span className="aa-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="aa-input"
                        placeholder="e.g. Healthy Bakra – 38kg"
                        value={animalData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Category + Breed */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">
                        Category <span className="aa-required">*</span>
                      </label>
                      <select
                        name="category"
                        className="aa-input aa-select"
                        value={animalData.category}
                        onChange={handleChange}
                      >
                        {categoryOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">
                        Breed <span className="aa-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="breed"
                        className="aa-input"
                        placeholder="e.g. Pure Beetal"
                        value={animalData.breed}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="aa-field">
                    <label className="aa-label">
                      Gender <span className="aa-required">*</span>
                    </label>
                    <div className="aa-radio-group">
                      <label className={`aa-radio-card ${animalData.gender === 'male' ? 'aa-radio-card--active' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={animalData.gender === 'male'}
                          onChange={handleChange}
                          hidden
                        />
                        <span>Male</span>
                      </label>
                      <label className={`aa-radio-card ${animalData.gender === 'female' ? 'aa-radio-card--active' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={animalData.gender === 'female'}
                          onChange={handleChange}
                          hidden
                        />
                        <span>Female</span>
                      </label>
                    </div>
                  </div>

                  {/* Age + Weight */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">
                        Age <span className="aa-required">*</span>
                      </label>
                      <div className="aa-input-combo">
                        <input
                          type="number"
                          name="age"
                          className="aa-input aa-input-combo-main"
                          placeholder="e.g. 18"
                          min="0"
                          value={animalData.age}
                          onChange={handleChange}
                        />
                        <select
                          name="ageUnit"
                          className="aa-input aa-input-combo-unit"
                          value={animalData.ageUnit}
                          onChange={handleChange}
                        >
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">
                        Weight (Zinda) <span className="aa-required">*</span>
                      </label>
                      <div className="aa-input-adorned">
                        <input
                          type="number"
                          name="weight"
                          className="aa-input"
                          placeholder="e.g. 38"
                          min="0"
                          value={animalData.weight}
                          onChange={handleChange}
                        />
                        <span className="aa-input-suffix">KG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ┌─────────────────────────────────────┐ */}
              {/* │  SECTION 2: Pricing & Status         │ */}
              {/* └─────────────────────────────────────┘ */}
              <div className="aa-section">
                <div className="aa-section-header">
                  <div className="aa-section-icon"><FaMoneyBillWave /></div>
                  <div>
                    <h2 className="aa-section-title">Pricing & Status</h2>
                    <p className="aa-section-desc">Set the pricing and availability.</p>
                  </div>
                </div>

                <div className="aa-section-body">
                  {/* Purchase Price + Price */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">Purchase Price</label>
                      <div className="aa-input-adorned">
                        <span className="aa-input-prefix">Rs.</span>
                        <input
                          type="text"
                          name="purchasePrice"
                          className="aa-input aa-input--with-prefix"
                          placeholder="Optional"
                          value={animalData.purchasePrice}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">
                        Price <span className="aa-required">*</span>
                      </label>
                      <div className="aa-input-adorned">
                        <span className="aa-input-prefix">Rs.</span>
                        <input
                          type="text"
                          name="price"
                          className="aa-input aa-input--with-prefix"
                          placeholder="e.g. 58,000"
                          value={animalData.price}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount + Status */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">Discount Price</label>
                      <div className="aa-input-adorned">
                        <span className="aa-input-prefix">Rs.</span>
                        <input
                          type="text"
                          name="discountPrice"
                          className="aa-input aa-input--with-prefix"
                          placeholder="Optional"
                          value={animalData.discountPrice}
                          onChange={handleChange}
                        />
                      </div>
                      <span className="aa-helper">Leave empty if no discount.</span>
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">Availability Status</label>
                      <select
                        name="status"
                        className="aa-input aa-select"
                        value={animalData.status}
                        onChange={handleChange}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="aa-field">
                    <label className="aa-label">Visibility</label>
                    <div className="aa-toggle-wrap" onClick={() => handleToggle('visibility')}>
                      <div className={`aa-toggle-track ${animalData.visibility ? 'aa-toggle-track--on' : ''}`}>
                        <div className="aa-toggle-thumb"></div>
                      </div>
                      <div className="aa-toggle-info">
                        {animalData.visibility ? (
                          <>
                            <FaEye className="aa-toggle-status-icon" />
                            <span>Active — Visible on shop</span>
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="aa-toggle-status-icon" />
                            <span>Hidden — Not visible on shop</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Preview */}
                  {cleanPrice(animalData.price) > 0 && (
                    <div className="aa-payment-preview">
                      <div className="aa-payment-preview-header">
                        <FaMoneyBillWave />
                        <span>Payment Breakdown (USP Preview)</span>
                      </div>
                      <div className="aa-payment-preview-body">
                        <div className="aa-payment-row">
                          <span>Total Price</span>
                          <span>Rs. {formatPrice(cleanPrice(animalData.price))}</span>
                        </div>
                        <div className="aa-payment-row aa-payment-row--highlight">
                          <span>20% Advance Required</span>
                          <span>Rs. {formatPrice(Math.round(cleanPrice(animalData.price) * 0.2))}</span>
                        </div>
                        <div className="aa-payment-row">
                          <span>80% Remaining Balance</span>
                          <span>Rs. {formatPrice(cleanPrice(animalData.price) - Math.round(cleanPrice(animalData.price) * 0.2))}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ┌─────────────────────────────────────┐ */}
              {/* │  SECTION 3: Physical Details          │ */}
              {/* └─────────────────────────────────────┘ */}
              <div className="aa-section">
                <div className="aa-section-header">
                  <div className="aa-section-icon"><FaHeartbeat /></div>
                  <div>
                    <h2 className="aa-section-title">Physical Details</h2>
                    <p className="aa-section-desc">Describe the animal's physical characteristics.</p>
                  </div>
                </div>

                <div className="aa-section-body">
                  {/* Color + Teeth */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">Color</label>
                      <input
                        type="text"
                        name="color"
                        className="aa-input"
                        placeholder="e.g. White, Brown"
                        value={animalData.color}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">Teeth Count</label>
                      <input
                        type="number"
                        name="teeth"
                        className="aa-input"
                        placeholder="e.g. 2, 4, 6"
                        min="0"
                        max="8"
                        value={animalData.teeth}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Health */}
                  <div className="aa-grid">
                    <div className="aa-field">
                      <label className="aa-label">Health Status</label>
                      <select
                        name="healthStatus"
                        className="aa-input aa-select"
                        value={animalData.healthStatus}
                        onChange={handleChange}
                      >
                        {healthOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location + City */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">
                        Farm Location <span className="aa-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="farmLocation"
                        className="aa-input"
                        placeholder="e.g. Rahim Yar Khan Mandi"
                        value={animalData.farmLocation}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">
                        City <span className="aa-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        className="aa-input"
                        placeholder="e.g. Rahim Yar Khan"
                        value={animalData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Meat Integration */}
                  <div className="aa-meat-integration">
                    <div className="aa-field">
                      <label className="aa-label">Meat & Qurbani Status</label>
                      <div className="aa-toggle-wrap" onClick={() => handleToggle('isForMeat')}>
                        <div className={`aa-toggle-track ${animalData.isForMeat ? 'aa-toggle-track--on' : ''}`}>
                          <div className="aa-toggle-thumb"></div>
                        </div>
                        <div className="aa-toggle-info">
                          {animalData.isForMeat ? (
                            <span>Available for Qurbani / Meat processing</span>
                          ) : (
                            <span>Selling as Live Animal only</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {animalData.isForMeat && (
                      <div className="aa-grid aa-grid--2 aa-animate-fade-in">
                        <div className="aa-field">
                          <label className="aa-label">Slaughter Weight (Estimated)</label>
                          <div className="aa-input-adorned">
                            <input
                              type="number"
                              name="slaughterWeight"
                              className="aa-input"
                              placeholder="e.g. 20"
                              value={animalData.slaughterWeight}
                              onChange={handleChange}
                            />
                            <span className="aa-input-suffix">KG</span>
                          </div>
                        </div>
                        <div className="aa-field">
                          <label className="aa-label">Meat Yield Estimate</label>
                          <input
                            type="text"
                            name="meatYieldEstimate"
                            className="aa-input"
                            placeholder="e.g. 55-60%"
                            value={animalData.meatYieldEstimate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ┌─────────────────────────────────────┐ */}
              {/* │  SECTION 4: Media Upload              │ */}
              {/* └─────────────────────────────────────┘ */}
              <div className="aa-section">
                <div className="aa-section-header">
                  <div className="aa-section-icon"><FaCamera /></div>
                  <div>
                    <h2 className="aa-section-title">Media Upload</h2>
                    <p className="aa-section-desc">Upload photos and videos of the animal.</p>
                  </div>
                </div>

                <div className="aa-section-body">

                  {/* ── Image Upload ── */}
                  <div className="aa-field">
                    <label className="aa-label">
                      Photos <span className="aa-required">*</span>
                      {totalImageCount > 0 && (
                        <span className="aa-media-count">({totalImageCount} / 8 photos)</span>
                      )}
                    </label>
                    <div className="aa-media-limit-note">
                      Max 8 images allowed. Each file should be under 5MB.
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="aa-preview-grid aa-preview-grid--existing">
                        <div className="aa-existing-label">Current Photos</div>
                        <div className="aa-preview-items">
                          {existingImages.map((imgPath, i) => (
                            <div key={`existing-${i}`} className="aa-preview-item">
                              <img
                                src={buildMediaUrl(imgPath)}
                                alt={`Existing ${i + 1}`}
                                className="aa-preview-img"
                              />
                              {i === 0 && isFirstImageExisting && (
                                <span className="aa-preview-badge">
                                  <FaStar /> THUMBNAIL
                                </span>
                              )}
                              <button
                                type="button"
                                className="aa-preview-remove"
                                onClick={() => removeExistingImage(i)}
                                title="Remove this photo"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Zone */}
                    <div
                      className={`aa-upload-zone ${isDraggingImage ? 'aa-upload-zone--active' : ''}`}
                      onDragOver={handleImageDragOver}
                      onDragLeave={handleImageDragLeave}
                      onDrop={handleImageDrop}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <FaCloudUploadAlt className="aa-upload-zone-icon" />
                      <p className="aa-upload-zone-text">
                        <strong>Drag & Drop</strong> images here or <strong>click to browse</strong>
                      </p>
                      <p className="aa-upload-zone-hint">
                        JPEG, PNG, WebP • Max 5MB each •
                        {existingImages.length === 0
                          ? ' First image = Thumbnail'
                          : ' New photos will be added to gallery'}
                      </p>
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => { addImages(e.target.files); e.target.value = '' }}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        hidden
                      />
                    </div>

                    {/* New Image Previews */}
                    {newImagePreviews.length > 0 && (
                      <div className="aa-preview-grid">
                        <div className="aa-existing-label">New Photos to Upload</div>
                        <div className="aa-preview-items">
                          {newImagePreviews.map((src, i) => (
                            <div key={`new-img-${i}`} className="aa-preview-item">
                              <img src={src} alt={`New ${i + 1}`} className="aa-preview-img" />
                              {existingImages.length === 0 && i === 0 && (
                                <span className="aa-preview-badge">
                                  <FaStar /> THUMBNAIL
                                </span>
                              )}
                              <button
                                type="button"
                                className="aa-preview-remove"
                                onClick={(e) => { e.stopPropagation(); removeNewImage(i) }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Video Upload ── */}
                  <div className="aa-field">
                    <label className="aa-label">
                      Videos
                      {totalVideoCount > 0 && (
                        <span className="aa-media-count">({totalVideoCount} / 1 video)</span>
                      )}
                    </label>
                    <div className="aa-media-limit-note">
                      Max 1 video allowed. File should be under 50MB.
                    </div>

                    {/* Existing Videos */}
                    {existingVideos.length > 0 && (
                      <div className="aa-preview-grid aa-preview-grid--existing aa-preview-grid--videos">
                        <div className="aa-existing-label">Current Videos</div>
                        <div className="aa-preview-items aa-preview-items--videos">
                          {existingVideos.map((vidPath, i) => (
                            <div key={`existing-vid-${i}`} className="aa-preview-item aa-preview-item--video">
                              <video src={buildMediaUrl(vidPath)} className="aa-preview-video" controls />
                              <button
                                type="button"
                                className="aa-preview-remove"
                                onClick={() => removeExistingVideo(i)}
                                title="Remove this video"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Zone */}
                    <div
                      className={`aa-upload-zone aa-upload-zone--video ${isDraggingVideo ? 'aa-upload-zone--active' : ''}`}
                      onDragOver={handleVideoDragOver}
                      onDragLeave={handleVideoDragLeave}
                      onDrop={handleVideoDrop}
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <FaPlay className="aa-upload-zone-icon" />
                      <p className="aa-upload-zone-text">
                        <strong>Drag & Drop</strong> videos here or <strong>click to browse</strong>
                      </p>
                      <p className="aa-upload-zone-hint">MP4, WebM • Max 50MB each</p>
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={(e) => { addVideos(e.target.files); e.target.value = '' }}
                        accept="video/mp4,video/webm,video/quicktime"
                        multiple
                        hidden
                      />
                    </div>

                    {/* New Video Previews */}
                    {newVideoPreviews.length > 0 && (
                      <div className="aa-preview-grid aa-preview-grid--videos">
                        <div className="aa-existing-label">New Videos to Upload</div>
                        <div className="aa-preview-items aa-preview-items--videos">
                          {newVideoPreviews.map((src, i) => (
                            <div key={`new-vid-${i}`} className="aa-preview-item aa-preview-item--video">
                              <video src={src} className="aa-preview-video" controls />
                              <button
                                type="button"
                                className="aa-preview-remove"
                                onClick={(e) => { e.stopPropagation(); removeNewVideo(i) }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── URL-based Media ── */}
                  <div className="aa-url-media-section">
                    <div className="aa-existing-label">External Media Links (Optional)</div>
                    <p className="aa-section-desc mb-3">
                      Instead of uploading, you can provide direct links to images or videos.
                    </p>

                    <div className="aa-grid aa-grid--2">
                      <div className="aa-field">
                        <label className="aa-label">Image URL</label>
                        <div className="aa-input-adorned">
                          <input
                            type="text"
                            className="aa-input"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                          />
                          <button type="button" className="aa-url-add-btn" onClick={addImageUrl}>
                            Add
                          </button>
                        </div>
                      </div>
                      <div className="aa-field">
                        <label className="aa-label">Video URL</label>
                        <div className="aa-input-adorned">
                          <input
                            type="text"
                            className="aa-input"
                            placeholder="https://example.com/video.mp4"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                          />
                          <button type="button" className="aa-url-add-btn" onClick={addVideoUrl}>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {(urlImages.length > 0 || urlVideos.length > 0) && (
                      <div className="aa-url-previews mt-3">
                        {urlImages.length > 0 && (
                          <div className="aa-preview-grid mb-3">
                            <div className="aa-existing-label">Linked Images</div>
                            <div className="aa-preview-items">
                              {urlImages.map((url, i) => (
                                <div key={`url-img-${i}`} className="aa-preview-item">
                                  <img
                                    src={url}
                                    alt={`URL ${i + 1}`}
                                    className="aa-preview-img"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg' }}
                                  />
                                  <button type="button" className="aa-preview-remove" onClick={() => removeUrlImage(i)}>
                                    <FaTimes />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {urlVideos.length > 0 && (
                          <div className="aa-preview-grid aa-preview-grid--videos">
                            <div className="aa-existing-label">Linked Videos</div>
                            <div className="aa-preview-items aa-preview-items--videos">
                              {urlVideos.map((url, i) => (
                                <div key={`url-vid-${i}`} className="aa-preview-item aa-preview-item--video">
                                  <video
                                    src={url}
                                    className="aa-preview-video"
                                    controls
                                    onError={() => console.error('Video URL failed to load:', url)}
                                  />
                                  <button type="button" className="aa-preview-remove" onClick={() => removeUrlVideo(i)}>
                                    <FaTimes />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ┌─────────────────────────────────────┐ */}
              {/* │  SECTION 5: Description & Extras      │ */}
              {/* └─────────────────────────────────────┘ */}
              <div className="aa-section">
                <div className="aa-section-header">
                  <div className="aa-section-icon"><FaFileAlt /></div>
                  <div>
                    <h2 className="aa-section-title">Description & Extra Details</h2>
                    <p className="aa-section-desc">Add descriptions and additional preferences.</p>
                  </div>
                </div>

                <div className="aa-section-body">
                  <div className="aa-field">
                    <label className="aa-label">Short Description</label>
                    <textarea
                      name="shortDescription"
                      className="aa-input aa-textarea aa-textarea--sm"
                      placeholder="Brief summary (2-3 lines)..."
                      value={animalData.shortDescription}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="aa-field">
                    <label className="aa-label">Full Description</label>
                    <ReactQuill
                      theme="snow"
                      value={animalData.fullDescription}
                      onChange={(content) => setAnimalData(prev => ({ ...prev, fullDescription: content }))}
                      placeholder="Detailed description with formatting..."
                      className="aa-quill-editor"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          ['clean']
                        ]
                      }}
                    />
                  </div>

                  <div className="aa-field">
                    <label className="aa-label">Special Notes</label>
                    <textarea
                      name="specialNotes"
                      className="aa-input aa-textarea aa-textarea--sm"
                      placeholder="Any special notes (optional)..."
                      value={animalData.specialNotes}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  {/* Delivery + Negotiable */}
                  <div className="aa-grid aa-grid--2">
                    <div className="aa-field">
                      <label className="aa-label">Delivery Available</label>
                      <div className="aa-toggle-wrap" onClick={() => handleToggle('deliveryAvailable')}>
                        <div className={`aa-toggle-track ${animalData.deliveryAvailable ? 'aa-toggle-track--on' : ''}`}>
                          <div className="aa-toggle-thumb"></div>
                        </div>
                        <div className="aa-toggle-info">
                          <FaTruck className="aa-toggle-status-icon" />
                          <span>{animalData.deliveryAvailable ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="aa-field">
                      <label className="aa-label">Negotiable</label>
                      <label className="aa-checkbox-wrap">
                        <input
                          type="checkbox"
                          name="negotiable"
                          checked={animalData.negotiable}
                          onChange={handleChange}
                        />
                        <span className="aa-checkbox-custom">
                          {animalData.negotiable && <FaCheckCircle />}
                        </span>
                        <span className="aa-checkbox-label">
                          <FaHandshake className="aa-checkbox-icon" />
                          Price is negotiable
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ┌─────────────────────────────────────┐ */}
              {/* │  ACTION BUTTONS                      │ */}
              {/* └─────────────────────────────────────┘ */}
              <div className="aa-actions">
                <button
                  type="button"
                  className="aa-btn aa-btn--secondary"
                  onClick={() => navigate(isEditMode ? -1 : '/shop')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aa-btn aa-btn--primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="aa-btn-spinner" />
                      <span>{isEditMode ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      {isEditMode ? <FaSave /> : <FaPlusCircle />}
                      <span>{isEditMode ? 'Update Animal' : 'Add Animal'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddAnimal