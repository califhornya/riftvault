import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

type RawCost = {
  energy?: number;
  power?: number;
};

type RawVariant = {
  variant_id?: string;
  rarity?: string;
};

type RawCard = {
  card_id: string;
  name: string;
  type: string;
  domain?: string;
  cost?: RawCost;
  might?: number;
  rules_text?: string;
  set: string;
  variants?: RawVariant[];
};

const prisma = new PrismaClient();

function deriveSetCode(cardId: string) {
  const [code] = cardId.split('-');
  return code;
}

function normalizeName(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'master_data_cards.json');
  const fileContent = readFileSync(dataPath, 'utf-8');
  const cards: RawCard[] = JSON.parse(fileContent);

  const setEntries = new Map<string, string>();
  const factionNames = new Set<string>();
  const rarityNames = new Set<string>();

  cards.forEach((card) => {
    const code = deriveSetCode(card.card_id);
    setEntries.set(code, card.set);

    const faction = normalizeName(card.domain);
    if (faction) {
      factionNames.add(faction);
    }

    (card.variants ?? []).forEach((variant) => {
      const rarity = normalizeName(variant.rarity);
      if (rarity) {
        rarityNames.add(rarity);
      }
    });
  });

  await prisma.cardKeyword.deleteMany();
  await prisma.cardVariant.deleteMany();
  await prisma.card.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.rarity.deleteMany();
  await prisma.faction.deleteMany();
  await prisma.set.deleteMany();

  await prisma.set.createMany({
    data: Array.from(setEntries.entries()).map(([code, name]) => ({ code, name })),
  });

  if (factionNames.size > 0) {
    await prisma.faction.createMany({
      data: Array.from(factionNames).map((name) => ({ name })),
    });
  }

  if (rarityNames.size > 0) {
    await prisma.rarity.createMany({
      data: Array.from(rarityNames).map((name) => ({ name })),
    });
  }

  const [setMap, factionMap, rarityMap] = await Promise.all([
    prisma.set.findMany().then((sets) => new Map(sets.map((set) => [set.code, set.id]))),
    prisma.faction.findMany().then((factions) => new Map(factions.map((faction) => [faction.name, faction.id]))),
    prisma.rarity.findMany().then((rarities) => new Map(rarities.map((rarity) => [rarity.name, rarity.id]))),
  ]);

  const cardRecords = cards.map((card) => {
    const setCode = deriveSetCode(card.card_id);
    const factionName = normalizeName(card.domain);
    const variantId = card.variants?.[0]?.variant_id ?? card.card_id;
    const imageUrl = setCode && variantId ? `/cards/${setCode}/${variantId}.webp` : null;
    return {
      cardId: card.card_id,
      name: card.name,
      typeLine: card.type,
      rulesText: card.rules_text ?? null,
      costEnergy: card.cost?.energy ?? null,
      costPower: card.cost?.power ?? null,
      might: card.might ?? null,
      imageUrl,
      setId: setMap.get(setCode)!,
      factionId: factionName ? factionMap.get(factionName) ?? null : null,
    };
  });

  await prisma.card.createMany({ data: cardRecords });

  const cardIdMap = new Map(
    (await prisma.card.findMany({ select: { id: true, cardId: true } })).map((entry) => [entry.cardId, entry.id]),
  );

  const variantRecords = cards.flatMap((card) => {
    const cardDbId = cardIdMap.get(card.card_id);
    if (!cardDbId) return [];

    const variants = card.variants?.length ? card.variants : [{ variant_id: card.card_id, rarity: undefined }];
    return variants
      .map((variant) => {
        const rarityName = normalizeName(variant.rarity);
        return {
          variantId: variant.variant_id ?? `${card.card_id}`,
          rarityId: rarityName ? rarityMap.get(rarityName) ?? null : null,
          cardId: cardDbId,
        };
      })
      .filter((variant) => variant.variantId);
  });

  if (variantRecords.length > 0) {
    await prisma.cardVariant.createMany({ data: variantRecords, skipDuplicates: true });
  }

  console.log(`Seeded ${cardRecords.length} cards across ${setEntries.size} sets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
