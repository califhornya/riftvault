import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid card id' }, { status: 400 });
  }

  const card = await prisma.card.findUnique({
    where: { id },
    include: { set: true },
  });

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  return NextResponse.json({ data: card });
}
