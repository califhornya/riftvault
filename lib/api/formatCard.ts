import type { Card, CardKeyword, CardVariant, Faction, Keyword, Rarity, Set } from '@prisma/client';

export type FormattedCard = {
  id: number;
  cardId: string;
  name: string;
  type: string;
  typeLine: string;
  text: string | null;
  faction: string | null;
  rarity: string | null;
  cost: {
    energy: number | null;
    power: number | null;
  };
  might: number | null;
  set: {
    id: number;
    name: string;
  };
  keywords: string[];
  variants: {
    variantId: string | null;
    rarity: string | null;
  }[];
};

export type CardWithRelations = Card & {
  set: Set;
  faction: Faction | null;
  variants: (CardVariant & { rarity: Rarity | null })[];
  keywords: (CardKeyword & { keyword: Keyword })[];
};

export function formatCard(card: CardWithRelations): FormattedCard {
  const variants = card.variants ?? [];
  const primaryVariant = variants[0];

  return {
    id: card.id,
    cardId: card.cardId,
    name: card.name,
    type: card.type,
    typeLine: card.type,
    text: card.rulesText ?? null,
    faction: card.faction?.name ?? card.domain ?? null,
    rarity: primaryVariant?.rarity?.name ?? null,
    cost: {
      energy: card.costEnergy ?? null,
      power: card.costPower ?? null,
    },
    might: card.might ?? null,
    set: {
      id: card.set.id,
      name: card.set.name,
    },
    keywords: (card.keywords ?? []).map(({ keyword }) => keyword.name),
    variants: variants.map((variant) => ({
      variantId: variant.variantId ?? null,
      rarity: variant.rarity?.name ?? null,
    })),
  };
}
