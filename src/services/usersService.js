import api from './api'

export const usersService = {
  list: async ({ search = '', role = '', page = 1, limit = 20, signal } = {}) => {
    const sp = new URLSearchParams()
    if (search) sp.set('search', search)
    if (role === 'admin' || role === 'user') sp.set('role', role)
    sp.set('page', String(page))
    sp.set('limit', String(limit))
    const response = await api.get(`/api/users?${sp.toString()}`, { signal })
    return response.data
  },

  remove: async (id, { signal } = {}) => {
    const response = await api.delete(`/api/users/${encodeURIComponent(id)}`, { signal })
    return response.data
  },

  setRole: async (id, role, { signal } = {}) => {
    const response = await api.patch(`/api/users/${encodeURIComponent(id)}/role`, { role }, { signal })
    return response.data
  }
}
