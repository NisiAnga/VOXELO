import React, { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import Materials from "./components/Materials.jsx";
import Orders from "./components/Orders.jsx";
import Finances from "./components/Finances.jsx";
import Analytics from "./components/Analytics.jsx";
import './App.css';

import { Home, Layers, Package, Wallet, BarChart3 } from "lucide-react";

export default function App() {
  const [route, setRoute] = useState("dashboard");

  const SidebarButton = ({ label, icon, active }) => (
    <button
      onClick={() => setRoute(label.toLowerCase())}
      className={`sidebar-btn ${active ? "active" : ""}`}
    >
      {icon}
      <span className="capitalize">{label}</span>
    </button>
  );

  const renderPage = () => {
    switch (route) {
      case "dashboard":
        return <Dashboard />;
      case "materials":
        return <Materials />;
      case "orders":
        return <Orders />;
      case "finances":
        return <Finances />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">

        {/* ---------------- Branding Section ---------------- */}
        <div className="sidebar-branding">
          <img src="/logo.png" alt="VOXELO Logo" className="sidebar-logo" />
          <h2 className="sidebar-title">VOXELO</h2>
          <span className="sidebar-subtitle">Business Manager</span>
        </div>

        {/* ---------------- Sidebar Buttons ---------------- */}
        <SidebarButton
          label="Dashboard"
          icon={<Home size={18} />}
          active={route === "dashboard"}
        />

        <SidebarButton
          label="Materials"
          icon={<Layers size={18} />}
          active={route === "materials"}
        />

        <SidebarButton
          label="Orders"
          icon={<Package size={18} />}
          active={route === "orders"}
        />

        <SidebarButton
          label="Finances"
          icon={<Wallet size={18} />}
          active={route === "finances"}
        />

        <SidebarButton
          label="Analytics"
          icon={<BarChart3 size={18} />}
          active={route === "analytics"}
        />

      </aside>

      {/* Main Page */}
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}
