import React, { Suspense, lazy, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faPaw,
  faHandshake,
  faIndianRupeeSign,
  faCommentDots,
  faArrowUp,
  faArrowDown,
  faEllipsisVertical,
  faBell,
  faSearch,
  faCalendarDay,
  faTriangleExclamation,
  faRotateRight,
  faXmark,
  faCheck,
  faChevronRight,
  faBox,
  faShoppingCart,
  faUsers,
  faClock,
  faArrowTrendUp,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import "../css/AdminDashboard.css";
import { dashboardService } from "../services/dashboardService";
import { useAuth } from "../contexts/authContextCore";

const RevenueChart = lazy(() => import("../components/RevenueChart"));
const SalesChart = lazy(() => import("../components/SalesChart"));

const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatPct = (value) => {
  const v = Number.isFinite(value) ? value : 0;
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  return `${sign}${Math.abs(v).toFixed(1)}%`;
};

const AnimatedNumber = memo(function AnimatedNumber({ value, formatter }) {
  const [display, setDisplay] = useState(value || 0);
  const fromRef = useRef(value || 0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value || 0;
    fromRef.current = to;

    if (from === to) {
      rafRef.current = requestAnimationFrame(() => setDisplay(to));
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    const duration = 700;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const renderVal = formatter ? formatter(display) : Math.round(display).toLocaleString();
  return <>{renderVal}</>;
});

const SkeletonBlock = memo(function SkeletonBlock({ className }) {
  return <div className={`skel ${className || ""}`} />;
});

const MetricCard = memo(function MetricCard({ title, value, icon, trend, trendValue, subtitle, color, isLoading }) {
  return (
    <div className={`metric-card ${color} ${isLoading ? "metric-card--loading" : ""}`}>
      <div className="metric-card-inner">
        <div className="metric-header">
          <div className="metric-icon-wrap">
            <FontAwesomeIcon icon={icon} className="metric-icon" />
          </div>
          <span className="metric-title">{title}</span>
        </div>
        
        <div className="metric-value-wrap">
          {isLoading ? (
            <SkeletonBlock className="skel-text skel-text--xl" />
          ) : (
            <span className="metric-value">
              <AnimatedNumber value={value.raw} formatter={value.formatter} />
            </span>
          )}
        </div>

        <div className="metric-footer">
          {isLoading ? (
            <SkeletonBlock className="skel-text skel-text--sm" />
          ) : (
            <>
              <span className={`metric-trend ${trend === "up" ? "trend-up" : "trend-down"}`}>
                <FontAwesomeIcon icon={trend === "up" ? faArrowTrendUp : faArrowTrendDown} />
                {trendValue}
              </span>
              <span className="metric-subtitle">{subtitle}</span>
            </>
          )}
        </div>
      </div>
      <div className="metric-card-bg" />
    </div>
  );
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const toggleSidebar = outletContext?.toggleSidebar;
  
  const [animateCards, setAnimateCards] = useState(false);
  const [period, setPeriod] = useState("month");

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);

  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState("");
  const [revenueData, setRevenueData] = useState([]);

  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState("");
  const [salesData, setSalesData] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState({ animals: [], inquiries: [] });

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  const { token, role, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!token || role !== "admin") {
      navigate("/login");
    }
  }, [token, role, authLoading, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleUnauthorized = useCallback(() => {
    if (!token) return;
    logout();
    navigate("/login");
  }, [logout, navigate, token]);

  const runRequest = useCallback(
    async (fn) => {
      try {
        return await fn();
      } catch (err) {
        if (err?.status === 401 || err?.code === "UNAUTHORIZED") {
          handleUnauthorized();
        }
        throw err;
      }
    },
    [handleUnauthorized]
  );

  const refreshDashboard = useCallback(
    async ({ signal } = {}) => {
      const result = await runRequest(() => dashboardService.getDashboard(period, { signal }));
      setStats(result?.stats || null);
      setTrends(result?.trends || null);
    },
    [period, runRequest]
  );

  const refreshRevenue = useCallback(
    async ({ signal } = {}) => {
      const result = await runRequest(() => dashboardService.getRevenue(period, { signal }));
      setRevenueData(Array.isArray(result?.points) ? result.points : []);
    },
    [period, runRequest]
  );

  const refreshSales = useCallback(
    async ({ signal } = {}) => {
      const result = await runRequest(() => dashboardService.getSales(period, { signal }));
      setSalesData(Array.isArray(result?.points) ? result.points : []);
    },
    [period, runRequest]
  );

  const refreshUnreadCount = useCallback(
    async ({ signal } = {}) => {
      const result = await runRequest(() => dashboardService.getUnreadNotificationsCount({ signal }));
      setUnreadCount(Number(result?.count || 0));
    },
    [runRequest]
  );

  const loadNotifications = useCallback(
    async ({ signal } = {}) => {
      setNotifLoading(true);
      setNotifError("");
      try {
        const result = await runRequest(() => dashboardService.getNotifications({ signal, limit: 12 }));
        setNotifications(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        setNotifError(err?.message || "Failed to load notifications");
      } finally {
        setNotifLoading(false);
      }
    },
    [runRequest]
  );

  const refreshAll = useCallback(
    async ({ signal } = {}) => {
      setDashboardLoading(true);
      setRevenueLoading(true);
      setSalesLoading(true);
      setDashboardError("");
      setRevenueError("");
      setSalesError("");

      try {
        await Promise.all([
          refreshDashboard({ signal }),
          refreshRevenue({ signal }),
          refreshSales({ signal }),
          refreshUnreadCount({ signal }),
        ]);
      } catch (err) {
        const msg = err?.message || "Failed to load dashboard";
        setDashboardError(msg);
        setRevenueError(msg);
        setSalesError(msg);
      } finally {
        setDashboardLoading(false);
        setRevenueLoading(false);
        setSalesLoading(false);
      }
    },
    [refreshDashboard, refreshRevenue, refreshSales, refreshUnreadCount]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!token || role !== "admin") return;

    const controller = new AbortController();
    refreshAll({ signal: controller.signal });

    return () => controller.abort();
  }, [refreshAll, token, role, authLoading]);

  // Auto-refresh disabled (only manual refresh)

  useEffect(() => {
    if (!notifOpen) return;
    const controller = new AbortController();
    loadNotifications({ signal: controller.signal });
    return () => controller.abort();
  }, [notifOpen, loadNotifications]);

  useEffect(() => {
    const raw = searchValue.trim();
    if (!searchOpen || raw.length < 2) {
      setSearchLoading(false);
      setSearchError("");
      setSearchResults({ animals: [], inquiries: [] });
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const result = await runRequest(() => dashboardService.search(raw, { signal: controller.signal, limit: 6 }));
        setSearchResults(result?.results || { animals: [], inquiries: [] });
      } catch (err) {
        if (err?.name === "AbortError") return;
        setSearchError(err?.message || "Search failed");
        setSearchResults({ animals: [], inquiries: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 320);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchOpen, searchValue, runRequest]);

  const metrics = useMemo(() => {
    const t = trends || {};
    const s = stats || {};
    
    return [
      {
        id: "inventory",
        title: "Total Inventory",
        icon: faBox,
        color: "metric-blue",
        value: { raw: Number(s.totalAnimals || 0), formatter: (v) => Math.round(v).toLocaleString() },
        trend: t?.totalAnimals?.direction === "down" ? "down" : "up",
        trendValue: formatPct(t?.totalAnimals?.pct || 0),
        subtitle: `${formatCompactNumber(t?.totalAnimals?.current || 0)} new this ${period}`,
      },
      {
        id: "revenue",
        title: "Total Revenue",
        icon: faIndianRupeeSign,
        color: "metric-green",
        value: { raw: Number(s.totalRevenue || 0), formatter: (v) => formatCurrency(v) },
        trend: t?.totalRevenue?.direction === "down" ? "down" : "up",
        trendValue: formatPct(t?.totalRevenue?.pct || 0),
        subtitle: `vs previous ${period}`,
      },
      {
        id: "orders",
        title: "Total Orders",
        icon: faShoppingCart,
        color: "metric-purple",
        value: { raw: Number(s.totalOrders || s.animalsSold || 0), formatter: (v) => Math.round(v).toLocaleString() },
        trend: t?.animalsSold?.direction === "down" ? "down" : "up",
        trendValue: formatPct(t?.animalsSold?.pct || 0),
        subtitle: `${formatCompactNumber(t?.animalsSold?.current || 0)} this ${period}`,
      },
      {
        id: "pending",
        title: "Pending Inquiries",
        icon: faClock,
        color: "metric-orange",
        value: { raw: Number(s.pendingInquiries || 0), formatter: (v) => Math.round(v).toLocaleString() },
        trend: t?.pendingInquiries?.direction === "down" ? "down" : "up",
        trendValue: formatPct(t?.pendingInquiries?.pct || 0),
        subtitle: "Requires attention",
      },
    ];
  }, [period, stats, trends]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const adminInitial = "A";

  return (
    <>
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          {toggleSidebar && (
            <button className="hamburger-btn" type="button" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
          <div className="topbar-greeting">
            <h1>Dashboard</h1>
            <p className="topbar-date">
              <FontAwesomeIcon icon={faCalendarDay} />
              {today}
            </p>
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-search">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
            />
            {searchValue && (
              <button
                className="search-clear-btn"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSearchValue("")}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}

            {searchOpen && searchValue.trim().length >= 2 && (
              <div className="topbar-search-dropdown" onMouseDown={(e) => e.preventDefault()}>
                {searchLoading && (
                  <div className="search-dd-row">
                    <SkeletonBlock className="skel-text skel-text--md" />
                  </div>
                )}
                {searchError && !searchLoading && (
                  <div className="search-dd-row search-dd-row--error">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <span>{searchError}</span>
                  </div>
                )}

                {!searchLoading && !searchError && (
                  <>
                    {(searchResults.animals?.length || 0) > 0 && (
                      <>
                        <div className="search-dd-section">Animals</div>
                        {searchResults.animals.map((a) => (
                          <button
                            key={a._id}
                            className="search-dd-item"
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate(`/admin/edit-animal/${a._id}`);
                            }}
                          >
                            <span className="search-dd-item-title">{a.name}</span>
                            <span className="search-dd-item-meta">
                              {a.breed ? `${a.breed}` : ""}
                            </span>
                            <FontAwesomeIcon icon={faChevronRight} className="search-dd-item-arrow" />
                          </button>
                        ))}
                      </>
                    )}

                    {(searchResults.inquiries?.length || 0) > 0 && (
                      <>
                        <div className="search-dd-section">Inquiries</div>
                        {searchResults.inquiries.map((i) => (
                          <button
                            key={i._id}
                            className="search-dd-item"
                            type="button"
                            onClick={() => {
                              setSearchOpen(false);
                              navigate(`/admin/inquiries`);
                            }}
                          >
                            <span className="search-dd-item-title">{i.customerName}</span>
                            <span className="search-dd-item-meta">{i.animalName}</span>
                            <FontAwesomeIcon icon={faChevronRight} className="search-dd-item-arrow" />
                          </button>
                        ))}
                      </>
                    )}

                    {(searchResults.animals?.length || 0) === 0 && (searchResults.inquiries?.length || 0) === 0 && (
                      <div className="search-dd-row search-dd-row--empty">No results found</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <button className="topbar-notification" type="button" onClick={() => setNotifOpen((v) => !v)}>
            <FontAwesomeIcon icon={faBell} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          <div className="topbar-avatar">
            <span>{adminInitial}</span>
          </div>
        </div>
      </header>

      {notifOpen && (
        <div className="notif-panel" onMouseDown={(e) => e.preventDefault()}>
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            <div className="notif-panel-actions">
              <button
                type="button"
                className="notif-panel-btn"
                onClick={async () => {
                  try {
                    await runRequest(() => dashboardService.markAllNotificationsRead({}));
                    await Promise.all([refreshUnreadCount({}), loadNotifications({})]);
                  } catch (e) {
                    void e;
                  }
                }}
              >
                <FontAwesomeIcon icon={faCheck} />
                Mark all read
              </button>
              <button type="button" className="notif-panel-close" onClick={() => setNotifOpen(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>

          {notifError && (
            <div className="notif-panel-error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <span>{notifError}</span>
            </div>
          )}

          <div className="notif-panel-body">
            {notifLoading ? (
              <>
                <div className="notif-item"><SkeletonBlock className="skel-text skel-text--md" /></div>
                <div className="notif-item"><SkeletonBlock className="skel-text skel-text--md" /></div>
                <div className="notif-item"><SkeletonBlock className="skel-text skel-text--md" /></div>
              </>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">You're all caught up</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  className={`notif-item ${n.isRead ? "read" : "unread"}`}
                  onClick={async () => {
                    try {
                      if (!n.isRead) await runRequest(() => dashboardService.markNotificationRead(n._id, {}));
                      await Promise.all([refreshUnreadCount({}), loadNotifications({})]);
                      if (n.entityType === "inquiry") navigate("/admin/inquiries");
                    } catch (e) {
                      void e;
                    }
                  }}
                >
                  <div className="notif-item-main">
                    <div className="notif-item-title">{n.title || "Notification"}</div>
                    <div className="notif-item-msg">{n.message || ""}</div>
                  </div>
                  {!n.isRead && <span className="notif-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className={`welcome-section ${animateCards ? "animate" : ""}`}>
          <div className="welcome-content">
            <h2>Welcome back, <span>Admin</span></h2>
            <p>Track your livestock business performance and manage inventory.</p>
          </div>
          <div className="period-selector">
            {["today", "week", "month", "year"].map((p) => (
              <button
                key={p}
                type="button"
                className={`period-option ${period === p ? "active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
            <button type="button" className="refresh-btn" onClick={() => refreshAll({})} disabled={dashboardLoading}>
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
          </div>
        </div>

        {dashboardError && (
          <div className="dashboard-error">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{dashboardError}</span>
            <button type="button" className="dashboard-retry" onClick={() => refreshAll({})}>
              Retry
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend}
              trendValue={metric.trendValue}
              subtitle={metric.subtitle}
              color={metric.color}
              isLoading={dashboardLoading}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <Suspense fallback={<div className="chart-suspense"><SkeletonBlock className="skel-chart" /></div>}>
            <RevenueChart
              data={revenueData}
              loading={revenueLoading}
              error={revenueError}
              period={period}
              onPeriodChange={setPeriod}
            />
          </Suspense>
          <Suspense fallback={<div className="chart-suspense"><SkeletonBlock className="skel-chart" /></div>}>
            <SalesChart
              data={salesData}
              loading={salesLoading}
              error={salesError}
              period={period}
              onPeriodChange={setPeriod}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
