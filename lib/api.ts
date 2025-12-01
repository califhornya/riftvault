export type Card = {
  id: number;
  name: string;
  typeLine: string;
  text?: string | null;
  faction?: string | null;
  rarity?: string | null;
  collectorNumber?: string | null;
  set: { id: number; code: string; name: string };
  imageUrl?: string | null;
  attack?: number | null;
  health?: number | null;
};

export type CardsResponse = {
  data: Card[];
  total: number;
  page: number;
  limit: number;
};

export type SetSummary = {
  id: number;
  code: string;
  name: string;
  releasedAt: string | null;
  cardCount: number;
};

export type SetWithCards = CardsResponse & {
  set: SetSummary;
};

export async function fetchJson<T>(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return (await res.json()) as T;
}
