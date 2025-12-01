import { CardGrid } from '@/components/CardGrid';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import { getBaseUrl } from '@/lib/http';
import type { CardsResponse } from '@/lib/api';

function buildCardsUrl(searchParams: { [key: string]: string | string[] | undefined }, baseUrl: string) {
  const params = new URLSearchParams();
  const keys: Array<keyof typeof searchParams> = ['q', 'page', 'limit', 'faction', 'rarity', 'type'];
  keys.forEach((key) => {
    const value = searchParams[key];
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return `${baseUrl}/api/v1/cards${query ? `?${query}` : ''}`;
}

async function loadCards(searchParams: { [key: string]: string | string[] | undefined }) {
  const baseUrl = getBaseUrl();
  const url = buildCardsUrl(searchParams, baseUrl);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch cards');
  }
  return (await res.json()) as CardsResponse;
}

export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  let data: CardsResponse | null = null;
  let error: string | null = null;

  try {
    data = await loadCards(searchParams);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load cards';
  }

  const page = Number(searchParams.page ?? data?.page ?? 1) || 1;
  const limit = Number(searchParams.limit ?? data?.limit ?? 20) || 20;
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const faction = typeof searchParams.faction === 'string' ? searchParams.faction : undefined;
  const rarity = typeof searchParams.rarity === 'string' ? searchParams.rarity : undefined;
  const typeLine = typeof searchParams.type === 'string' ? searchParams.type : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Search cards</h1>
        <p className="muted">Browse the entire Riftvault catalog with full-text search, filters, and pagination.</p>
      </section>

      <FilterBar
        action="/"
        query={query}
        faction={faction}
        rarity={rarity}
        typeLine={typeLine}
        limit={limit}
      />

      {error && <div className="panel" style={{ borderColor: '#fbbf24', color: '#fcd34d' }}>{error}</div>}

      {!error && data && data.data.length === 0 && (
        <div className="panel muted">No cards match your query.</div>
      )}

      {!error && data && data.data.length > 0 && <CardGrid cards={data.data} />}

      {!error && data && data.total > 0 && (
        <Pagination
          page={data.page}
          limit={data.limit}
          total={data.total}
          searchParams={{ ...searchParams, q: query, faction, rarity, type: typeLine }}
          basePath="/"
        />
      )}
    </div>
  );
}
