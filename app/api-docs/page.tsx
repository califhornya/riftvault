import Link from 'next/link';

const baseUrl = '/api';

const codeBlock = (content: string) => (
  <pre
    style={{
      whiteSpace: 'pre-wrap',
      background: '#0b1224',
      borderRadius: '10px',
      padding: '1rem',
      fontSize: '0.95rem',
      color: '#e2e8f0',
      border: '1px solid #1f2937',
    }}
  >
    <code>{content}</code>
  </pre>
);

export default function ApiDocsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Riftvault API</h1>
        <p className="muted">Endpoints for retrieving cards, sets, and autocomplete suggestions.</p>
      </header>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Cards</h2>
        <p className="muted">Search and paginate through cards with text search and filters.</p>
        {codeBlock(`GET ${baseUrl}/cards?q=vi&faction=Fury&rarity=Showcase&type=Champion&cost=2&page=1&limit=20`)}
        <p className="muted">Response</p>
        {codeBlock(`{
  "data": [
    {
      "id": 1,
      "cardId": "ARC-001",
      "name": "Vi Destructive",
      "typeLine": "Champion",
      "text": "...rules text...",
      "cost": { "energy": 2, "power": 1 },
      "might": 3,
      "faction": "Fury",
      "rarity": "Showcase",
      "set": { "id": 1, "code": "ARC", "name": "Arcane Box Set" },
      "imageUrl": "/cards/ARC/ARC-001.webp",
      "variants": [
        { "id": 1, "variantId": "ARC-001", "rarity": "Showcase" }
      ]
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 347
}`)}
      </section>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Card detail</h2>
        <p className="muted">Fetch a single card by its cardId or numeric id.</p>
        {codeBlock(`GET ${baseUrl}/cards/ARC-001`)}
        <p className="muted">Response</p>
        {codeBlock(`{ "data": { /* same shape as cards list */ } }`)}
      </section>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Autocomplete</h2>
        <p className="muted">Retrieve up to twenty matching card names for live suggestions.</p>
        {codeBlock(`GET ${baseUrl}/search/autocomplete?q=storm`)}
        <p className="muted">Response</p>
        {codeBlock(`{ "data": [ { "id": 1, "cardId": "ARC-001", "name": "Storm Caller" } ], "total": 1 }`)}
      </section>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Sets</h2>
        <p className="muted">List sets or fetch cards within a single set.</p>
        {codeBlock(`GET ${baseUrl}/sets`)}
        <p className="muted">Single set with cards</p>
        {codeBlock(`GET ${baseUrl}/sets/{code}?page=1&limit=20`)}
        <p className="muted">Set response</p>
        {codeBlock(`{
  "data": [/* cards */],
  "page": 1,
  "limit": 20,
  "total": 50,
  "set": { "id": 3, "code": "ARC", "name": "Arcane Box Set", "cardCount": 50 }
}`)}
      </section>

      <div className="muted" style={{ fontSize: '0.95rem' }}>
        Ready to explore? <Link href="/" className="nav-link">Start searching</Link> or <Link href="/sets" className="nav-link">browse sets</Link>.
      </div>
    </div>
  );
}
