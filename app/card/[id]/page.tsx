import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CardGrid } from '@/components/CardGrid';
import type { Card } from '@/lib/api';
import { getBaseUrl } from '@/lib/http';

async function loadCard(id: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/cards/${id}`, { cache: 'no-store' });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to load card');
  }
  const json = (await res.json()) as { data: Card };
  return json.data;
}

export default async function CardPage({ params }: { params: { id: string } }) {
  const card = await loadCard(params.id);

  if (!card) {
    notFound();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ height: '10rem', width: '8rem', overflow: 'hidden', borderRadius: '12px', border: '1px solid #1f2937', background: '#0b1224' }}>
            <div className="muted" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              No image
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{card.name}</h1>
            <div className="muted">{card.typeLine}</div>
            <div className="badge">{card.rarity ?? 'Unknown rarity'}</div>
            <div className="muted">Faction: {card.faction ?? '—'}</div>
            <div className="muted">
              Set: <Link href={`/sets/${card.set.id}`} className="nav-link">{card.set.name}</Link>
            </div>
            {(card.cost.energy !== null || card.cost.power !== null || card.might !== null) && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {card.cost.energy !== null && <span>Energy: {card.cost.energy}</span>}
                {card.cost.power !== null && <span>Power: {card.cost.power}</span>}
                {card.might !== null && <span>Might: {card.might}</span>}
              </div>
            )}
          </div>
        </div>
        {card.text && <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{card.text}</p>}
      </div>
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>More from {card.set.name}</h2>
        <p className="muted">Explore additional cards from this set.</p>
        <CardGrid cards={[card]} />
      </section>
    </div>
  );
}
