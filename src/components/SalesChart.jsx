import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import '../css/SalesChart.css';
import { dashboardService } from '../services/dashboardService';

const formatNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const SalesChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="sc-tooltip">
        <p className="sc-tooltip-label">{label}</p>
        <p className="sc-tooltip-value">
          {formatNumber(value)} <span>goats sold</span>
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart = ({ data, loading, error, period, onPeriodChange } = {}) => {
  const [internalPeriod, setInternalPeriod] = useState(period || 'month');
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
        const result = await dashboardService.getSales(period || internalPeriod, { signal: controller.signal });
        setInternalData(Array.isArray(result.points) ? result.points : []);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setInternalError(err?.message || 'Failed to load sales analytics');
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
  const salesData = data || internalData;
  const isLoading = loading ?? internalLoading;
  const errMsg = error ?? internalError;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGoats = salesData.reduce((sum, item) => sum + (item.goats || 0), 0);
    const averageGoats = salesData.length ? Math.round(totalGoats / salesData.length) : 0;
    const bestWeek = salesData.length ? Math.max(...salesData.map((item) => item.goats || 0)) : 0;
    const previousTotal = salesData.reduce((sum, item) => sum + (item.previous || 0), 0);
    const growth = previousTotal > 0 ? ((totalGoats - previousTotal) / previousTotal) * 100 : 0;
    return { totalGoats, averageGoats, bestWeek, previousTotal, growth };
  }, [salesData]);

  const xKey = useMemo(() => {
    const first = salesData?.[0];
    if (first && Object.prototype.hasOwnProperty.call(first, 'label')) return 'label';
    return 'week';
  }, [salesData]);

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Period', 'Goats Sold'];
    const rows = salesData.map(item => [item[xKey], item.goats || 0]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_data_${activePeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sc-container">
      {/* Header */}
      <div className="sc-header">
        <div className="sc-header-left">
          <div className="sc-icon-box">
            <i className="fa-solid fa-chart-simple" />
          </div>
          <div>
            <h3 className="sc-title">Sales Performance</h3>
            <p className="sc-subtitle">Track animal sales across periods</p>
          </div>
        </div>
        <div className="sc-period-tabs">
          {['today', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              type="button"
              className={`sc-period-tab ${activePeriod === p ? 'active' : ''}`}
              onClick={() => setActivePeriod(p)}
            >
              {p === 'today' ? 'Today' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {errMsg && (
        <div className="sc-error">
          <span>{errMsg}</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="sc-stats-row">
        <div className="sc-stat-card">
          <div className="sc-stat-icon" style={{ background: '#2c7a4d12', color: '#2c7a4d' }}>
            <i className="fa-solid fa-chart-line" />
          </div>
          <div className="sc-stat-info">
            <span className="sc-stat-label">Total Sold</span>
            <span className="sc-stat-value">{formatNumber(stats.totalGoats)}</span>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon" style={{ background: '#1e4e6f12', color: '#1e4e6f' }}>
            <i className="fa-solid fa-calendar-week" />
          </div>
          <div className="sc-stat-info">
            <span className="sc-stat-label">Period Avg</span>
            <span className="sc-stat-value">{formatNumber(stats.averageGoats)}</span>
          </div>
        </div>
        <div className="sc-stat-card">
          <div className="sc-stat-icon" style={{ background: '#d4af3712', color: '#b8960f' }}>
            <i className="fa-solid fa-trophy" />
          </div>
          <div className="sc-stat-info">
            <span className="sc-stat-label">Best Period</span>
            <span className="sc-stat-value">{formatNumber(stats.bestWeek)}</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="sc-chart-area">
        <div className="sc-chart-header-row">
          <div className="sc-legend">
            <div className="sc-legend-item">
              <div className="sc-legend-bar" />
              <span>Goats Sold</span>
            </div>
          </div>
          <button className="sc-export-btn" onClick={handleExport}>
            <i className="fa-solid fa-download" />
            Export
          </button>
        </div>

        <div className="sc-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
            <BarChart
              data={salesData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c7a4d" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#2c7a4d" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#eef2f6" 
                vertical={false}
              />
              <XAxis 
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#7c8b9c', fontSize: 11 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#7c8b9c', fontSize: 11 }}
                dx={-8}
                allowDecimals={false}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<SalesChartTooltip />} cursor={{ fill: '#eef2f6' }} />
              <Bar 
                dataKey="goats" 
                fill="url(#barGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
          {isLoading && (
            <div className="sc-loading">
              <span>Loading sales data...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sc-footer">
        <div className="sc-footer-left">
          <div className="sc-footer-stat">
            <span className="sc-footer-label">Period Total</span>
            <span className="sc-footer-value">{formatNumber(stats.totalGoats)} goats</span>
          </div>
          <div className="sc-footer-divider" />
          <div className="sc-footer-stat">
            <span className="sc-footer-label">Previous Period</span>
            <span className="sc-footer-value dim">{formatNumber(stats.previousTotal)} goats</span>
          </div>
        </div>
        <div className={`sc-trend-pill ${stats.growth >= 0 ? 'up' : 'down'}`}>
          <i className={`fa-solid fa-arrow-trend-${stats.growth >= 0 ? 'up' : 'down'}`} />
          <span>{Math.abs(stats.growth).toFixed(1)}% vs previous period</span>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
