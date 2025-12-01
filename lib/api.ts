export type CardVariant = {
  id: number;
  variantId: string;
  rarity: string | null;
};

export type Card = {
  id: number;
  cardId: string;
  name: string;
  typeLine: string;
  text: string | null;
  cost: {
    energy: number | null;
    power: number | null;
  };
  might: number | null;
  faction: string | null;
  rarity: string | null;
  set: { id: number; code: string; name: string };
  imageUrl: string | null;
  variants: CardVariant[];
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
