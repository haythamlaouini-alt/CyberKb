import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "./Icon";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile background overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">C</div>
          <div className="sidebar__logo-text">
            Cyber<span>KB</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section-label">Menu Principal</div>
          
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen?.(false)}
          >
            <Icon name="dashboard" />
            Dashboard
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen?.(false)}
          >
            <Icon name="courses" />
            Cours & Leçons
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen?.(false)}
          >
            <Icon name="chat" />
            AI Mentor
          </NavLink>

          <NavLink
            to="/progress"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen?.(false)}
          >
            <span className="sidebar__link-icon">📈</span>
            Progression
          </NavLink>

          <div className="sidebar__section-label">Paramètres</div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
            onClick={() => setSidebarOpen?.(false)}
          >
            <Icon name="settings" />
            Options
          </NavLink>
        </nav>

        {user && (
          <div className="sidebar__footer">
            <div 
              className="sidebar__user"
              onClick={handleLogout}
              title="Cliquer pour se déconnecter"
            >
              <div className="sidebar__avatar">
                {user.username?.substring(0, 2).toUpperCase() || "US"}
              </div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">
                  {user.full_name || user.username}
                </div>
                <div className="sidebar__user-role">
                  {user.role === "admin" ? "Administrateur" : "Apprenant"}
                </div>
              </div>
              <div className="ml-auto text-red-400 hover:text-red-300 text-xs">
                🚪
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}