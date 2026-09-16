import { notFound } from 'next/navigation';
import BookingForm from './BookingForm';

async function getCourse(id) {
  const res = await fetch(`${process.env.SITE_URL}/api/courses`, { cache: 'no-store' });
  const courses = await res.json();
  return courses.find((c) => c.id === id);
}

export default async function CoursePage({ params }) {
  const course = await getCourse(params.id);
  if (!course) return notFound();

  return (
    <main className="section wrap" style={{ paddingTop: 48 }}>
      <a href="/" className="btn-ghost">← All courses</a>
      <h1 style={{ marginTop: 24 }}>{course.name}</h1>
      <p className="course-format">{course.level} · {course.format}</p>
      {course.description && <p style={{ maxWidth: '52ch', color: 'var(--ink-soft)' }}>{course.description}</p>}
      <p className="course-price">
        {(course.price_cents / 100).toFixed(0)} {course.currency.toUpperCase()}
      </p>
      <p className="course-seats">
        {course.seats_available > 0
          ? `${course.seats_available} spot${course.seats_available === 1 ? '' : 's'} left`
          : 'Fully booked'}
      </p>

      {course.seats_available > 0 ? (
        <BookingForm courseId={course.id} />
      ) : (
        <p style={{ marginTop: 24, color: 'var(--grey)' }}>This course is fully booked — check the catalog for other dates.</p>
      )}
    </main>
  );
}
