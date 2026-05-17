import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard',       icon: '⬡', label: 'Dashboard' },
  { to: '/vulnerabilities', icon: '◈', label: 'Vulnérabilités' },
  { to: '/chatbot',         icon: '◉', label: 'CyberBot' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-cyber-surface border-r border-white/[0.07] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-md bg-neon flex items-center justify-center text-xs font-bold text-cyber-base font-display flex-shrink-0">
          KB
        </div>
        <span className="font-display font-extrabold text-[1.05rem] tracking-tight text-slate-100">
          Cyber<span className="text-neon">Kb</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5 py-4 overflow-y-auto">
        <p className="text-[0.62rem] uppercase tracking-widest text-slate-600 px-2 mb-1">Menu</p>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-[0.8rem] font-mono transition-all duration-150 border
              ${isActive
                ? 'bg-neon/10 text-neon border-neon/30'
                : 'text-slate-400 border-transparent hover:bg-cyber-elevated hover:text-slate-200 hover:border-white/[0.07]'
              }`
            }
          >
            <span className="text-sm opacity-80">{icon}</span>
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-[0.62rem] uppercase tracking-widest text-slate-600 px-2 mt-4 mb-1">Admin</p>
            <NavLink to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-[0.8rem] font-mono transition-all duration-150 border
                ${isActive
                  ? 'bg-neon/10 text-neon border-neon/30'
                  : 'text-slate-400 border-transparent hover:bg-cyber-elevated hover:text-slate-200 hover:border-white/[0.07]'
                }`
              }
            >
              <span className="text-sm opacity-80">▣</span>
              Administration
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.07] px-2.5 py-3">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-cyber-elevated transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center text-[0.65rem] text-neon font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="text-left min-w-0 flex-1">
            <div className="text-[0.78rem] text-slate-200 truncate">{user?.first_name} {user?.last_name}</div>
            <div className="text-[0.65rem] text-slate-500 group-hover:text-red-400 transition-colors">
              {user?.role} · Logout
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}