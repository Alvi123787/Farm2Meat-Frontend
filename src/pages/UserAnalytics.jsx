// UserAnalytics.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../css/UserAnalytics.css';
import {
  Users,
  Eye,
  UserCheck,
  Activity,
  TrendingUp,
  Clock,
  ChevronDown,
  Download,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar
} from 'recharts';

const UserAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [overview, setOverview] = useState({
    totalUsers: '0',
    pageViews: '0',
    sessions: '0',
    activeUsers: '0'
  });
  const [userTimeData, setUserTimeData] = useState([]);
  const [pageViewData, setPageViewData] = useState([]);
  const [topPages, setTopPages] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, usersTimeRes, pageViewsRes, topPagesRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/users-over-time'),
        api.get('/api/analytics/page-views'),
        api.get('/api/analytics/top-pages')
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.data);
      if (usersTimeRes.data.success) setUserTimeData(usersTimeRes.data.data);
      if (pageViewsRes.data.success) setPageViewData(pageViewsRes.data.data);
      if (topPagesRes.data.success) setTopPages(topPagesRes.data.data);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to connect to Google Analytics. Please ensure credentials are set up in the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const summaryCards = [
    {
      title: 'Total Users',
      value: overview.totalUsers,
      icon: Users,
      color: 'var(--primary)'
    },
    {
      title: 'Page Views',
      value: overview.pageViews,
      icon: Eye,
      color: 'var(--accent)'
    },
    {
      title: 'Active Users',
      value: overview.activeUsers,
      icon: UserCheck,
      color: '#10B981'
    },
    {
      title: 'Sessions',
      value: overview.sessions,
      icon: Activity,
      color: '#F59E0B'
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Fetching data from Google Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <AlertCircle size={48} />
        <h2>Analytics Error</h2>
        <p>{error}</p>
        <button onClick={fetchAnalytics} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="user-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>User Analytics</h1>
          <p className="header-subtitle">
            Real-time engagement metrics from Google Analytics 4
            {overview.isMock && (
              <span className="mock-badge" title="Credentials missing in backend. Showing sample data.">
                (Sample Data)
              </span>
            )}
          </p>
        </div>
        <div className="header-right">
          <div className="date-range-selector">
            <button 
              className={`date-option ${dateRange === '7d' ? 'active' : ''}`}
              onClick={() => setDateRange('7d')}
            >
              Last 7 days
            </button>
            <button 
              className={`date-option ${dateRange === '30d' ? 'active' : ''}`}
              onClick={() => setDateRange('30d')}
            >
              Last 30 days
            </button>
          </div>
          <button className="export-btn" onClick={() => window.print()}>
            <Download size={18} />
            Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="summary-card">
              <div className="card-header">
                <div className="card-icon" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon size={24} style={{ color: card.color }} />
                </div>
              </div>
              <div className="card-body">
                <h3>{Number(card.value).toLocaleString()}</h3>
                <p>{card.title}</p>
              </div>
              <div className="card-footer">
                <span className="period-badge">
                  <Clock size={12} />
                  Live Data
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Active Users Over Time</h2>
            <button className="chart-action">
              <Filter size={16} />
            </button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={userTimeData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border-light)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border-light)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Active Users"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="url(#colorUsers)"
                  dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Page Views Over Time</h2>
            <button className="chart-action">
              <Filter size={16} />
            </button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={pageViewData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border-light)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border-light)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="views" 
                  name="Page Views"
                  fill="var(--accent)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bottom-section">
        <div className="table-card full-width">
          <div className="table-header">
            <h2>Top Visited Pages (Last 30 Days)</h2>
          </div>
          <div className="table-container">
            <table className="pages-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Views</th>
                  <th>Users</th>
                  <th>Engagement</th>
                </tr>
              </thead>
              <tbody>
                {topPages.length > 0 ? topPages.map((page, index) => (
                  <tr key={index}>
                    <td className="url-cell">
                      <div className="url-wrapper">
                        <span className="url-icon">🔗</span>
                        <span className="url-text">{page.url}</span>
                      </div>
                    </td>
                    <td>
                      <div className="metric-cell">
                        <span className="metric-value">{page.views.toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="metric-cell">
                        <span className="metric-value">{page.users.toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="bounce-cell">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min(100, (page.users / page.views) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="bounce-value">{((page.users / page.views) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No data available for the selected period.</td>
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

export default UserAnalytics;
