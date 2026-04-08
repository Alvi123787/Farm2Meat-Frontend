import React, { useEffect, useMemo, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import {
  FaArrowDown,
  FaArrowTrendUp,
  FaBolt,
  FaChartArea,
  FaChartBar,
  FaChartLine,
  FaDownload,
  FaMoneyBillWave,
} from 'react-icons/fa6';
import '../css/RevenueChart.css';
import { dashboardService } from '../services/dashboardService';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value) => {
  if (value >= 1000000) return `₨${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₨${(value / 1000).toFixed(0)}k`;
  return `₨${value}`;
};

const RevenueChartTooltip = ({ active, payload, label, showPrevious }) => {
  if (!active || !payload?.length) return null;
  const rev = payload.find((p) => p.dataKey === 'revenue');
  const prev = payload.find((p) => p.dataKey === 'previous');
  const changeNum =
    rev && prev && prev.value > 0
      ? ((rev.value - prev.value) / prev.value) * 100
      : 0;
  const change = Number.isFinite(changeNum) ? changeNum.toFixed(1) : '0.0';
  return (
    <div className="rc-tooltip">
      <div className="rc-tooltip-header">
        <span className="rc-tooltip-label">{label}</span>
        {prev && (
          <span className={`rc-tooltip-badge ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? <FaArrowTrendUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="rc-tooltip-body">
        <div className="rc-tooltip-row">
          <span className="rc-tooltip-dot current" />
          <span className="rc-tooltip-text">Current</span>
          <span className="rc-tooltip-val">{formatCurrency(rev?.value || 0)}</span>
        </div>
        {prev && showPrevious && (
          <div className="rc-tooltip-row">
            <span className="rc-tooltip-dot previous" />
            <span className="rc-tooltip-text">Previous</span>
            <span className="rc-tooltip-val">{formatCurrency(prev.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const RevenueChart = ({ data, loading, error, period, onPeriodChange } = {}) => {
  const [internalPeriod, setInternalPeriod] = useState(period || 'year');
  const [chartType, setChartType] = useState('area');
  const [showPrevious, setShowPrevious] = useState(true);
  const [internalData, setInternalData] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState('');

  useEffect(() => {
    if (period) setInternalPeriod(period);
  }, [period]);

  useEffect(() => {
    if (data) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        setInternalLoading(true);
        setInternalError('');
        const result = await dashboardService.getRevenue(period || internalPeriod, { signal: controller.signal });
        setInternalData(Array.isArray(result.points) ? result.points : []);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setInternalError(err?.message || 'Failed to load revenue analytics');
        setInternalData([]);
      } finally {
        setInternalLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [data, internalPeriod, period]);

  const activePeriod = period || internalPeriod;
  const setActivePeriod = onPeriodChange || setInternalPeriod;
  const currentData = data || internalData;
  const isLoading = loading ?? internalLoading;
  const errMsg = error ?? internalError;

  const stats = useMemo(() => {
    const totalRevenue = currentData.reduce((s, i) => s + (i.revenue || 0), 0);
    const totalPrevious = currentData.reduce((s, i) => s + (i.previous || 0), 0);
    const avgRevenue = currentData.length ? totalRevenue / currentData.length : 0;
    const peakRevenue = currentData.length ? Math.max(...currentData.map((i) => i.revenue || 0)) : 0;
    const growthNum =
      totalPrevious > 0 ? ((totalRevenue - totalPrevious) / totalPrevious) * 100 : 0;
    const growth = Number.isFinite(growthNum) ? growthNum.toFixed(1) : '0.0';
    return { totalRevenue, totalPrevious, growth, avgRevenue, peakRevenue };
  }, [currentData]);

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCompact(stats.totalRevenue),
      change: `+${stats.growth}%`,
      isUp: stats.growth >= 0,
      icon: FaMoneyBillWave,
      color: '#d4af37',
    },
    {
      label: 'Average',
      value: formatCompact(stats.avgRevenue),
      change: 'per period',
      isUp: true,
      icon: FaChartBar,
      color: '#800000',
    },
    {
      label: 'Peak Revenue',
      value: formatCompact(stats.peakRevenue),
      change: 'highest',
      isUp: true,
      icon: FaArrowTrendUp,
      color: '#2e7d32',
    },
    {
      label: 'Growth Rate',
      value: `${stats.growth}%`,
      change: 'vs previous',
      isUp: stats.growth >= 0,
      icon: FaBolt,
      color: '#1565c0',
    },
  ];

  return (
    <div className="rc-container">
      {/* Header */}
      <div className="rc-header">
        <div className="rc-header-left">
          <div className="rc-icon-box">
            <FaChartLine />
          </div>
          <div>
            <h3 className="rc-title">Revenue Analytics</h3>
            <p className="rc-subtitle">Track your financial performance over time</p>
          </div>
        </div>
        <div className="rc-header-right">
          <div className="rc-chart-toggles">
            <button
              className={`rc-type-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <FaChartArea />
            </button>
            <button
              className={`rc-type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <FaChartBar />
            </button>
          </div>
          <div className="rc-period-tabs">
            {['today', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                className={`rc-period-tab ${activePeriod === p ? 'active' : ''}`}
                onClick={() => setActivePeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errMsg && (
        <div className="rc-error">
          <span>{errMsg}</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="rc-stats-row">
        {statCards.map((s, i) => (
          <div className="rc-stat-card" key={i} style={{ '--stat-color': s.color }}>
            <div className="rc-stat-icon" style={{ background: `${s.color}12`, color: s.color }}>
              <s.icon />
            </div>
            <div className="rc-stat-info">
              <span className="rc-stat-label">{s.label}</span>
              <span className="rc-stat-value">{s.value}</span>
              <span className={`rc-stat-change ${s.isUp ? 'up' : 'down'}`}>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="rc-chart-area">
        <div className="rc-chart-toolbar">
          <div className="rc-legend">
            <div className="rc-legend-item">
              <span className="rc-legend-line current" />
              <span>Current Period</span>
            </div>
            <label className="rc-legend-item rc-toggle-label">
              <input
                type="checkbox"
                checked={showPrevious}
                onChange={() => setShowPrevious(!showPrevious)}
              />
              <span className="rc-toggle-switch" />
              <span className="rc-legend-line previous" />
              <span>Previous Period</span>
            </label>
          </div>
          <button className="rc-export-btn">
            <FaDownload />
            Export
          </button>
        </div>

        <div className="rc-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
            <ComposedChart data={currentData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#800000" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#800000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#800000" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#999', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#999', fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                dx={-5}
                width={50}
              />
              <Tooltip content={<RevenueChartTooltip showPrevious={showPrevious} />} cursor={{ stroke: '#d4af3740', strokeWidth: 1 }} />

              {chartType === 'area' ? (
                <>
                  {showPrevious && (
                    <Area
                      type="monotone"
                      dataKey="previous"
                      stroke="#d4af37"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      fill="url(#prevGrad)"
                      dot={false}
                      animationDuration={800}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#800000"
                    strokeWidth={3}
                    fill="url(#revGrad)"
                    dot={{ fill: '#800000', stroke: '#fff', strokeWidth: 2, r: 5 }}
                    activeDot={{
                      fill: '#800000',
                      stroke: '#fff',
                      strokeWidth: 3,
                      r: 7,
                      filter: 'drop-shadow(0 2px 6px rgba(128,0,0,0.4))',
                    }}
                    animationDuration={1000}
                  />
                </>
              ) : (
                <>
                  {showPrevious && (
                    <Bar
                      dataKey="previous"
                      fill="#d4af3730"
                      stroke="#d4af37"
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      animationDuration={800}
                    />
                  )}
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGrad)"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    animationDuration={1000}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          {isLoading && (
            <div className="rc-loading">
              <span>Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="rc-footer">
        <div className="rc-footer-left">
          <div className="rc-footer-stat">
            <span className="rc-footer-label">Total YTD</span>
            <span className="rc-footer-value">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="rc-footer-divider" />
          <div className="rc-footer-stat">
            <span className="rc-footer-label">Previous YTD</span>
            <span className="rc-footer-value dim">{formatCurrency(stats.totalPrevious)}</span>
          </div>
        </div>
        <div className="rc-footer-right">
        <div className={`rc-growth-pill ${stats.growth >= 0 ? 'up' : 'down'}`}>
          {stats.growth >= 0 ? <FaArrowTrendUp /> : <FaArrowDown />}
          <span>{stats.growth}% growth vs previous period</span>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
