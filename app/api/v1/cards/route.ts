import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

function parsePagination(searchParams: URLSearchParams) {
  const limitParam = Number(searchParams.get('limit'));
  const pageParam = Number(searchParams.get('page'));

  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : DEFAULT_LIMIT;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : DEFAULT_PAGE;

  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim();
  const faction = searchParams.get('faction')?.trim();
  const rarity = searchParams.get('rarity')?.trim();
  const type = searchParams.get('type')?.trim();

  const { limit, page, skip } = parsePagination(searchParams);

  const where: Parameters<typeof prisma.card.findMany>[0]['where'] = {};

  if (q && q.length > 0) {
    const containsQuery = { contains: q, mode: 'insensitive' as const };
    where.OR = [
      { name: containsQuery },
      { typeLine: containsQuery },
      { text: containsQuery },
    ];
  }

  if (faction && faction.length > 0) {
    where.faction = { equals: faction, mode: 'insensitive' };
  }

  if (rarity && rarity.length > 0) {
    where.rarity = { equals: rarity, mode: 'insensitive' };
  }

  if (type && type.length > 0) {
    where.typeLine = { contains: type, mode: 'insensitive' };
  }

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
      include: { set: true },
    }),
    prisma.card.count({ where }),
  ]);

  return NextResponse.json({ data: cards, page, limit, total });
}
