import Link from 'next/link';

export type FilterBarProps = {
  action: string;
  query?: string;
  faction?: string;
  rarity?: string;
  typeLine?: string;
  limit?: number;
  disabled?: boolean;
};

export function FilterBar({ action, query, faction, rarity, typeLine, limit, disabled }: FilterBarProps) {
  return (
    <form action={action} method="get" className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <input type="hidden" name="q" value={query ?? ''} />
      {typeof limit === 'number' && <input type="hidden" name="limit" value={limit} />}
      <div className="filter-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label className="muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Faction
          </label>
        <input
          type="text"
          name="faction"
          defaultValue={faction}
          disabled={disabled}
          placeholder="e.g. Arcane"
          className="input"
        />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label className="muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Rarity
          </label>
        <input
          type="text"
          name="rarity"
          defaultValue={rarity}
          disabled={disabled}
          placeholder="e.g. Rare"
          className="input"
        />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label className="muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Type
          </label>
        <input
          type="text"
          name="type"
          defaultValue={typeLine}
          disabled={disabled}
          placeholder="e.g. Unit"
          className="input"
        />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="submit" disabled={disabled} className="btn" aria-disabled={disabled}>
            Apply filters
          </button>
          <Link href={action} className="btn secondary">
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}
