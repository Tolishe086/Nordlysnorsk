async function getCourses() {
  const res = await fetch(`${process.env.SITE_URL}/api/courses`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const courses = await getCourses();

  return (
    <main>
      <header className="site-header">
        <div className="wrap">
          <span className="brand">Nordlys Norsk</span>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <h1>Book your Norwegian course</h1>
          <p className="lede">Pick a level and format below. Seats update in real time, and payment is handled securely by Stripe.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {courses.length === 0 ? (
            <p>No courses open right now — check back soon.</p>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <a key={course.id} href={`/courses/${course.id}`} className="course-card">
                  <div className="course-level">{course.level} · {course.format}</div>
                  <h3>{course.name}</h3>
                  <p className="course-price">
                    {(course.price_cents / 100).toFixed(0)} {course.currency.toUpperCase()}
                  </p>
                  <p className="course-seats">
                    {course.seats_available > 0
                      ? `${course.seats_available} spot${course.seats_available === 1 ? '' : 's'} left`
                      : 'Fully booked'}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
