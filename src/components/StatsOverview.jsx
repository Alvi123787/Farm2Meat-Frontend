// StatsOverview.jsx
import StatCard from "./StatCard";
import "../css/StatsOverview.css";

const statsData = [
  {
    id: 1,
    title: "Total Animals",
    value: "245",
    trend: { value: "+12%", label: "this month", direction: "up" },
    icon: "fa-cow",
    accentColor: "primary",
  },
  {
    id: 2,
    title: "Active Listings",
    value: "120",
    trend: { value: "+8%", label: "this week", direction: "up" },
    icon: "fa-clipboard-list",
    accentColor: "gold",
  },
  {
    id: 3,
    title: "Sold Animals",
    value: "58",
    trend: { value: "+23%", label: "this month", direction: "up" },
    icon: "fa-handshake",
    accentColor: "green",
  },
  {
    id: 4,
    title: "Pending Inquiries",
    value: "13",
    trend: { value: "-5%", label: "this week", direction: "down" },
    icon: "fa-message",
    accentColor: "orange",
  },
  {
    id: 5,
    title: "Total Revenue",
    value: "Rs. 1,250,000",
    trend: { value: "+18%", label: "this month", direction: "up" },
    icon: "fa-chart-line",
    accentColor: "primary",
  },
];

export default function StatsOverview() {
  return (
    <section className="stats-overview">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <div className="stats-section-header">
        <div className="stats-title-group">
          <h2 className="stats-section-title">Overview</h2>
          <p className="stats-section-subtitle">
            Your livestock business at a glance
          </p>
        </div>
        <div className="stats-period-selector">
          <button className="period-btn">7D</button>
          <button className="period-btn active">30D</button>
          <button className="period-btn">90D</button>
          <button className="period-btn">1Y</button>
        </div>
      </div>
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            accentColor={stat.accentColor}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}