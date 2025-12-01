import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { notFound, serverError } from '@/lib/api/errors';
import { formatCard } from '@/lib/api/formatCard';
import prisma from '@/lib/prisma';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const idParam = params.id;
    const numericId = Number(idParam);

    const where: Prisma.CardWhereInput = {
      OR: [
        { cardId: idParam },
        Number.isInteger(numericId) && numericId > 0 ? { id: numericId } : undefined,
      ].filter(Boolean) as Prisma.CardWhereInput[],
    };

    const card = await prisma.card.findFirst({
      where,
      include: { set: true, faction: true, variants: { include: { rarity: true } } },
    });

    if (!card) {
      return notFound('Card not found');
    }

    return NextResponse.json({ data: formatCard(card) });
  } catch (error) {
    return serverError(error);
  }
}
