const CART_STORAGE_KEY = 'meatbyalvi-cart'
const DEFAULT_TTL_MS = 30 * 60 * 1000
const EXPIRED_FLAG_KEY = 'meatbyalvi-cart-expired'

const safeParse = (raw) => {
  try {
    return JSON.parse(raw)
  } catch (e) {
    void e
    return null
  }
}

const nowMs = () => Date.now()

const normalizeMeta = (meta, { now, ttlMs }) => {
  const createdAt = Number(meta?.createdAt) || now
  const updatedAt = Number(meta?.updatedAt) || now
  const expiresAt = Number(meta?.expiresAt) || (updatedAt + ttlMs)
  return { createdAt, updatedAt, expiresAt }
}

export const cartStorage = {
  key: CART_STORAGE_KEY,

  load: ({ ttlMs = DEFAULT_TTL_MS } = {}) => {
    const now = nowMs()
    const stored = safeParse(localStorage.getItem(CART_STORAGE_KEY) || '')

    if (!stored) return { items: [], meta: normalizeMeta(null, { now, ttlMs }), expired: false }

    if (Array.isArray(stored)) {
      const meta = normalizeMeta(null, { now, ttlMs })
      const state = { items: stored, meta }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
      return { ...state, expired: false }
    }

    const items = Array.isArray(stored?.items) ? stored.items : []
    const meta = normalizeMeta(stored?.meta, { now, ttlMs })

    if (meta.expiresAt <= now) {
      try {
        sessionStorage.setItem(EXPIRED_FLAG_KEY, String(now))
        localStorage.removeItem(CART_STORAGE_KEY)
      } catch (e) {
        void e
      }
      return { items: [], meta: normalizeMeta(null, { now, ttlMs }), expired: true }
    }

    if (!stored?.meta?.expiresAt || !stored?.meta?.updatedAt || !stored?.meta?.createdAt) {
      const state = { items, meta }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
      return { ...state, expired: false }
    }

    return { items, meta, expired: false }
  },

  save: (items, { ttlMs = DEFAULT_TTL_MS } = {}) => {
    const now = nowMs()
    const meta = normalizeMeta({ createdAt: now, updatedAt: now, expiresAt: now + ttlMs }, { now, ttlMs })
    const state = { items: Array.isArray(items) ? items : [], meta }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    return state
  },

  touch: (items, { ttlMs = DEFAULT_TTL_MS } = {}) => {
    const now = nowMs()
    const stored = safeParse(localStorage.getItem(CART_STORAGE_KEY) || '')
    const prevMeta = normalizeMeta(stored?.meta, { now, ttlMs })
    const meta = normalizeMeta({ createdAt: prevMeta.createdAt, updatedAt: now, expiresAt: now + ttlMs }, { now, ttlMs })
    const state = { items: Array.isArray(items) ? items : [], meta }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    return state
  },

  replace: (items, { ttlMs = DEFAULT_TTL_MS } = {}) => {
    const now = nowMs()
    const stored = safeParse(localStorage.getItem(CART_STORAGE_KEY) || '')
    const prevMeta = normalizeMeta(stored?.meta, { now, ttlMs })
    const meta = normalizeMeta({ createdAt: prevMeta.createdAt, updatedAt: prevMeta.updatedAt, expiresAt: prevMeta.expiresAt }, { now, ttlMs })
    const state = { items: Array.isArray(items) ? items : [], meta }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    return state
  },

  clear: () => {
    localStorage.removeItem(CART_STORAGE_KEY)
  },

  consumeExpiredFlag: () => {
    try {
      const v = sessionStorage.getItem(EXPIRED_FLAG_KEY)
      if (!v) return false
      sessionStorage.removeItem(EXPIRED_FLAG_KEY)
      return true
    } catch (e) {
      void e
      return false
    }
  }
}
