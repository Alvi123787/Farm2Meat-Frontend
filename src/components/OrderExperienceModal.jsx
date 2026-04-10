import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
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

/* ── 3D Emoji Reaction Component ─────────────────────── */
const ReactionEmoji = ({ level, isSelected, onSelect, index, hoveredEmoji, setHoveredEmoji }) => {
  const controls = useAnimation()
  const emojiRef = useRef(null)
  const isHovered = hoveredEmoji === level.value
  
  const handleHoverStart = () => setHoveredEmoji(level.value)
  const handleHoverEnd = () => setHoveredEmoji(null)
  
  const handleClick = async () => {
    // Burst animation sequence
    await controls.start({
      scale: [1, 1.45, 1.15, 1.25],
      rotateY: [0, 15, -10, 0],
      rotateX: [0, -10, 5, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.3, 0.6, 1],
        ease: "easeOut"
      }
    })
    
    onSelect(level.value)
  }
  
  // Idle floating animation when selected
  useEffect(() => {
    if (isSelected) {
      controls.start({
        y: [0, -6, 0],
        rotateY: [0, 5, -5, 0],
        rotateX: [0, -3, 3, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      })
    } else {
      controls.start({ y: 0, rotateY: 0, rotateX: 0 })
    }
  }, [isSelected, controls])
  
  // Hover animation
  useEffect(() => {
    if (isHovered && !isSelected) {
      controls.start({
        y: -14,
        scale: 1.3,
        rotateY: 8,
        rotateX: -5,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      })
    } else if (!isSelected) {
      controls.start({
        y: 0,
        scale: 1,
        rotateY: 0,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      })
    }
  }, [isHovered, isSelected, controls])
  
  return (
    <div className="er-emoji-container">
      <motion.button
        ref={emojiRef}
        className={`er-emoji-3d ${isSelected ? 'er-emoji-selected' : ''}`}
        style={{
          '--emoji-color': level.color,
          '--emoji-bg': level.bg,
          '--glow-color': level.color,
        }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={isSelected || hoveredEmoji === level.value ? controls : { 
          opacity: 1, 
          y: 0,
          transition: { 
            delay: index * 0.05,
            type: "spring",
            stiffness: 400,
            damping: 20
          }
        }}
      >
        {/* 3D lighting layers */}
        <div className="er-emoji-shadow-layer" />
        <div className="er-emoji-highlight" />
        <div className="er-emoji-inner-shadow" />
        
        <span className="er-emoji-char">{level.emoji}</span>
        
        {/* Selection ring glow */}
        {isSelected && (
          <motion.div
            className="er-emoji-ring"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
        )}
        
        {/* Hover glow effect */}
        {isHovered && !isSelected && (
          <motion.div
            className="er-emoji-hover-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isSelected && (
          <motion.div
            className="er-emoji-tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <span className="er-tooltip-emoji">{level.emoji}</span>
            <span className="er-tooltip-text">{level.tooltip}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Label */}
      <motion.span
        className="er-emoji-label-3d"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isSelected || isHovered ? 1 : 0,
          y: isSelected || isHovered ? 0 : 10
        }}
        transition={{ duration: 0.2 }}
        style={{ color: level.color }}
      >
        {level.short}
      </motion.span>
    </div>
  )
}

/* ── Burst Particle Effect ───────────────────────────── */
const BurstEffect = ({ color, isActive }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        className="er-burst-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`burst-particle-${i}`}
            className="er-burst-particle"
            style={{ background: color }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              x: Math.cos(i * 30 * Math.PI / 180) * 40,
              y: Math.sin(i * 30 * Math.PI / 180) * 40,
              opacity: [1, 0.8, 0]
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              times: [0, 0.5, 1]
            }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
)

/* ── Physics Confetti ───────────────────────────────── */
const PhysicsConfetti = ({ isActive }) => {
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      char: CONFETTI_CHARS[i % CONFETTI_CHARS.length],
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      rotation: Math.random() * 720 - 360,
      scale: 0.8 + Math.random() * 0.7
    })), []
  )
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          className="er-physics-confetti"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="er-confetti-particle"
              initial={{ 
                top: '-10%',
                left: `${p.x}%`,
                opacity: 0,
                rotate: 0,
                scale: 0
              }}
              animate={{
                top: ['0%', '120%'],
                opacity: [0, 1, 1, 0],
                rotate: p.rotation,
                scale: p.scale
              }}
              exit={{
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.3, 0.1, 0.4, 1],
                times: [0, 0.1, 0.8, 1]
              }}
              style={{ 
                left: `${p.x}%`,
              }}
            >
              {p.char}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Animated Checkmark ─────────────────────────────── */
const AnimatedCheck = () => (
  <motion.div 
    className="er-check-wrapper"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ 
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.1
    }}
  >
    <svg className="er-check-svg" viewBox="0 0 52 52">
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M14 27l7 7 16-16"
        fill="none"
        stroke="#22c55e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  </motion.div>
)

