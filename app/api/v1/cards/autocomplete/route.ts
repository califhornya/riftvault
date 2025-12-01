import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MAX_RESULTS = 10;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const where = { name: { contains: q, mode: 'insensitive' as const } };

  const [names, grouped] = await Promise.all([
    prisma.card.findMany({
      where,
      select: { id: true, name: true },
      distinct: ['name'],
      take: MAX_RESULTS,
      orderBy: { name: 'asc' },
    }),
    prisma.card.groupBy({
      by: ['name'],
      where,
    }),
  ]);

  return NextResponse.json({ data: names, total: grouped.length });
}
