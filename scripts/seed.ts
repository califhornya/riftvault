import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type CardVariant = {
  variant_id?: string;
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

    for (const variant of card.variants ?? []) {
      if (variant.rarity) {
        rarityNames.add(variant.rarity);
      }
    }
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
  const [sets, factions] = await Promise.all([
    prisma.set.findMany({ select: { id: true, name: true } }),
    prisma.faction.findMany({ select: { id: true, name: true } }),
  ]);

  return {
    setMap: new Map(sets.map((set) => [set.name, set.id])),
    factionMap: new Map(factions.map((faction) => [faction.name, faction.id])),
  };
}

function mapCardsToRows(cards: RawCard[], setMap: Map<string, number>, factionMap: Map<string, number>) {
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

    return {
      cardId,
      name: card.name,
      type: card.type,
      domain: card.domain ?? null,
      costEnergy: card.cost?.energy ?? null,
      costPower: card.cost?.power ?? null,
      might: card.might ?? null,
      rulesText: card.rules_text ?? null,
      variants: JSON.stringify(card.variants ?? []),
      setId,
      factionId,
    };
  });
}

async function main() {
  const cards = loadCards();
  const { setNames, factionNames, rarityNames } = buildLookups(cards);

  await resetDatabase();
  await seedReferenceTables(setNames, factionNames, rarityNames);

  const { setMap, factionMap } = await buildRelationMaps();
  const cardRows = mapCardsToRows(cards, setMap, factionMap);

  await prisma.card.createMany({
    data: cardRows,
    skipDuplicates: true,
  });

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
