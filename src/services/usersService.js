import api from './api'

export const usersService = {
  list: async ({ search = '', role = '', page = 1, limit = 20, signal } = {}) => {
    const sp = new URLSearchParams()
    if (search) sp.set('search', search)
    if (role === 'admin' || role === 'user') sp.set('role', role)
    sp.set('page', String(page))
    sp.set('limit', String(limit))
    const response = await api.get(`/api/users?${sp.toString()}`, { signal })
    const payload = response.data
    const users = Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload?.data)
        ? payload.data
        : []

    return {
      users,
      total: Number(payload?.total) || 0,
      page: Number(payload?.page) || page,
      pages: Number(payload?.pages) || 1
    }
  },

  remove: async (id, { signal } = {}) => {
    const response = await api.delete(`/api/users/${encodeURIComponent(id)}`, { signal })
    return response.data
  },

  setRole: async (id, role, { signal } = {}) => {
    const response = await api.patch(`/api/users/${encodeURIComponent(id)}/role`, { role }, { signal })
    const payload = response.data
    return {
      user: payload?.user ?? payload?.data ?? null,
      success: Boolean(payload?.success),
      message: payload?.message
    }
  }
}