/* ── Background Orbs ────────────────────────────────── */
const AnimatedOrbs = () => (
  <div className="er-orbs-container">
    <motion.div
      className="er-orb er-orb-1"
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="er-orb er-orb-2"
      animate={{
        x: [0, -25, 30, 0],
        y: [0, 30, -30, 0],
        scale: [1, 0.9, 1.1, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="er-orb er-orb-3"
      animate={{
        x: [0, 20, -30, 0],
        y: [0, -20, 40, 0],
        scale: [1, 1.05, 0.95, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
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
  const [hoveredEmoji, setHoveredEmoji] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const modalRef = useRef(null)

  const selectedLevel = LEVELS.find((l) => l.value === rating) || null

  const reset = useCallback(() => {
    setRating(null)
    setExtraMessage('')
    setHoveredEmoji(null)
    setSubmitting(false)
    setError('')
    setSuccess(false)
    setShowConfetti(false)
    setShowBurst(false)
  }, [])

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, orderId, reset])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const handler = (e) => {
      if (e.key === 'Escape' && !submitting && !success) handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, submitting, success, handleClose])

  const handleRatingSelect = (value) => {
    setRating(value)
    setShowBurst(true)
    setTimeout(() => setShowBurst(false), 600)
    setError('')
  }

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
      setTimeout(() => setShowConfetti(false), 3500)
      setTimeout(() => handleClose(), 4000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not save feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const activeColor = selectedLevel?.color || '#800000'

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="order-experience-modal-overlay"
          className="er-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="er-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && !success && handleClose()}
          />

          <motion.div
            ref={modalRef}
            className="er-modal"
            style={{ '--er-accent': activeColor }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          >
            <AnimatedOrbs />
            <PhysicsConfetti isActive={showConfetti} />

            {!success ? (
              <motion.form 
                className="er-inner" 
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Close button */}
                <motion.button
                  type="button"
                  className="er-close-btn"
                  onClick={handleClose}
                  disabled={submitting}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </motion.button>

                {/* Header */}
                <motion.div 
                  className="er-header"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="er-header-icon-wrapper">
                    <motion.span
                      className="er-header-emoji"
                      animate={{ 
                        rotate: [0, -5, 5, -3, 0],
                        scale: [1, 1.1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 0.6,
                        delay: 0.2,
                        type: "spring"
                      }}
                    >
                      {selectedLevel ? selectedLevel.emoji : '💬'}
                    </motion.span>
                    <motion.div
                      className="er-header-ring"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 20, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    />
                  </div>
                </motion.div>

                <motion.h2 
                  className="er-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  How was your experience?
                </motion.h2>
                
                <motion.p 
                  className="er-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Your feedback helps us improve
                </motion.p>

                {/* Emoji Reactions */}
                <motion.div 
                  className="er-reactions-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
                >
                  <BurstEffect color={activeColor} isActive={showBurst} />
                  
                  <div className="er-reactions-grid">
                    {LEVELS.map((level, index) => (
                      <ReactionEmoji
                        key={level.value}
                        level={level}
                        index={index}
                        isSelected={rating === level.value}
                        onSelect={handleRatingSelect}
                        hoveredEmoji={hoveredEmoji}
                        setHoveredEmoji={setHoveredEmoji}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Selected feedback */}
                <AnimatePresence mode="wait">
                  {selectedLevel && (
                    <motion.div
                      key={`selected-feedback-${selectedLevel.value}`}
                      className="er-selected-feedback"
                      style={{ 
                        background: selectedLevel.bg, 
                        borderColor: selectedLevel.color 
                      }}
                      initial={{ opacity: 0, height: 0, scale: 0.9 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <motion.span 
                        className="er-feedback-emoji"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {selectedLevel.emoji}
                      </motion.span>
                      <span className="er-feedback-text" style={{ color: selectedLevel.color }}>
                        {selectedLevel.tooltip}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Extra message */}
                <AnimatePresence>
                  {rating != null && (
                    <motion.div
                      className="er-message-container"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="er-label">
                        Share more details
                        <span className="er-optional">(optional)</span>
                      </label>
                      <div className="er-textarea-wrapper">
                        <motion.textarea
                          className="er-textarea"
                          rows={3}
                          placeholder="Tell us what went well or what we can improve…"
                          value={extraMessage}
                          onChange={(e) => {
                            setExtraMessage(e.target.value)
                            setError('')
                          }}
                          maxLength={800}
                          whileFocus={{ 
                            scale: 1.01,
                            boxShadow: `0 0 0 3px ${activeColor}20`
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        />
                        <motion.div 
                          className="er-textarea-glow"
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ delay: 0.3 }}
                          style={{ background: `linear-gradient(90deg, transparent, ${activeColor}, transparent)` }}
                        />
                        <span className="er-char-count">
                          {extraMessage.length}<span className="er-char-max">/800</span>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="er-error-message"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <motion.div 
                  className="er-actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    type="button"
                    className="er-btn-ghost"
                    onClick={handleClose}
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Maybe later
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="er-btn-primary"
                    disabled={rating == null || submitting}
                    whileHover={rating != null ? { scale: 1.02, y: -2 } : {}}
                    whileTap={rating != null ? { scale: 0.98 } : {}}
                    style={{
                      background: rating ? `linear-gradient(135deg, ${activeColor}, ${adjustColor(activeColor, -20)})` : undefined
                    }}
                  >
                    <span className="er-btn-shine" />
                    {submitting ? (
                      <>
                        <motion.span 
                          className="er-spinner"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Submit feedback
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            ) : (
              /* Success State */
              <motion.div 
                className="er-success-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatedCheck />
                
                <motion.h2 
                  className="er-success-title"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Thank you!
                </motion.h2>
                
                <motion.p 
                  className="er-success-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Your feedback means the world to us.
                  <br />
                  We'll use it to serve you even better.
                </motion.p>

                {selectedLevel && (
                  <motion.div
                    className="er-success-rating"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.7,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    <motion.span 
                      className="er-success-emoji"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.9,
                        repeat: 1
                      }}
                    >
                      {selectedLevel.emoji}
                    </motion.span>
                    <span className="er-success-label">{selectedLevel.tooltip}</span>
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  className="er-btn-success"
                  onClick={handleClose}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper function to darken color
function adjustColor(color, amount) {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}