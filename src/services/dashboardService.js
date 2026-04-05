import api from './api'

export const dashboardService = {
  getDashboard: async (period, { signal } = {}) => {
    const response = await api.get(`/api/analytics/dashboard?period=${encodeURIComponent(period)}`, { signal })
    return response.data
  },

  getRevenue: async (period, { signal } = {}) => {
    const response = await api.get(`/api/analytics/revenue?period=${encodeURIComponent(period)}`, { signal })
    return response.data
  },

  getSales: async (period, { signal } = {}) => {
    const response = await api.get(`/api/analytics/sales?period=${encodeURIComponent(period)}`, { signal })
    return response.data
  },

  search: async (q, { signal, limit = 8 } = {}) => {
    const response = await api.get(`/api/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`, { signal })
    return response.data
  },

  getUnreadNotificationsCount: async ({ signal } = {}) => {
    const response = await api.get('/api/notifications/unread-count', { signal })
    return response.data
  },

  getNotifications: async ({ signal, limit = 10 } = {}) => {
    const response = await api.get(`/api/notifications?limit=${encodeURIComponent(limit)}`, { signal })
    return response.data
  },

  markNotificationRead: async (id, { signal } = {}) => {
    const response = await api.patch(`/api/notifications/${encodeURIComponent(id)}/read`, {}, { signal })
    return response.data
  },

  markAllNotificationsRead: async ({ signal } = {}) => {
    const response = await api.patch('/api/notifications/read-all', {}, { signal })
    return response.data
  }
}
