'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Suggestion = { id: number; name: string };

type SearchBarProps = {
  initialQuery?: string;
  placeholder?: string;
};

export function SearchBar({ initialQuery = '', placeholder = 'Search cards' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/cards/autocomplete?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Autocomplete failed');
        }
        const json = (await res.json()) as { data?: Suggestion[] };
        setSuggestions(json.data ?? []);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError('Could not load suggestions');
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const existingParams = useMemo(() => new URLSearchParams(searchParams?.toString() ?? ''), [searchParams]);

  const submit = (value: string) => {
    const params = new URLSearchParams(existingParams);
    if (value.trim().length > 0) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    const queryString = params.toString();
    router.push(`${pathname}?${queryString}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(query);
    setOpen(false);
  };

  const handleSuggestion = (name: string) => {
    setQuery(name);
    submit(name);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="input"
          onFocus={() => setOpen(true)}
        />
        <button type="submit" className="btn" aria-label="Search">Search</button>
      </form>
      {open && (suggestions.length > 0 || loading || error) && (
        <div className="suggestion-panel">
          {loading && <div className="muted">Loading suggestions...</div>}
          {error && <div style={{ color: '#fcd34d' }}>{error}</div>}
          {!loading && !error && suggestions.length === 0 && <div className="muted">No suggestions yet</div>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button type="button" className="suggestion-item" onClick={() => handleSuggestion(suggestion.name)}>
                  {suggestion.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
