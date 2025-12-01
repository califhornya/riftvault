import './globals.css';
import Link from 'next/link';
import { HeaderSearch } from '@/components/HeaderSearch';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Riftvault',
  description: 'Explore Riftvault cards and sets.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="header-bar">
            <div className="brand-mark" aria-hidden />
            <Link href="/" className="brand-name">Riftvault</Link>
            <nav className="nav-links">
              <Link href="/" className="nav-link">Search</Link>
              <Link href="/sets" className="nav-link">Browse Sets</Link>
              <Link href="/?view=all" className="nav-link">All Cards</Link>
            </nav>
            <div style={{ marginLeft: 'auto', width: '100%', maxWidth: '460px' }}>
              <HeaderSearch />
            </div>
          </header>
          <main className="main-shell">
            {children}
          </main>
          <footer className="footer">Built for the Riftvault API.</footer>
        </div>
      </body>
    </html>
  );
}
