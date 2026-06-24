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
      console.log("Fetching overview from API...");
      const response = await api.get("/api/inquiries/me/overview");
      console.log("API response:", response);
      if (response.data.success) {
        setStats(response.data.data.stats);
        setRecentOrders(response.data.data.recentOrders);
      } else {
        console.error("API returned success: false", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

    fetchOverview();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "status-delivered";
      case "Processing":
      case "Pending":
      case "Contacted":
        return "status-processing";
      case "Shipped":
        return "status-shipped";
      case "Completed":
        return "status-delivered";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return "fa-solid fa-circle-check";
      case "Processing":
      case "Pending":
      case "Contacted":
        return "fa-solid fa-clock";
      case "Shipped":
        return "fa-solid fa-truck";
      default:
        return "fa-solid fa-circle";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  };

  if (loading) {
    return <div className="overview loading">Loading...</div>;
  }

  return (
    <div className="overview">
      {/* Stats Section */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
            </div>
            <div className="stat-card-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              {stat.delta && (
                <div className={`stat-delta ${stat.delta.direction}`}>
                  <i
                    className={
                      stat.delta.direction === "up"
                        ? "fa-solid fa-arrow-trend-up"
                        : "fa-solid fa-arrow-trend-down"
                    }
                  ></i>
                  {stat.delta.value} this month
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section - Recent Orders */}
      <div className="overview-bottom">
        {/* Recent Orders */}
        <div className="recent-orders-card card full-width">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fa-solid fa-receipt"></i>
              Recent Orders
            </h3>
          </div>
          <div className="orders-table-wrapper">
            <table className="orders-table">
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
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">
                        <i className="fa-solid fa-hashtag"></i>
                        {order.inquiryId}
                      </td>
                      <td className="order-date">
                        <i className="fa-regular fa-calendar"></i>
                        {formatDate(order.createdAt || order.date)}
                      </td>
                      <td className="order-customer">
                        <i className="fa-regular fa-user"></i>
                        {order.customerName}
                      </td>
                      <td className="order-amount">Rs. {Number(order.totalAmount).toLocaleString()}</td>
                      <td>
                <span
                  className={`status-badge ${getStatusClass(
                    order.status
                  )}`}
                >
                  <i className={getStatusIcon(order.status)}></i>
                  {order.status === "Completed" ? "Delivered" : order.status}
                </span>
              </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;