import { NextRequest, NextResponse } from 'next/server';
import { badRequest, serverError } from '@/lib/api/errors';
import prisma from '@/lib/prisma';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

function parseLimit(param: string | null) {
  const parsed = Number(param);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return badRequest('Query parameter "q" must be at least 2 characters.');
    }

    const limit = parseLimit(searchParams.get('limit'));

    const results = await prisma.card.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      select: { id: true, cardId: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });

    return NextResponse.json({ data: results, total: results.length });
  } catch (error) {
    return serverError(error);
  }
}
