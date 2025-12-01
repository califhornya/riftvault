import type { Card, CardVariant, Faction, Rarity, Set } from '@prisma/client';

export type ApiVariant = {
  id: number;
  variantId: string;
  rarity: string | null;
};

export type ApiCard = {
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
  set: {
    id: number;
    code: string;
    name: string;
  };
  imageUrl: string | null;
  variants: ApiVariant[];
};

type PrismaCard = Card & {
  set: Set;
  faction: Faction | null;
  variants: (CardVariant & { rarity: Rarity | null })[];
};

export function formatCard(card: PrismaCard): ApiCard {
  const primaryVariant = card.variants[0];
  return {
    id: card.id,
    cardId: card.cardId,
    name: card.name,
    typeLine: card.typeLine,
    text: card.rulesText ?? null,
    cost: {
      energy: card.costEnergy ?? null,
      power: card.costPower ?? null,
    },
    might: card.might ?? null,
    faction: card.faction?.name ?? null,
    rarity: primaryVariant?.rarity?.name ?? null,
    set: {
      id: card.set.id,
      code: card.set.code,
      name: card.set.name,
    },
    imageUrl: card.imageUrl ?? null,
    variants: card.variants.map((variant) => ({
      id: variant.id,
      variantId: variant.variantId,
      rarity: variant.rarity?.name ?? null,
    })),
  };
}
