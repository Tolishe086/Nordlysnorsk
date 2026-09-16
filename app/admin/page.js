'use client';
import { useState } from 'react';

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];
const FORMATS = ['Classroom', 'Virtual', 'Online', 'Private'];

const EMPTY_FORM = {
  name: '', level: 'A1', format: 'Classroom', description: '',
  price_cents: '', currency: 'nok', total_seats: '', start_date: '',
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [courses, setCourses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadData(pw) {
    const coursesRes = await fetch('/api/courses');
    setCourses(await coursesRes.json());

    const bookingsRes = await fetch('/api/bookings', { headers: { 'x-admin-password': pw } });
    if (bookingsRes.ok) {
      setBookings(await bookingsRes.json());
      setAuthed(true);
    } else {
      alert('Wrong password');
    }
  }

  async function addCourse(e) {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({
        ...form,
        price_cents: Number(form.price_cents),
        total_seats: Number(form.total_seats),
      }),
    });
    if (res.ok) {
      loadData(password);
      setForm(EMPTY_FORM);
    } else {
      const data = await res.json();
      alert(data.error || 'Could not add course');
    }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course?')) return;
    await fetch(`/api/courses/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } });
    loadData(password);
  }

  if (!authed) {
    return (
      <main className="section wrap" style={{ paddingTop: 80 }}>
        <h1>Admin</h1>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 3 }}
          />
          <button className="btn-primary" onClick={() => loadData(password)}>Log in</button>
        </div>
      </main>
    );
  }

  return (
    <main className="section wrap" style={{ paddingTop: 48 }}>
      <h1>Admin dashboard</h1>

      <h2 style={{ marginTop: 40 }}>Add a course</h2>
      <form onSubmit={addCourse} className="admin-form">
        <input required placeholder="Course name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
          {LEVELS.map((lv) => <option key={lv}>{lv}</option>)}
        </select>
        <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
          {FORMATS.map((f) => <option key={f}>{f}</option>)}
        </select>
        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input required type="number" placeholder="Price (in øre/pence, e.g. 92800 = 928.00)" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: e.target.value })} />
        <input placeholder="Currency (nok, gbp...)" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        <input required type="number" placeholder="Total seats" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} />
        <button className="btn-primary" type="submit" style={{ gridColumn: 'span 2', justifySelf: 'start' }}>Add course</button>
      </form>

      <h2>Courses</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Level</th><th>Format</th><th>Seats left</th><th>Price</th><th></th></tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.level}</td>
              <td>{c.format}</td>
              <td>{c.seats_available} / {c.total_seats}</td>
              <td>{(c.price_cents / 100).toFixed(0)} {c.currency.toUpperCase()}</td>
              <td><button onClick={() => deleteCourse(c.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Bookings</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Course</th><th>Name</th><th>Email</th><th>Seats</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.courses?.name}</td>
              <td>{b.customer_name}</td>
              <td>{b.customer_email}</td>
              <td>{b.seats_booked}</td>
              <td>{b.status}</td>
              <td>{new Date(b.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
