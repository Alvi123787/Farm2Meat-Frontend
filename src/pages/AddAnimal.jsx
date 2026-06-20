import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import '../css/AddAnimal.css';

/* ============================================================
   Constants
   ============================================================ */
const CATEGORIES = ['Bakra', 'Patth', 'Bakri'];
const HEALTH_STATUSES = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
];
const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
  { value: 'new', label: 'New' },
];

const STEPS = [
  { id: 'basic', label: 'Basic Information', note: 'Identity, breed & physical record' },
  { id: 'pricing', label: 'Pricing & Status', note: 'Cost, sale price & availability' },
  { id: 'media', label: 'Media', note: 'Photos and video for the listing' },
  { id: 'seo', label: 'SEO & Description', note: 'Search visibility & buyer notes' },
];

const emptyForm = {
  name: '',
  type: 'livestock',
  category: 'Bakra',
  breed: '',
  gender: 'male',
  age: '',
  ageUnit: 'months',
  weight: '',
  color: '',
  teeth: '',
  healthStatus: 'good',
  farmLocation: '',
  city: '',

  purchasePrice: '',
  price: '',
  discountPrice: '',
  isForMeat: false,
  slaughterWeight: '',
  meatYieldEstimate: '',
  status: 'available',
  listingType: 'normal',
  visibility: true,
  deliveryAvailable: false,
  negotiable: false,

  images: [],
  videos: [],
  imageUrl: '',

  shortDescription: '',
  fullDescription: '',
  specialNotes: '',
  seoTitle: '',
  seoDescription: '',
};

/* ============================================================
   Small Icon set (inline SVG, no dependency)
   ============================================================ */
