import type { FormattedCard } from './api/formatCard';

export type Card = FormattedCard;

export type CardsResponse = {
  data: Card[];
  total: number;
  page: number;
  limit: number;
};

export type SetSummary = {
  id: number;
  name: string;
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
