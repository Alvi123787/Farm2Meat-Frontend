import { useAuth } from "../contexts/authContextCore";
import "../css/UserSidebar.css";

const NAV = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Order History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    id: "favourites",
    label: "Favourites",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();

  const getDisplayName = () => {
    if (user?.email) {
      const local = user.email.split('@')[0];
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return "User";
  };

  return (
    <aside className={`mba-sidebar ${sidebarOpen ? "mba-open" : "mba-closed"}`}>
      {/* Brand */}
      <div className="mba-brand">
        <div className="mba-brand-mark">
          <span className="mba-brand-letter">M</span>
        </div>
        {sidebarOpen && (
          <div className="mba-brand-text">
            <span className="mba-brand-name">MeatByAlvi</span>
            <span className="mba-brand-tagline">Premium Meats</span>
          </div>
        )}
      </div>

      <div className="mba-divider" />

      {/* User info */}
      {sidebarOpen && (
        <div className="mba-user">
          <div className="mba-user-avatar">
            <span>{getDisplayName().charAt(0).toUpperCase()}</span>
          </div>
          <div className="mba-user-info">
            <p className="mba-user-name">{getDisplayName()}</p>
            <p className="mba-user-tier">Valued Customer</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mba-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`mba-nav-item ${activeTab === item.id ? "mba-active" : ""}`}
            onClick={() => setActiveTab(item.id)}
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="mba-nav-icon">{item.icon}</span>
            {sidebarOpen && <span className="mba-nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="mba-divider" />

      {/* Logout */}
      <button
        className="mba-nav-item mba-logout"
        onClick={logout}
        title={!sidebarOpen ? "Logout" : undefined}
      >
        <span className="mba-nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        {sidebarOpen && <span className="mba-nav-label">Logout</span>}
      </button>

      {/* Toggle */}
      <button
        className="mba-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={sidebarOpen ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
        </svg>
      </button>
    </aside>
  );
}