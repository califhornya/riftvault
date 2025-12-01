import { NextRequest, NextResponse } from 'next/server';
import { serverError } from '@/lib/api/errors';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const sets = await prisma.set.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        releasedAt: true,
        _count: { select: { cards: true } },
      },
      orderBy: { code: 'asc' },
    });

    const data = sets.map((set) => ({
      id: set.id,
      code: set.code,
      name: set.name,
      releasedAt: set.releasedAt,
      cardCount: set._count.cards,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return serverError(error);
  }
}
