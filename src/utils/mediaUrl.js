const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If we are on a live site (not localhost), we should NOT use localhost:5000
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    // Correct production backend URL (Vercel)
    return 'https://farm2-meat-backend.vercel.app'; 
  }
  
  return envUrl || 'http://localhost:5000';
};

export const API_BASE_URL = getApiUrl();

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
