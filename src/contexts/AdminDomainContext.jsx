import React, { createContext, useContext, useState, useEffect } from 'react'

const AdminDomainContext = createContext(null)

export const useAdminDomain = () => {
  const context = useContext(AdminDomainContext)
  if (!context) {
    throw new Error('useAdminDomain must be used within AdminDomainProvider')
  }
  return context
}

export const AdminDomainProvider = ({ children }) => {
  const [domain, setDomain] = useState(() => {
    try {
      const stored = localStorage.getItem('adminSelectedDomain')
      return stored || null
    } catch {
      return null
    }
  })

  const selectDomain = (selectedDomain) => {
    if (selectedDomain === 'animal' || selectedDomain === 'meat') {
      setDomain(selectedDomain)
      try {
        localStorage.setItem('adminSelectedDomain', selectedDomain)
      } catch {
        // ignore storage errors
      }
    }
  }

  const clearDomain = () => {
    setDomain(null)
    try {
      localStorage.removeItem('adminSelectedDomain')
    } catch {
      // ignore storage errors
    }
  }

  const value = {
    domain,
    selectDomain,
    clearDomain,
    isSelected: domain === 'animal' || domain === 'meat'
  }

  return (
    <AdminDomainContext.Provider value={value}>
      {children}
    </AdminDomainContext.Provider>
  )
}
