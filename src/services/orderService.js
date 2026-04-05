import api from './api'

export const orderService = {
  getOrders: async ({ signal } = {}) => {
    const response = await api.get('/api/inquiries/me', { signal })
    return response.data
  },

  getAllOrders: async ({ signal } = {}) => {
    const response = await api.get('/api/inquiries/all', { signal })
    return response.data
  },

  updateStatus: async (id, status, { signal } = {}) => {
    const response = await api.patch(`/api/inquiries/${encodeURIComponent(id)}/status`, { status }, { signal })
    return response.data
  }
}
