import api from './api'

export const authService = {
  login: async ({ email, password }, { signal } = {}) => {
    const response = await api.post('/api/auth/login', { email, password }, { signal })
    return response.data
  },

  signup: async ({ email, password }, { signal } = {}) => {
    const response = await api.post('/api/auth/signup', { email, password }, { signal })
    return response.data
  },

  forgotPassword: async ({ email }, { signal } = {}) => {
    const response = await api.post('/api/auth/forgot-password', { email }, { signal })
    return response.data
  },

  resetPassword: async ({ token, password }, { signal } = {}) => {
    const response = await api.post(`/api/auth/reset-password/${encodeURIComponent(token)}`, { password }, { signal })
    return response.data
  },

  verifyEmail: async (token, email, { signal } = {}) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : ''
    const response = await api.get(`/api/auth/verify-email/${encodeURIComponent(token)}${query}`, { signal })
    return response.data
  },

  resendVerification: async (email, { signal } = {}) => {
    const response = await api.post('/api/auth/resend-verification', { email }, { signal })
    return response.data
  }
}
