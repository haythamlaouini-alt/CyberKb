const courses = [
  {
    id: 1,
    title: "Broken Access Control",
    severity: "Critical",
  },
  {
    id: 2,
    title: "Injection Attacks",
    severity: "High",
  },
];

export default function CoursesPage() {
  return (
    <div className="page-body">
      <h1>Courses</h1>

      <div className="courses-grid">
        {courses.map((course) => (
          <div
            className="card"
            key={course.id}
          >
            <h3>{course.title}</h3>

            <p>
              Severity:
              {" "}
              {course.severity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}