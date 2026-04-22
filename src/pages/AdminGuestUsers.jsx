import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faSearch,
  faSpinner,
  faTriangleExclamation,
  faUserSlash,
  faChevronLeft,
  faChevronRight,
  faRotateRight,
  faDownload,
  faAddressCard,
  faPhone,
  faEnvelope,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons'
import '../css/AdminUsers.css' // Reusing AdminUsers styles
import { usersService } from '../services/usersService'

const formatDate = (value) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AdminGuestUsers() {
  const navigate = useNavigate()
  const [guests, setGuests] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const limit = 12

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 320)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(
    async ({ signal } = {}) => {
      setLoading(true)
      setError('')
      try {
        const result = await usersService.listGuests({
          search: debouncedSearch,
          page,
          limit,
          signal
        })
        setGuests(result.guests)
        setTotal(result.total)
        setPages(result.pages)
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(err?.message || 'Failed to load guest users')
        setGuests([])
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, page]
  )

  useEffect(() => {
    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [load])

  const exportToCSV = () => {
    if (guests.length === 0) return
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Orders', 'Total Spent', 'Last Activity']
    const rows = guests.map(g => [
      g.name || 'N/A',
      g.email,
      g.phone || 'N/A',
      `"${g.deliveryAddress || ''}"`,
      g.city || 'N/A',
      g.orderCount,
      g.totalSpent,
      formatDate(g.updatedAt)
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `guest_users_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div className="header-title">
          <div className="icon-box">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <h1>Guest Users</h1>
            <p>Manage users who placed orders without an account</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => load()} disabled={loading}>
            <FontAwesomeIcon icon={faRotateRight} spin={loading} />
          </button>
          <button className="export-btn" onClick={exportToCSV} disabled={guests.length === 0}>
            <FontAwesomeIcon icon={faDownload} /> Export
          </button>
        </div>
      </div>

      <div className="admin-users-controls">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="admin-users-error">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <p>{error}</p>
          <button onClick={() => load()}>Try Again</button>
        </div>
      )}

      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Customer Info</th>
              <th>Contact Details</th>
              <th>Address</th>
              <th>Order Stats</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan="5"><div className="skeleton-line"></div></td>
                </tr>
              ))
            ) : guests.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <FontAwesomeIcon icon={faUserSlash} />
                  <p>No guest users found</p>
                </td>
              </tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest._id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {(guest.name || guest.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="user-meta">
                        <span className="user-name">{guest.name || 'Anonymous'}</span>
                        <span className="user-id">ID: {guest.lastOrderId || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <FontAwesomeIcon icon={faEnvelope} /> {guest.email}
                      </div>
                      {guest.phone && (
                        <div className="contact-item">
                          <FontAwesomeIcon icon={faPhone} /> {guest.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="address-cell">
                      <span className="city-badge">{guest.city || 'N/A'}</span>
                      <p className="address-text" title={guest.deliveryAddress}>
                        {guest.deliveryAddress || 'No address provided'}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="stats-cell">
                      <div className="stat-item">
                        <FontAwesomeIcon icon={faShoppingBag} /> {guest.orderCount} Orders
                      </div>
                      <div className="stat-amount">
                        Rs. {guest.totalSpent?.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      {formatDate(guest.updatedAt)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pages > 1 && (
        <div className="admin-users-pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="page-info">
            Page <strong>{page}</strong> of {pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  )
}
