import { useState } from "react";
import Sidebar from "../variables/sidebar"
import Overview from "../variables/Overview";
import OrderHistory from "../variables/OrderHistory";
import Favourites from "../variables/Favourites";
import "../css/Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":     return <Overview />;
      case "orders":       return <OrderHistory />;
      case "favourites":   return <Favourites />;
      default:             return <Overview />;
    }
  };

  return (
    <div className={`dashboard-root ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="topbar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span /><span /><span />
          </button>
        </header>
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}