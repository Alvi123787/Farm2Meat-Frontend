import api from './api'

export const notificationService = {
  getNotifications: async ({ signal } = {}) => {
    const response = await api.get('/api/notifications/me', { signal })
    return response.data
  },
  markAsRead: async (notificationId, { signal } = {}) => {
    const response = await api.patch(`/api/notifications/me/${notificationId}/read`, {}, { signal })
    return response.data
  },
  markAllAsRead: async ({ signal } = {}) => {
    const response = await api.patch('/api/notifications/me/read-all', {}, { signal })
    return response.data
  }
}
