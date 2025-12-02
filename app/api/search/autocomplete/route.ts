import { NextRequest, NextResponse } from 'next/server';
import { badRequest, serverError } from '@/lib/api/errors';
import prisma from '@/lib/prisma';

const MAX_RESULTS = 10;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q) {
    return badRequest('Query parameter "q" is required');
  }

  const where = { name: { contains: q } };

  try {
    const [matches, total] = await Promise.all([
      prisma.card.findMany({
        where,
        select: { name: true },
        distinct: ['name'],
        orderBy: { name: 'asc' },
        take: MAX_RESULTS,
      }),
      prisma.card.count({ where }),
    ]);

    return NextResponse.json({
      data: matches.map((match) => match.name),
      total,
    });
  } catch (error) {
    return serverError(error);
  }
}
