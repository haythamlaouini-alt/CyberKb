import { useState } from "react";

import "./styles/globals.css";

import Sidebar from "./components/Layout/Sidebar";

import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import ChatPage from "./pages/ChatPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [page, setPage] =
    useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage />;

      case "courses":
        return <CoursesPage />;

      case "chat":
        return <ChatPage />;

      case "progress":
        return <ProgressPage />;

      case "settings":
        return <SettingsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={page}
        setActivePage={setPage}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}