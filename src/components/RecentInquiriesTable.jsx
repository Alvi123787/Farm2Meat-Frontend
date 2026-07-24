import { useState, useEffect, useMemo, useCallback } from 'react'
import api from '../services/api'
import '../css/RecentInquiriesTable.css'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { formatPrice } from '../utils/priceUtils'
import { useAdminDomain } from '../contexts/AdminDomainContext'
import {
  FaTimes, FaReceipt, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCity, FaStickyNote, FaFileInvoiceDollar, FaImage, FaExternalLinkAlt,
  FaBoxOpen, FaEdit
} from 'react-icons/fa'
import { orderService } from '../services/orderService'

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
   Helper Constants & Functions
   ======================== */
const ORDER_STATUSES = {
  pending: { label: 'Pending' },
  confirmed: { label: 'Contacted' },
  delivered: { label: 'Completed' },
  cancelled: { label: 'Cancelled' },
}
const PAYMENT_STATUSES = {
  unpaid: { label: 'Unpaid' },
  advance_paid: { label: 'Advance Paid' },
  fully_paid: { label: 'Fully Paid' },
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not scheduled yet'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Not scheduled yet'
  return date.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateWithoutTime = (dateStr) => {
  if (!dateStr) return 'Not scheduled yet'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Not scheduled yet'
  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/* ========================
   Main Component
   ======================== */
export default function RecentInquiriesTable() {
  const { domain } = useAdminDomain()
  // ─── Dynamic data state ───
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ─── Table state ───
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(null)

  // ─── Modal state ───
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Helper: Map Grouped Order to Order format
  const mapGroupedOrderToOrder = useCallback((orderGroup) => {
    // Map backend status to frontend status keys
    const orderStatusMap = {
      'Pending': 'pending',
      'Contacted': 'confirmed',
      'Completed': 'delivered',
      'Cancelled': 'cancelled',
      'Refunded': 'refunded'
    }

    const orderStatus = orderStatusMap[orderGroup.status] || 'pending'

    // Determine payment status based on status and payment method
    let paymentStatus = 'unpaid'
    if (orderGroup.status === 'Completed') paymentStatus = 'fully_paid'

    return {
      id: orderGroup.orderId,
      orderGroupId: orderGroup.orderId,
      customer: {
        name: orderGroup.customerName,
        phone: orderGroup.phone,
        email: orderGroup.email,
        address: orderGroup.deliveryAddress,
        city: orderGroup.city,
        specialInstructions: orderGroup.items.map(i => i.notes).filter(Boolean).join(', '),
      },
      animal: {
        name: orderGroup.items.map(i => i.animalName).join(', '),
        category: orderGroup.items.map(i => i.category || 'Item').filter(Boolean).join(', '),
        breed: orderGroup.items.map(i => i.breed).filter(Boolean).join(', '),
        weight: orderGroup.items.map(i => i.weight).filter(Boolean).join(', '),
      },
      pricing: {
        animalPrice: orderGroup.items.reduce((sum, i) => sum + i.price, 0),
        deliveryCharges: 49,
        totalAmount: orderGroup.totalAmount + 49, // Add delivery charge
        advancePaid: orderGroup.items.reduce((sum, i) => sum + (i.animalCarePrice || 0), 0),
        remainingBalance: (orderGroup.totalAmount + 49) - orderGroup.items.reduce((sum, i) => sum + (i.animalCarePrice || 0), 0),
      },
      paymentStatus: paymentStatus,
      paymentScreenshot: null,
      orderStatus: orderStatus,
      orderDate: orderGroup.createdAt ? orderGroup.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      deliveryDate: orderGroup.deliveryDate || '',
      expectedDeliveryDate: orderGroup.expectedDeliveryDate || '',
      expectedDeliveryTime: orderGroup.expectedDeliveryTime || '',
      timeline: [
        { status: 'pending', date: orderGroup.createdAt, note: 'Order placed' },
      ],
      items: orderGroup.items.map(item => ({
        ...item,
        unit: item.unit || '',
        price: Number(item.price || 0),
        totalAmount: Number(item.totalAmount || 0),
        quantity: Number(item.quantity || 0)
      })),
    }
  }, [])

  // View Order Handler
  const handleViewOrder = useCallback(async (inquiry) => {
    try {
      const orderGroupId = inquiry.orderGroupId || inquiry.inquiryId
      const result = await orderService.getOrderGroup(orderGroupId, { domain })
      if (result.success && result.data) {
        const detailedOrder = mapGroupedOrderToOrder(result.data)
        setSelectedOrder(detailedOrder)
        setShowDetailModal(true)
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err)
    }
  }, [mapGroupedOrderToOrder, domain])

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

  useAdminLiveRefresh(fetchInquiries, { intervalMs: 8000, enabled: false })

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
  // CSV Export Handler
  // ════════════════════════════════════════════
  // NOTE: moved below filteredData/sortedData declarations — previously this was
  // declared earlier in the file and referenced `filteredData` before it existed,
  // throwing "Cannot access 'filteredData' before initialization" on every render.

  const exportToCSV = useCallback(() => {
    if (filteredData.length === 0) {
      alert('No inquiries to export')
      return
    }

    const headers = ['Inquiry ID', 'Customer', 'Phone', 'Animal/Item', 'Price', 'Date', 'Status']
    const rows = filteredData.map((inquiry) => [
      inquiry.inquiryId,
      inquiry.customerName,
      inquiry.phone,
      inquiry.animalName,
      formatPrice(inquiry.price),
      formatDate(inquiry.date),
      inquiry.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `inquiries-${domain === 'meat' ? 'meat' : 'livestock'}-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredData, domain])

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

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    let initials = ''
    if (parts.length >= 1) initials += parts[0][0]?.toUpperCase() || ''
    if (parts.length >= 2) initials += parts[1][0]?.toUpperCase() || ''
    return initials || '?'
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
          <button className="export-btn" onClick={exportToCSV}>
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
                            {getInitials(inquiry.customerName)}
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
                          {formatDateWithoutTime(inquiry.date)}
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
                            onClick={() => handleViewOrder(inquiry)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(inquiry._id)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
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
                      <div className="customer-avatar">{getInitials(inquiry.customerName)}</div>
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
                    <button className="action-btn view-btn" onClick={() => handleViewOrder(inquiry)}>
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

          {/* Order Detail Modal */}
          {showDetailModal && selectedOrder && (
            <div className="om-overlay" onClick={() => setShowDetailModal(false)}>
              <div className="om-modal om-modal--detail" onClick={(e) => e.stopPropagation()}>
                <div className="om-modal__head">
                  <h2><FaReceipt /> Order Details</h2>
                  <button className="om-modal__x" onClick={() => setShowDetailModal(false)}><FaTimes /></button>
                </div>

                <div className="om-modal__body">
                  {/* Top Bar */}
                  <div className="om-detail-top">
                    <div className="om-detail-top__left">
                      <span className="om-detail-oid">{selectedOrder.id}</span>
                      <span className="om-detail-odate">Placed on {formatDate(selectedOrder.orderDate)}</span>
                    </div>
                  </div>

                  {/* Two-Column Info */}
                  <div className="om-detail-cols">
                    {/* Customer Information */}
                    <div className="om-detail-box">
                      <h3><FaUser /> Customer Information</h3>
                      <div className="om-detail-list">
                        <div className="om-detail-item"><FaUser /><strong>{selectedOrder.customer.name}</strong></div>
                        <div className="om-detail-item"><FaPhone />{selectedOrder.customer.phone}</div>
                        <div className="om-detail-item"><FaEnvelope />{selectedOrder.customer.email || 'N/A'}</div>
                        <div className="om-detail-item"><FaMapMarkerAlt />{selectedOrder.customer.address || 'N/A'}</div>
                        <div className="om-detail-item"><FaCity />{selectedOrder.customer.city || 'N/A'}</div>
                      </div>
                      {selectedOrder.customer.specialInstructions && (
                        <div className="om-detail-special">
                          <FaStickyNote /> <strong>Special Instructions:</strong>
                          <p>{selectedOrder.customer.specialInstructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Payment & Pricing */}
                    <div className="om-detail-box">
                      <h3><FaFileInvoiceDollar /> Payment &amp; Pricing</h3>
                      <div className="om-detail-pricing">
                        <div className="om-price-row">
                          <span>Animal/Item Price</span>
                          <span>Rs. {selectedOrder.pricing.animalPrice.toLocaleString()}</span>
                        </div>
                        <div className="om-price-row">
                          <span>Delivery Charges</span>
                          <span>Rs. 49</span>
                        </div>
                        <div className="om-price-row om-price-row--total">
                          <span>Total Amount</span>
                          <strong>Rs. {selectedOrder.pricing.totalAmount.toLocaleString()}</strong>
                        </div>
                        <div className="om-price-row om-price-row--advance">
                          <span>Advance Paid</span>
                          <span>Rs. {selectedOrder.pricing.advancePaid.toLocaleString()}</span>
                        </div>
                        <div className="om-price-row om-price-row--remaining">
                          <span>Remaining Balance</span>
                          <strong>Rs. {selectedOrder.pricing.remainingBalance.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Details */}
                  <div className="om-detail-box om-detail-box--full">
                    <h3><FaBoxOpen /> Order Items</h3>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: idx === selectedOrder.items.length - 1 ? 0 : '20px', paddingBottom: idx === selectedOrder.items.length - 1 ? 0 : '20px', borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px dashed var(--border-light)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>Item {idx + 1}: {item.animalName}</h4>
                        <div className="om-detail-animal-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                          <div className="om-animal-detail-item">
                            <span className="om-animal-detail-label">{item.itemType === 'meat' ? 'Item ID' : 'Animal ID'}</span>
                            <span className="om-animal-detail-val">{item.inquiryId || item.animalId || 'N/A'}</span>
                          </div>
                          <div className="om-animal-detail-item">
                            <span className="om-animal-detail-label">Type</span>
                            <span className="om-animal-detail-val">{item.itemType === 'meat' ? 'Meat' : 'Livestock'}</span>
                          </div>
                          <div className="om-animal-detail-item">
                            <span className="om-animal-detail-label">Category</span>
                            <span className="om-animal-detail-val">{item.category || 'N/A'}</span>
                          </div>
                          {item.breed && item.itemType !== 'meat' && (
                            <div className="om-animal-detail-item">
                              <span className="om-animal-detail-label">Breed</span>
                              <span className="om-animal-detail-val">{item.breed}</span>
                            </div>
                          )}
                          {item.weight && item.itemType !== 'meat' && (
                            <div className="om-animal-detail-item">
                              <span className="om-animal-detail-label">Weight (Zinda)</span>
                              <span className="om-animal-detail-val om-animal-detail-val--weight">{item.weight} kg</span>
                            </div>
                          )}
                          {item.quantity && (
                            <div className="om-animal-detail-item">
                              <span className="om-animal-detail-label">Quantity</span>
                              <span className="om-animal-detail-val">{item.quantity} {item.unit || (item.itemType === 'meat' ? 'units' : '')}</span>
                            </div>
                          )}
                          <div className="om-animal-detail-item">
                            <span className="om-animal-detail-label">Price per Unit</span>
                            <span className="om-animal-detail-val">Rs. {item.price?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="om-animal-detail-item">
                            <span className="om-animal-detail-label">Item Total</span>
                            <span className="om-animal-detail-val" style={{ fontWeight: '700', color: 'var(--primary)' }}>Rs. {item.totalAmount?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                      <div className="om-animal-detail-item" style={{ justifyContent: 'flex-end' }}>
                        <span className="om-animal-detail-label">Delivery Date</span>
                        <span className="om-animal-detail-val">{formatDate(selectedOrder.deliveryDate)}</span>
                      </div>
                      <div className="om-animal-detail-item" style={{ justifyContent: 'flex-end' }}>
                        <span className="om-animal-detail-label">Expected Delivery Date</span>
                        <span className="om-animal-detail-val">{formatDate(selectedOrder.expectedDeliveryDate)}</span>
                      </div>
                      <div className="om-animal-detail-item" style={{ justifyContent: 'flex-end' }}>
                        <span className="om-animal-detail-label">Expected Delivery Time</span>
                        <span className="om-animal-detail-val">{selectedOrder.expectedDeliveryTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="om-modal__foot">
                  <button className="om-btn om-btn--secondary" onClick={() => setShowDetailModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}