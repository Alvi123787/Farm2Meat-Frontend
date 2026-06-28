// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faUtensils,
  faEnvelopeOpenText,
  faBoxesStacked,
  faTachometerAlt,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faCrown,
  faChartLine,
  faChartBar,
  faCommentDots,
  faUserFriends,
  faAddressBook,
  faUserShield,
  faPaperPlane,
  faDrumstickBite,
  faPaw,
  faExchangeAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Sidebar.css";

import { useAuth } from "../contexts/authContextCore";
import { useAdminDomain } from "../contexts/AdminDomainContext";

const getStoredBool = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1";
  } catch (e) {
    return fallback;
  }
};

const setStoredBool = (key, value) => {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch (e) {
    // ignore
  }
};

const Sidebar = React.memo(({ isOpen, toggleSidebar, totalAnimals, domain }) => {
  const { logout } = useAuth();
  const { clearDomain } = useAdminDomain();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => getStoredBool("adminSidebarCollapsed", false));

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    setStoredBool("adminSidebarCollapsed", isCollapsed);
  }, [isCollapsed]);

  // Domain-specific navigation items (memoized!)
  const navItems = React.useMemo(() => {
    if (domain === "animal") {
      return [
        {
          label: "Animal Dashboard",
          path: "/admin",
          icon: faTachometerAlt,
        },
        {
          label: "Add Livestock",
          path: "/admin/add-animal/livestock",
          icon: faPlusCircle,
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
          label: "Inquiries",
          path: "/admin/inquiries",
          icon: faEnvelopeOpenText,
        },
        {
          label: "Complaints",
          path: "/admin/complaints",
          icon: faExclamationTriangle,
        },
        {
          label: "Reviews",
          path: "/admin/reviews",
          icon: faCommentDots,
        },
        {
          label: "Analytics",
          path: "/admin/analytics",
          icon: faChartBar,
        },
        {
          label: "Users",
          path: "/admin/users",
          icon: faUserFriends,
        },
        {
          label: "Guest Users",
          path: "/admin/guest-users",
          icon: faAddressBook,
        },
        {
          label: "Butchers",
          path: "/admin/butchers",
          icon: faUserShield,
        },
        {
          label: "Send Email",
          path: "/admin/send-email",
          icon: faPaperPlane,
        },
      ];
    } else if (domain === "meat") {
      return [
        {
          label: "Meat Dashboard",
          path: "/admin/meat-dashboard",
          icon: faDrumstickBite,
        },
        {
          label: "Meat Items",
          path: "/admin/meat-items",
          icon: faUtensils,
        },
        {
          label: "Add Meat Item",
          path: "/admin/add-animal/meat",
          icon: faPlusCircle,
        },
        {
          label: "Orders",
          path: "/admin/orders",
          icon: faChartLine,
        },
        {
          label: "Inquiries",
          path: "/admin/inquiries",
          icon: faEnvelopeOpenText,
        },
        {
          label: "Complaints",
          path: "/admin/complaints",
          icon: faExclamationTriangle,
        },
        {
          label: "Reviews",
          path: "/admin/reviews",
          icon: faCommentDots,
        },
        {
          label: "Analytics",
          path: "/admin/analytics",
          icon: faChartBar,
        },
        {
          label: "Users",
          path: "/admin/users",
          icon: faUserFriends,
        },
        {
          label: "Guest Users",
          path: "/admin/guest-users",
          icon: faAddressBook,
        },
        {
          label: "Butchers",
          path: "/admin/butchers",
          icon: faUserShield,
        },
        {
          label: "Send Email",
          path: "/admin/send-email",
          icon: faPaperPlane,
        },
      ];
    }
    return [];
  }, [domain]);

  const handleSwitchDomain = () => {
    clearDomain();
    navigate("/admin/select-domain");
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />

      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isOpen ? "open" : ""}`}>
        {/* Toggle Button */}
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
          <div className="sidebar-logo-wrapper logo-visibility-wrapper" style={{ padding: '6px' }}>
            <img 
              src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
              alt="MeatByAlvi Logo" 
              className="admin-sidebar-logo-img"
              style={{ width: '30px', height: '30px', objectFit: 'contain' }}
            />
            <div className="logo-glow"></div>
            <div className="logo-shine"></div>
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <h2>
                {domain === "animal" ? "Livestock" : "Meat"}<span>Admin</span>
              </h2>
              <div className="brand-badge">
                <FontAwesomeIcon icon={domain === "animal" ? faPaw : faDrumstickBite} />
                <span>{domain === "animal" ? "Animal" : "Meat"}</span>
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
                  end={item.path === "/admin" || item.path === "/admin/meat-dashboard"}
                >
                  <span className="link-icon-wrapper">
                    <FontAwesomeIcon icon={item.icon} className="link-icon" />
                    <span className="icon-pulse"></span>
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="link-label">{item.label}</span>
                      {item.badge && <span className="link-badge">{item.badge}</span>}
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
                  <span className="stat-label">Total {domain === "animal" ? "Animals" : "Meat Items"}</span>
                  <span className="stat-value">{Number(totalAnimals || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <button
            className="sidebar-logout-btn"
            type="button"
            onClick={handleSwitchDomain}
            style={{ marginBottom: '8px' }}
          >
            <div className="logout-icon-wrapper">
              <FontAwesomeIcon icon={faExchangeAlt} />
            </div>
            {!isCollapsed && <span>Switch Domain</span>}
            {isCollapsed && <span className="link-tooltip">Switch Domain</span>}
          </button>

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
});

export default Sidebar;
