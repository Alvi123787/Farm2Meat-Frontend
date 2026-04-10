// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHorse,
  faPlusCircle,
  faEnvelopeOpenText,
  faBoxesStacked,
  faTachometerAlt,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faCrown,
  faChartLine,
  faCommentDots,
  faUserFriends,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Sidebar.css";

import { useAuth } from "../contexts/authContextCore";

const getStoredBool = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1";
  } catch (e) {
    void e;
    return fallback;
  }
};

const setStoredBool = (key, value) => {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch (e) {
    void e;
  }
};

const Sidebar = ({ isOpen, toggleSidebar, totalAnimals }) => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => getStoredBool("adminSidebarCollapsed", false));

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    setStoredBool("adminSidebarCollapsed", isCollapsed);
  }, [isCollapsed]);

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: faTachometerAlt,
    },
    {
      label: "Add Animal",
      path: "/admin/add-animal",
      icon: faPlusCircle,
    },
    {
      label: "Inquiries",
      path: "/admin/inquiries",
      icon: faEnvelopeOpenText,
    },
    {
      label: "Inventory",
      path: "/admin/animals",
      icon: faBoxesStacked,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: faChartLine,
    },
    {
      label: "Reviews",
      path: "/admin/reviews",
      icon: faCommentDots,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: faUserFriends,
    },
    {
      label: "Butchers",
      path: "/admin/butchers",
      icon: faUserShield,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />

      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isOpen ? "open" : ""}`}>
        {/* Toggle Button - Amazing Design */}
        <button 
          className={`sidebar-toggle-btn ${isCollapsed ? "collapsed" : ""}`}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="toggle-btn-bg">
            <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
          </div>
          <div className="toggle-btn-ring"></div>
        </button>

        {/* Close button for mobile */}
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrapper">
            <img 
              src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
              alt="Farm2Meat Logo" 
              className="sidebar-logo-img"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <div className="logo-glow"></div>
            <div className="logo-shine"></div>
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <h2>
                Livestock<span>Admin</span>
              </h2>
              <div className="brand-badge">
                <FontAwesomeIcon icon={faCrown} />
                <span>Pro</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item, index) => (
              <li key={item.path} style={{ animationDelay: `${index * 0.1}s` }}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""} ${isCollapsed ? "collapsed" : ""}`
                  }
                  onClick={() => {
                    if (window.innerWidth <= 768) toggleSidebar();
                  }}
                  end={item.path === "/admin"}
                >
                  <span className="link-icon-wrapper">
                    <FontAwesomeIcon icon={item.icon} className="link-icon" />
                    <span className="icon-pulse"></span>
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="link-label">{item.label}</span>
                      <span className="link-indicator"></span>
                    </>
                  )}
                  {isCollapsed && <span className="link-tooltip">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <div className="stat-item">
              <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
              {!isCollapsed && (
                <div className="stat-info">
                  <span className="stat-label">Total Animals</span>
                  <span className="stat-value">{Number(totalAnimals || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar-wrapper">
              <div className="user-avatar">
                <span>A</span>
              </div>
              <div className="avatar-status"></div>
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <p className="user-name">Admin User</p>
                <p className="user-role">Super Admin</p>
              </div>
            )}
          </div>

          <button
            className="sidebar-logout-btn"
            type="button"
            onClick={() => {
              logout();
            }}
          >
            <div className="logout-icon-wrapper">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            {!isCollapsed && <span>Logout</span>}
            {isCollapsed && <span className="link-tooltip">Logout</span>}
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="sidebar-decoration">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
          <div className="deco-line"></div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
