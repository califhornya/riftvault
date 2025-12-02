import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { formatCard } from '@/lib/api/formatCard';
import { badRequest, serverError } from '@/lib/api/errors';
import prisma from '@/lib/prisma';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;

function parsePagination(searchParams: URLSearchParams) {
  const limitParam = searchParams.get('limit');
  const pageParam = searchParams.get('page');

  const limitValue = limitParam ? Number(limitParam) : DEFAULT_LIMIT;
  const pageValue = pageParam ? Number(pageParam) : DEFAULT_PAGE;

  if (!Number.isFinite(limitValue) || limitValue < 1) {
    return { error: badRequest('Invalid limit parameter') } as const;
  }

  if (!Number.isFinite(pageValue) || pageValue < 1) {
    return { error: badRequest('Invalid page parameter') } as const;
  }

  const limit = Math.min(limitValue, MAX_LIMIT);
  const page = Math.floor(pageValue);
  const skip = (page - 1) * limit;

  return { limit, page, skip } as const;
}

function buildFilters(searchParams: URLSearchParams) {
  const q = searchParams.get('q')?.trim();
  const faction = searchParams.get('faction')?.trim();
  const rarity = searchParams.get('rarity')?.trim();
  const type = searchParams.get('type')?.trim();
  const costParam = searchParams.get('cost');

  const where: Prisma.CardWhereInput = {};
  const andFilters: Prisma.CardWhereInput[] = [];

  if (q && q.length > 0) {
    andFilters.push({
      OR: [
        { name: { contains: q } },
        { rulesText: { contains: q } },
      ],
    });
  }

  if (faction && faction.length > 0) {
    andFilters.push({
      OR: [
        { faction: { name: faction } },
        { domain: { equals: faction } },
      ],
    });
  }

  if (rarity && rarity.length > 0) {
    andFilters.push({
      variants: {
        some: { rarity: { name: rarity } },
      },
    });
  }

  if (type && type.length > 0) {
    andFilters.push({ type: { contains: type } });
  }

  if (costParam !== null) {
    const parsedCost = Number(costParam);
    if (!Number.isFinite(parsedCost) || parsedCost < 0) {
      return { error: badRequest('Invalid cost parameter') } as const;
    }

    andFilters.push({
      OR: [{ costEnergy: parsedCost }, { costPower: parsedCost }],
    });
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  return { where } as const;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pagination = parsePagination(searchParams);
  if ('error' in pagination) {
    return pagination.error;
  }

  const filters = buildFilters(searchParams);
  if ('error' in filters) {
    return filters.error;
  }

  try {
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: filters.where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { id: 'asc' },
        include: {
          set: true,
          faction: true,
          variants: { include: { rarity: true }, orderBy: { variantId: 'asc' } },
        },
      }),
      prisma.card.count({ where: filters.where }),
    ]);

    return NextResponse.json({
      data: cards.map(formatCard),
      page: pagination.page,
      limit: pagination.limit,
      total,
    });
  } catch (error) {
    return serverError(error);
  }
}
