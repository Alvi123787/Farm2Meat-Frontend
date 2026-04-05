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

const StatCard = memo(function StatCard({ card, animateCards, isLoading }) {
  return (
    <div
      className={`stat-card ${card.gradient} ${animateCards ? "animate" : ""} ${
        isLoading ? "stat-card--loading" : ""
      }`}
      style={{ animationDelay: card.animationDelay }}
    >
      <div className="card-shape shape-1" />
      <div className="card-shape shape-2" />

      <div className="stat-card-header">
        <div className={`stat-icon-wrapper ${card.iconBg}`}>
          <FontAwesomeIcon icon={card.icon} className="stat-icon" />
        </div>
        <button className="card-menu-btn" type="button">
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </div>

      <div className="stat-card-body">
        <p className="stat-title">{card.title}</p>
        <h3 className="stat-value">
          {isLoading ? (
            <SkeletonBlock className="skel-text skel-text--lg" />
          ) : (
            <AnimatedNumber value={card.rawValue} formatter={card.formatter} />
          )}
        </h3>
      </div>

      <div className="stat-card-footer">
        {isLoading ? (
          <>
            <SkeletonBlock className="skel-text skel-text--sm" />
            <SkeletonBlock className="skel-text skel-text--sm" />
          </>
        ) : (
          <>
            <span className={`stat-trend ${card.trendDir === "up" ? "trend-up" : "trend-down"}`}>
              <FontAwesomeIcon icon={card.trendDir === "up" ? faArrowUp : faArrowDown} />
              {card.trend}
            </span>
            <span className="stat-subtitle">{card.subtitle}</span>
          </>
        )}
      </div>

      <div className="card-accent-line" />
    </div>
  );
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const toggleSidebar =
    outletContext && typeof outletContext.toggleSidebar === "function" ? outletContext.toggleSidebar : undefined;
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

  // ✅ Step 2: Redirect logic fix - wait for authLoading
  useEffect(() => {
    if (authLoading) return; // ⛔ wait for auth to be ready

    if (!token || role !== "admin") {
      navigate("/login");
    }
  }, [token, role, authLoading, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Step 5: Unauthorized handler ko safe banao
  const handleUnauthorized = useCallback(() => {
    if (!token) return; // ⛔ ignore early case

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

  // ✅ Step 3: API calls ko guard karo (MOST IMPORTANT)
  useEffect(() => {
    if (authLoading) return;
    if (!token || role !== "admin") return;

    const controller = new AbortController();
    refreshAll({ signal: controller.signal });

    return () => controller.abort();
  }, [refreshAll, token, role, authLoading]);

  // ✅ Step 4: Auto refresh interval bhi fix karo
  useEffect(() => {
    if (authLoading) return;
    if (!token || role !== "admin") return;

    const controller = new AbortController();

    const id = setInterval(() => {
      refreshAll({ signal: controller.signal });
    }, 15000);

    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, [refreshAll, token, role, authLoading]);

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

  const cards = useMemo(() => {
    const t = trends || {};
    const s = stats || {};
    const items = [
      {
        id: 1,
        title: "Total Animals",
        icon: faPaw,
        rawValue: Number(s.totalAnimals || 0),
        formatter: (v) => Math.round(v).toLocaleString(),
        trend: formatPct(t?.totalAnimals?.pct),
        trendDir: t?.totalAnimals?.direction === "down" ? "down" : "up",
        subtitle: `new: ${formatCompactNumber(t?.totalAnimals?.current || 0)} (vs ${formatCompactNumber(t?.totalAnimals?.previous || 0)})`,
        gradient: "card-gradient-1",
        iconBg: "icon-bg-1",
      },
      {
        id: 2,
        title: "Animals Sold",
        icon: faHandshake,
        rawValue: Number(s.animalsSold || 0),
        formatter: (v) => Math.round(v).toLocaleString(),
        trend: formatPct(t?.animalsSold?.pct),
        trendDir: t?.animalsSold?.direction === "down" ? "down" : "up",
        subtitle: `vs previous ${period}`,
        gradient: "card-gradient-2",
        iconBg: "icon-bg-2",
      },
      {
        id: 3,
        title: "Total Revenue",
        icon: faIndianRupeeSign,
        rawValue: Number(s.totalRevenue || 0),
        formatter: (v) => formatCurrency(v),
        trend: formatPct(t?.totalRevenue?.pct),
        trendDir: t?.totalRevenue?.direction === "down" ? "down" : "up",
        subtitle: `vs previous ${period}`,
        gradient: "card-gradient-3",
        iconBg: "icon-bg-3",
      },
      {
        id: 4,
        title: "Pending Inquiries",
        icon: faCommentDots,
        rawValue: Number(s.pendingInquiries || 0),
        formatter: (v) => Math.round(v).toLocaleString(),
        trend: formatPct(t?.pendingInquiries?.pct),
        trendDir: t?.pendingInquiries?.direction === "down" ? "down" : "up",
        subtitle: `new pending vs previous ${period}`,
        gradient: "card-gradient-4",
        iconBg: "icon-bg-4",
      },
    ];

    return items.map((c, idx) => ({
      ...c,
      animationDelay: `${idx * 0.15}s`,
    }));
  }, [period, stats, trends]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              <h1>
                Dashboard
                <span className="greeting-dot" />
              </h1>
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
                placeholder="Search animals, orders, inquiries..."
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
                                {a.tagId ? `#${a.tagId}` : ""} {a.breed ? `• ${a.breed}` : ""} {a.status ? `• ${a.status}` : ""}
                              </span>
                              <FontAwesomeIcon icon={faChevronRight} className="search-dd-item-arrow" />
                            </button>
                          ))}
                        </>
                      )}

                      {(searchResults.inquiries?.length || 0) > 0 && (
                        <>
                          <div className="search-dd-section">Inquiries / Orders</div>
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
                              <span className="search-dd-item-meta">
                                {i.inquiryId ? `${i.inquiryId} • ` : ""}
                                {i.animalName} {i.status ? `• ${i.status}` : ""}
                              </span>
                              <FontAwesomeIcon icon={faChevronRight} className="search-dd-item-arrow" />
                            </button>
                          ))}
                        </>
                      )}

                      {(searchResults.animals?.length || 0) === 0 && (searchResults.inquiries?.length || 0) === 0 && (
                        <div className="search-dd-row search-dd-row--empty">No results</div>
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
              <span>A</span>
            </div>
        </div>
      </header>

      {notifOpen && (
        <div className="notif-panel" onMouseDown={(e) => e.preventDefault()}>
          <div className="notif-panel-header">
            <div className="notif-panel-title">Notifications</div>
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
              <div className="notif-empty">You’re all caught up.</div>
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

      {/* Dashboard Content */}
      <section className="dashboard-content">
          {/* Welcome Banner */}
          <div className={`welcome-banner ${animateCards ? "animate" : ""}`}>
            <div className="welcome-text">
              <h2>
                Welcome back, <span className="highlight-name">Admin</span>
              </h2>
              <p>
                Here&apos;s what&apos;s happening with your livestock business
                today.
              </p>
            </div>
            <div className="welcome-decoration">
              <div className="deco-circle deco-1" />
              <div className="deco-circle deco-2" />
              <div className="deco-circle deco-3" />
            </div>
          </div>

          <div className="dashboard-toolbar">
            <div className="period-tabs">
              {["today", "week", "month", "year"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`period-tab ${period === p ? "active" : ""}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === "today" ? "Today" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <button type="button" className="refresh-btn" onClick={() => refreshAll({})} disabled={dashboardLoading}>
              <FontAwesomeIcon icon={faRotateRight} />
              Refresh
            </button>
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

          {/* Stats Cards */}
          <div className="stats-grid">
            {cards.map((card) => (
              <StatCard key={card.id} card={card} animateCards={animateCards} isLoading={dashboardLoading} />
            ))}
          </div>
        </section>

        <div className="dashboard-charts">
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
    </>
  );
};

export default AdminDashboard;