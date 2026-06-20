import axios from 'axios'
import { API_BASE_URL } from '../utils/mediaUrl'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Remove credentials: 'include' if it was somehow set
    config.withCredentials = false
    // If data is FormData, don't set Content-Type—let Axios handle it automatically!
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    } else {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors (like 401)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('lastVisit')
      
      // We can't use navigate() here directly, but we can redirect using window.location
      // or trigger a custom event that AuthContext listens to.
      // For now, simple redirect if we are not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?message=Session expired. Please log in again.'
      }
    }
    return Promise.reject(error)
  }
)

export default api
