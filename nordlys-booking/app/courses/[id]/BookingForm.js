'use client';
import { useState } from 'react';

export default function BookingForm({ courseId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, customerName: name, customerEmail: email, seats: 1 }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <label>
        Full name
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Redirecting to payment…' : 'Book & pay'}
      </button>
    </form>
  );
}
