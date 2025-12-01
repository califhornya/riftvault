import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { notFound, serverError } from '@/lib/api/errors';
import { formatCard } from '@/lib/api/formatCard';
import prisma from '@/lib/prisma';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 100;

function parsePositiveNumber(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const limit = Math.min(parsePositiveNumber(request.nextUrl.searchParams.get('limit')) ?? DEFAULT_LIMIT, MAX_LIMIT);
    const page = parsePositiveNumber(request.nextUrl.searchParams.get('page')) ?? DEFAULT_PAGE;
    const skip = (page - 1) * limit;

    const set = await prisma.set.findUnique({ where: { code: params.code } });

    if (!set) {
      return notFound('Set not found');
    }

    const where: Prisma.CardWhereInput = { setId: set.id };

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

    return NextResponse.json({
      data: cards.map(formatCard),
      page,
      limit,
      total,
      set: {
        id: set.id,
        code: set.code,
        name: set.name,
        releasedAt: set.releasedAt,
        cardCount: total,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
