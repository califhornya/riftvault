import { readFileSync } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

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

  for (const card of cards) {
    const code = card.set.toLowerCase().replace(/\s+/g, '-');
    let setRecord = setMap.get(code);

    if (!setRecord) {
      const set = await prisma.cardSet.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: card.set,
        },
      });
      setRecord = { id: set.id, code: set.code };
      setMap.set(code, setRecord);
    }

    const rarity = card.variants && card.variants.length > 0 ? card.variants[0].rarity : undefined;

    await prisma.card.create({
      data: {
        name: card.name,
        typeLine: card.type,
        text: card.rules_text,
        faction: card.domain,
        rarity: rarity ?? undefined,
        collectorNumber: card.card_id,
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
