export const API_BASE_URL = import.meta.env.VITE_API_URL

export const isAbsoluteUrl = (value) =>
  typeof value === 'string' &&
  (value.startsWith('http://') || value.startsWith('https://'))

export const buildMediaUrl = (path) => {
  if (!path || typeof path !== 'string') return ''

  const trimmed = path.trim()
  if (!trimmed) return ''
  if (isAbsoluteUrl(trimmed)) return trimmed
  if (!API_BASE_URL) return trimmed

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${API_BASE_URL}${normalizedPath}`
}
