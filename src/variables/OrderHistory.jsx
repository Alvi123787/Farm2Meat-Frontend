import { useState, useEffect } from "react";
import "../css/OrderHistory.css";
import { orderService } from "../services/orderService";
import { formatPrice } from "../utils/priceUtils";

const FILTERS = ["All", "Delivered", "Pending", "Cancelled"];
const STATUS_MAP = { 
  Delivered: "pill-delivered",
  Completed: "pill-delivered", // Treat Completed as Delivered
  Pending: "pill-processing",
  Cancelled: "pill-cancelled" 
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [fullOrders, setFullOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await orderService.getOrders();
        const fullOrdersList = ordersData?.data || [];
        setFullOrders(fullOrdersList);
        const loadedOrders = fullOrdersList.map(order => ({
          id: `#${order.inquiryId || order._id}`,
          _id: order._id,
          product: order.animalName || "Unknown",
          category: order.category || (order.itemType === "meat" ? "Meat" : "Livestock"),
          date: new Date(order.createdAt || order.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          amount: `Rs. ${formatPrice(order.totalAmount)}`,
          status: order.status || "Pending",
          img: null
        }));
        setOrders(loadedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleViewDetails = (orderId) => {
    const fullOrder = fullOrders.find(o => `#${o.inquiryId || o._id}` === orderId || o._id === orderId);
    if (fullOrder) {
      setSelectedOrder(fullOrder);
      setShowModal(true);
    }
  };

  const filtered = orders.filter((o) => {
    // Treat Completed as Delivered for filtering/display
    const effectiveStatus = o.status === "Completed" ? "Delivered" : o.status;
    const matchStatus = filter === "All" || effectiveStatus === filter;
    const matchSearch = o.product.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="order-history">
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h1 className="page-heading">Order History</h1>
      <p className="page-subheading">A complete record of all your purchases.</p>
      <div className="accent-rule" />

      <div className="oh-controls card">
        <div className="oh-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by product or order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="oh-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No orders match your filter.</p>
          </div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="order-row">
              {order.img ? (
                <img src={order.img} alt={order.product} className="order-thumb" />
              ) : (
                <div className="order-thumb-placeholder">
                  <span>📦</span>
                </div>
              )}
              <div className="order-info">
                <p className="order-product">{order.product}</p>
                <p className="order-meta">{order.category} · {order.date}</p>
              </div>
              <div className="order-center">
                <p className="order-id-label">{order.id}</p>
              </div>
              <div className="order-right">
                <p className="order-price">{order.amount}</p>
                <span className={`pill ${STATUS_MAP[order.status] || "pill-processing"}`}>
                  {order.status === "Completed" ? "Delivered" : order.status}
                </span>
              </div>
              <div className="order-actions">
                <button className="btn-secondary" onClick={() => handleViewDetails(order.id)}>Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Order ID: {selectedOrder.inquiryId || selectedOrder._id}</h3>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedOrder.status === "Completed" ? "Delivered" : selectedOrder.status}</p>
                <p><strong>Total Amount:</strong> Rs. {formatPrice(selectedOrder.totalAmount)}</p>
              </div>
              
              {selectedOrder.customerName && (
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  {selectedOrder.phone && <p><strong>Phone:</strong> {selectedOrder.phone}</p>}
                  {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                  {selectedOrder.deliveryAddress && <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>}
                  {selectedOrder.city && <p><strong>City:</strong> {selectedOrder.city}</p>}
                </div>
              )}

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="detail-section">
                  <h3>Items</h3>
                  <div className="items-list">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <p><strong>Product:</strong> {item.animalName || item.name || "Unknown"}</p>
                        {item.category && <p><strong>Category:</strong> {item.category}</p>}
                        {item.weight && <p><strong>Weight:</strong> {item.weight} kg</p>}
                        <p><strong>Price:</strong> Rs. {formatPrice(item.price || item.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
