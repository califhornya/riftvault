import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type CardVariant = {
  variant_id?: string;
  rarity?: string;
};

type RawCard = {
  card_id: string;
  name: string;
  type: string;
  domain?: string;
  rules_text?: string;
  set: string;
  variants?: CardVariant[];
};

type CardSetRecord = {
  id: number;
  code: string;
};

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'master_data_cards.json');
  const fileContent = readFileSync(dataPath, 'utf-8');
  const cards: RawCard[] = JSON.parse(fileContent);

  const setMap = new Map<string, CardSetRecord>();

  await prisma.card.deleteMany();
  await prisma.cardSet.deleteMany();

  for (const card of cards) {
    const cardId = card.card_id ?? card.variants?.[0]?.variant_id;

    if (!cardId) {
      throw new Error(`Card ID is missing for card ${card.name}`);
    }

    const [setCode] = cardId.split('-');
    let setRecord = setMap.get(setCode);

    if (!setRecord) {
      const set = await prisma.cardSet.upsert({
        where: { code: setCode },
        update: {},
        create: {
          code: setCode,
          name: card.set,
        },
      });
      setRecord = { id: set.id, code: set.code };
      setMap.set(setCode, setRecord);
    }

    const rarity = card.variants && card.variants.length > 0 ? card.variants[0].rarity : undefined;
    const imageUrl = `/cards/${setRecord.code}/${cardId}.webp`;

    await prisma.card.create({
      data: {
        name: card.name,
        typeLine: card.type,
        text: card.rules_text,
        faction: card.domain,
        rarity: rarity ?? undefined,
        collectorNumber: cardId,
        imageUrl,
        setId: setRecord.id,
      },
    });
  }

  console.log(`Imported ${cards.length} cards.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
