export default function Topbar({
  setSidebarOpen,
}) {
  return (
    <header className="topbar">
      <button
        type="button"
        onClick={() =>
          setSidebarOpen((prev) => !prev)
        }
      >
        ☰
      </button>
    </header>
  );
}