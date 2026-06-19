import api from './api'

export const orderService = {
  getOrders: async ({ signal } = {}) => {
    const response = await api.get('/api/inquiries/me', { signal })
    return response.data
  },

  getAllOrders: async ({ domain, signal } = {}) => {
    const params = domain ? { domain } : {}
    const response = await api.get('/api/inquiries/all', { params, signal })
    return response.data
  },

  getGroupedOrders: async ({ domain, signal } = {}) => {
    const params = domain ? { domain } : {}
    const response = await api.get('/api/inquiries/grouped', { params, signal })
    return response.data
  },

  getOrderGroup: async (orderGroupId, { domain, signal } = {}) => {
    const params = domain ? { domain } : {}
    const response = await api.get(`/api/inquiries/group/${encodeURIComponent(orderGroupId)}`, { params, signal })
    return response.data
  },

  updateStatus: async (id, status, { signal } = {}) => {
    const response = await api.patch(`/api/inquiries/${encodeURIComponent(id)}/status`, { status }, { signal })
    return response.data
  }
}
