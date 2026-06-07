import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMeatItems, useAdminItems } from '../hooks/useMeatItems'
import api from '../services/api'
import '../css/AdminMeatDashboard.css'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/authContextCore'
import { Navigate } from 'react-router-dom'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts'

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTachometerAlt,
  faDrumstickBite,
  faShoppingCart,
  faPlus,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faSearch,
  faStar,
  faTimes,
  faExclamationTriangle,
  faBoxOpen,
  faCheckCircle,
  faTimesCircle,
  faBars,
  faTimes as faClose,
  faHome,
  faChartLine,
  faSync,
  faDollarSign,
  faWeightHanging,
  faClock,
  faUser,
  faMapMarkerAlt,
  faCalendarAlt,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: faTachometerAlt },
  { id: 'items',    label: 'Meat Items', icon: faDrumstickBite },
  { id: 'orders',   label: 'Meat Orders',     icon: faShoppingCart },
]

export default function AdminMeatDashboard() {
  const { role, token, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Strict RBAC check
  if (authLoading) return <div className="ad-loading-spinner">Verifying permissions...</div>
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const [items, setItems] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState(null)

  // Hooks
  const { getAllItems } = useMeatItems()
  const { toggleAvailability, toggleBestseller, deleteItem } = useAdminItems()

  // Fetch all items
  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllItems({ limit: 500 })
      setItems(res?.data || [])
    } catch (err) {
      toast.error('Failed to fetch items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [getAllItems])

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await api.get('/api/analytics/meat-dashboard')
      if (res.data.success) {
        setDashboardStats(res.data)
        setLastUpdated(new Date(res.data.updatedAt))
      }
    } catch (err) {
      toast.error('Failed to fetch dashboard metrics')
      console.error(err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const refreshAll = useCallback(() => {
    fetchItems()
    fetchDashboardStats()
  }, [fetchItems, fetchDashboardStats])

  useEffect(() => {
    refreshAll()
    // Auto refresh every 5 minutes
    const interval = setInterval(refreshAll, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshAll])

  // Derived stats for the "Items" tab
  const localStats = useMemo(() => ({
    total: items.length,
    categories: [...new Set(items.map(i => i.category))].length,
    bestsellers: items.filter(i => i.isBestseller && i.isAvailable).length,
    outOfStock: items.filter(i => !i.isAvailable).length,
  }), [items])

  // Filtered items for table
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [items, search, categoryFilter])

  // Handlers
  const handleToggleAvailability = async (id) => {
    if (!id) return
    try {
      await toggleAvailability(id)
      toast.success('Inventory status updated')
      fetchItems()
      fetchDashboardStats() // Update low stock count
    } catch (err) {
      toast.error(err.message || 'Stock update failed')
    }
  }

  const handleToggleBestseller = async (id) => {
    if (!id) return
    try {
      await toggleBestseller(id)
      toast.success('Bestseller status updated')
      fetchItems()
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const confirmDelete = (item) => setDeleteModal(item)
  const cancelDelete = () => setDeleteModal(null)

  const executeDelete = async () => {
    if (!deleteModal) return
    try {
      await deleteItem(deleteModal._id)
      toast.success('Item deleted successfully')
      setDeleteModal(null)
      fetchItems()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  return (
    <div className="ad-wrapper">
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="ad-sidebar-header">
          <div className="ad-logo">
            <FontAwesomeIcon icon={faDrumstickBite} className="ad-logo-icon" />
            <span>MeatAdmin</span>
          </div>
          <button className="ad-sidebar-close" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <nav className="ad-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`ad-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} fixedWidth />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <a href="/" className="ad-nav-item">
            <FontAwesomeIcon icon={faHome} fixedWidth />
            <span>Back to Site</span>
          </a>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <button className="ad-hamburger" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="ad-topbar-left">
            <h2 className="ad-page-title">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            {lastUpdated && (
              <span className="ad-last-updated">
                <FontAwesomeIcon icon={faClock} /> Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="ad-topbar-actions">
            <button className="ad-btn-icon ad-refresh-btn" onClick={refreshAll} title="Refresh Data">
              <FontAwesomeIcon icon={faSync} spin={statsLoading || loading} />
            </button>
            <div className="ad-user-info">
              <FontAwesomeIcon icon={faUser} />
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="ad-content">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              dashboardData={dashboardStats} 
              loading={statsLoading} 
              onRefresh={fetchDashboardStats}
            />
          )}

          {activeTab === 'items' && (
            <MeatItemsManager
              items={filteredItems}
              loading={loading}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onToggleAvailability={handleToggleAvailability}
              onToggleBestseller={handleToggleBestseller}
              onDelete={confirmDelete}
              onRefresh={fetchItems}
              stats={localStats}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersSection />
          )}
        </div>
      </main>

      {deleteModal && (
        <div className="ad-modal-overlay" onClick={cancelDelete}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3>Delete {deleteModal.name}?</h3>
            <p>This action cannot be undone and will remove the item from inventory.</p>
            <div className="ad-modal-actions">
              <button className="ad-btn ad-btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="ad-btn ad-btn-danger" onClick={executeDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardOverview({ dashboardData, loading, onRefresh }) {
  if (loading && !dashboardData) return (
    <div className="ad-loading-container">
      <div className="ad-spinner"></div>
      <p>Synchronizing real-time metrics...</p>
    </div>
  )

  const stats = dashboardData?.stats || {}
  const recentOrders = dashboardData?.recentOrders || []
  const categoryStats = dashboardData?.categoryStats || []
  const revenueTrend = dashboardData?.revenueTrend || []
  const lowStockItems = dashboardData?.lowStockItems || []

  const statCards = [
    { label: 'Total Inventory', value: stats.totalItems || 0, icon: faBoxOpen, color: '#800000' },
    { label: '30d Revenue', value: `Rs. ${stats.revenue?.toLocaleString() || 0}`, icon: faDollarSign, color: '#2d6a4f' },
    { label: 'Units Sold', value: stats.unitsSold || 0, icon: faWeightHanging, color: '#d4af37' },
    { label: 'Low Stock Alerts', value: stats.outOfStock || 0, icon: faExclamationTriangle, color: '#d00000' },
  ]

  return (
    <div className="ad-dashboard">
      <div className="ad-stat-grid">
        {statCards.map(card => (
          <div key={card.label} className="ad-stat-card">
            <div className="ad-stat-icon" style={{ backgroundColor: card.color }}>
              <FontAwesomeIcon icon={card.icon} />
            </div>
            <div className="ad-stat-info">
              <span className="ad-stat-value">{card.value}</span>
              <span className="ad-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="ad-dashboard-row">
        <div className="ad-dashboard-col ad-chart-card">
          <div className="ad-card-header">
            <h3><FontAwesomeIcon icon={faChartLine} /> 30-Day Sales Trend</h3>
            <span className="ad-badge-live">Live</span>
          </div>
          <div className="ad-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#666' }}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(val) => `Rs.${val > 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#800000" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ad-dashboard-col ad-category-card">
          <div className="ad-card-header">
            <h3><FontAwesomeIcon icon={faDrumstickBite} /> Inventory by Category</h3>
          </div>
          <div className="ad-category-list">
            {categoryStats.map(cat => (
              <div key={cat.category} className="ad-category-item">
                <div className="ad-cat-info">
                  <span className="ad-cat-name">{cat.category || 'Uncategorized'}</span>
                  <span className="ad-cat-count">{cat.count} items</span>
                </div>
                <div className="ad-cat-progress-bg">
                  <div 
                    className="ad-cat-progress-fill" 
                    style={{ width: `${(cat.count / (stats.totalItems || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ad-dashboard-row">
        <div className="ad-dashboard-col ad-recent-orders-card">
          <div className="ad-card-header">
            <h3><FontAwesomeIcon icon={faShoppingCart} /> Recent Meat Orders</h3>
            <button className="ad-btn-text" onClick={() => window.location.href='/admin/inquiries'}>View All</button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="ad-mini-table-wrapper">
              <table className="ad-mini-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.customerName}</td>
                      <td>{order.animalName}</td>
                      <td>Rs. {order.totalAmount}</td>
                      <td>
                        <span className={`ad-status-pill status-${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ad-empty-state">No recent orders found.</p>
          )}
        </div>

        <div className="ad-dashboard-col ad-low-stock-card">
          <div className="ad-card-header">
            <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Low Stock Alerts</h3>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="ad-alert-list">
              {lowStockItems.map(item => (
                <div key={item._id} className="ad-alert-item">
                  <div className="ad-alert-icon">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                  <div className="ad-alert-content">
                    <span className="ad-alert-title">{item.name}</span>
                    <span className="ad-alert-desc">Marked as Out of Stock</span>
                  </div>
                  <button 
                    className="ad-alert-action"
                    onClick={() => window.location.href=`/admin/edit-meat-item/${item._id}`}
                  >
                    Update
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="ad-empty-alerts">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" style={{ color: '#2d6a4f', marginBottom: '10px' }} />
              <p>All items are currently in stock!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MeatItemsManager({
  items, loading, search, setSearch,
  categoryFilter, setCategoryFilter,
  onToggleAvailability, onToggleBestseller, onDelete, onRefresh, stats
}) {
  return (
    <div className="ad-items-manager">
      <div className="ad-mini-stats">
        <div className="ad-mini-stat"><strong>{stats.total}</strong> Items</div>
        <div className="ad-mini-stat"><strong>{stats.bestsellers}</strong> Bestsellers</div>
        <div className="ad-mini-stat danger"><strong>{stats.outOfStock}</strong> Out of Stock</div>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ad-filter-group">
          <select
            className="ad-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="mutton">Mutton</option>
            <option value="beef">Beef</option>
            <option value="chicken">Chicken</option>
            <option value="fish">Fish</option>
          </select>
          <a href="/admin/add-meat-item" className="ad-btn ad-btn-primary">
            <FontAwesomeIcon icon={faPlus} /> Add New Item
          </a>
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-pulse">Updating inventory list...</div>
      ) : (
        <div className="ad-table-container">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="ad-empty">No items match your search filters.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className="ad-item-cell">
                        <img src={item.imageUrl || '/placeholder.png'} alt="" />
                        <div className="ad-item-info">
                          <span className="ad-item-name">{item.name}</span>
                          <span className="ad-item-sub">ID: {item._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="ad-badge-cat">{item.category}</span></td>
                    <td className="ad-price-cell">Rs. {item.price} <small>/{item.unit}</small></td>
                    <td>
                      <button
                        className={`ad-toggle-btn ${item.isAvailable ? 'on' : 'off'}`}
                        onClick={() => onToggleAvailability(item._id)}
                      >
                        <FontAwesomeIcon icon={item.isAvailable ? faCheckCircle : faTimesCircle} />
                        {item.isAvailable ? ' In Stock' : ' Out of Stock'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`ad-toggle-btn ${item.isBestseller ? 'star' : ''}`}
                        onClick={() => onToggleBestseller(item._id)}
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                    </td>
                    <td>
                      <div className="ad-actions">
                        <a href={`/admin/edit-meat-item/${item._id}`} className="ad-action-link" title="Edit">
                          <FontAwesomeIcon icon={faEdit} />
                        </a>
                        <button
                          className="ad-action-btn-danger"
                          onClick={() => onDelete(item)}
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function OrdersSection() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/inquiries/all')
      if (res.data.success) {
        // Filter for meat orders only
        setOrders(res.data.data.filter(o => o.itemType === 'meat'))
      }
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = async (id, status) => {
    if (!id || !status) return;
    
    // Add validation/confirmation for important status changes
    const isDestructive = ['Cancelled'].includes(status);
    const isFinal = ['Completed', 'Delivered'].includes(status);
    
    if (isDestructive || isFinal) {
      if (!window.confirm(`Are you sure you want to mark this order as ${status}?`)) {
        return;
      }
    }

    try {
      await api.patch(`/api/inquiries/${id}/status`, { status })
      toast.success(`Order marked as ${status}`)
      fetchOrders()
      // Also refresh dashboard stats since revenue might change
      fetchDashboardStats()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status'
      toast.error(msg)
    }
  }

  return (
    <div className="ad-orders-manager">
      <div className="ad-card">
        <div className="ad-card-header">
          <h3><FontAwesomeIcon icon={faShoppingCart} /> Meat Order Management</h3>
          <button className="ad-btn-icon" onClick={fetchOrders}><FontAwesomeIcon icon={faSync} /></button>
        </div>
        
        {loading ? (
          <div className="ad-loading">Fetching orders...</div>
        ) : orders.length > 0 ? (
          <div className="ad-table-container">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Order Info</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <div className="ad-order-cell">
                        <span className="ad-order-id">#{order.inquiryId}</span>
                        <span className="ad-order-date">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ad-customer-cell">
                        <span className="ad-cust-name">{order.customerName}</span>
                        <span className="ad-cust-phone">{order.phone}</span>
                      </div>
                    </td>
                    <td>{order.quantity} {order.unit || 'kg'}</td>
                    <td className="ad-bold">Rs. {order.totalAmount}</td>
                    <td>
                      <span className={`ad-status-pill status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="ad-status-select"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ad-empty-orders">
            <FontAwesomeIcon icon={faBoxOpen} size="3x" />
            <p>No meat orders found in the system.</p>
          </div>
        )}
      </div>
    </div>
  )
}
