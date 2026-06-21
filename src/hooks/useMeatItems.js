import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export const useBestsellers = (limit = 6) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await api.get(`/api/meat-items/bestsellers?limit=${limit}`)
        if (response.data && response.data.success) {
          setItems(response.data.data)
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBestsellers()
  }, [limit])

  return { items, loading, error }
}

export const useMenuItems = () => {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMenuItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/api/meat-items/by-category')
      if (response.data && response.data.success) {
        setGrouped(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  return { grouped, loading, error, refetch: fetchMenuItems }
}

export const useMeatItems = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getAllItems = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const response = await api.get('/api/meat-items', { params })
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getItemById = useCallback(async (id) => {
    setLoading(true)
    try {
      const response = await api.get(`/api/meat-items/${id}`)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getByCategory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/meat-items/by-category')
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getBestsellers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/meat-items/bestsellers')
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, getAllItems, getByCategory, getBestsellers, getItemById }
}

export const useAdminItems = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createItem = useCallback(async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/api/meat-items', data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (id, data) => {
    setLoading(true)
    try {
      const response = await api.put(`/api/meat-items/${id}`, data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteItem = useCallback(async (id) => {
    setLoading(true)
    try {
      const response = await api.delete(`/api/meat-items/${id}`)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleAvailability = useCallback(async (id) => {
    setLoading(true)
    try {
      const response = await api.patch(`/api/meat-items/${id}/toggle-availability`)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleBestseller = useCallback(async (id) => {
    setLoading(true)
    try {
      const response = await api.patch(`/api/meat-items/${id}/toggle-bestseller`)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reorderItems = useCallback(async (items) => {
    setLoading(true)
    try {
      const response = await api.patch('/api/meat-items/reorder', { items })
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    toggleBestseller,
    reorderItems
  }
}
