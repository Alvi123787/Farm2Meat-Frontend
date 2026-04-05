import { useState, useEffect, useRef, useCallback } from "react";
import "../css/AdminHeader.css";

export default function AdminHeader({ title = "Dashboard" }) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const notifications = [
    { id: 1, text: "New order #1042 received", time: "2 min ago", icon: "fa-cart-shopping", unread: true },
    { id: 2, text: "Payment confirmed for #1039", time: "15 min ago", icon: "fa-check-circle", unread: true },
    { id: 3, text: "New inquiry from buyer", time: "1 hr ago", icon: "fa-message", unread: true },
    { id: 4, text: "Animal listing approved", time: "3 hrs ago", icon: "fa-cow", unread: false },
    { id: 5, text: "System update completed", time: "5 hrs ago", icon: "fa-gear", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      setIsSearchExpanded(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        isMobile
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const handleSearchToggle = () => {
    setIsSearchExpanded((prev) => !prev);
    if (!isSearchExpanded) {
      setTimeout(() => {
        const input = searchRef.current?.querySelector("input");
        input?.focus();
      }, 300);
    }
  };

  const getPageIcon = () => {
    const icons = {
      Dashboard: "fa-gauge-high",
      Animals: "fa-cow",
      Orders: "fa-cart-shopping",
      Customers: "fa-users",
      Revenue: "fa-chart-line",
      Settings: "fa-gear",
      Breeds: "fa-dna",
      Inquiries: "fa-message",
      "Add Animal": "fa-circle-plus",
    };
    return icons[title] || "fa-layer-group";
  };

  return (
    <header className="admin-header">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* ===== LEFT: Page Title ===== */}
      <div
        className={`header-left ${
          isMobile && isSearchExpanded ? "hidden-mobile" : ""
        }`}
      >
        <div className="page-title-wrapper">
          <div className="title-icon">
            <i className={`fa-solid ${getPageIcon()}`} />
          </div>
          <div className="title-text">
            <h1 className="page-title">{title}</h1>
            <div className="title-accent" />
          </div>
        </div>
        <div className="breadcrumb">
          <span className="breadcrumb-item">
            <i className="fa-solid fa-house" /> Home
          </span>
          <i className="fa-solid fa-chevron-right breadcrumb-separator" />
          <span className="breadcrumb-item active">{title}</span>
        </div>
      </div>

      {/* ===== CENTER: Search ===== */}
      <div
        className={`header-center ${isSearchExpanded ? "search-expanded" : ""}`}
        ref={searchRef}
      >
        {isMobile && !isSearchExpanded ? (
          <button
            className="search-toggle-btn"
            onClick={handleSearchToggle}
            aria-label="Open search"
          >
            <i className="fa-solid fa-magnifying-glass" />
          </button>
        ) : (
          <div className="search-container">
            <i className="fa-solid fa-magnifying-glass search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search animals, orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
            {isMobile && (
              <button
                className="search-close-btn"
                onClick={() => setIsSearchExpanded(false)}
                aria-label="Close search"
              >
                <i className="fa-solid fa-arrow-left" />
              </button>
            )}
            <kbd className="search-shortcut">⌘K</kbd>
          </div>
        )}
      </div>

      {/* ===== RIGHT: Actions ===== */}
      <div
        className={`header-right ${
          isMobile && isSearchExpanded ? "hidden-mobile" : ""
        }`}
      >
        {/* Quick Action Button */}
        <button className="header-action-btn quick-add" title="Quick Add">
          <i className="fa-solid fa-plus" />
        </button>

        {/* Notification Bell */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            className={`header-action-btn notification-btn ${
              isNotifOpen ? "active" : ""
            }`}
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <i className="fa-solid fa-bell" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
            <span className="notif-pulse" />
          </button>

          {isNotifOpen && (
            <div className="dropdown-panel notif-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="mark-read-btn">Mark all read</button>
              </div>
              <div className="dropdown-body">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.unread ? "unread" : ""}`}
                  >
                    <div className="notif-icon-wrapper">
                      <i className={`fa-solid ${notif.icon}`} />
                    </div>
                    <div className="notif-content">
                      <p className="notif-text">{notif.text}</p>
                      <span className="notif-time">
                        <i className="fa-regular fa-clock" /> {notif.time}
                      </span>
                    </div>
                    {notif.unread && <div className="unread-dot" />}
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button className="view-all-btn">
                  View All Notifications{" "}
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="header-divider" />

        {/* Profile */}
        <div className="profile-wrapper" ref={profileRef}>
          <button
            className={`profile-btn ${isProfileOpen ? "active" : ""}`}
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
          >
            <div className="profile-avatar">
              <span>AK</span>
              <div className="avatar-online-dot" />
            </div>
            <div className="profile-info">
              <p className="profile-name">Ahmad Khan</p>
              <p className="profile-role">Super Admin</p>
            </div>
            <i
              className={`fa-solid fa-chevron-down profile-arrow ${
                isProfileOpen ? "rotated" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="dropdown-panel profile-dropdown">
              <div className="dropdown-profile-header">
                <div className="dropdown-avatar">AK</div>
                <div>
                  <p className="dropdown-name">Ahmad Khan</p>
                  <p className="dropdown-email">ahmad@goattrade.com</p>
                </div>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-body">
                <button className="dropdown-item">
                  <i className="fa-solid fa-user" />
                  <span>My Profile</span>
                  <i className="fa-solid fa-arrow-right item-arrow" />
                </button>
                <button className="dropdown-item">
                  <i className="fa-solid fa-gear" />
                  <span>Settings</span>
                  <i className="fa-solid fa-arrow-right item-arrow" />
                </button>
                <button className="dropdown-item">
                  <i className="fa-solid fa-chart-line" />
                  <span>Activity Log</span>
                  <i className="fa-solid fa-arrow-right item-arrow" />
                </button>
                <button className="dropdown-item">
                  <i className="fa-solid fa-question-circle" />
                  <span>Help & Support</span>
                  <i className="fa-solid fa-arrow-right item-arrow" />
                </button>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-footer">
                <button className="logout-action-btn">
                  <i className="fa-solid fa-right-from-bracket" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
