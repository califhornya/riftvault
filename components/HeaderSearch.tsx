'use client';

import { useSearchParams } from 'next/navigation';
import { SearchBar } from './SearchBar';

export function HeaderSearch() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') ?? '';

  return <SearchBar initialQuery={q} placeholder="Search cards" />;
}
