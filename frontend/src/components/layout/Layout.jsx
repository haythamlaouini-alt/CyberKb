import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="app-shell">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="main-content">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <Outlet />
      </div>
    </div>
  );
}