import { useState, useEffect, useMemo, useCallback } from 'react'
import api from '../services/api'
import '../css/RecentInquiriesTable.css'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { formatPrice } from '../utils/priceUtils'
import { useAdminDomain } from '../contexts/AdminDomainContext'

/* ========================
   StatusBadge Component
   ======================== */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: 'badge-pending',
    Contacted: 'badge-contacted',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled'
  }

  const iconConfig = {
    Pending: 'fa-clock',
    Contacted: 'fa-phone',
    Completed: 'fa-circle-check',
    Cancelled: 'fa-circle-xmark'
  }

  return (
    <span className={`status-badge ${statusConfig[status] || 'badge-pending'}`}>
      <i className={`fa-solid ${iconConfig[status] || 'fa-circle'}`} />
      {status}
    </span>
  )
}

/* ========================
   Main Component
   ======================== */
export default function RecentInquiriesTable() {
  const { domain } = useAdminDomain()
  // ── Dynamic data state ──
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Table state ──
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(null)

  const rowsPerPage = 5

  // ════════════════════════════════════════════
  // Fetch inquiries from backend
  // ════════════════════════════════════════════

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = domain ? { domain } : {}
      const response = await api.get('/api/inquiries/all', { params })
      const result = response.data

      if (result.success) {
        setInquiries(result.data)
      } else {
        setError('Failed to load inquiries')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }, [domain])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  useAdminLiveRefresh(fetchInquiries, { intervalMs: 8000, enabled: true })

  // ════════════════════════════════════════════
  // Status Update Handler
  // ════════════════════════════════════════════

  const handleStatusChange = async (inquiry, newStatus) => {
    const id = inquiry._id
    setStatusUpdating(id)

    // Optimistic update
    setInquiries((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: newStatus } : item
      )
    )

    try {
      const response = await api.patch(`/api/inquiries/${id}/status`, { status: newStatus })
      const result = response.data

      if (!result.success) {
        // Revert on failure
        setInquiries((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status: inquiry.status } : item
          )
        )
      }
    } catch (err) {
      console.error('Status update error:', err)
      // Revert
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: inquiry.status } : item
        )
      )
    } finally {
      setStatusUpdating(null)
    }
  }

  // ════════════════════════════════════════════
  // Delete Handler
  // ════════════════════════════════════════════

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return

    try {
      await api.delete(`/api/inquiries/${id}`)
      setInquiries((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      console.error('Delete error:', err)
      fetchInquiries() // Refetch on error
    }
  }

  // ════════════════════════════════════════════
  // Bulk Delete Handler
  // ════════════════════════════════════════════

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} inquiries?`)) return

    try {
      await api.post('/api/inquiries/bulk/delete', { ids: selectedRows })
      setInquiries((prev) =>
        prev.filter((item) => !selectedRows.includes(item._id))
      )
      setSelectedRows([])
    } catch (err) {
      console.error('Bulk delete error:', err)
      fetchInquiries()
    }
  }

  // ════════════════════════════════════════════
  // Filtering + Search + Sorting
  // ════════════════════════════════════════════

  const filteredData = useMemo(() => {
    let data = inquiries

    // Filter by status
    if (filterStatus !== 'All') {
      data = data.filter((item) => item.status === filterStatus)
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      data = data.filter(
        (item) =>
          (item.customerName || '').toLowerCase().includes(query) ||
          (item.animalName || '').toLowerCase().includes(query) ||
          (item.inquiryId || '').toLowerCase().includes(query) ||
          (item.phone || '').toLowerCase().includes(query)
      )
    }

    return data
  }, [inquiries, filterStatus, searchQuery])

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData
    const sorted = [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredData, sortConfig])

  // ════════════════════════════════════════════
  // Pagination
  // ════════════════════════════════════════════

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage)
  const startEntry = sortedData.length > 0 ? startIndex + 1 : 0
  const endEntry = Math.min(startIndex + rowsPerPage, sortedData.length)

  // ════════════════════════════════════════════
  // Table Handlers
  // ════════════════════════════════════════════

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(currentData.map((item) => item._id))
    }
  }

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setSelectedRows([])
    }
  }

  // ════════════════════════════════════════════
  // Helper Functions
  // ════════════════════════════════════════════

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return 'fa-sort'
    return sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  // ── Dynamic status counts ──
  const statusCounts = useMemo(() => {
    const counts = { All: inquiries.length }
    inquiries.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1
    })
    return counts
  }, [inquiries])

  // ════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════

  return (
    <section className="inquiries-section">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Section Header */}
      <div className="inquiries-header">
        <div className="inquiries-title-group">
          <div className="title-row">
            <div className="title-icon-box">
              <i className="fa-solid fa-message" />
            </div>
            <div>
              <h2 className="inquiries-title">
                {domain === 'meat' ? 'Meat Inquiries' : 'Recent Inquiries'}
              </h2>
              <div className="title-accent-bar" />
            </div>
          </div>
          <p className="inquiries-subtitle">
            {domain === 'meat' 
              ? 'Manage and track customer inquiries for your meat products' 
              : 'Manage and track customer inquiries for your livestock'}
          </p>
        </div>

        <div className="inquiries-actions-top">
          <button className="export-btn" onClick={fetchInquiries}>
            <i className="fa-solid fa-rotate" />
            <span>Refresh</span>
          </button>
          <button className="export-btn">
            <i className="fa-solid fa-download" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="inquiries-loading">
          <i className="fa-solid fa-spinner fa-spin" />
          <span>Loading inquiries...</span>
        </div>
      )}

      {/* ── Error State ── */}
      {error && !loading && (
        <div className="inquiries-error">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{error}</span>
          <button className="inquiries-retry-btn" onClick={fetchInquiries}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Main Content (only when loaded) ── */}
      {!loading && !error && (
        <>
          {/* Filter Tabs */}
          <div className="filter-tabs-bar">
            <div className="filter-tabs">
              {['All', 'Pending', 'Contacted', 'Completed', 'Cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    className={`filter-tab ${
                      filterStatus === status ? 'active' : ''
                    }`}
                    onClick={() => {
                      setFilterStatus(status)
                      setCurrentPage(1)
                      setSelectedRows([])
                    }}
                  >
                    {status}
                    <span className="filter-count">
                      {statusCounts[status] || 0}
                    </span>
                  </button>
                )
              )}
            </div>
            <div className="table-search-box">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>

          {/* Selected Actions Bar */}
          {selectedRows.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="selected-count">
                <i className="fa-solid fa-check-circle" />
                {selectedRows.length} selected
              </span>
              <div className="bulk-btns">
                <button className="bulk-btn danger" onClick={handleBulkDelete}>
                  <i className="fa-solid fa-trash" /> Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* ── Desktop Table ── */}
          <div className="table-wrapper">
            <table className="inquiries-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === currentData.length &&
                          currentData.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                      <span className="checkmark" />
                    </label>
                  </th>
                  <th
                    className="th-sortable"
                    onClick={() => handleSort('inquiryId')}
                  >
                    <span>Inquiry ID</span>
                    <i
                      className={`fa-solid ${getSortIcon('inquiryId')} sort-icon`}
                    />
                  </th>
                  <th
                    className="th-sortable"
                    onClick={() => handleSort('customerName')}
                  >
                    <span>Customer</span>
                    <i
                      className={`fa-solid ${getSortIcon('customerName')} sort-icon`}
                    />
                  </th>
                  <th>Phone</th>
                  <th
                    className="th-sortable"
                    onClick={() => handleSort('animalName')}
                  >
                    <span>Animal</span>
                    <i
                      className={`fa-solid ${getSortIcon('animalName')} sort-icon`}
                    />
                  </th>
                  <th
                    className="th-sortable"
                    onClick={() => handleSort('price')}
                  >
                    <span>Price</span>
                    <i
                      className={`fa-solid ${getSortIcon('price')} sort-icon`}
                    />
                  </th>
                  <th
                    className="th-sortable"
                    onClick={() => handleSort('date')}
                  >
                    <span>Date</span>
                    <i
                      className={`fa-solid ${getSortIcon('date')} sort-icon`}
                    />
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((inquiry) => (
                    <tr
                      key={inquiry._id}
                      className={
                        selectedRows.includes(inquiry._id)
                          ? 'row-selected'
                          : ''
                      }
                    >
                      <td className="td-checkbox">
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(inquiry._id)}
                            onChange={() => handleSelectRow(inquiry._id)}
                          />
                          <span className="checkmark" />
                        </label>
                      </td>
                      <td>
                        <span className="inquiry-id">
                          {inquiry.inquiryId}
                        </span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {inquiry.avatar}
                          </div>
                          <span className="customer-name">
                            {inquiry.customerName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="phone-text">{inquiry.phone}</span>
                      </td>
                      <td>
                        <div className="animal-cell">
                          <span className="animal-name">
                            {inquiry.animalName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="price-text">
                          {formatPrice(inquiry.price)}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {formatDate(inquiry.date)}
                        </span>
                      </td>
                      <td>
                        {/* Clickable status badge — cycles through statuses */}
                        <button
                          className="status-badge-btn"
                          onClick={() => {
                            const statuses = [
                              'Pending',
                              'Contacted',
                              'Completed',
                              'Cancelled'
                            ]
                            const currentIdx = statuses.indexOf(
                              inquiry.status
                            )
                            const nextStatus =
                              statuses[(currentIdx + 1) % statuses.length]
                            handleStatusChange(inquiry, nextStatus)
                          }}
                          disabled={statusUpdating === inquiry._id}
                          title="Click to change status"
                        >
                          <StatusBadge status={inquiry.status} />
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye" />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(inquiry._id)}
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      <div className="empty-content">
                        <i className="fa-solid fa-inbox" />
                        <h4>No inquiries found</h4>
                        <p>
                          {searchQuery
                            ? 'No inquiries match your search.'
                            : filterStatus !== 'All'
                            ? `No ${filterStatus.toLowerCase()} inquiries.`
                            : 'No inquiries yet. Orders will appear here automatically.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Card View ── */}
          <div className="mobile-cards">
            {currentData.length > 0 ? (
              currentData.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className={`mobile-inquiry-card ${
                    selectedRows.includes(inquiry._id) ? 'card-selected' : ''
                  }`}
                >
                  <div className="mobile-card-header">
                    <div className="mobile-card-left">
                      <label className="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(inquiry._id)}
                          onChange={() => handleSelectRow(inquiry._id)}
                        />
                        <span className="checkmark" />
                      </label>
                      <div className="customer-avatar">{inquiry.avatar}</div>
                      <div>
                        <span className="customer-name">
                          {inquiry.customerName}
                        </span>
                        <span className="inquiry-id">
                          {inquiry.inquiryId}
                        </span>
                      </div>
                    </div>
                    <button
                      className="status-badge-btn"
                      onClick={() => {
                        const statuses = [
                          'Pending',
                          'Contacted',
                          'Completed',
                          'Cancelled'
                        ]
                        const currentIdx = statuses.indexOf(inquiry.status)
                        const nextStatus =
                          statuses[(currentIdx + 1) % statuses.length]
                        handleStatusChange(inquiry, nextStatus)
                      }}
                      disabled={statusUpdating === inquiry._id}
                    >
                      <StatusBadge status={inquiry.status} />
                    </button>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-detail-row">
                      <div className="mobile-detail">
                        <span className="detail-label">
                          <i className="fa-solid fa-cow" /> Animal
                        </span>
                        <span className="detail-value">
                          {inquiry.animalName}
                        </span>
                      </div>
                      <div className="mobile-detail">
                        <span className="detail-label">
                          <i className="fa-solid fa-tag" /> Price
                        </span>
                        <span className="detail-value price-text">
                          {formatPrice(inquiry.price)}
                        </span>
                      </div>
                    </div>
                    <div className="mobile-detail-row">
                      <div className="mobile-detail">
                        <span className="detail-label">
                          <i className="fa-solid fa-phone" /> Phone
                        </span>
                        <span className="detail-value">{inquiry.phone}</span>
                      </div>
                      <div className="mobile-detail">
                        <span className="detail-label">
                          <i className="fa-solid fa-calendar" /> Date
                        </span>
                        <span className="detail-value">
                          {formatDate(inquiry.date)}
                        </span>
                      </div>
                    </div>
                    {inquiry.orderSource && (
                      <div className="mobile-detail-row">
                        <div className="mobile-detail">
                          <span className="detail-label">
                            <i className="fa-solid fa-shopping-cart" /> Source
                          </span>
                          <span className="detail-value">
                            {inquiry.orderSource}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mobile-card-footer">
                    <button className="action-btn view-btn">
                      <i className="fa-solid fa-eye" /> View
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(inquiry._id)}
                    >
                      <i className="fa-solid fa-trash-can" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-content mobile-empty">
                <i className="fa-solid fa-inbox" />
                <h4>No inquiries found</h4>
                <p>Orders will appear here when customers place them.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {sortedData.length > 0 && (
            <div className="pagination-bar">
              <p className="pagination-info">
                Showing{' '}
                <strong>
                  {startEntry}–{endEntry}
                </strong>{' '}
                of <strong>{sortedData.length}</strong> inquiries
              </p>

              <div className="pagination-controls">
                <button
                  className="page-btn nav-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fa-solid fa-chevron-left" />
                  <span>Previous</span>
                </button>

                <div className="page-numbers">
                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span key={`dots-${index}`} className="page-dots">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`page-btn num-btn ${
                          currentPage === page ? 'active' : ''
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  className="page-btn nav-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span>Next</span>
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
