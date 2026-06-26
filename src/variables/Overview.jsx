import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/Overview.css";

const Overview = () => {
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get("/api/inquiries/me/overview");
        if (response.data.success) {
          setStats(response.data.data.stats);
          setRecentOrders(response.data.data.recentOrders);
        }
      } catch (error) {
        console.error("Error fetching overview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const getStatusMeta = (status) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return { cls: "ov-badge--delivered", icon: "fa-solid fa-circle-check", label: "Delivered" };
      case "Processing":
      case "Pending":
      case "Contacted":
        return { cls: "ov-badge--processing", icon: "fa-solid fa-clock", label: status };
      case "Shipped":
        return { cls: "ov-badge--shipped", icon: "fa-solid fa-truck", label: "Shipped" };
      case "Cancelled":
        return { cls: "ov-badge--cancelled", icon: "fa-solid fa-circle-xmark", label: "Cancelled" };
      default:
        return { cls: "", icon: "fa-solid fa-circle", label: status };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="ov-loading">
        <div className="ov-loading__spinner">
          <span></span><span></span><span></span>
        </div>
        <p>Loading your overview…</p>
      </div>
    );
  }

  return (
    <div className="ov-root">

      {/* ── Stat Strip ── */}
      <section className="ov-stats" aria-label="Key metrics">
        <div className="ov-stats__scroll">
          {stats.map((stat) => (
            <div key={stat.id} className="ov-stat-card">
              <div className="ov-stat-card__slash" aria-hidden="true" />
              <div className="ov-stat-card__icon">
                <i className={stat.icon} aria-hidden="true" />
              </div>
              <div className="ov-stat-card__body">
                <span className="ov-stat-card__label">{stat.label}</span>
                <span className="ov-stat-card__value">{stat.value}</span>
                {stat.delta && (
                  <span className={`ov-stat-card__delta ov-stat-card__delta--${stat.delta.direction}`}>
                    <i
                      className={
                        stat.delta.direction === "up"
                          ? "fa-solid fa-arrow-trend-up"
                          : "fa-solid fa-arrow-trend-down"
                      }
                      aria-hidden="true"
                    />
                    {stat.delta.value} this month
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Orders ── */}
      <section className="ov-orders" aria-label="Recent orders">
        <div className="ov-orders__card">

          {/* Card Header */}
          <div className="ov-orders__header">
            <div className="ov-orders__header-left">
              <span className="ov-orders__header-icon" aria-hidden="true">
                <i className="fa-solid fa-receipt" />
              </span>
              <h2 className="ov-orders__title">Recent Orders</h2>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="ov-table-wrap">
            <table className="ov-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const meta = getStatusMeta(order.status);
                    return (
                      <tr key={order._id} className="ov-table__row">
                        <td>
                          <span className="ov-table__order-id">
                            #{order.inquiryId}
                          </span>
                        </td>
                        <td className="ov-table__date">
                          {formatDate(order.createdAt || order.date)}
                        </td>
                        <td className="ov-table__customer">
                          <span className="ov-table__avatar" aria-hidden="true">
                            {order.customerName?.charAt(0).toUpperCase()}
                          </span>
                          {order.customerName}
                        </td>
                        <td className="ov-table__amount">
                          Rs.&nbsp;{Number(order.totalAmount).toLocaleString()}
                        </td>
                        <td>
                          <span className={`ov-badge ${meta.cls}`}>
                            <i className={meta.icon} aria-hidden="true" />
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="ov-table__empty">
                      <i className="fa-solid fa-inbox" aria-hidden="true" />
                      <span>No orders yet</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (visible only on small screens) */}
          <div className="ov-mobile-orders">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const meta = getStatusMeta(order.status);
                return (
                  <div key={order._id} className="ov-order-row">
                    <div className="ov-order-row__top">
                      <div className="ov-order-row__id-wrap">
                        <span className="ov-table__avatar" aria-hidden="true">
                          {order.customerName?.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="ov-order-row__customer">{order.customerName}</p>
                          <p className="ov-order-row__id">#{order.inquiryId}</p>
                        </div>
                      </div>
                      <span className={`ov-badge ${meta.cls}`}>
                        <i className={meta.icon} aria-hidden="true" />
                        {meta.label}
                      </span>
                    </div>
                    <div className="ov-order-row__bottom">
                      <span className="ov-order-row__date">
                        <i className="fa-regular fa-calendar" aria-hidden="true" />
                        {formatDate(order.createdAt || order.date)}
                      </span>
                      <span className="ov-order-row__amount">
                        Rs. {Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ov-table__empty">
                <i className="fa-solid fa-inbox" aria-hidden="true" />
                <span>No orders yet</span>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Overview;