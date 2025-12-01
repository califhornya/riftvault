import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

function parsePagination(searchParams: URLSearchParams) {
  const limitParam = Number(searchParams.get('limit'));
  const pageParam = Number(searchParams.get('page'));

  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : DEFAULT_LIMIT;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : DEFAULT_PAGE;
  const skip = (page - 1) * limit;

  return { limit, page, skip };
}

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const setCode = params.code;
  const { limit, page, skip } = parsePagination(request.nextUrl.searchParams);

  const set = await prisma.cardSet.findFirst({
    where: { code: { equals: setCode, mode: 'insensitive' } },
  });

  if (!set) {
    return NextResponse.json({ error: 'Set not found' }, { status: 404 });
  }

  const where = { setId: set.id } as const;

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
      include: { set: true },
    }),
    prisma.card.count({ where }),
  ]);

  return NextResponse.json({ data: cards, page, limit, total, set });
}
