import { NextRequest, NextResponse } from 'next/server';
import { serverError } from '@/lib/api/errors';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const sets = await prisma.set.findMany({
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      data: sets.map((set) => ({
        id: set.id,
        name: set.name,
        cardCount: set._count.cards,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
