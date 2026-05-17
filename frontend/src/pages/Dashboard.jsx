import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/courses',   icon: '◈', label: 'Vulnérabilités' },
  { to: '/chat',      icon: '◉', label: 'CyberBot' },
  { to: '/profile',   icon: '◎', label: 'Mon Profil' },
];

const ADMIN_ITEMS = [
  { to: '/admin',            icon: '▣', label: 'Vue Admin' },
  { to: '/admin/courses',    icon: '▤', label: 'Gérer Cours' },
  { to: '/admin/users',      icon: '▥', label: 'Utilisateurs' },
  { to: '/admin/ai-config',  icon: '▦', label: 'Config IA' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">KB</div>
        <span className="sidebar__logo-text">Cyber<span>Kb</span></span>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        <span className="sidebar__section-label">Navigation</span>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar__link-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <span className="sidebar__section-label" style={{ marginTop: '0.5rem' }}>
              Administration
            </span>
            {ADMIN_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar__link-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer user */}
      <div className="sidebar__footer">
        <div className="sidebar__user" onClick={handleLogout} title="Se déconnecter">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.first_name} {user?.last_name}</div>
            <div className="sidebar__user-role">
              {user?.role === 'admin' ? '◈ Admin' : '◎ Apprenant'} · Logout →
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}