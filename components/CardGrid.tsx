import Link from 'next/link';
import type { Card } from '@/lib/api';

function formatTypeLine(card: Card) {
  return card.typeLine || '—';
}

function formatCost(card: Card) {
  const parts = [] as string[];
  if (card.cost.energy !== null) parts.push(`${card.cost.energy} Energy`);
  if (card.cost.power !== null) parts.push(`${card.cost.power} Power`);
  return parts.join(' / ') || '—';
}

export function CardGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <div key={card.cardId} className="panel card-item">
          <div className="card-meta">
            <div>
              <Link href={`/card/${card.cardId}`} className="card-link" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {card.name}
              </Link>
              <div className="badge" style={{ marginTop: '0.25rem' }}>{card.rarity ?? 'Unknown rarity'}</div>
            </div>
            <div className="card-thumb" aria-hidden>
              {card.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.imageUrl} alt={card.name} style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '10px' }} />
              ) : (
                <span>No image</span>
              )}
            </div>
          </div>
          <div className="card-text">{formatTypeLine(card)}</div>
          {card.text && <div className="subpanel card-text">{card.text}</div>}
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div>
              <dt className="muted" style={{ fontWeight: 600 }}>Faction</dt>
              <dd>{card.faction ?? '—'}</dd>
            </div>
            <div>
              <dt className="muted" style={{ fontWeight: 600 }}>Set</dt>
              <dd>
                <Link href={`/sets/${card.set.code}`} className="nav-link">
                  {card.set.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="muted" style={{ fontWeight: 600 }}>Cost</dt>
              <dd>{formatCost(card)}</dd>
            </div>
            <div>
              <dt className="muted" style={{ fontWeight: 600 }}>Might</dt>
              <dd>{card.might ?? '—'}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