const Icon = ({ name, size = 16, className = '' }) => {
  const paths = {
    check: <polyline points="20 6 9 17 4 12" />,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    spinner: <><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></>,
    paw: <><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="4" cy="8" r="2" /><path d="M11 13c-3 0-6.5 2.2-6.5 5.4 0 1.5 1.2 2.6 2.7 2.6.9 0 1.6-.4 2.4-.7.6-.3 1.2-.5 1.9-.5.7 0 1.3.2 1.9.5.8.3 1.5.7 2.4.7 1.5 0 2.7-1.1 2.7-2.6C18.5 15.2 14.4 13 11 13z" /></>,
    tag: <><path d="M20.59 13.41 11 4H4v7l9.41 9.41a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z" /><circle cx="7.5" cy="7.5" r="1" /></>,
  };
  return (
    <svg className={`aa-icon ${className}`} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

/* ============================================================
   Reusable field primitives
   ============================================================ */
const Field = ({ label, required, hint, children, className = '' }) => (
  <div className={`aa-field ${className}`}>
    <label className="aa-field__label">
      {label}{required && <span className="aa-required">*</span>}
    </label>
    {children}
    {hint && <p className="aa-field__hint">{hint}</p>}
  </div>
);

const TextInput = (props) => <input className="aa-input" {...props} />;
const TextArea = (props) => <textarea className="aa-textarea" {...props} />;

const Select = ({ options, ...props }) => (
  <div className="aa-select-wrap">
    <select className="aa-select" {...props}>
      {options.map((opt) =>
        typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
    <svg className="aa-select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
);

const SegmentedToggle = ({ value, onChange, options, name }) => (
  <div className="aa-segmented" role="radiogroup">
    {options.map((opt) => (
      <button
        type="button"
        key={opt.value}
        className={`aa-segmented__btn${value === opt.value ? ' aa-segmented__btn--active' : ''}`}
        onClick={() => onChange(opt.value)}
        role="radio"
        aria-checked={value === opt.value}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const SwitchRow = ({ label, hint, checked, onChange }) => (
  <label className="aa-switch-row">
    <div>
      <p className="aa-switch-row__label">{label}</p>
      {hint && <p className="aa-switch-row__hint">{hint}</p>}
    </div>
    <span className={`aa-switch${checked ? ' aa-switch--on' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="aa-switch__thumb" />
    </span>
  </label>
);

/* ============================================================
   Main Component
   ============================================================ */
export default function AddAnimal() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [urlDraft, setUrlDraft] = useState({ image: '', video: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Load existing animal when editing ── */
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingExisting(true);
        const res = await api.get(`/api/animals/${id}`);
        const data = res.data?.data || res.data;
        if (!cancelled && data) {
          setForm((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load animal:', err);
        if (!cancelled) setSubmitError('Could not load this listing. Try again.');
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const update = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  /* ════════════════════════════════════════════
     Step validation
     ════════════════════════════════════════════ */
  const validateStep = useCallback((stepIndex) => {
    const e = {};
    if (stepIndex === 0) {
      if (!form.name.trim()) e.name = 'Animal name is required';
      if (!form.category) e.category = 'Category is required';
      if (!form.breed.trim()) e.breed = 'Breed is required';
      if (!form.age) e.age = 'Age is required';
      if (!form.weight.trim()) e.weight = 'Weight is required';
      if (!form.farmLocation.trim()) e.farmLocation = 'Farm location is required';
      if (!form.city.trim()) e.city = 'City is required';
    }
    if (stepIndex === 1) {
      if (!form.price) e.price = 'Sale price is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const goToStep = (index) => {
    if (index === activeStep) return;
    if (index > activeStep && !validateStep(activeStep)) return;
    setActiveStep(index);
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    setCompletedSteps((prev) => Array.from(new Set([...prev, activeStep])));
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  /* ════════════════════════════════════════════
     Media handlers
     ════════════════════════════════════════════ */
  const handleFileSelect = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      // Just add File objects to form.images array to be uploaded with FormData later
      update('images', [...form.images, ...files]);
    } catch (err) {
      console.error('Upload failed:', err);
      setSubmitError('Image upload failed. You can add an image URL instead.');
    } finally {
      setUploadingImages(false);
    }
  };

  const addImageUrl = () => {
    const url = urlDraft.image.trim();
    if (!url) return;
    update('images', [...form.images, url]);
    setUrlDraft((p) => ({ ...p, image: '' }));
  };

  const addVideoUrl = () => {
    const url = urlDraft.video.trim();
    if (!url) return;
    update('videos', [...form.videos, url]);
    setUrlDraft((p) => ({ ...p, video: '' }));
  };

  const removeImage = (idx) => update('images', form.images.filter((_, i) => i !== idx));
  const removeVideo = (idx) => update('videos', form.videos.filter((_, i) => i !== idx));

  /* ════════════════════════════════════════════
     Submit
     ════════════════════════════════════════════ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) { setActiveStep(i); return; }
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();

      // Add all text fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images' || key === 'videos') return;
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Separate file images from URL images
      const fileImages = form.images.filter(img => img instanceof File);
      const urlImages = form.images.filter(img => typeof img === 'string');

      // Add file images
      fileImages.forEach(file => {
        formData.append('images', file);
      });

      if (isEdit) {
        // For edit mode: keep existing images (URLs) + add new ones
        formData.append('keepImages', JSON.stringify(urlImages));
      } else {
        // For create mode: send URL images as urlImages
        formData.append('urlImages', JSON.stringify(urlImages));
      }

      // Add URL videos
      const urlVideos = form.videos.filter(vid => typeof vid === 'string');
      if (isEdit) {
        formData.append('keepVideos', JSON.stringify(urlVideos));
      } else {
        formData.append('urlVideos', JSON.stringify(urlVideos));
      }

      if (isEdit) {
        await api.put(`/api/animals/${id}`, formData);
      } else {
        await api.post('/api/animals', formData);
      }
      setSubmitted(true);
      setTimeout(() => navigate('/admin/animals'), 1100);
    } catch (err) {
      console.error('Save failed:', err);
      setSubmitError(err.response?.data?.message || 'Something went wrong while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Derived preview data ── */
  const previewPrice = useMemo(() => {
    const p = Number(form.discountPrice) || Number(form.price) || 0;
    return p ? `Rs. ${p.toLocaleString('en-PK')}` : 'Rs. —';
  }, [form.price, form.discountPrice]);

  // Helper to get image source from either URL or File object
  const getImageSrc = (img) => {
    if (!img) return '';
    if (img instanceof File) {
      return URL.createObjectURL(img);
    }
    return img;
  };

  const heroImage = getImageSrc(form.images?.[0]) || form.imageUrl || '';
  const progressPct = Math.round(((activeStep) / (STEPS.length - 1)) * 100);

  if (loadingExisting) {
    return (
      <div className="aa-page">
        <div className="aa-loading-state">
          <Icon name="spinner" size={26} className="aa-spin" />
          <span>Loading listing…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aa-page">
      <form className="aa-shell" onSubmit={handleSubmit}>

        {/* ════════ Left rail ════════ */}
        <aside className="aa-rail">
          <div className="aa-rail__header">
            <span className="aa-rail__eyebrow">{isEdit ? 'Edit listing' : 'New listing'}</span>
            <h1 className="aa-rail__title">
              {isEdit ? 'Update Animal Record' : 'Add Livestock Record'}
            </h1>
          </div>

          <nav className="aa-steps" aria-label="Form sections">
            {STEPS.map((step, idx) => {
              const state =
                idx === activeStep ? 'active' :
                completedSteps.includes(idx) ? 'done' : 'pending';
              return (
                <button
                  type="button"
                  key={step.id}
                  className={`aa-step aa-step--${state}`}
                  onClick={() => goToStep(idx)}
                >
                  <span className="aa-step__indicator">
                    {state === 'done' ? <Icon name="check" size={12} /> : idx + 1}
                  </span>
                  {idx < STEPS.length - 1 && <span className="aa-step__line" />}
                  <span className="aa-step__text">
                    <span className="aa-step__label">{step.label}</span>
                    <span className="aa-step__note">{step.note}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Live preview card */}
          <div className="aa-preview-card">
            <div className="aa-preview-card__media">
              {heroImage
                ? <img src={heroImage} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                : <Icon name="paw" size={22} className="aa-preview-card__placeholder" />}
            </div>
            <div className="aa-preview-card__body">
              <p className="aa-preview-card__name">{form.name || 'Unnamed animal'}</p>
              <p className="aa-preview-card__meta">
                {form.breed || 'Breed'} · {form.category}
              </p>
              <p className="aa-preview-card__price">{previewPrice}</p>
            </div>
          </div>

          <div className="aa-rail__progress">
            <div className="aa-rail__progress-track">
              <div className="aa-rail__progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span>{activeStep + 1} of {STEPS.length}</span>
          </div>
        </aside>

        {/* ════════ Right content ════════ */}
        <main className="aa-content">

          {submitError && (
            <div className="aa-banner aa-banner--error">
              <span>{submitError}</span>
              <button type="button" onClick={() => setSubmitError('')} aria-label="Dismiss">×</button>
            </div>
          )}

          {/* ── Step 0: Basic Information ── */}
          {activeStep === 0 && (
            <section className="aa-panel">
              <header className="aa-panel__header">
                <p className="aa-eyebrow">Section 01</p>
                <h2>Basic Information</h2>
                <p className="aa-panel__sub">Identity, breed, and the physical details buyers see first.</p>
              </header>

              <div className="aa-grid aa-grid--2">
                <Field label="Animal name" required className="aa-span-2">
                  <TextInput
                    placeholder="e.g. Sultan — Premium Beetal Bakra"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                  {errors.name && <p className="aa-error">{errors.name}</p>}
                </Field>

                <Field label="Category" required>
                  <Select options={CATEGORIES} value={form.category}
                    onChange={(e) => update('category', e.target.value)} />
                  {errors.category && <p className="aa-error">{errors.category}</p>}
                </Field>

                <Field label="Breed" required>
                  <TextInput
                    placeholder="e.g. Beetal, Teddy, Dera Din Panah"
                    value={form.breed}
                    onChange={(e) => update('breed', e.target.value)}
                  />
                  {errors.breed && <p className="aa-error">{errors.breed}</p>}
                </Field>

                <Field label="Gender">
                  <SegmentedToggle
                    value={form.gender}
                    onChange={(v) => update('gender', v)}
                    options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
                  />
                </Field>

                <Field label="Listing type">
                  <SegmentedToggle
                    value={form.listingType}
                    onChange={(v) => update('listingType', v)}
                    options={[{ value: 'normal', label: 'Normal' }, { value: 'featured', label: 'Featured' }]}
                  />
                </Field>

                <Field label="Age" required>
                  <div className="aa-input-group">
                    <input
                      className="aa-input aa-input--mono"
                      type="number" min="0" placeholder="0"
                      value={form.age}
                      onChange={(e) => update('age', e.target.value)}
                    />
                    <Select
                      options={[{ value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }]}
                      value={form.ageUnit}
                      onChange={(e) => update('ageUnit', e.target.value)}
                    />
                  </div>
                  {errors.age && <p className="aa-error">{errors.age}</p>}
                </Field>

                <Field label="Weight" required hint="Include unit, e.g. 45 kg">
                  <TextInput
                    className="aa-input--mono"
                    placeholder="45 kg"
                    value={form.weight}
                    onChange={(e) => update('weight', e.target.value)}
                  />
                  {errors.weight && <p className="aa-error">{errors.weight}</p>}
                </Field>

                <Field label="Color">
                  <TextInput
                    placeholder="e.g. White & brown"
                    value={form.color}
                    onChange={(e) => update('color', e.target.value)}
                  />
                </Field>

                <Field label="Teeth count" hint="Used to estimate age for buyers">
                  <input
                    className="aa-input aa-input--mono"
                    type="number" min="0" placeholder="—"
                    value={form.teeth}
                    onChange={(e) => update('teeth', e.target.value)}
                  />
                </Field>

                <Field label="Health status">
                  <Select options={HEALTH_STATUSES} value={form.healthStatus}
                    onChange={(e) => update('healthStatus', e.target.value)} />
                </Field>

                <Field label="Farm location" required>
                  <TextInput
                    placeholder="e.g. Green Valley Farm, Sadiqabad Road"
                    value={form.farmLocation}
                    onChange={(e) => update('farmLocation', e.target.value)}
                  />
                  {errors.farmLocation && <p className="aa-error">{errors.farmLocation}</p>}
                </Field>

                <Field label="City" required>
                  <TextInput
                    placeholder="e.g. Rahim Yar Khan"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                  {errors.city && <p className="aa-error">{errors.city}</p>}
                </Field>
              </div>
            </section>
          )}

          {/* ── Step 1: Pricing & Status ── */}
          {activeStep === 1 && (
            <section className="aa-panel">
              <header className="aa-panel__header">
                <p className="aa-eyebrow">Section 02</p>
                <h2>Pricing &amp; Status</h2>
                <p className="aa-panel__sub">What this animal cost, what it sells for, and its current state.</p>
              </header>

              <div className="aa-grid aa-grid--3">
                <Field label="Purchase price" hint="Internal — not shown to buyers">
                  <div className="aa-input-prefix">
                    <span>Rs.</span>
                    <input
                      className="aa-input aa-input--mono"
                      type="number" min="0" placeholder="0"
                      value={form.purchasePrice}
                      onChange={(e) => update('purchasePrice', e.target.value)}
                    />
                  </div>
                </Field>

                <Field label="Sale price" required>
                  <div className="aa-input-prefix">
                    <span>Rs.</span>
                    <input
                      className="aa-input aa-input--mono"
                      type="number" min="0" placeholder="0"
                      value={form.price}
                      onChange={(e) => update('price', e.target.value)}
                    />
                  </div>
                  {errors.price && <p className="aa-error">{errors.price}</p>}
                </Field>

                <Field label="Discount price" hint="Optional — shown as the listed price">
                  <div className="aa-input-prefix">
                    <span>Rs.</span>
                    <input
                      className="aa-input aa-input--mono"
                      type="number" min="0" placeholder="0"
                      value={form.discountPrice}
                      onChange={(e) => update('discountPrice', e.target.value)}
                    />
                  </div>
                </Field>
              </div>

              <div className="aa-divider" />

              <div className="aa-grid aa-grid--2">
                <Field label="Listing status">
                  <Select options={STATUSES} value={form.status}
                    onChange={(e) => update('status', e.target.value)} />
                </Field>

                <Field label="Visibility">
                  <SegmentedToggle
                    value={form.visibility ? 'visible' : 'hidden'}
                    onChange={(v) => update('visibility', v === 'visible')}
                    options={[{ value: 'visible', label: 'Visible' }, { value: 'hidden', label: 'Hidden' }]}
                  />
                </Field>
              </div>

              <div className="aa-switch-stack">
                <SwitchRow
                  label="Delivery available"
                  hint="Show a delivery badge on this listing"
                  checked={form.deliveryAvailable}
                  onChange={(v) => update('deliveryAvailable', v)}
                />
                <SwitchRow
                  label="Price negotiable"
                  hint="Buyers will see a 'negotiable' tag"
                  checked={form.negotiable}
                  onChange={(v) => update('negotiable', v)}
                />
                <SwitchRow
                  label="Available for meat"
                  hint="Enables slaughter weight & yield fields below"
                  checked={form.isForMeat}
                  onChange={(v) => update('isForMeat', v)}
                />
              </div>

              {form.isForMeat && (
                <div className="aa-subpanel">
                  <p className="aa-subpanel__title">
                    <Icon name="tag" size={13} /> Meat integration details
                  </p>
                  <div className="aa-grid aa-grid--2">
                    <Field label="Slaughter weight" hint="Estimated post-slaughter weight in kg">
                      <input
                        className="aa-input aa-input--mono"
                        type="number" min="0" placeholder="0"
                        value={form.slaughterWeight}
                        onChange={(e) => update('slaughterWeight', e.target.value)}
                      />
                    </Field>
                    <Field label="Meat yield estimate">
                      <TextInput
                        placeholder="e.g. ~18-20 kg usable meat"
                        value={form.meatYieldEstimate}
                        onChange={(e) => update('meatYieldEstimate', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Step 2: Media ── */}
          {activeStep === 2 && (
            <section className="aa-panel">
              <header className="aa-panel__header">
                <p className="aa-eyebrow">Section 03</p>
                <h2>Media</h2>
                <p className="aa-panel__sub">Photos sell livestock. Add clear, well-lit images first.</p>
              </header>

              {/* Upload dropzone */}
              <div
                className="aa-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Icon name={uploadingImages ? 'spinner' : 'upload'} size={22}
                  className={uploadingImages ? 'aa-spin' : ''} />
                <p className="aa-dropzone__title">
                  {uploadingImages ? 'Uploading…' : 'Drag images here, or click to browse'}
                </p>
                <p className="aa-dropzone__hint">JPG, PNG or WEBP — up to 10MB each</p>
              </div>

              {/* URL fallback */}
              <div className="aa-url-row">
                <div className="aa-input-icon">
                  <Icon name="link" size={14} />
                  <input
                    className="aa-input"
                    placeholder="Or paste an image URL"
                    value={urlDraft.image}
                    onChange={(e) => setUrlDraft((p) => ({ ...p, image: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  />
                </div>
                <button type="button" className="aa-btn-secondary" onClick={addImageUrl}>
                  <Icon name="plus" size={13} /> Add
                </button>
              </div>

              {/* Image grid */}
              {form.images.length > 0 && (
                <div className="aa-media-grid">
                  {form.images.map((src, idx) => (
                    <div className="aa-media-thumb" key={idx}>
                      <img src={getImageSrc(src)} alt="" onError={(e) => { e.target.style.opacity = 0.15; }} />
                      {idx === 0 && <span className="aa-media-thumb__badge">Cover</span>}
                      <button
                        type="button"
                        className="aa-media-thumb__remove"
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="aa-divider" />

              {/* Videos */}
              <Field label="Video links" hint="YouTube, Facebook, or direct video URLs">
                <div className="aa-url-row">
                  <div className="aa-input-icon">
                    <Icon name="video" size={14} />
                    <input
                      className="aa-input"
                      placeholder="Paste a video URL"
                      value={urlDraft.video}
                      onChange={(e) => setUrlDraft((p) => ({ ...p, video: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                    />
                  </div>
                  <button type="button" className="aa-btn-secondary" onClick={addVideoUrl}>
                    <Icon name="plus" size={13} /> Add
                  </button>
                </div>
              </Field>

              {form.videos.length > 0 && (
                <ul className="aa-link-list">
                  {form.videos.map((v, idx) => (
                    <li key={`${v}-${idx}`}>
                      <Icon name="video" size={13} />
                      <span className="aa-link-list__url">{v}</span>
                      <button type="button" onClick={() => removeVideo(idx)} aria-label="Remove video">
                        <Icon name="trash" size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* ── Step 3: SEO & Description ── */}
          {activeStep === 3 && (
            <section className="aa-panel">
              <header className="aa-panel__header">
                <p className="aa-eyebrow">Section 04</p>
                <h2>SEO &amp; Description</h2>
                <p className="aa-panel__sub">How this listing reads to buyers and to search engines.</p>
              </header>

              <Field label="Short description" hint="Shown on listing cards — keep it to one line">
                <TextInput
                  placeholder="e.g. Healthy, well-fed Beetal bakra ready for Qurbani"
                  value={form.shortDescription}
                  onChange={(e) => update('shortDescription', e.target.value)}
                />
              </Field>

              <Field label="Full description">
                <TextArea
                  rows={5}
                  placeholder="Describe diet, temperament, vaccination history, and anything a buyer should know…"
                  value={form.fullDescription}
                  onChange={(e) => update('fullDescription', e.target.value)}
                />
              </Field>

              <Field label="Special notes" hint="Internal notes or buyer-facing caveats">
                <TextArea
                  rows={3}
                  placeholder="e.g. Slight limp on left leg, otherwise in excellent health"
                  value={form.specialNotes}
                  onChange={(e) => update('specialNotes', e.target.value)}
                />
              </Field>

              <div className="aa-divider" />

              <p className="aa-subpanel__title"><Icon name="tag" size={13} /> Search appearance</p>

              <Field label="SEO title" hint={`${form.seoTitle.length}/60 characters`}>
                <TextInput
                  maxLength={70}
                  placeholder={form.name ? `${form.name} for sale in ${form.city || 'your city'}` : 'SEO title'}
                  value={form.seoTitle}
                  onChange={(e) => update('seoTitle', e.target.value)}
                />
              </Field>

              <Field label="SEO description" hint={`${form.seoDescription.length}/160 characters`}>
                <TextArea
                  rows={3}
                  maxLength={180}
                  placeholder="A short, search-friendly summary of this listing…"
                  value={form.seoDescription}
                  onChange={(e) => update('seoDescription', e.target.value)}
                />
              </Field>

              {/* Search result preview */}
              <div className="aa-serp-preview">
                <p className="aa-serp-preview__label">Preview</p>
                <p className="aa-serp-preview__title">
                  {form.seoTitle || form.name || 'Animal listing title'}
                </p>
                <p className="aa-serp-preview__url">meatbyalvi.com › animals › {form.name ? form.name.toLowerCase().replace(/\s+/g, '-') : 'slug'}</p>
                <p className="aa-serp-preview__desc">
                  {form.seoDescription || form.shortDescription || 'Your animal description will appear here once added.'}
                </p>
              </div>
            </section>
          )}

          {/* ── Footer nav ── */}
          <footer className="aa-footer">
            <button
              type="button"
              className="aa-btn-ghost"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <Icon name="arrowLeft" size={14} /> Back
            </button>

            {activeStep < STEPS.length - 1 ? (
              <button type="button" className="aa-btn-primary" onClick={handleNext}>
                Continue <Icon name="arrowRight" size={14} />
              </button>
            ) : (
              <button type="submit" className="aa-btn-primary" disabled={submitting}>
                {submitting
                  ? <><Icon name="spinner" size={14} className="aa-spin" /> Saving…</>
                  : submitted
                  ? <><Icon name="check" size={14} /> Saved</>
                  : <><Icon name="save" size={14} /> {isEdit ? 'Save changes' : 'Publish listing'}</>}
              </button>
            )}
          </footer>
        </main>
      </form>
    </div>
  );
}