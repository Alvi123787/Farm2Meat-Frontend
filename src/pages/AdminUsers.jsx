import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faSearch,
  faFilter,
  faSpinner,
  faTriangleExclamation,
  faUserSlash,
  faUserShield,
  faUser,
  faChevronLeft,
  faChevronRight,
  faRotateRight,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import '../css/AdminUsers.css'
import { usersService } from '../services/usersService'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { useAuth } from '../contexts/authContextCore' // ✅ For self-protection

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' }
]

const formatJoined = (value) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

export default function AdminUsers() {
  const navigate = useNavigate()
  const { user } = useAuth() // ✅ For self-protection
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('') // ✅ For role toggle feedback
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [rowBusyId, setRowBusyId] = useState('')

  const limit = 12

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 320)
    return () => clearTimeout(t)
  }, [search])

  // ✅ A. Move page reset BEFORE fetch trigger
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter])

  const load = useCallback(
    async ({ signal } = {}) => {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const result = await usersService.list({
          search: debouncedSearch,
          role: roleFilter,
          page,
          limit,
          signal
        })
        setUsers(Array.isArray(result?.users) ? result.users : [])
        setTotal(Number(result?.total) || 0)
        setPages(Math.max(1, Number(result?.pages) || 1))
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (err?.code === 'UNAUTHORIZED') return navigate('/login')
        setError(err?.message || 'Failed to load users')
        setUsers([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, roleFilter, page, navigate]
  )

  // ✅ A. Fetch depends on page (after reset)
  useEffect(() => {
    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [debouncedSearch, roleFilter, page, load])

  // ✅ B. Live refresh disabled (only manual refresh)
  const isBusy = Boolean(rowBusyId)
  
  useAdminLiveRefresh(() => {
    if (!isBusy) load({})
  }, { intervalMs: 10000, enabled: false })

  const filteredSummary = useMemo(() => {
    if (total === 0) return 'No users match your filters'
    const start = (page - 1) * limit + 1
    const end = Math.min(page * limit, total)
    return `Showing ${start}–${end} of ${total}`
  }, [total, page, limit])

  // ✅ C. Self-protection helper
  const isSelf = (id) => String(user?._id) === String(id)

  const handleDelete = async (u) => {
    const id = String(u?._id || '')
    if (!id || rowBusyId) return
    
    // ✅ C. Prevent self-deletion
    if (isSelf(id)) {
      setError("❌ You cannot delete your own account")
      setTimeout(() => setError(''), 3000)
      return
    }
    
    const label = u?.displayName || u?.email || 'this user'
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return

    setRowBusyId(id)
    setError('')
    setSuccess('')
    try {
      await usersService.remove(id)
      
      // ✅ D. Better sync: reload current page data
      const onlyRowOnPage = users.length === 1
      if (onlyRowOnPage && page > 1) {
        setPage((p) => Math.max(1, p - 1))
      } else {
        // Optimistic update + fallback reload
        setUsers((prev) => prev.filter((x) => String(x._id) !== id))
        setTotal((t) => Math.max(0, t - 1))
        setSuccess(`✅ ${label} deleted successfully`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      if (err?.code === 'UNAUTHORIZED') return navigate('/login')
      setError(err?.message || 'Failed to delete user')
      // ✅ D. Fallback reload on error
      await load()
    } finally {
      setRowBusyId('')
    }
  }

  const handleToggleRole = async (u) => {
    const id = String(u?._id || '')
    if (!id || rowBusyId) return
    
    // ✅ C. Prevent self-role modification
    if (isSelf(id)) {
      setError("❌ You cannot modify your own role")
      setTimeout(() => setError(''), 3000)
      return
    }
    
    const next = u?.role === 'admin' ? 'user' : 'admin'
    const label = u?.displayName || u?.email || 'User'

    if (next === 'user' && u?.role === 'admin') {
      if (!window.confirm(`⚠️ Demote ${label} to regular user? They will lose admin access.`)) return
    } else if (next === 'admin') {
      if (!window.confirm(`✨ Promote ${label} to admin? They will gain full access.`)) return
    }

    setRowBusyId(id)
    setError('')
    setSuccess('')
    try {
      const result = await usersService.setRole(id, next)
      const updated = result?.user
      if (updated) {
        setUsers((prev) =>
          prev.map((x) => (String(x._id) === id ? { ...x, ...updated } : x))
        )
        // ✅ E. Success feedback
        const roleText = next === 'admin' ? 'admin' : 'user'
        setSuccess(`✅ ${label} is now ${roleText}`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        // ✅ D. Fallback reload
        await load()
        setSuccess(`✅ ${label} role updated`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      if (err?.code === 'UNAUTHORIZED') return navigate('/login')
      setError(err?.message || 'Failed to update role')
    } finally {
      setRowBusyId('')
    }
  }

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="au-page">
      <header className="au-header">
        <div className="au-header-text">
          <div className="au-title-row">
            <span className="au-icon-wrap">
              <FontAwesomeIcon icon={faUsers} className="au-title-icon" />
            </span>
            <div>
              <h1 className="au-title">View Users</h1>
              <p className="au-subtitle">Registered accounts on your platform (database users only).</p>
            </div>
          </div>
        </div>
        <div className="au-header-stats">
          <div className="au-stat-card">
            <span className="au-stat-label">Total users</span>
            <span className="au-stat-value">{loading ? '—' : total.toLocaleString()}</span>
          </div>
          <button
            type="button"
            className="au-btn-refresh"
            onClick={() => load()}
            disabled={loading}
            aria-label="Refresh list"
          >
            <FontAwesomeIcon icon={faRotateRight} spin={loading} />
          </button>
        </div>
      </header>

      <section className="au-toolbar">
        <div className="au-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="au-search-icon" />
          <input
            type="search"
            className="au-search-input"
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <div className="au-filter-wrap">
          <FontAwesomeIcon icon={faFilter} className="au-filter-icon" />
          <select
            className="au-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ✅ Success message */}
      {success && (
        <div className="au-alert au-alert--success" role="status">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="au-alert au-alert--error" role="alert">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>{error}</span>
        </div>
      )}

      <div className="au-table-shell">
        {loading ? (
          <div className="au-state au-state--loading">
            <FontAwesomeIcon icon={faSpinner} spin className="au-state-icon" />
            <p>Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="au-state au-state--empty">
            <FontAwesomeIcon icon={faUsers} className="au-state-icon" />
            <p className="au-state-title">No users found</p>
            <p className="au-state-hint">Try adjusting search or filters, or invite customers to sign up.</p>
          </div>
        ) : (
          <>
            <div className="au-table-scroll">
              <table className="au-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Joined</th>
                    <th scope="col" className="au-th-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const id = String(u._id)
                    const busy = rowBusyId === id
                    const self = isSelf(id) // ✅ Check if current user
                    return (
                      <tr key={id} className={busy ? 'au-row-busy' : ''}>
                        <td className="au-cell-name">
                          <span className="au-name">
                            {u.displayName || '—'}
                            {self && <span className="au-badge au-badge--self">You</span>}
                          </span>
                          {u.isVerified ? <span className="au-badge au-badge--ok">Verified</span> : null}
                        </td>
                        <td className="au-cell-email">{u.email}</td>
                        <td>
                          <span
                            className={`au-role-pill ${u.role === 'admin' ? 'au-role-pill--admin' : 'au-role-pill--user'}`}
                          >
                            {u.role === 'admin' ? (
                              <>
                                <FontAwesomeIcon icon={faUserShield} /> Admin
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faUser} /> User
                              </>
                            )}
                          </span>
                        </td>
                        <td className="au-cell-date">{formatJoined(u.joinedAt)}</td>
                        <td className="au-cell-actions">
                          <button
                            type="button"
                            className="au-btn au-btn--role"
                            onClick={() => handleToggleRole(u)}
                            disabled={busy || self} // ✅ Disable for self
                            title={self ? "You cannot modify your own role" : (u.role === 'admin' ? 'Demote to user' : 'Promote to admin')}
                          >
                            {busy ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faUserShield} />
                            )}
                            <span className="au-btn-text">{u.role === 'admin' ? 'Make user' : 'Make admin'}</span>
                          </button>
                          <button
                            type="button"
                            className="au-btn au-btn--danger"
                            onClick={() => handleDelete(u)}
                            disabled={busy || self} // ✅ Disable for self
                            title={self ? "You cannot delete your own account" : "Delete user"}
                          >
                            {busy ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faUserSlash} />
                            )}
                            <span className="au-btn-text">Delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <footer className="au-footer">
              <span className="au-footer-meta">{filteredSummary}</span>
              <div className="au-pagination">
                <button
                  type="button"
                  className="au-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className="au-page-label">
                  Page {page} / {pages}
                </span>
                <button
                  type="button"
                  className="au-page-btn"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages || loading}
                  aria-label="Next page"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </footer>
          </>
        )}
      </div>

      <p className="au-footnote">
        Built-in login admins (not stored in this database) never appear in this list.
      </p>
    </div>
  )
}