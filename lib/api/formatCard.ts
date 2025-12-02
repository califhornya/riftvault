import type { Card, Faction, Set } from '@prisma/client';

type RawVariant = {
  variant_id?: string;
  variantId?: string;
  rarity?: string;
};

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
  variants: {
    variantId: string | null;
    rarity: string | null;
  }[];
};

export type CardWithRelations = Card & { set: Set; faction: Faction | null };

function parseVariants(variants: string | null) {
  if (!variants) {
    return [] as RawVariant[];
  }

  try {
    const parsed = JSON.parse(variants) as RawVariant[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [] as RawVariant[];
  } catch (error) {
    console.warn('Failed to parse variants JSON', error);
    return [] as RawVariant[];
  }
}

export function formatCard(card: CardWithRelations): FormattedCard {
  const variants = parseVariants(card.variants ?? null);
  const primaryVariant = variants[0];

  return {
    id: card.id,
    cardId: card.cardId,
    name: card.name,
    type: card.type,
    typeLine: card.type,
    text: card.rulesText ?? null,
    faction: card.faction?.name ?? card.domain ?? null,
    rarity: primaryVariant?.rarity ?? null,
    cost: {
      energy: card.costEnergy ?? null,
      power: card.costPower ?? null,
    },
    might: card.might ?? null,
    set: {
      id: card.set.id,
      name: card.set.name,
    },
    variants: variants.map((variant) => ({
      variantId: variant.variant_id ?? variant.variantId ?? null,
      rarity: variant.rarity ?? null,
    })),
  };
}
