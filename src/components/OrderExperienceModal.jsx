import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import '../css/OrderExperienceModal.css'
import { reviewsService } from '../services/reviewsService'

/* ── data ────────────────────────────────────────────── */
const LEVELS = [
  { value: 1, emoji: '😡', short: 'Terrible', tooltip: 'Very Bad Experience', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  { value: 2, emoji: '😕', short: 'Poor', tooltip: 'Bad Experience', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { value: 3, emoji: '😐', short: 'Okay', tooltip: 'Average Experience', color: '#eab308', bg: 'rgba(234,179,8,0.08)' },
  { value: 4, emoji: '🙂', short: 'Good', tooltip: 'Good Experience', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  { value: 5, emoji: '😍', short: 'Amazing', tooltip: 'Excellent Experience', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
]

const CONFETTI_CHARS = ['🎉', '✨', '⭐', '💫', '🌟', '🎊', '💖', '🥳']

const getUserIdFromStorage = () => {
  try {
    const t = localStorage.getItem('authToken')
    if (!t) return ''
    const d = jwtDecode(t)
    return String(d.sub || d.id || '')
  } catch {
    return ''
  }
}

/* ── confetti particle ───────────────────────────────── */
const ConfettiPiece = ({ char, style }) => (
  <span className="er-confetti-piece" style={style} aria-hidden>
    {char}
  </span>
)

/* ── animated check SVG ──────────────────────────────── */
const AnimatedCheck = () => (
  <div className="er-check-wrap">
    <svg className="er-check-svg" viewBox="0 0 52 52">
      <circle className="er-check-circle" cx="26" cy="26" r="24" fill="none" />
      <path className="er-check-path" fill="none" d="M14 27l7 7 16-16" />
    </svg>
  </div>
)

/* ── decorative orbs ─────────────────────────────────── */
const Orbs = () => (
  <div className="er-orbs" aria-hidden>
    <span className="er-orb er-orb--1" />
    <span className="er-orb er-orb--2" />
    <span className="er-orb er-orb--3" />
  </div>
)

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function OrderExperienceModal({
  open,
  onClose,
  orderId,
  customerName,
  email,
}) {
  const [rating, setRating] = useState(null)
  const [extraMessage, setExtraMessage] = useState('')
  const [hovered, setHovered] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const modalRef = useRef(null)
  const firstFocusRef = useRef(null)

  /* confetti pieces (memoized random positions) */
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        char: CONFETTI_CHARS[i % CONFETTI_CHARS.length],
        style: {
          '--cx': `${10 + Math.random() * 80}%`,
          '--cy': `${Math.random() * 100}%`,
          '--cr': `${Math.random() * 360}deg`,
          '--cd': `${0.6 + Math.random() * 1.2}s`,
          '--cs': `${0.6 + Math.random() * 0.8}`,
          '--cdelay': `${Math.random() * 0.4}s`,
        },
      })),
    [],
  )

  const selectedLevel = LEVELS.find((l) => l.value === rating) || null

  const reset = useCallback(() => {
    setRating(null)
    setExtraMessage('')
    setHovered(null)
    setSubmitting(false)
    setError('')
    setSuccess(false)
    setClosing(false)
    setShowConfetti(false)
  }, [])

  /* reset on open */
  useEffect(() => {
    if (open) {
      reset()
      setTimeout(() => firstFocusRef.current?.focus(), 400)
    }
  }, [open, orderId, reset])

  /* body scroll lock */
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  /* Escape key */
  useEffect(() => {
    if (!open) return undefined
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting && !success) handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, submitting, success])

  /* animated close */
  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose?.()
    }, 300)
  }, [onClose])

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating || !orderId) return
    setError('')
    setSubmitting(true)
    try {
      const userId = getUserIdFromStorage()
      await reviewsService.submitPostOrder({
        orderId,
        rating,
        message: extraMessage.trim(),
        name: customerName ? customerName.trim() : 'Customer',
        email: email ? email.trim().toLowerCase() : 'no-email@farm2meat.com',
        userId: userId || undefined,
      })
      setSuccess(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      setTimeout(() => handleClose(), 3500)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not save feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open && !closing) return null

  const activeColor = (hovered && LEVELS.find((l) => l.value === hovered)?.color) || selectedLevel?.color || null

  return (
    <div
      className={`er-overlay ${closing ? 'er-overlay--closing' : ''}`}
      role="presentation"
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        className="er-backdrop"
        onClick={() => !submitting && !success && handleClose()}
        aria-hidden
      />

      {/* modal */}
      <div
        ref={modalRef}
        className={`er-modal ${closing ? 'er-modal--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="er-modal-title"
        style={activeColor ? { '--er-accent': activeColor } : undefined}
      >
        <Orbs />

        {/* confetti layer */}
        {showConfetti && (
          <div className="er-confetti" aria-hidden>
            {confettiPieces.map((p) => (
              <ConfettiPiece key={p.id} char={p.char} style={p.style} />
            ))}
          </div>
        )}

        {/* ── FORM STATE ───────────────────────── */}
        {!success ? (
          <form className="er-inner" onSubmit={handleSubmit}>
            {/* close X */}
            <button
              type="button"
              className="er-close"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>

            {/* header icon */}
            <div className="er-header-icon">
              <span className="er-header-emoji" aria-hidden>
                {selectedLevel ? selectedLevel.emoji : '💬'}
              </span>
              <span className="er-header-ring" />
            </div>

            <h2 id="er-modal-title" className="er-title">
              How was your experience?
            </h2>
            <p className="er-sub">
              Your feedback helps us improve. Tap an emoji to rate your order.
            </p>

            {/* progress dots */}
            <div className="er-progress">
              <span className={`er-dot er-dot--active`} />
              <span className={`er-dot ${rating ? 'er-dot--active' : ''}`} />
              <span className={`er-dot ${extraMessage.trim() ? 'er-dot--active' : ''}`} />
            </div>

            {/* emoji picker */}
            <div className="er-emojis" role="radiogroup" aria-label="Rating">
              {LEVELS.map((lv) => {
                const isSelected = rating === lv.value
                const isHovered = hovered === lv.value
                return (
                  <div key={lv.value} className="er-emoji-wrap">
                    <button
                      ref={lv.value === 1 ? firstFocusRef : undefined}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`er-emoji-btn ${isSelected ? 'er-emoji-btn--selected' : ''} ${isHovered ? 'er-emoji-btn--hovered' : ''}`}
                      style={{
                        '--emoji-color': lv.color,
                        '--emoji-bg': lv.bg,
                      }}
                      onMouseEnter={() => setHovered(lv.value)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(lv.value)}
                      onBlur={() => setHovered(null)}
                      onClick={() => {
                        setRating(lv.value)
                        setError('')
                      }}
                      aria-label={lv.tooltip}
                    >
                      <span className="er-emoji-char" aria-hidden>
                        {lv.emoji}
                      </span>
                      <span className="er-emoji-ripple" />
                    </button>

                    <span
                      className={`er-emoji-label ${isSelected || isHovered ? 'er-emoji-label--visible' : ''}`}
                      style={{ color: lv.color }}
                    >
                      {lv.short}
                    </span>

                    {isHovered && !isSelected && (
                      <span className="er-tooltip" role="tooltip">
                        {lv.tooltip}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* selected feedback bar */}
            {selectedLevel && (
              <div
                className="er-selected-bar"
                style={{ background: selectedLevel.bg, borderColor: selectedLevel.color }}
              >
                <span className="er-selected-emoji">{selectedLevel.emoji}</span>
                <span className="er-selected-text" style={{ color: selectedLevel.color }}>
                  {selectedLevel.tooltip}
                </span>
              </div>
            )}

            {/* optional message */}
            {rating != null && (
              <div className="er-extra-block">
                <label className="er-label" htmlFor="er-extra">
                  Share more details
                  <span className="er-optional">(optional)</span>
                </label>
                <div className="er-textarea-wrap">
                  <textarea
                    id="er-extra"
                    className="er-textarea"
                    rows={3}
                    placeholder="Tell us what went well or what we can improve…"
                    value={extraMessage}
                    onChange={(e) => {
                      setExtraMessage(e.target.value)
                      setError('')
                    }}
                    maxLength={800}
                  />
                  <span className="er-textarea-glow" />
                  <span className="er-char-count">
                    {extraMessage.length}<span className="er-char-max">/800</span>
                  </span>
                </div>
              </div>
            )}

            {/* error */}
            {error && (
              <div className="er-error" role="alert">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="er-error-icon">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* actions */}
            <div className="er-actions">
              <button
                type="button"
                className="er-btn er-btn--ghost"
                onClick={handleClose}
                disabled={submitting}
              >
                Maybe later
              </button>
              <button
                type="submit"
                className="er-btn er-btn--primary"
                disabled={rating == null || submitting}
              >
                <span className="er-btn-shine" />
                {submitting ? (
                  <>
                    <span className="er-btn-spinner" />
                    Sending…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="er-btn-icon">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    Submit feedback
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ── SUCCESS STATE ───────────────────── */
          <div className="er-success">
            <AnimatedCheck />

            <h2 className="er-title er-title--success">
              Thank you!
            </h2>
            <p className="er-success-sub">
              Your feedback means the world to us.
              <br />
              We'll use it to serve you even better.
            </p>

            {selectedLevel && (
              <div className="er-success-rating">
                <span className="er-success-emoji">{selectedLevel.emoji}</span>
                <span className="er-success-label">{selectedLevel.tooltip}</span>
              </div>
            )}

            <button
              type="button"
              className="er-btn er-btn--primary er-btn--full"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}