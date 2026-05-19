import Icon from "./Icon";

export default function Sidebar({
  activePage,
  setActivePage,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        CyberKB
      </div>

      <button
        className="sidebar__link"
        onClick={() =>
          setActivePage("dashboard")
        }
      >
        <Icon name="dashboard" />
        Dashboard
      </button>

      <button
        className="sidebar__link"
        onClick={() =>
          setActivePage("courses")
        }
      >
        <Icon name="courses" />
        Courses
      </button>

      <button
        className="sidebar__link"
        onClick={() =>
          setActivePage("chat")
        }
      >
        <Icon name="chat" />
        AI Mentor
      </button>

      <button
        className="sidebar__link"
        onClick={() =>
          setActivePage("settings")
        }
      >
        <Icon name="settings" />
        Settings
      </button>
    </aside>
  );
}