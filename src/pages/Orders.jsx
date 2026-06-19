import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  FaClipboardList, FaRupeeSign, FaClock, FaCheckCircle, FaTimesCircle,
  FaFilter, FaChevronDown, FaChevronLeft, FaChevronRight, FaSearch,
  FaFileExport, FaFileCsv, FaFileExcel, FaFilePdf, FaDownload,
  FaEye, FaEdit, FaTrashAlt, FaSortAmountDown, FaSortAmountUp,
  FaTimes, FaExclamationTriangle, FaCheck, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaUser, FaBox, FaTruck, FaCreditCard, FaMoneyBillWave,
  FaStickyNote, FaCalendarAlt, FaCity, FaHashtag, FaInfoCircle,
  FaArrowRight, FaRedo, FaWeightHanging, FaPaw, FaLayerGroup,
  FaShieldAlt, FaReceipt, FaHandHoldingUsd, FaCalendarCheck,
  FaImage, FaExternalLinkAlt, FaChevronUp, FaEllipsisV,
  FaPrint, FaShoppingCart, FaBan, FaHourglassHalf, FaWallet,
  FaFileInvoiceDollar, FaPercent, FaMotorcycle, FaSpinner,
  FaBoxOpen
} from 'react-icons/fa';
import '../css/Orders.css';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/authContextCore';
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh';
import { useAdminDomain } from '../contexts/AdminDomainContext';

/* ════════════════════════════════════════════════════
   CONSTANTS & CONFIGURATION
   ════════════════════════════════════════════════════ */

const ORDER_STATUSES = {
  pending: { label: 'Pending', icon: FaHourglassHalf },
  confirmed: { label: 'Confirmed', icon: FaCheckCircle },
  delivered: { label: 'Delivered', icon: FaTruck },
  cancelled: { label: 'Cancelled', icon: FaBan },
};

const PAYMENT_STATUSES = {
  unpaid: { label: 'Unpaid', icon: FaTimesCircle },
  advance_paid: { label: 'Advance Paid', icon: FaHandHoldingUsd },
  fully_paid: { label: 'Fully Paid', icon: FaCheckCircle },
};

const ANIMAL_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Bakra', label: 'Bakra' },
  { value: 'Patth', label: 'Patth' },
  { value: 'Bakri', label: 'Bakri' },
];

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot',
  'Gujranwala', 'Bahawalpur',
];

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

const ORDER_STATUS_TIMELINE = ['pending', 'confirmed', 'delivered'];

const OrdersSortIcon = ({ sortConfig, field }) => {
  if (sortConfig.field !== field) {
    return <FaSortAmountDown className="om-sort-icon om-sort-icon--inactive" />;
  }
  return sortConfig.direction === 'asc'
    ? <FaSortAmountUp className="om-sort-icon" />
    : <FaSortAmountDown className="om-sort-icon" />;
};

/* ════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════ */

