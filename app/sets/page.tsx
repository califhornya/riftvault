import Link from 'next/link';
import type { SetSummary } from '@/lib/api';
import { getBaseUrl } from '@/lib/http';

async function loadSets() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/sets`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load sets');
  }
  const json = (await res.json()) as { data: SetSummary[] };
  return json.data;
}

export default async function SetsPage() {
  let sets: SetSummary[] = [];
  let error: string | null = null;
  try {
    sets = await loadSets();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load sets';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Card sets</h1>
        <p className="muted">Browse every Riftvault release and jump into its card list.</p>
      </header>

      {error && <div className="panel" style={{ borderColor: '#fbbf24', color: '#fcd34d' }}>{error}</div>}

      {!error && sets.length === 0 && (
        <div className="panel muted">No sets available.</div>
      )}

      {!error && sets.length > 0 && (
        <div className="card-grid">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className="panel"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{set.name}</h2>
                </div>
                <div className="badge" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#e2e8f0' }}>{set.cardCount} cards</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
