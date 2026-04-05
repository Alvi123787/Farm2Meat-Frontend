import api from './api'

export const animalsService = {
  checkAvailability: async ({ ids }, { signal } = {}) => {
    const response = await api.post('/api/animals/availability', { ids }, { signal })
    return response.data
  }
}
