import Sidebar from './Sidebar';

export default function AppLayout({ children, title, actions }) {
  return (
    <div className="flex min-h-screen bg-cyber-base">
      <Sidebar />
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 bg-cyber-surface border-b border-white/[0.07] sticky top-0 z-40">
          <h1 className="font-display font-semibold text-[0.95rem] text-slate-200">{title}</h1>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
        {/* Content */}
        <main className="flex-1 p-6 max-w-[1200px] w-full">{children}</main>
      </div>
    </div>
  );
}