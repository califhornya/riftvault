import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  const sets = await prisma.cardSet.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      releasedAt: true,
      _count: { select: { cards: true } },
    },
    orderBy: { releasedAt: 'asc' },
  });

  const data = sets.map((set) => ({
    id: set.id,
    code: set.code,
    name: set.name,
    releasedAt: set.releasedAt,
    cardCount: set._count.cards,
  }));

  return NextResponse.json({ data });
}
