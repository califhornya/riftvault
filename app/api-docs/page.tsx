import Link from 'next/link';

const baseUrl = '/api/v1';

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
        {codeBlock(`GET ${baseUrl}/cards?q=dragon&faction=arcane&rarity=rare&type=unit&page=1&limit=20`)}
        <p className="muted">Response</p>
        {codeBlock(`{
  "data": [
    {
      "id": 1,
      "name": "Storm Drake",
      "typeLine": "Unit — Dragon",
      "text": "Flying, ward",
      "faction": "Arcane",
      "rarity": "Rare",
      "set": { "id": 1, "code": "core", "name": "Core Set" }
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 120
}`)}
      </section>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Card detail</h2>
        <p className="muted">Fetch a single card by id.</p>
        {codeBlock(`GET ${baseUrl}/cards/42`)}
        <p className="muted">Response</p>
        {codeBlock(`{
  "data": {
    "id": 42,
    "name": "Blade Adept",
    "typeLine": "Unit — Warrior",
    "text": "First strike",
    "faction": "Valor",
    "rarity": "Uncommon",
    "set": { "id": 2, "code": "valor", "name": "Valor Rising" }
  }
}`)}
      </section>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Autocomplete</h2>
        <p className="muted">Retrieve up to ten matching card names for live suggestions.</p>
        {codeBlock(`GET ${baseUrl}/cards/autocomplete?q=storm`)}
        <p className="muted">Response</p>
        {codeBlock(`{
  "data": [
    { "id": 1, "name": "Storm Drake" },
    { "id": 8, "name": "Storm Herald" }
  ],
  "total": 2
}`)}
      </section>

      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Sets</h2>
        <p className="muted">List and browse individual sets.</p>
        {codeBlock(`GET ${baseUrl}/sets`)}
        <p className="muted">Single set with cards</p>
        {codeBlock(`GET ${baseUrl}/sets/{code}?page=1&limit=20`)}
        <p className="muted">Set response</p>
        {codeBlock(`{
  "data": [/* cards */],
  "page": 1,
  "limit": 20,
  "total": 50,
  "set": { "id": 3, "code": "arcane", "name": "Arcane Tempest", "cardCount": 50 }
}`)}
      </section>

      <div className="muted" style={{ fontSize: '0.95rem' }}>
        Ready to explore? <Link href="/" className="nav-link">Start searching</Link> or <Link href="/sets" className="nav-link">browse sets</Link>.
      </div>
    </div>
  );
}
