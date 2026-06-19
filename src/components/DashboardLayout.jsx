import React, { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import Sidebar from './Sidebar'
import { dashboardService } from '../services/dashboardService'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { useAdminDomain } from '../contexts/AdminDomainContext'

const getStoredBool = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return raw === '1'
  } catch (e) {
    void e
    return fallback
  }
}

const setStoredBool = (key, value) => {
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch (e) {
    void e
  }
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(() => getStoredBool('adminSidebarOpen', false))
  const [totalAnimals, setTotalAnimals] = useState(null)

    const { isSelected, domain } = useAdminDomain()
  
    useEffect(() => {
      if (!isSelected) {
        navigate('/admin/select-domain', { replace: true })
      }
    }, [isSelected, navigate])
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const loadTotalAnimals = useCallback(async ({ signal } = {}) => {
    try {
      const result = await dashboardService.getDashboard('month', { signal })
      const count = Number(result?.stats?.totalAnimals)
      setTotalAnimals(Number.isFinite(count) ? count : null)
    } catch (err) {
      if (err?.code === 'UNAUTHORIZED') navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    setStoredBool('adminSidebarOpen', sidebarOpen)
  }, [sidebarOpen])

  useEffect(() => {
    const controller = new AbortController()
    loadTotalAnimals({ signal: controller.signal })
    return () => controller.abort()
  }, [loadTotalAnimals])

  useAdminLiveRefresh(() => loadTotalAnimals({}), { intervalMs: 10000, enabled: true })

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} totalAnimals={totalAnimals} domain={domain} />
      <main className="admin-main">
        <button className="hamburger-btn" type="button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <Outlet context={{ toggleSidebar }} />
      </main>
    </div>
  )
}