const Orders = () => {
  const { role, loading: authLoading } = useAuth(); // ✅ Step 1: Wait for auth ready
  const { domain } = useAdminDomain(); // Get current domain
  /* ─────── State ─────── */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Helper: Map Grouped Order to Order format
  const mapGroupedOrderToOrder = useCallback((orderGroup) => {
    // Map backend status to frontend status keys
    const orderStatusMap = {
      'Pending': 'pending',
      'Contacted': 'confirmed',
      'Completed': 'delivered',
      'Cancelled': 'cancelled'
    };

    const orderStatus = orderStatusMap[orderGroup.status] || 'pending';
    
    // Determine payment status based on status and payment method
    let paymentStatus = 'unpaid';
    if (orderGroup.status === 'Completed') paymentStatus = 'fully_paid';

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
        deliveryCharges: 0, // Not explicitly in model yet
        totalAmount: orderGroup.totalAmount,
        advancePaid: orderGroup.items.reduce((sum, i) => sum + (i.animalCarePrice || 0), 0),
        remainingBalance: orderGroup.totalAmount - orderGroup.items.reduce((sum, i) => sum + (i.animalCarePrice || 0), 0),
      },
      paymentStatus: paymentStatus,
      paymentScreenshot: null,
      orderStatus: orderStatus,
      orderDate: orderGroup.createdAt ? orderGroup.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      deliveryDate: orderGroup.deliveryDate || '',
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
    };
  }, []);

  const fetchOrders = useCallback(async (signal) => {
    // ✅ Step 2: Guard the fetch
    if (authLoading) return;   // ⛔ wait karo
    if (!role) return;         // ⛔ role bhi hona chahiye
    
    setLoading(true);
    setError(null);
    try {
      const result = role === 'admin' 
        ? await orderService.getGroupedOrders({ domain, signal }) 
        : await orderService.getOrders({ signal });
      
      const mappedOrders = (result.data || []).map(mapGroupedOrderToOrder);
      setOrders(mappedOrders);
    } catch (err) {
      // ✅ BONUS FIX: Only show error if it's not an abort and not an auth timing issue
      if (err.name !== 'AbortError') {
        if (!role) return; // ⛔ ignore early error
        
        setError(err.message || 'Failed to fetch orders');
        showNotif(err.message || 'Failed to fetch orders', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [role, authLoading, mapGroupedOrderToOrder, domain]);

  // ✅ Step 2: useEffect ko guard karo
  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  // ✅ Step 3: Live refresh ko bhi guard karo
  useAdminLiveRefresh(() => fetchOrders(), { 
    intervalMs: role === 'admin' ? 8000 : 12000, 
    enabled: !!role && !authLoading  // ⛔ jab tak role nahi aata, run nahi karega
  })

  const initialFilters = {
    dateFrom: '',
    dateTo: '',
    orderStatus: '',
    paymentStatus: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    city: '',
    customerName: '',
    customerPhone: '',
    animalCategory: '',
  };

  const [filters, setFilters] = useState({ ...initialFilters });
  const [appliedFilters, setAppliedFilters] = useState({ ...initialFilters });
  const [sortConfig, setSortConfig] = useState({ field: 'orderDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notification, setNotification] = useState(null);

  const exportMenuRef = useRef(null);

  /* ─────── Close export on outside click ─────── */
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─────── Notification ─────── */
  const showNotif = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  /* ═══════════════════════════════════════
     FILTERING
     ═══════════════════════════════════════ */
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Quick search bar
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.animal.name.toLowerCase().includes(q)
      );
    }

    // Applied filters
    const f = appliedFilters;
    if (f.dateFrom) result = result.filter((o) => o.orderDate >= f.dateFrom);
    if (f.dateTo) result = result.filter((o) => o.orderDate <= f.dateTo);
    if (f.orderStatus) result = result.filter((o) => o.orderStatus === f.orderStatus);
    if (f.paymentStatus) result = result.filter((o) => o.paymentStatus === f.paymentStatus);
    if (f.deliveryDateFrom) result = result.filter((o) => o.deliveryDate >= f.deliveryDateFrom);
    if (f.deliveryDateTo) result = result.filter((o) => o.deliveryDate <= f.deliveryDateTo);
    if (f.city) result = result.filter((o) => o.customer.city === f.city);
    if (f.customerName) {
      const cn = f.customerName.toLowerCase().trim();
      result = result.filter((o) => o.customer.name.toLowerCase().includes(cn));
    }
    if (f.customerPhone) {
      const cp = f.customerPhone.trim();
      result = result.filter((o) => o.customer.phone.includes(cp));
    }
    if (f.animalCategory) result = result.filter((o) => o.animal.category === f.animalCategory);

    return result;
  }, [orders, searchQuery, appliedFilters]);

  /* ═══════════════════════════════════════
     SORTING
     ═══════════════════════════════════════ */
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (sortConfig.field) {
        case 'orderDate':
          aVal = new Date(a.orderDate);
          bVal = new Date(b.orderDate);
          break;
        case 'deliveryDate':
          aVal = new Date(a.deliveryDate);
          bVal = new Date(b.deliveryDate);
          break;
        case 'totalAmount':
          aVal = a.pricing.totalAmount;
          bVal = b.pricing.totalAmount;
          break;
        case 'weight':
          aVal = a.animal.weight;
          bVal = b.animal.weight;
          break;
        case 'orderStatus':
          aVal = a.orderStatus;
          bVal = b.orderStatus;
          break;
        case 'customerName':
          aVal = a.customer.name.toLowerCase();
          bVal = b.customer.name.toLowerCase();
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredOrders, sortConfig]);

  /* ═══════════════════════════════════════
     PAGINATION
     ═══════════════════════════════════════ */
  const totalPages = Math.ceil(sortedOrders.length / perPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sortedOrders.slice(start, start + perPage);
  }, [sortedOrders, currentPage, perPage]);

  /* ═══════════════════════════════════════
     STATISTICS
     ═══════════════════════════════════════ */
  const stats = useMemo(() => {
    const data = filteredOrders;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const nextWeekDate = new Date(now);
    nextWeekDate.setDate(now.getDate() + 7);
    const nextWeek = nextWeekDate.toISOString().split('T')[0];

    return {
      totalOrders: data.length,
      totalRevenue: data.reduce((s, o) => s + o.pricing.totalAmount, 0),
      totalAdvanceCollected: data.reduce((s, o) => s + o.pricing.advancePaid, 0),
      pendingPayments: data
        .filter((o) => o.paymentStatus !== 'fully_paid' && o.orderStatus !== 'cancelled')
        .reduce((s, o) => s + o.pricing.remainingBalance, 0),
      pendingOrders: data.filter((o) => o.orderStatus === 'pending').length,
      confirmedOrders: data.filter((o) => o.orderStatus === 'confirmed').length,
      deliveredOrders: data.filter((o) => o.orderStatus === 'delivered').length,
      cancelledOrders: data.filter((o) => o.orderStatus === 'cancelled').length,
      upcomingDeliveries: data.filter(
        (o) => o.deliveryDate >= today && o.deliveryDate <= nextWeek &&
               o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered'
      ).length,
    };
  }, [filteredOrders]);

  /* ═══════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════ */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
    showNotif('Filters applied successfully');
  };

  const resetFilters = () => {
    setFilters({ ...initialFilters });
    setAppliedFilters({ ...initialFilters });
    setSearchQuery('');
    setCurrentPage(1);
    showNotif('All filters cleared', 'info');
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleViewOrder = async (order) => {
    try {
      const result = await orderService.getOrderGroup(order.orderGroupId, { domain });
      if (result.success && result.data) {
        // Map the detailed order
        const detailedOrder = mapGroupedOrderToOrder(result.data);
        setSelectedOrder(detailedOrder);
        setShowDetailModal(true);
      }
    } catch (err) {
      showNotif(err.message || 'Failed to fetch order details', 'error');
    }
  };

  const handleDeleteClick = (order) => {
    setDeleteTarget(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      showNotif(`Order ${deleteTarget.id} removed successfully`);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleStatusClick = (order) => {
    setStatusTarget(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!statusTarget) return;
    
    // Only allow admins to update status via backend
    if (role === 'admin') {
      setLoading(true);
      try {
        // Map frontend status back to backend status
        const statusMap = {
          'pending': 'Pending',
          'confirmed': 'Contacted',
          'delivered': 'Completed',
          'cancelled': 'Cancelled'
        };
        const backendStatus = statusMap[newOrderStatus];
        
        await orderService.updateStatus(statusTarget._id, backendStatus);
        showNotif(`Order ${statusTarget.id} updated successfully`);
        fetchOrders(); // Refresh data
      } catch (err) {
        showNotif(err.message || 'Failed to update order status', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showNotif('Only admins can update order status', 'error');
    }
    
    setShowStatusModal(false);
    setStatusTarget(null);
  };

  /* ═══════════════════════════════════════
     EXPORT
     ═══════════════════════════════════════ */
  const getExportData = (scope) => (scope === 'all' ? orders : filteredOrders);

  const exportCSV = (scope) => {
    const data = getExportData(scope);
    const headers = [
      'Order ID', 'Customer Name', 'Phone', 'City', 'Animal Name', 'Category', 'Breed',
      'Weight (Zinda)', 'Animal Price (Rs.)', 'Delivery Charges (Rs.)', 'Total Amount (Rs.)',
      'Advance Paid (Rs.)', 'Remaining (Rs.)', 'Payment Method', 'Payment Status',
      'Order Status', 'Order Date', 'Delivery Date', 'Notes',
    ];
    const rows = data.map((o) => [
      o.id, o.customer.name, o.customer.phone, o.customer.city,
      o.animal.name, o.animal.category, o.animal.breed, o.animal.weight,
      o.pricing.animalPrice, o.pricing.deliveryCharges, o.pricing.totalAmount,
      o.pricing.advancePaid, o.pricing.remainingBalance,
      o.paymentMethod, PAYMENT_STATUSES[o.paymentStatus].label,
      ORDER_STATUSES[o.orderStatus].label, o.orderDate, o.deliveryDate, o.notes,
    ]);
    const totalRevenue = data.reduce((s, o) => s + o.pricing.totalAmount, 0);
    const totalAdvance = data.reduce((s, o) => s + o.pricing.advancePaid, 0);
    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
      '',
      `"Total Orders","${data.length}"`,
      `"Total Revenue","Rs. ${totalRevenue.toLocaleString()}"`,
      `"Total Advance Collected","Rs. ${totalAdvance.toLocaleString()}"`,
    ].join('\n');
    downloadFile(csv, `livestock-orders-${scope}.csv`, 'text/csv');
    showNotif(`CSV exported — ${data.length} orders`);
    setShowExportMenu(false);
  };

  const exportExcel = (scope) => {
    const data = getExportData(scope);
    const totalRevenue = data.reduce((s, o) => s + o.pricing.totalAmount, 0);
    const totalAdvance = data.reduce((s, o) => s + o.pricing.advancePaid, 0);
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Orders</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
    html += '<table border="1"><thead><tr>';
    const cols = ['Order ID', 'Customer', 'Phone', 'City', 'Animal', 'Category', 'Weight (Zinda)', 'Total (Rs.)', 'Advance (Rs.)', 'Remaining (Rs.)', 'Payment', 'Status', 'Order Date', 'Delivery Date'];
    cols.forEach((h) => { html += `<th style="background:#800000;color:#fff;font-weight:bold;padding:8px;">${h}</th>`; });
    html += '</tr></thead><tbody>';
    data.forEach((o) => {
      html += `<tr>
        <td>${o.id}</td><td>${o.customer.name}</td><td>${o.customer.phone}</td>
        <td>${o.customer.city}</td><td>${o.animal.name}</td><td>${o.animal.category}</td>
        <td style="text-align:right;">${o.animal.weight} kg</td>
        <td style="text-align:right;">${o.pricing.totalAmount.toLocaleString()}</td>
        <td style="text-align:right;">${o.pricing.advancePaid.toLocaleString()}</td>
        <td style="text-align:right;">${o.pricing.remainingBalance.toLocaleString()}</td>
        <td>${PAYMENT_STATUSES[o.paymentStatus].label}</td>
        <td>${ORDER_STATUSES[o.orderStatus].label}</td>
        <td>${o.orderDate}</td><td>${o.deliveryDate}</td>
      </tr>`;
    });
    html += `<tr><td colspan="7" style="font-weight:bold;padding:8px;">Total: ${data.length} orders</td><td style="font-weight:bold;padding:8px;text-align:right;">Rs. ${totalRevenue.toLocaleString()}</td><td style="font-weight:bold;padding:8px;text-align:right;">Rs. ${totalAdvance.toLocaleString()}</td><td colspan="5"></td></tr>`;
    html += '</tbody></table></body></html>';
    downloadFile(html, `livestock-orders-${scope}.xls`, 'application/vnd.ms-excel');
    showNotif(`Excel exported — ${data.length} orders`);
    setShowExportMenu(false);
  };

  const exportPDF = (scope) => {
    const data = getExportData(scope);
    const totalRevenue = data.reduce((s, o) => s + o.pricing.totalAmount, 0);
    const totalAdvance = data.reduce((s, o) => s + o.pricing.advancePaid, 0);
    const printWin = window.open('', '_blank');
    if (!printWin) { showNotif('Please allow popups for PDF export', 'error'); return; }

    let html = `<!DOCTYPE html><html><head><title>Livestock Orders Report</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:28px;color:#222;font-size:11px}
      h1{font-size:20px;color:#800000;margin-bottom:2px}
      .sub{font-size:12px;color:#666;margin-bottom:18px}
      .summary-row{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
      .s-card{background:#f5f5f5;border-radius:6px;padding:10px 16px;border-left:3px solid #800000}
      .s-card strong{font-size:16px;color:#800000;display:block}
      .s-card span{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.5px}
      table{width:100%;border-collapse:collapse}
      th{background:#800000;color:#fff;padding:7px 5px;text-align:left;font-size:10px;text-transform:uppercase}
      td{padding:5px;border-bottom:1px solid #e0e0e0;font-size:10px}
      tr:nth-child(even){background:#fafafa}
      .amt{text-align:right}
      .ft{margin-top:20px;padding-top:10px;border-top:2px solid #800000;font-size:11px}
      @media print{body{padding:8px}}
    </style></head><body>`;
    html += `<h1>Qurbani Mandi — Orders Report</h1>`;
    html += `<p class="sub">Generated: ${new Date().toLocaleString()} | ${scope === 'all' ? 'All Orders' : 'Filtered Results'}</p>`;
    html += `<div class="summary-row">
      <div class="s-card"><strong>${data.length}</strong><span>Total Orders</span></div>
      <div class="s-card"><strong>Rs. ${totalRevenue.toLocaleString()}</strong><span>Total Revenue</span></div>
      <div class="s-card"><strong>Rs. ${totalAdvance.toLocaleString()}</strong><span>Advance Collected</span></div>
      <div class="s-card"><strong>${data.filter(o=>o.orderStatus==='pending').length}</strong><span>Pending</span></div>
      <div class="s-card"><strong>${data.filter(o=>o.orderStatus==='delivered').length}</strong><span>Delivered</span></div>
    </div>`;
    html += '<table><thead><tr>';
    ['#','Order ID','Customer','Phone','City','Animal','Weight (Zinda)','Total','Advance','Remaining','Payment','Status','Order Date','Delivery'].forEach(h=>{html+=`<th>${h}</th>`;});
    html += '</tr></thead><tbody>';
    data.forEach((o,i)=>{
      html+=`<tr><td>${i+1}</td><td>${o.id}</td><td>${o.customer.name}</td><td>${o.customer.phone}</td><td>${o.customer.city}</td><td>${o.animal.name}</td><td class="amt">${o.animal.weight}kg</td><td class="amt">Rs.${o.pricing.totalAmount.toLocaleString()}</td><td class="amt">Rs.${o.pricing.advancePaid.toLocaleString()}</td><td class="amt">Rs.${o.pricing.remainingBalance.toLocaleString()}</td><td>${PAYMENT_STATUSES[o.paymentStatus].label}</td><td>${ORDER_STATUSES[o.orderStatus].label}</td><td>${o.orderDate}</td><td>${o.deliveryDate}</td></tr>`;
    });
    html += '</tbody></table>';
    html += `<div class="ft"><strong>Summary:</strong> ${data.length} orders | Revenue: Rs. ${totalRevenue.toLocaleString()} | Advance: Rs. ${totalAdvance.toLocaleString()}</div>`;
    html += '</body></html>';
    printWin.document.write(html);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
    showNotif(`PDF report generated — ${data.length} orders`);
    setShowExportMenu(false);
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  /* ═══════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════ */
  const formatDate = (d) => new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getPageNumbers = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  const activeFilterCount = Object.values(appliedFilters).filter((v) => v !== '').length;

  const getPaymentMethodLabel = (m) => {
    const map = { cod: 'Cash on Delivery', bank_transfer: 'Bank Transfer', easypaisa: 'EasyPaisa', jazzcash: 'JazzCash', cash: 'Cash (In-Person)' };
    return map[m] || m;
  };

  const getPaymentMethodIcon = (m) => {
    const map = { cod: FaMoneyBillWave, bank_transfer: FaCreditCard, easypaisa: FaWallet, jazzcash: FaWallet, cash: FaMoneyBillWave };
    const Icon = map[m] || FaMoneyBillWave;
    return <Icon />;
  };

  // ✅ Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="orders-management-page">
        <div className="om-loading-container">
          <FaSpinner className="om-loading-spinner" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="orders-management-page">
        <div className="om-loading-container">
          <FaSpinner className="om-loading-spinner" />
          <p>Loading orders…</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="orders-management-page">
        <div className="om-empty-state">
          <FaExclamationTriangle className="om-empty-icon" />
          <h2>Couldn't load orders</h2>
          <p>{String(error)}</p>
          <button className="om-btn om-btn--primary" onClick={() => fetchOrders()}>
            <FaRedo /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     JSX
     ═══════════════════════════════════════ */
  return (
    <div className="orders-management-page">
      {/* ── Toast ── */}
      {notification && (
        <div className={`om-toast om-toast--${notification.type}`}>
          {notification.type === 'success' && <FaCheckCircle />}
          {notification.type === 'error' && <FaTimesCircle />}
          {notification.type === 'info' && <FaInfoCircle />}
          <span>{notification.message}</span>
          <button className="om-toast__close" onClick={() => setNotification(null)}><FaTimes /></button>
        </div>
      )}

      {/* ═════════════════════════════════
         PAGE HEADER
         ═════════════════════════════════ */}
      <header className="om-header">
        <div className="om-header__left">
          <h1 className="om-header__title">
            <FaClipboardList className="om-header__icon" />
            Orders Management
          </h1>
          <p className="om-header__subtitle">
            Monitor, filter, and export {domain === 'meat' ? 'meat' : 'livestock'} orders efficiently.
          </p>
        </div>
        <div className="om-header__counters">
          <div className="om-header-counter">
            <span className="om-header-counter__value">{stats.totalOrders}</span>
            <span className="om-header-counter__label"><FaClipboardList /> Total</span>
          </div>
          <div className="om-header-counter om-header-counter--pending">
            <span className="om-header-counter__value">{stats.pendingOrders}</span>
            <span className="om-header-counter__label"><FaClock /> Pending</span>
          </div>
          <div className="om-header-counter om-header-counter--delivered">
            <span className="om-header-counter__value">{stats.deliveredOrders}</span>
            <span className="om-header-counter__label"><FaCheckCircle /> Delivered</span>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════
         STATISTICS CARDS
         ═════════════════════════════════ */}
      <div className="om-stats-grid">
        <div className="om-stat-card">
          <div className="om-stat-card__icon om-stat-card__icon--revenue"><FaRupeeSign /></div>
          <div className="om-stat-card__body">
            <span className="om-stat-card__value">Rs. {stats.totalRevenue.toLocaleString()}</span>
            <span className="om-stat-card__label">Total Revenue</span>
          </div>
        </div>
        <div className="om-stat-card">
          <div className="om-stat-card__icon om-stat-card__icon--advance"><FaHandHoldingUsd /></div>
          <div className="om-stat-card__body">
            <span className="om-stat-card__value">Rs. {stats.totalAdvanceCollected.toLocaleString()}</span>
            <span className="om-stat-card__label">Advance Collected</span>
          </div>
        </div>
        <div className="om-stat-card">
          <div className="om-stat-card__icon om-stat-card__icon--pending-pay"><FaHourglassHalf /></div>
          <div className="om-stat-card__body">
            <span className="om-stat-card__value">Rs. {stats.pendingPayments.toLocaleString()}</span>
            <span className="om-stat-card__label">Pending Payments</span>
          </div>
        </div>
        <div className="om-stat-card">
          <div className="om-stat-card__icon om-stat-card__icon--upcoming"><FaCalendarCheck /></div>
          <div className="om-stat-card__body">
            <span className="om-stat-card__value">{stats.upcomingDeliveries}</span>
            <span className="om-stat-card__label">Upcoming Deliveries</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════
         ADVANCED FILTERS
         ═════════════════════════════════ */}
      <div className="om-filters-wrapper">
        <button
          className={`om-filters-toggle ${showFilters ? 'om-filters-toggle--active' : ''}`}
          onClick={() => setShowFilters((p) => !p)}
        >
          <FaFilter />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && <span className="om-filters-badge">{activeFilterCount}</span>}
          <FaChevronDown className={`om-chevron ${showFilters ? 'om-chevron--open' : ''}`} />
        </button>

        {showFilters && (
          <div className="om-filters-panel">
            {/* Row 1 */}
            <div className="om-filters-row">
              <div className="om-filter-group">
                <label className="om-filter-label"><FaCalendarAlt /> Order Date From</label>
                <input type="date" name="dateFrom" className="om-filter-input" value={filters.dateFrom} onChange={handleFilterChange} />
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaCalendarAlt /> Order Date To</label>
                <input type="date" name="dateTo" className="om-filter-input" value={filters.dateTo} onChange={handleFilterChange} />
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaBox /> Order Status</label>
                <select name="orderStatus" className="om-filter-select" value={filters.orderStatus} onChange={handleFilterChange}>
                  <option value="">All Statuses</option>
                  {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaWallet /> Payment Status</label>
                <select name="paymentStatus" className="om-filter-select" value={filters.paymentStatus} onChange={handleFilterChange}>
                  <option value="">All</option>
                  {Object.entries(PAYMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaCalendarCheck /> Delivery From</label>
                <input type="date" name="deliveryDateFrom" className="om-filter-input" value={filters.deliveryDateFrom} onChange={handleFilterChange} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="om-filters-row">
              <div className="om-filter-group">
                <label className="om-filter-label"><FaCalendarCheck /> Delivery To</label>
                <input type="date" name="deliveryDateTo" className="om-filter-input" value={filters.deliveryDateTo} onChange={handleFilterChange} />
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaCity /> City</label>
                <select name="city" className="om-filter-select" value={filters.city} onChange={handleFilterChange}>
                  <option value="">All Cities</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaUser /> Customer Name</label>
                <input type="text" name="customerName" className="om-filter-input" placeholder="Search name..." value={filters.customerName} onChange={handleFilterChange} />
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaPhone /> Phone Number</label>
                <input type="text" name="customerPhone" className="om-filter-input" placeholder="e.g., 0300..." value={filters.customerPhone} onChange={handleFilterChange} />
              </div>
              <div className="om-filter-group">
                <label className="om-filter-label"><FaLayerGroup /> Animal Category</label>
                <select name="animalCategory" className="om-filter-select" value={filters.animalCategory} onChange={handleFilterChange}>
                  {ANIMAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="om-filters-actions">
              <button className="om-btn om-btn--apply" onClick={applyFilters}><FaCheck /> Apply Filters</button>
              <button className="om-btn om-btn--reset" onClick={resetFilters}><FaRedo /> Reset All</button>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════
         TOOLBAR
         ═════════════════════════════════ */}
      <div className="om-toolbar">
        <div className="om-toolbar__search">
          <FaSearch className="om-toolbar__search-icon" />
          <input
            type="text"
            className="om-toolbar__search-input"
            placeholder="Quick search: Order ID, customer, phone, animal..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          {searchQuery && (
            <button className="om-toolbar__search-clear" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}><FaTimes /></button>
          )}
        </div>

        <div className="om-toolbar__actions">
          <span className="om-toolbar__info">
            {sortedOrders.length > 0 ? `${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, sortedOrders.length)}` : '0'} of {sortedOrders.length} orders
          </span>
          <select className="om-toolbar__per-page" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>

          <div className="om-export-wrapper" ref={exportMenuRef}>
            <button className="om-btn om-btn--export" onClick={() => setShowExportMenu((p) => !p)}>
              <FaFileExport /> Export <FaChevronDown />
            </button>
            {showExportMenu && (
              <div className="om-export-dropdown">
                <div className="om-export-section">
                  <span className="om-export-heading">Export Filtered ({filteredOrders.length})</span>
                  <button onClick={() => exportCSV('filtered')}><FaFileCsv className="om-exp-icon om-exp-icon--csv" /> CSV Format</button>
                  <button onClick={() => exportExcel('filtered')}><FaFileExcel className="om-exp-icon om-exp-icon--excel" /> Excel Format</button>
                  <button onClick={() => exportPDF('filtered')}><FaFilePdf className="om-exp-icon om-exp-icon--pdf" /> PDF Report</button>
                </div>
                <div className="om-export-divider" />
                <div className="om-export-section">
                  <span className="om-export-heading">Export All ({orders.length})</span>
                  <button onClick={() => exportCSV('all')}><FaFileCsv className="om-exp-icon om-exp-icon--csv" /> CSV Format</button>
                  <button onClick={() => exportExcel('all')}><FaFileExcel className="om-exp-icon om-exp-icon--excel" /> Excel Format</button>
                  <button onClick={() => exportPDF('all')}><FaFilePdf className="om-exp-icon om-exp-icon--pdf" /> PDF Report</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════
         ORDERS TABLE
         ═════════════════════════════════ */}
      <div className="om-table-card">
        {sortedOrders.length === 0 ? (
          <div className="om-empty">
            <FaClipboardList className="om-empty__icon" />
            <h3>No Orders Found</h3>
            <p>No orders match your current search or filter criteria.</p>
            <button className="om-btn om-btn--reset" onClick={resetFilters}><FaRedo /> Clear Filters</button>
          </div>
        ) : (
          <div className="om-table-scroll">
            <table className="om-table">
              <thead>
                <tr>
                  <th className="om-th">
                    <button className="om-th-sort" onClick={() => handleSort('orderDate')}>
                      <FaHashtag /> Order ID <OrdersSortIcon sortConfig={sortConfig} field="orderDate" />
                    </button>
                  </th>
                  <th className="om-th">
                    <button className="om-th-sort" onClick={() => handleSort('customerName')}>
                      Customer <OrdersSortIcon sortConfig={sortConfig} field="customerName" />
                    </button>
                  </th>
                  <th className="om-th">Animal Details</th>
                  <th className="om-th">
                    <button className="om-th-sort" onClick={() => handleSort('totalAmount')}>
                      Amount <OrdersSortIcon sortConfig={sortConfig} field="totalAmount" />
                    </button>
                  </th>
                  <th className="om-th">Advance</th>
                  <th className="om-th">Payment</th>
                  <th className="om-th">
                    <button className="om-th-sort" onClick={() => handleSort('orderStatus')}>
                      Status <OrdersSortIcon sortConfig={sortConfig} field="orderStatus" />
                    </button>
                  </th>
                  <th className="om-th">
                    <button className="om-th-sort" onClick={() => handleSort('deliveryDate')}>
                      Delivery <OrdersSortIcon sortConfig={sortConfig} field="deliveryDate" />
                    </button>
                  </th>
                  <th className="om-th om-th--center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, idx) => (
                  <tr key={order.id} className={`om-tr ${idx % 2 === 1 ? 'om-tr--alt' : ''}`}>
                    {/* Order ID */}
                    <td className="om-td">
                      <span className="om-order-id">{order.id}</span>
                      <span className="om-td-sub">{formatDate(order.orderDate)}</span>
                    </td>

                    {/* Customer */}
                    <td className="om-td">
                      <div className="om-customer">
                        <span className="om-customer__name">{order.customer.name}</span>
                        <span className="om-customer__detail"><FaPhone /> {order.customer.phone}</span>
                        <span className="om-customer__detail"><FaMapMarkerAlt /> {order.customer.city}</span>
                      </div>
                    </td>

                    {/* Animal */}
                    <td className="om-td">
                      <div className="om-animal">
                        <span className="om-animal__name">{order.animal.name}</span>
                        <span className="om-animal__meta">
                          <FaPaw /> {order.animal.breed}
                          <span className="om-animal__sep">|</span>
                          <FaWeightHanging /> {order.animal.weight} kg
                        </span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="om-td">
                      <span className="om-amount">Rs. {order.pricing.totalAmount.toLocaleString()}</span>
                    </td>

                    {/* Advance */}
                    <td className="om-td">
                      <span className={`om-advance ${order.pricing.advancePaid > 0 ? 'om-advance--paid' : 'om-advance--none'}`}>
                        {order.pricing.advancePaid > 0
                          ? `Rs. ${order.pricing.advancePaid.toLocaleString()}`
                          : 'None'}
                      </span>
                      {order.pricing.remainingBalance > 0 && order.orderStatus !== 'cancelled' && (
                        <span className="om-td-sub om-td-sub--remaining">
                          Due: Rs. {order.pricing.remainingBalance.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="om-td">
                      <span className={`om-badge om-badge--pay-${order.paymentStatus}`}>
                        {PAYMENT_STATUSES[order.paymentStatus].label}
                      </span>
                      <span className="om-td-sub om-td-sub--method">
                        {getPaymentMethodIcon(order.paymentMethod)} {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="om-td">
                      <span className={`om-badge om-badge--os-${order.orderStatus}`}>
                        {ORDER_STATUSES[order.orderStatus].label}
                      </span>
                    </td>

                    {/* Delivery Date */}
                    <td className="om-td">
                      <span className="om-delivery-date">{formatDate(order.deliveryDate)}</span>
                    </td>

                    {/* Actions */}
                    <td className="om-td om-td--actions">
                      <div className="om-actions">
                        <button className="om-act om-act--view" title="View Details" onClick={() => handleViewOrder(order)}>
                          <FaEye />
                        </button>
                        <button className="om-act om-act--edit" title="Update Status" onClick={() => handleStatusClick(order)}>
                          <FaEdit />
                        </button>
                        <button className="om-act om-act--delete" title="Delete Order" onClick={() => handleDeleteClick(order)}>
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════
         PAGINATION
         ═════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="om-pagination">
          <button className="om-pg-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <FaChevronLeft /> Prev
          </button>
          <div className="om-pg-pages">
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="om-pg-ellipsis">...</span>
              ) : (
                <button key={p} className={`om-pg-page ${currentPage === p ? 'om-pg-page--active' : ''}`} onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              )
            )}
          </div>
          <button className="om-pg-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next <FaChevronRight />
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════
         ORDER DETAIL MODAL
         ═════════════════════════════════════════════ */}
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
                <div className="om-detail-top__badges">
                  <span className={`om-badge om-badge--os-${selectedOrder.orderStatus}`}>
                    {ORDER_STATUSES[selectedOrder.orderStatus].label}
                  </span>
                  <span className={`om-badge om-badge--pay-${selectedOrder.paymentStatus}`}>
                    {PAYMENT_STATUSES[selectedOrder.paymentStatus].label}
                  </span>
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
                    <div className="om-detail-item"><FaEnvelope />{selectedOrder.customer.email}</div>
                    <div className="om-detail-item"><FaMapMarkerAlt />{selectedOrder.customer.address}</div>
                    <div className="om-detail-item"><FaCity />{selectedOrder.customer.city}</div>
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
                      <span>Animal Price</span>
                      <span>Rs. {selectedOrder.pricing.animalPrice.toLocaleString()}</span>
                    </div>
                    <div className="om-price-row">
                      <span>Delivery Charges</span>
                      <span className="om-green">Free</span>
                    </div>
                    <div className="om-price-row om-price-row--total">
                      <span>Total Amount</span>
                      <strong>Rs. {selectedOrder.pricing.totalAmount.toLocaleString()}</strong>
                    </div>
                    <div className="om-price-row om-price-row--advance">
                      <span>Advance Paid</span>
                      <span className="om-green">Rs. {selectedOrder.pricing.advancePaid.toLocaleString()}</span>
                    </div>
                    <div className="om-price-row om-price-row--remaining">
                      <span>Remaining Balance</span>
                      <strong className={selectedOrder.pricing.remainingBalance > 0 ? 'om-red' : 'om-green'}>
                        Rs. {selectedOrder.pricing.remainingBalance.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  <div className="om-detail-method">
                    <span>{getPaymentMethodIcon(selectedOrder.paymentMethod)} {getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                  </div>
                  {selectedOrder.paymentScreenshot && (
                    <div className="om-detail-screenshot">
                      <FaImage /> <strong>Payment Screenshot:</strong>
                      <a href={selectedOrder.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="om-screenshot-link">
                        View Screenshot <FaExternalLinkAlt />
                      </a>
                    </div>
                  )}
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
                </div>
              </div>

              {/* Order Timeline */}
              <div className="om-detail-box om-detail-box--full">
                <h3><FaClock /> Order Timeline</h3>
                <div className="om-timeline">
                  {ORDER_STATUS_TIMELINE.map((status) => {
                    const event = selectedOrder.timeline.find((t) => t.status === status);
                    const isCompleted = !!event;
                    const isCurrent = selectedOrder.orderStatus === status;

                    if (selectedOrder.orderStatus === 'cancelled' && !event && status !== 'pending') return null;

                    return (
                      <div
                        key={status}
                        className={`om-tl-item ${isCompleted && !isCurrent ? 'om-tl-item--done' : ''} ${isCurrent ? 'om-tl-item--current' : ''} ${!isCompleted ? 'om-tl-item--future' : ''}`}
                      >
                        <div className="om-tl-dot">
                          {isCompleted ? <FaCheck /> : <span />}
                        </div>
                        <div className="om-tl-content">
                          <span className="om-tl-status">{ORDER_STATUSES[status].label}</span>
                          {event && (
                            <>
                              <span className="om-tl-date">{formatDateTime(event.date)}</span>
                              <span className="om-tl-note">{event.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {selectedOrder.orderStatus === 'cancelled' && (
                    <div className="om-tl-item om-tl-item--cancelled">
                      <div className="om-tl-dot"><FaTimes /></div>
                      <div className="om-tl-content">
                        <span className="om-tl-status">Cancelled</span>
                        {selectedOrder.timeline.find((t) => t.status === 'cancelled') && (
                          <>
                            <span className="om-tl-date">
                              {formatDateTime(selectedOrder.timeline.find((t) => t.status === 'cancelled').date)}
                            </span>
                            <span className="om-tl-note">
                              {selectedOrder.timeline.find((t) => t.status === 'cancelled').note}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="om-detail-box om-detail-box--full">
                  <h3><FaStickyNote /> Admin Notes</h3>
                  <p className="om-detail-notes-text">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="om-modal__foot">
              <button className="om-btn om-btn--secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              <button className="om-btn om-btn--primary" onClick={() => handleStatusClick(selectedOrder)}>
                <FaEdit /> Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════
         DELETE CONFIRMATION MODAL
         ═════════════════════════════════════════════ */}
      {showDeleteModal && deleteTarget && (
        <div className="om-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="om-modal om-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="om-modal__head om-modal__head--danger">
              <h2><FaExclamationTriangle /> Confirm Deletion</h2>
              <button className="om-modal__x" onClick={() => setShowDeleteModal(false)}><FaTimes /></button>
            </div>
            <div className="om-modal__body">
              <div className="om-confirm-body">
                <FaExclamationTriangle className="om-confirm-icon" />
                <p>Are you sure you want to delete order <strong>{deleteTarget.id}</strong>?</p>
                <p className="om-confirm-detail">
                  Customer: {deleteTarget.customer.name}<br />
                  Amount: Rs. {deleteTarget.pricing.totalAmount.toLocaleString()}<br />
                  Animal: {deleteTarget.animal.name}
                </p>
                <p className="om-confirm-warn">This action cannot be undone.</p>
              </div>
            </div>
            <div className="om-modal__foot">
              <button className="om-btn om-btn--secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="om-btn om-btn--danger" onClick={confirmDelete}><FaTrashAlt /> Delete Order</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════
         STATUS UPDATE MODAL
         ═════════════════════════════════════════════ */}
      {showStatusModal && statusTarget && (
        <div className="om-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="om-modal om-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="om-modal__head">
              <h2><FaEdit /> Update Order Status</h2>
              <button className="om-modal__x" onClick={() => setShowStatusModal(false)}><FaTimes /></button>
            </div>
            <div className="om-modal__body">
              <div className="om-status-form">
                <p className="om-status-form__oid">Order: <strong>{statusTarget.id}</strong></p>
                <p className="om-status-form__customer">{statusTarget.customer.name} — {statusTarget.animal.name}</p>

                <div className="om-status-form__current">
                  <span>Current:</span>
                  <span className={`om-badge om-badge--os-${statusTarget.orderStatus}`}>
                    {ORDER_STATUSES[statusTarget.orderStatus].label}
                  </span>
                  <span className={`om-badge om-badge--pay-${statusTarget.paymentStatus}`}>
                    {PAYMENT_STATUSES[statusTarget.paymentStatus].label}
                  </span>
                </div>

                <div className="om-status-form__group">
                  <label className="om-filter-label"><FaBox /> Order Status</label>
                  <select className="om-filter-select" value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value)}>
                    {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                <div className="om-status-form__group">
                  <label className="om-filter-label"><FaWallet /> Payment Status</label>
                  <select className="om-filter-select" value={newPaymentStatus} onChange={(e) => setNewPaymentStatus(e.target.value)}>
                    {Object.entries(PAYMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                {(newOrderStatus !== statusTarget.orderStatus || newPaymentStatus !== statusTarget.paymentStatus) && (
                  <div className="om-status-preview">
                    <div className="om-status-preview__row">
                      <span>Order:</span>
                      <span className={`om-badge om-badge--os-${statusTarget.orderStatus}`}>{ORDER_STATUSES[statusTarget.orderStatus].label}</span>
                      <FaArrowRight />
                      <span className={`om-badge om-badge--os-${newOrderStatus}`}>{ORDER_STATUSES[newOrderStatus].label}</span>
                    </div>
                    <div className="om-status-preview__row">
                      <span>Payment:</span>
                      <span className={`om-badge om-badge--pay-${statusTarget.paymentStatus}`}>{PAYMENT_STATUSES[statusTarget.paymentStatus].label}</span>
                      <FaArrowRight />
                      <span className={`om-badge om-badge--pay-${newPaymentStatus}`}>{PAYMENT_STATUSES[newPaymentStatus].label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="om-modal__foot">
              <button className="om-btn om-btn--secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button
                className="om-btn om-btn--primary"
                onClick={confirmStatusUpdate}
                disabled={newOrderStatus === statusTarget.orderStatus && newPaymentStatus === statusTarget.paymentStatus}
              >
                <FaCheck /> Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;