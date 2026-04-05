import api from './api'

const BASE_URL = '/api/butchers'

export const butcherService = {
  getAllButchers: async () => {
    try {
      const response = await api.get(BASE_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching butchers:', error)
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  createButcher: async (butcherData) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && butcherData instanceof FormData
      const response = await api.post(BASE_URL, butcherData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      })
      return response.data
    } catch (error) {
      console.error('Error creating butcher:', error)
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  deleteButcher: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting butcher:', error)
      return { success: false, message: error.response?.data?.message || error.message }
    }
  }
}
