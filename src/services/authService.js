import api from './api'

const getErrorText = (payload) => {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  if (typeof payload?.message === 'string') return payload.message
  if (typeof payload?.error === 'string') return payload.error
  return ''
}

const normalizeAuthError = (error, action) => {
  const status = error?.response?.status ?? error?.status ?? null
  const code = error?.response?.data?.code || error?.code || null
  const backendMessage = getErrorText(error?.response?.data)

  let message = backendMessage || error?.message || 'Something went wrong. Please try again.'

  if (/^Request failed with status code \d+$/i.test(message)) {
    message = ''
  }

  if (!message) {
    if (action === 'login') {
      if (status === 401) message = 'Invalid email or password.'
      else if (status === 403) message = 'Please verify your email to continue.'
      else if (status === 404) message = 'No account found with this email.'
      else message = 'Login failed. Please try again.'
    } else if (action === 'signup') {
      if (status === 409) message = 'An account with this email already exists.'
      else if (status === 429) message = 'Too many requests. Please wait and try again.'
      else message = 'Signup failed. Please try again.'
    } else if (action === 'resendVerification') {
      if (status === 404) message = 'No account found with this email.'
      else if (status === 429) message = 'Please wait before requesting another verification email.'
      else message = 'Could not resend verification email.'
    } else {
      message = 'Request failed. Please try again.'
    }
  }

  const normalized = new Error(message)
  normalized.status = status
  normalized.code = code
  normalized.raw = error
  throw normalized
}

export const authService = {
  login: async ({ email, password }, { signal } = {}) => {
    try {
      const response = await api.post('/api/auth/login', { email, password }, { signal })
      return response.data
    } catch (error) {
      return normalizeAuthError(error, 'login')
    }
  },

  signup: async ({ email, password }, { signal } = {}) => {
    try {
      const response = await api.post('/api/auth/signup', { email, password }, { signal })
      return response.data
    } catch (error) {
      return normalizeAuthError(error, 'signup')
    }
  },

  forgotPassword: async ({ email }, { signal } = {}) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email }, { signal })
      return response.data
    } catch (error) {
      return normalizeAuthError(error, 'forgotPassword')
    }
  },

  resetPassword: async ({ token, password }, { signal } = {}) => {
    try {
      const response = await api.post(`/api/auth/reset-password/${encodeURIComponent(token)}`, { password }, { signal })
      return response.data
    } catch (error) {
      return normalizeAuthError(error, 'resetPassword')
    }
  },

  verifyEmail: async (token, email, { signal } = {}) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : ''
      const response = await api.get(`/api/auth/verify-email/${encodeURIComponent(token)}${query}`, { signal })
      return response.data
    } catch (error) {
      return normalizeAuthError(error, 'verifyEmail')
    }
  },

  resendVerification: async (email, { signal } = {}) => {
    try {
      const response = await api.post('/api/auth/resend-verification', { email }, { signal })
      return response.data
    } catch (error) {
      return normalizeAuthError(error, 'resendVerification')
    }
  }
}
