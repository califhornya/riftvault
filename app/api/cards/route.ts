import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { badRequest, serverError } from '@/lib/api/errors';
import { formatCard } from '@/lib/api/formatCard';
import prisma from '@/lib/prisma';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 100;

function parsePositiveNumber(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim();
    const faction = searchParams.get('faction')?.trim();
    const rarity = searchParams.get('rarity')?.trim();
    const type = searchParams.get('type')?.trim();
    const cost = parsePositiveNumber(searchParams.get('cost'));

    const limit = Math.min(parsePositiveNumber(searchParams.get('limit')) ?? DEFAULT_LIMIT, MAX_LIMIT);
    const page = parsePositiveNumber(searchParams.get('page')) ?? DEFAULT_PAGE;
    const skip = (page - 1) * limit;

    if (Number.isFinite(cost) && cost !== null && cost < 0) {
      return badRequest('Cost must be a positive number.');
    }

    const where: Prisma.CardWhereInput = {};

    if (q && q.length > 0) {
      const containsQuery = { contains: q, mode: 'insensitive' as const };
      where.OR = [{ name: containsQuery }, { typeLine: containsQuery }, { rulesText: containsQuery }];
    }

    if (faction) {
      where.faction = { name: { equals: faction, mode: 'insensitive' } };
    }

    if (rarity) {
      where.variants = { some: { rarity: { name: { equals: rarity, mode: 'insensitive' } } } };
    }

    if (type) {
      where.typeLine = { contains: type, mode: 'insensitive' };
    }

    if (cost !== null) {
      where.costEnergy = cost;
    }

    const [cards, total] = await prisma.$transaction([
      prisma.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: { cardId: 'asc' },
        include: { set: true, faction: true, variants: { include: { rarity: true } } },
      }),
      prisma.card.count({ where }),
    ]);

    return NextResponse.json({ data: cards.map(formatCard), page, limit, total });
  } catch (error) {
    return serverError(error);
  }
}
