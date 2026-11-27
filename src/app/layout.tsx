import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Chronos Atlas — Thematic Historical & Geopolitical Investigation Platform',
  description:
    'Explore 20 historical civilizations and unique geographical states with dynamic visual theming, JWT authentication, 2-device concurrent session control, protected archival media, and RBAC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="default">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen selection:bg-theme-accent/30 selection:text-theme-text">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-theme-border/70 mt-24">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-theme-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-theme-accent" />
                  <span className="font-semibold text-theme-text tracking-tight">Chronos Atlas</span>
                  <span className="opacity-50">·</span>
                  <span>Thematic Research Archive</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 opacity-80">
                  <span>20 Dynamic Themes</span>
                  <span className="opacity-40">/</span>
                  <span>JWT · Max 2 Devices</span>
                  <span className="opacity-40">/</span>
                  <span>RBAC &amp; Protected Media</span>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
