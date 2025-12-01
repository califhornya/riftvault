import Link from 'next/link';

export default function CardNotFound() {
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem' }}>Card not found</h1>
      <p className="muted">The card you are looking for does not exist.</p>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        <Link href="/" className="btn">
          Back to search
        </Link>
        <Link href="/sets" className="btn secondary">
          Browse sets
        </Link>
      </div>
    </div>
  );
}
