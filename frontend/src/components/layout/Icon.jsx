export default function Icon({
  name,
  size = 16,
}) {
  const icons = {
    dashboard: "📊",
    courses: "📚",
    chat: "💬",
    settings: "⚙️",
  };

  return (
    <span
      style={{
        fontSize: size,
      }}
    >
      {icons[name]}
    </span>
  );
}