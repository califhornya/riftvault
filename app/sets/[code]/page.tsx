import { CardGrid } from '@/components/CardGrid';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';
import type { CardsResponse, SetSummary } from '@/lib/api';
import { getBaseUrl } from '@/lib/http';

async function loadSet(code: string, searchParams: { [key: string]: string | string[] | undefined }) {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams();
  const page = searchParams.page;
  const limit = searchParams.limit;
  if (typeof page === 'string') params.set('page', page);
  if (typeof limit === 'string') params.set('limit', limit);
  params.set('set', code);
  const qs = params.toString();
  const [cardsRes, setsRes] = await Promise.all([
    fetch(`${baseUrl}/api/cards${qs ? `?${qs}` : ''}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/sets`, { cache: 'no-store' }),
  ]);

  if (!cardsRes.ok) {
    throw new Error('Failed to load set cards');
  }

  if (!setsRes.ok) {
    throw new Error('Failed to load set metadata');
  }

  const cards = (await cardsRes.json()) as CardsResponse;
  const sets = (await setsRes.json()) as { data: SetSummary[] };
  const set = sets.data.find((entry) => String(entry.id) === code);

  if (!set) {
    return null;
  }

  return { ...cards, set } as const;
}

export default async function SetDetailPage({ params, searchParams }: { params: { code: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
  let data: (CardsResponse & { set: SetSummary }) | null = null;
  let error: string | null = null;

  try {
    data = await loadSet(params.code, searchParams);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unable to load set';
  }

  if (!data && !error) {
    return (
      <div className="panel">
        <h1 style={{ fontSize: '1.5rem' }}>Set not found</h1>
        <p className="muted">We could not find a set with id {params.code}.</p>
      </div>
    );
  }

  const page = data?.page ?? Number(searchParams.page ?? 1) ?? 1;
  const limit = data?.limit ?? Number(searchParams.limit ?? 20) ?? 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>{data?.set.name ?? 'Unknown set'}</h1>
        <p className="muted">Total cards: {data?.set.cardCount ?? 0}</p>
      </header>

      <FilterBar action={`/sets/${params.code}`} limit={limit} disabled query={undefined} />
      {error && <div className="panel" style={{ borderColor: '#fbbf24', color: '#fcd34d' }}>{error}</div>}

      {!error && data && data.data.length === 0 && (
        <div className="panel muted">No cards found in this set.</div>
      )}

      {!error && data && data.data.length > 0 && <CardGrid cards={data.data} />}

      {!error && data && data.total > 0 && (
        <Pagination
          page={page}
          limit={limit}
          total={data.total}
          searchParams={{ page: String(page), limit: String(limit) }}
          basePath={`/sets/${params.code}`}
        />
      )}
    </div>
  );
}
