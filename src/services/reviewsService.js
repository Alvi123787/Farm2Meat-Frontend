import api from './api'

export const reviewsService = {
  getAll: async ({ signal, isAdmin, productId, verifiedOnly, limit } = {}) => {
    const headers = isAdmin ? { 'x-admin': 'true' } : {}
    const params = {}
    if (productId) params.productId = productId
    if (verifiedOnly) params.verifiedOnly = 'true'
    if (limit) params.limit = limit

    const response = await api.get('/api/reviews', { signal, headers, params })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to load reviews')
      error.response = response
      throw error
    }
    return payload
  },

  /** Get reviews and stats for a specific product */
  getByProduct: async (productId, { signal } = {}) => {
    const response = await api.get(`/api/reviews/product/${encodeURIComponent(productId)}`, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to load product reviews')
      error.response = response
      throw error
    }
    return payload
  },

  /** Check eligibility for verified customer review */
  checkEligibility: async (productId, { signal } = {}) => {
    const response = await api.get('/api/reviews/eligibility', {
      signal,
      params: { productId }
    })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to check eligibility')
      error.response = response
      throw error
    }
    return payload
  },

  /** Submit verified customer review for a delivered order */
  submitVerifiedReview: async ({ productId, orderId, rating, comment }, { signal } = {}) => {
    const response = await api.post('/api/reviews', {
      productId,
      orderId,
      rating,
      comment
    }, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to submit review')
      error.response = response
      throw error
    }
    return payload
  },

  /** Legacy create (calls POST /api/reviews) */
  create: async ({ productId, orderId, rating, text, name, comment }, { signal } = {}) => {
    const response = await api.post('/api/reviews', {
      productId,
      orderId,
      rating,
      comment: comment || text,
      name
    }, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to submit review')
      error.response = response
      throw error
    }
    return payload
  },

  /** Post-checkout emoji review (Bearer optional). */
  submitPostOrder: async (
    { orderId, rating, message, name, email, userId },
    { signal } = {}
  ) => {
    const response = await api.post('/api/reviews/post-order', {
      orderId,
      rating,
      message,
      name,
      email,
      userId
    }, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to save review')
      error.response = response
      throw error
    }
    return payload
  },

  /** Admin reviews management view with populated customer & order info */
  getAdminReviews: async ({ signal, verifiedOnly, hidden, search } = {}) => {
    const params = {}
    if (verifiedOnly !== undefined && verifiedOnly !== 'all') params.verifiedOnly = verifiedOnly
    if (hidden !== undefined && hidden !== 'all') params.hidden = hidden
    if (search) params.search = search

    const response = await api.get('/api/reviews/admin', { signal, params })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to load admin reviews')
      error.response = response
      throw error
    }
    return payload
  },

  remove: async (id, { signal } = {}) => {
    const response = await api.delete(`/api/reviews/${encodeURIComponent(id)}`, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to delete review')
      error.response = response
      throw error
    }
    return payload
  },

  toggleHidden: async (id, { signal } = {}) => {
    const response = await api.patch(`/api/reviews/${encodeURIComponent(id)}/toggle-hidden`, {}, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to update review')
      error.response = response
      throw error
    }
    return payload
  }
}
