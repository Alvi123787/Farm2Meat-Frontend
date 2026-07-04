// =====================================================
// FIX: Replace your api.js with this version
// Root cause: axios.create({ headers: { 'Content-Type': 'application/json' } })
// sets a DEFAULT header. Even deleting it in the interceptor doesn't always
// remove the instance-level default. Fix: don't set it at instance level,
// and explicitly set multipart/form-data when sending FormData.
// =====================================================

import axios from 'axios'
import { API_BASE_URL } from '../utils/mediaUrl'

const api = axios.create({
  baseURL: API_BASE_URL,
  // DO NOT set Content-Type here — let each request decide
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.withCredentials = false

    if (config.data instanceof FormData) {
      // Let the browser set multipart/form-data with the correct boundary
      // Manually setting it here would BREAK the boundary, causing 400/404
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('lastVisit')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?message=Session expired. Please log in again.'
      }
    }
    return Promise.reject(error)
  }
)

export default api