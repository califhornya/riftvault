import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type CardVariant = {
  variant_id?: string;
  variantId?: string;
  rarity?: string;
};

type RawCard = {
  card_id?: string;
  name: string;
  type: string;
  domain?: string;
  cost?: {
    energy?: number;
    power?: number;
  };
  might?: number;
  rules_text?: string;
  set: string;
  variants?: CardVariant[];
};

function loadCards(): RawCard[] {
  const dataPath = path.join(process.cwd(), 'data', 'master_data_cards.json');

  try {
    const fileContent = readFileSync(dataPath, 'utf-8');
    return JSON.parse(fileContent) as RawCard[];
  } catch (error) {
    console.error(`Failed to load card data from ${dataPath}`);
    throw error;
  }
}

async function resetDatabase() {
  await prisma.$transaction([
    prisma.cardVariant.deleteMany(),
    prisma.cardKeyword.deleteMany(),
    prisma.card.deleteMany(),
    prisma.keyword.deleteMany(),
    prisma.rarity.deleteMany(),
    prisma.faction.deleteMany(),
    prisma.set.deleteMany(),
  ]);
}

function buildLookups(cards: RawCard[]) {
  const setNames = new Set<string>();
  const factionNames = new Set<string>();
  const rarityNames = new Set<string>();

  for (const card of cards) {
    if (card.set) {
      setNames.add(card.set);
    }

    if (card.domain) {
      factionNames.add(card.domain);
    }

    card.variants
      ?.map((variant) => variant.rarity?.trim())
      .filter((rarity): rarity is string => Boolean(rarity && rarity.length > 0))
      .forEach((rarity) => rarityNames.add(rarity));
  }

  return {
    setNames: Array.from(setNames),
    factionNames: Array.from(factionNames),
    rarityNames: Array.from(rarityNames),
  };
}

async function seedReferenceTables(setNames: string[], factionNames: string[], rarityNames: string[]) {
  await prisma.set.createMany({
    data: setNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  await prisma.faction.createMany({
    data: factionNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  if (rarityNames.length > 0) {
    await prisma.rarity.createMany({
      data: rarityNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
}

async function buildRelationMaps() {
  const [sets, factions, rarities] = await Promise.all([
    prisma.set.findMany({ select: { id: true, name: true } }),
    prisma.faction.findMany({ select: { id: true, name: true } }),
    prisma.rarity.findMany({ select: { id: true, name: true } }),
  ]);

  return {
    setMap: new Map(sets.map((set) => [set.name, set.id])),
    factionMap: new Map(factions.map((faction) => [faction.name, faction.id])),
    rarityMap: new Map(rarities.map((rarity) => [rarity.name, rarity.id])),
  };
}

function buildCardData(
  cards: RawCard[],
  setMap: Map<string, number>,
  factionMap: Map<string, number>,
  rarityMap: Map<string, number>
) {
  return cards.map((card) => {
    const cardId = card.card_id ?? card.variants?.[0]?.variant_id;

    if (!cardId) {
      throw new Error(`Missing card_id for card: ${card.name}`);
    }

    const setId = setMap.get(card.set);

    if (!setId) {
      throw new Error(`Set not found for card ${card.name}: ${card.set}`);
    }

    const factionId = card.domain ? factionMap.get(card.domain) ?? null : null;

    const variants = (card.variants ?? []).map((variant) => {
      const variantId = variant.variant_id ?? variant.variantId ?? cardId;
      const rarityName = variant.rarity?.trim();
      const rarityId = rarityName ? rarityMap.get(rarityName) ?? null : null;

      return { variantId, rarityId };
    });

    return {
      cardData: {
        cardId,
        name: card.name,
        type: card.type,
        domain: card.domain ?? null,
        costEnergy: card.cost?.energy ?? null,
        costPower: card.cost?.power ?? null,
        might: card.might ?? null,
        rulesText: card.rules_text ?? null,
        setId,
        factionId,
      },
      variants,
    };
  });
}

async function main() {
  const cards = loadCards();
  const { setNames, factionNames, rarityNames } = buildLookups(cards);

  await resetDatabase();
  await seedReferenceTables(setNames, factionNames, rarityNames);

  const { setMap, factionMap, rarityMap } = await buildRelationMaps();
  const cardRows = buildCardData(cards, setMap, factionMap, rarityMap);

  for (const card of cardRows) {
    await prisma.card.create({
      data: {
        ...card.cardData,
        variants: {
          create: card.variants.map((variant) => ({
            variantId: variant.variantId,
            rarity: variant.rarityId ? { connect: { id: variant.rarityId } } : undefined,
          })),
        },
      },
    });
  }

  console.log(`Seed completed: ${setNames.length} sets, ${factionNames.length} factions, ${rarityNames.length} rarities, ${cardRows.length} cards.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
