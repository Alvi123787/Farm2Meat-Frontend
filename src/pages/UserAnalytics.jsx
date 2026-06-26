// UserAnalytics.jsx - Premium Dark Analytics Dashboard
import React, { useState, useEffect } from 'react'
import api from '../services/api'
import '../css/UserAnalytics.css'
import {
  Users,
  Eye,
  UserCheck,
  Activity,
  TrendingUp,
  Clock,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  Smartphone,
  Monitor,
  MapPin,
  Globe,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react'
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#E53935', '#FF6F00', '#B71C1C', '#FF8F00', '#D32F2F']
const DEVICE_COLORS = ['#00E5FF', '#7C4DFF', '#FF6D00']

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

const exportToCSV = (data, filename = 'analytics-report') => {
  let csvContent = ''
  if (data.overview) {
    csvContent += 'Metric,Value\n'
    csvContent += `Total Users,${data.overview.totalUsers}\n`
    csvContent += `Page Views,${data.overview.pageViews}\n`
    csvContent += `Sessions,${data.overview.sessions}\n`
    csvContent += `Active Users,${data.overview.activeUsers}\n\n`
  }
  if (data.topPages?.length > 0) {
    csvContent += 'Top Pages\nURL,Views,Users,Average Time,Engagement Rate,Conversion Rate\n'
    data.topPages.forEach(page => {
      csvContent += `${page.url},${page.views},${page.users},${formatTime(page.avgTimeOnPage)},${page.engagementRate}%,${page.conversionRate}%\n`
    })
    csvContent += '\n'
  }
  if (data.trafficSources?.length > 0) {
    csvContent += 'Traffic Sources\nSource,Users,Percentage\n'
    data.trafficSources.forEach(source => {
      csvContent += `${source.source},${source.users},${source.percentage}%\n`
    })
    csvContent += '\n'
  }
  if (data.geographicData?.length > 0) {
    csvContent += 'Top Cities\nCity,Users,Percentage\n'
    data.geographicData.forEach(city => {
      csvContent += `${city.city},${city.users},${city.percentage}%\n`
    })
  }
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="ua-tooltip">
        <p className="ua-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="ua-tooltip-value" style={{ color: entry.color }}>
            <span className="ua-tooltip-dot" style={{ background: entry.color }}></span>
            {entry.name}: <strong>{entry.value?.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const StatDelta = ({ value }) => {
  const isPositive = value >= 0
  return (
    <span className={`ua-delta ${isPositive ? 'ua-delta-up' : 'ua-delta-down'}`}>
      {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value)}%
    </span>
  )
}

const UserAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liveActiveUsers, setLiveActiveUsers] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [overview, setOverview] = useState(null)
  const [userTimeData, setUserTimeData] = useState([])
  const [pageViewData, setPageViewData] = useState([])
  const [topPages, setTopPages] = useState([])
  const [trafficSources, setTrafficSources] = useState([])
  const [deviceTypes, setDeviceTypes] = useState([])
  const [geographicData, setGeographicData] = useState([])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        overviewRes, usersTimeRes, pageViewsRes,
        topPagesRes, trafficRes, deviceRes, geoRes
      ] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/users-over-time'),
        api.get('/api/analytics/page-views'),
        api.get('/api/analytics/top-pages'),
        api.get('/api/analytics/traffic-sources'),
        api.get('/api/analytics/device-types'),
        api.get('/api/analytics/geographic-data')
      ])
      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data)
        setLiveActiveUsers(parseInt(overviewRes.data.data.activeUsers) || 0)
      }
      if (usersTimeRes.data.success) setUserTimeData(usersTimeRes.data.data)
      if (pageViewsRes.data.success) setPageViewData(pageViewsRes.data.data)
      if (topPagesRes.data.success) setTopPages(topPagesRes.data.data)
      if (trafficRes.data.success) setTrafficSources(trafficRes.data.data)
      if (deviceRes.data.success) setDeviceTypes(deviceRes.data.data)
      if (geoRes.data.success) setGeographicData(geoRes.data.data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAnalytics() }, [dateRange])

  useEffect(() => {
    if (!overview) return
    const interval = setInterval(async () => {
      try {
        const overviewRes = await api.get('/api/analytics/overview')
        if (overviewRes.data.success) {
          setOverview(overviewRes.data.data)
          setLiveActiveUsers(parseInt(overviewRes.data.data.activeUsers) || 0)
          setLastUpdated(new Date())
        }
      } catch (err) {
        console.error('Live update failed:', err)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [overview])

  const summaryCards = overview ? [
    {
      title: 'Live Active Users',
      value: liveActiveUsers !== null ? liveActiveUsers.toLocaleString() : '0',
      icon: Zap,
      accent: '#E53935',
      delta: 5.2,
      isLive: true,
      sub: 'Right now on site'
    },
    {
      title: 'Total Users',
      value: Number(overview.totalUsers).toLocaleString(),
      icon: Users,
      accent: '#7C4DFF',
      delta: 12.4,
      sub: `Last ${dateRange === '7d' ? '7' : '30'} days`
    },
    {
      title: 'Page Views',
      value: Number(overview.pageViews).toLocaleString(),
      icon: Eye,
      accent: '#00E5FF',
      delta: -2.1,
      sub: `Last ${dateRange === '7d' ? '7' : '30'} days`
    },
    {
      title: 'Sessions',
      value: Number(overview.sessions).toLocaleString(),
      icon: Activity,
      accent: '#FF6F00',
      delta: 8.7,
      sub: `Last ${dateRange === '7d' ? '7' : '30'} days`
    }
  ] : []

  if (isLoading) {
    return (
      <div className="ua-loading">
        <div className="ua-loading-orb">
          <Loader2 className="ua-spinner" size={36} />
        </div>
        <p className="ua-loading-text">Loading analytics</p>
        <span className="ua-loading-sub">Crunching the numbers…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ua-error">
        <AlertCircle size={52} className="ua-error-icon" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchAnalytics} className="ua-retry-btn">
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    )
  }

  return (
    <div className="ua-root">
      {/* Background aurora */}
      <div className="ua-aurora" aria-hidden="true">
        <div className="ua-aurora-blob ua-aurora-blob-1"></div>
        <div className="ua-aurora-blob ua-aurora-blob-2"></div>
        <div className="ua-aurora-blob ua-aurora-blob-3"></div>
      </div>

      <div className="ua-inner">
        {/* ── Header ── */}
        <header className="ua-header">
          <div className="ua-header-left">
            <div className="ua-eyebrow">
              <span className="ua-live-dot"></span>
              Real-time · Google Analytics 4
              {overview.isMock && <span className="ua-mock-badge">Sample data</span>}
            </div>
            <h1 className="ua-title">Analytics <span className="ua-title-accent">Dashboard</span></h1>
            <p className="ua-last-updated">
              <Clock size={13} />
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="ua-header-right">
            <div className="ua-range-group">
              {['7d', '30d'].map(r => (
                <button
                  key={r}
                  className={`ua-range-btn ${dateRange === r ? 'ua-range-active' : ''}`}
                  onClick={() => setDateRange(r)}
                >
                  {r === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
            <button
              className="ua-refresh-btn"
              onClick={fetchAnalytics}
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
            <button
              className="ua-export-btn"
              onClick={() => exportToCSV({ overview, topPages, trafficSources, geographicData })}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </header>

        {/* ── KPI Cards ── */}
        <section className="ua-kpi-grid">
          {summaryCards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={i}
                className={`ua-kpi-card ${card.isLive ? 'ua-kpi-live' : ''}`}
                style={{ '--card-accent': card.accent }}
              >
                <div className="ua-kpi-top">
                  <div className="ua-kpi-icon">
                    <Icon size={22} />
                  </div>
                  {card.isLive && (
                    <div className="ua-live-badge">
                      <span className="ua-live-ring"></span>
                      LIVE
                    </div>
                  )}
                  {!card.isLive && <StatDelta value={card.delta} />}
                </div>
                <div className="ua-kpi-value">{card.value}</div>
                <div className="ua-kpi-label">{card.title}</div>
                <div className="ua-kpi-sub">{card.sub}</div>
                <div className="ua-kpi-bar">
                  <div className="ua-kpi-bar-fill"></div>
                </div>
              </div>
            )
          })}
        </section>

        {/* ── Charts Row 1 ── */}
        <div className="ua-charts-row">
          {/* Area chart */}
          <div className="ua-chart-card ua-chart-wide">
            <div className="ua-chart-head">
              <div>
                <h2 className="ua-chart-title">Active Users Over Time</h2>
                <p className="ua-chart-sub">Daily unique sessions</p>
              </div>
              <button className="ua-icon-btn"><Filter size={16} /></button>
            </div>
            <div className="ua-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userTimeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E53935" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#8899AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8899AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, color: '#AAB4BF' }} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Active Users"
                    stroke="#E53935"
                    strokeWidth={2.5}
                    fill="url(#gradUsers)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#E53935', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart — traffic */}
          <div className="ua-chart-card ua-chart-narrow">
            <div className="ua-chart-head">
              <div>
                <h2 className="ua-chart-title">Traffic Sources</h2>
                <p className="ua-chart-sub">Where users come from</p>
              </div>
              <button className="ua-icon-btn"><Globe size={16} /></button>
            </div>
            <div className="ua-chart-body ua-chart-body-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    innerRadius={55}
                    dataKey="users"
                    paddingAngle={3}
                  >
                    {trafficSources.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => <span style={{ color: '#AAB4BF', fontSize: 12 }}>{val}</span>}
                    wrapperStyle={{ paddingTop: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="ua-charts-row">
          {/* Bar chart — page views */}
          <div className="ua-chart-card ua-chart-wide">
            <div className="ua-chart-head">
              <div>
                <h2 className="ua-chart-title">Page Views Over Time</h2>
                <p className="ua-chart-sub">Daily page impressions</p>
              </div>
              <button className="ua-icon-btn"><TrendingUp size={16} /></button>
            </div>
            <div className="ua-chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pageViewData} barSize={28} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6F00" stopOpacity={1} />
                      <stop offset="100%" stopColor="#E53935" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#8899AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8899AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, color: '#AAB4BF' }} iconType="circle" />
                  <Bar dataKey="views" name="Page Views" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut — devices */}
          <div className="ua-chart-card ua-chart-narrow">
            <div className="ua-chart-head">
              <div>
                <h2 className="ua-chart-title">Device Breakdown</h2>
                <p className="ua-chart-sub">Sessions by device type</p>
              </div>
              <button className="ua-icon-btn"><Smartphone size={16} /></button>
            </div>
            <div className="ua-chart-body ua-chart-body-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTypes}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="users"
                    paddingAngle={3}
                  >
                    {deviceTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => <span style={{ color: '#AAB4BF', fontSize: 12 }}>{val}</span>}
                    wrapperStyle={{ paddingTop: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Geographic Cities ── */}
        {geographicData.length > 0 && (
          <section className="ua-section">
            <div className="ua-section-head">
              <MapPin size={18} className="ua-section-icon" />
              <h2 className="ua-section-title">Top Cities by Users</h2>
            </div>
            <div className="ua-geo-grid">
              {geographicData.slice(0, 6).map((city, i) => (
                <div key={i} className="ua-geo-card">
                  <div className="ua-geo-rank">{String(i + 1).padStart(2, '0')}</div>
                  <div className="ua-geo-info">
                    <span className="ua-geo-city">{city.city}</span>
                    <span className="ua-geo-users">{city.users?.toLocaleString()} users</span>
                  </div>
                  <div className="ua-geo-right">
                    <div className="ua-geo-pct">{city.percentage}%</div>
                    <div className="ua-geo-bar">
                      <div className="ua-geo-fill" style={{ width: `${city.percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Top Pages Table ── */}
        <section className="ua-section">
          <div className="ua-section-head">
            <TrendingUp size={18} className="ua-section-icon" />
            <h2 className="ua-section-title">Top Performing Pages</h2>
          </div>
          <div className="ua-table-wrap">
            <table className="ua-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th className="ua-th-right">Views</th>
                  <th className="ua-th-right">Users</th>
                  <th className="ua-th-right">Avg. Time</th>
                  <th className="ua-th-right">Engagement</th>
                  <th className="ua-th-right">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {topPages.length > 0 ? topPages.map((page, i) => (
                  <tr key={i} className="ua-tr">
                    <td>
                      <div className="ua-url-cell">
                        <span className="ua-url-slug">{page.url}</span>
                      </div>
                    </td>
                    <td className="ua-td-right ua-num">{page.views?.toLocaleString()}</td>
                    <td className="ua-td-right ua-num">{page.users?.toLocaleString()}</td>
                    <td className="ua-td-right ua-mono">{formatTime(page.avgTimeOnPage)}</td>
                    <td className="ua-td-right">
                      <div className="ua-conv-cell">
                        <div className="ua-conv-bar">
                          <div
                            className="ua-conv-fill"
                            style={{ width: `${Math.min(100, page.engagementRate)}%`, background: 'linear-gradient(90deg, #00E5FF, #7C4DFF)' }}
                          ></div>
                        </div>
                        <span className="ua-conv-val" style={{ color: '#00E5FF' }}>{page.engagementRate}%</span>
                      </div>
                    </td>
                    <td className="ua-td-right">
                      <div className="ua-conv-cell">
                        <div className="ua-conv-bar">
                          <div
                            className="ua-conv-fill"
                            style={{ width: `${Math.min(100, page.conversionRate * 2)}%` }}
                          ></div>
                        </div>
                        <span className="ua-conv-val">{page.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="ua-empty">No data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default UserAnalytics