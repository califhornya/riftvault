import { NextRequest, NextResponse } from 'next/server';
import { formatCard } from '@/lib/api/formatCard';
import { badRequest, notFound, serverError } from '@/lib/api/errors';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id < 1) {
    return badRequest('Invalid card id');
  }

  try {
    const card = await prisma.card.findUnique({
      where: { id },
      include: { set: true, faction: true },
    });

    if (!card) {
      return notFound('Card not found');
    }

    return NextResponse.json({ data: formatCard(card) });
  } catch (error) {
    return serverError(error);
  }
}
