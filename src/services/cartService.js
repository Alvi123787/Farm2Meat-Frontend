import api from './api'

export const cartService = {
  syncSession: async ({ items, expiresAt }, { signal } = {}) => {
    const response = await api.post('/api/cart/session', { items, expiresAt }, { signal })
    return response.data
  }
}
