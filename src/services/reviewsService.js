import api from './api'

export const reviewsService = {
  getAll: async ({ signal } = {}) => {
    const response = await api.get('/api/reviews', { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to load reviews')
      error.response = response
      throw error
    }
    return payload
  },

  create: async ({ name, rating, text }, { signal } = {}) => {
    const response = await api.post('/api/reviews', { name, rating, text }, { signal })
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

  remove: async (id, { signal } = {}) => {
    const response = await api.delete(`/api/reviews/${encodeURIComponent(id)}`, { signal })
    const payload = response.data
    if (payload?.success === false) {
      const error = new Error(payload?.message || 'Failed to delete review')
      error.response = response
      throw error
    }
    return payload
  }
}
