import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaSpinner,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaClipboardList,
  FaSync,
  FaTimes,
} from 'react-icons/fa'
import '../css/AdminComplaints.css'
import complaintService from '../services/complaintService'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { useAuth } from '../contexts/authContextCore'

const formatDate = (value) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusConfig = (status) => {
  switch (status) {
    case 'Pending':
      return { color: '#f59e0b', bg: '#f59e0b12', icon: FaClock, label: 'Pending' }
    case 'In Review':
      return { color: '#3b82f6', bg: '#3b82f612', icon: FaExclamationTriangle, label: 'In Review' }
    case 'Resolved':
      return { color: '#10b981', bg: '#10b98112', icon: FaCheckCircle, label: 'Resolved' }
    case 'Closed':
      return { color: '#6b7280', bg: '#6b728012', icon: FaTimesCircle, label: 'Closed' }
    default:
      return { color: '#6b7280', bg: '#6b728012', icon: FaClock, label: status }
  }
}

const AdminComplaints = () => {
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [complaints, setComplaints] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [updatingId, setUpdatingId] = useState('')

  const load = useCallback(
    async ({ signal } = {}) => {
      if (authLoading) return
      setLoading(true)
      setError('')
      try {
        const result = await complaintService.getComplaints({ signal })
        setComplaints(Array.isArray(result?.data) ? result.data : [])
      } catch (err) {
        if (err?.name === 'AbortError') return
        if (err?.code === 'UNAUTHORIZED') {
          if (!authLoading) navigate('/login')
          return
        }
        setError(err?.message || 'Failed to load complaints')
        setComplaints([])
      } finally {
        setLoading(false)
      }
    },
    [navigate, authLoading]
  )

  useEffect(() => {
    if (authLoading) return
    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [load, authLoading])

  useAdminLiveRefresh(() => load({}), {
    intervalMs: 10000,
    enabled: true,
  })

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        const matchesSearch = !searchQuery ||
          [c.customerName, c.phone, c.email, c.orderNumber, c.subject, c.complaint].some(
            (field) => String(field || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  }, [complaints, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = complaints.length
    const pending = complaints.filter((c) => c.status === 'Pending').length
    const inReview = complaints.filter((c) => c.status === 'In Review').length
    const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length
    return { total, pending, inReview, resolved }
  }, [complaints])

  const handleUpdateStatus = async (complaintId, newStatus) => {
    if (!complaintId || updatingId) return
    setUpdatingId(complaintId)
    try {
      await complaintService.updateComplaintStatus(complaintId, newStatus)
      setComplaints((prev) =>
        prev.map((c) => (c.complaintId === complaintId ? { ...c, status: newStatus } : c))
      )
      if (selectedComplaint?.complaintId === complaintId) {
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      if (err?.code === 'UNAUTHORIZED') {
        if (!authLoading) navigate('/login')
        return
      }
      setError(err?.message || 'Failed to update status')
    } finally {
      setUpdatingId('')
    }
  }

  if (authLoading) {
    return (
      <div className="acp-page">
        <div className="acp-state">
          <FaSpinner className="acp-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="acp-page">
      <div className="acp-container">
        {/* Header */}
        <div className="acp-header">
          <div>
            <h1 className="acp-title">Complaints</h1>
            <p className="acp-subtitle">Manage and resolve customer complaints efficiently</p>
          </div>
          <button
            className="acp-refresh-btn"
            onClick={() => load({})}
            disabled={loading || authLoading}
          >
            <FaSync className={loading ? 'acp-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="acp-stats">
          <div className="acp-stat-card">
            <div className="acp-stat-icon" style={{ background: '#8B000010', color: '#8B0000' }}>
              <FaClipboardList />
            </div>
            <div>
              <p className="acp-stat-label">Total</p>
              <p className="acp-stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="acp-stat-card">
            <div className="acp-stat-icon" style={{ background: '#f59e0b10', color: '#f59e0b' }}>
              <FaClock />
            </div>
            <div>
              <p className="acp-stat-label">Pending</p>
              <p className="acp-stat-value">{stats.pending}</p>
            </div>
          </div>
          <div className="acp-stat-card">
            <div className="acp-stat-icon" style={{ background: '#3b82f610', color: '#3b82f6' }}>
              <FaExclamationTriangle />
            </div>
            <div>
              <p className="acp-stat-label">In Review</p>
              <p className="acp-stat-value">{stats.inReview}</p>
            </div>
          </div>
          <div className="acp-stat-card">
            <div className="acp-stat-icon" style={{ background: '#10b98110', color: '#10b981' }}>
              <FaCheckCircle />
            </div>
            <div>
              <p className="acp-stat-label">Resolved</p>
              <p className="acp-stat-value">{stats.resolved}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="acp-controls">
          <div className="acp-search">
            <FaSearch className="acp-search-icon" />
            <input
              type="text"
              className="acp-search-input"
              placeholder="Search by name, phone, order, subject…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="acp-filter">
            <FaFilter className="acp-filter-icon" />
            <select
              className="acp-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {loading && !authLoading && (
          <div className="acp-state">
            <FaSpinner className="acp-spin" />
            <span>Loading complaints…</span>
          </div>
        )}

        {!loading && !authLoading && error && (
          <div className="acp-error">
            <span>{error}</span>
          </div>
        )}

        {!loading && !authLoading && !error && filteredComplaints.length === 0 && (
          <div className="acp-empty">
            {complaints.length === 0 ? 'No complaints yet.' : 'No complaints match your filters.'}
          </div>
        )}

        {/* Table */}
        {!loading && !authLoading && !error && filteredComplaints.length > 0 && (
          <div className="acp-table-wrap">
            <table className="acp-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="acp-table-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => {
                  const statusConfig = getStatusConfig(c.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <tr key={c.complaintId}>
                      <td>
                        <div className="acp-customer">
                          <div className="acp-customer-icon">
                            <FaUser />
                          </div>
                          <div>
                            <div className="acp-customer-name">{c.customerName}</div>
                            <div className="acp-customer-phone">
                              <FaPhone /> {c.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{c.subject}</td>
                      <td>{c.orderNumber || '—'}</td>
                      <td>
                        <span
                          className="acp-status-badge"
                          style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                        >
                          <StatusIcon className="acp-status-icon" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td>{formatDate(c.date)}</td>
                      <td className="acp-table-action">
                        <button
                          className="acp-view-btn"
                          onClick={() => setSelectedComplaint(c)}
                          aria-label="View complaint details"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <>
          <div className="acp-modal-overlay" onClick={() => setSelectedComplaint(null)} />
          <div className="acp-modal">
            <button className="acp-modal-close" onClick={() => setSelectedComplaint(null)}>
              <FaTimes />
            </button>
            <h2 className="acp-modal-title">Complaint Details</h2>
            <div className="acp-modal-body">
              <div className="acp-modal-field">
                <label>ID</label>
                <p>{selectedComplaint.complaintId}</p>
              </div>
              <div className="acp-modal-field">
                <label>Customer</label>
                <p>{selectedComplaint.customerName}</p>
              </div>
              <div className="acp-modal-field">
                <label>Phone</label>
                <p>
                  <FaPhone className="acp-modal-field-icon" /> {selectedComplaint.phone}
                </p>
              </div>
              {selectedComplaint.email && (
                <div className="acp-modal-field">
                  <label>Email</label>
                  <p>
                    <FaEnvelope className="acp-modal-field-icon" /> {selectedComplaint.email}
                  </p>
                </div>
              )}
              {selectedComplaint.orderNumber && (
                <div className="acp-modal-field">
                  <label>Order Number</label>
                  <p>{selectedComplaint.orderNumber}</p>
                </div>
              )}
              <div className="acp-modal-field">
                <label>Subject</label>
                <p>{selectedComplaint.subject}</p>
              </div>
              <div className="acp-modal-field">
                <label>Complaint</label>
                <div className="acp-modal-text">{selectedComplaint.complaint}</div>
              </div>
              <div className="acp-modal-field">
                <label>Status</label>
                <div>
                  <span
                    className="acp-status-badge"
                    style={{
                      backgroundColor: getStatusConfig(selectedComplaint.status).bg,
                      color: getStatusConfig(selectedComplaint.status).color,
                    }}
                  >
                    {React.createElement(getStatusConfig(selectedComplaint.status).icon, {
                      className: 'acp-status-icon',
                    })}
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
              <div className="acp-modal-field">
                <label>Submitted On</label>
                <p>{formatDate(selectedComplaint.date)}</p>
              </div>

              <div className="acp-modal-actions">
                <button
                  className="acp-modal-btn acp-modal-btn-pending"
                  onClick={() => handleUpdateStatus(selectedComplaint.complaintId, 'Pending')}
                  disabled={updatingId === selectedComplaint.complaintId || selectedComplaint.status === 'Pending'}
                >
                  {updatingId === selectedComplaint.complaintId && <FaSpinner className="acp-spin" />}
                  Mark Pending
                </button>
                <button
                  className="acp-modal-btn acp-modal-btn-progress"
                  onClick={() => handleUpdateStatus(selectedComplaint.complaintId, 'In Review')}
                  disabled={updatingId === selectedComplaint.complaintId || selectedComplaint.status === 'In Review'}
                >
                  {updatingId === selectedComplaint.complaintId && <FaSpinner className="acp-spin" />}
                  In Review
                </button>
                <button
                  className="acp-modal-btn acp-modal-btn-resolved"
                  onClick={() => handleUpdateStatus(selectedComplaint.complaintId, 'Resolved')}
                  disabled={updatingId === selectedComplaint.complaintId || selectedComplaint.status === 'Resolved'}
                >
                  {updatingId === selectedComplaint.complaintId && <FaSpinner className="acp-spin" />}
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminComplaints