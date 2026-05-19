import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ setSidebarOpen }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Map pathnames to beautiful display titles
  const getPageTitle = (path) => {
    switch (path) {
      case "/dashboard":
        return "Tableau de Bord";
      case "/courses":
        return "Cours & Vulnérabilités";
      case "/chat":
        return "AI Mentor Chat";
      case "/progress":
        return "Progression de l'Apprenant";
      case "/settings":
        return "Paramètres du Compte";
      default:
        return "Plateforme CyberKB";
    }
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      logout();
    }
  };

  return (
    <header className="topbar">
      <div className="flex items-center gap-2">
        {/* Toggle button for sidebar on mobile screens */}
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="md:hidden text-slate-300 hover:text-white text-xl p-1 bg-cyber-elevated rounded border border-white/10 cursor-pointer"
        >
          ☰
        </button>

        <div className="topbar__breadcrumb">
          <span>CyberKB</span>
          <span>/</span>
          <span className="text-accent font-medium">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      <div className="topbar__actions">
        {user && (
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 text-xs hidden sm:inline-block">
              Connecté en tant que:{" "}
              <strong className="text-slate-200 font-medium">
                {user.username}
              </strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn btn--danger btn--sm cursor-pointer"
              title="Déconnexion"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}