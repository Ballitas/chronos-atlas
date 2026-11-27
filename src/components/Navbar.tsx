'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Bookmark,
  Shield,
  Feather,
  User,
  LogOut,
  LogIn,
  Laptop,
  Mail,
  Palette,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-400 border-red-500/40',
  INVESTIGATOR: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  STANDARD_USER: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
};

export function Navbar() {
  const { user, activeDeviceCount, maxConcurrentSessions, logout, authNotice, clearAuthNotice } =
    useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.push('/');
  };

  const navLinkClass = (href: string) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      pathname === href || (href !== '/' && pathname.startsWith(href))
        ? 'bg-theme-accentSoft text-theme-accent border border-theme-border'
        : 'text-theme-muted hover:text-theme-text hover:bg-theme-elevated'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-theme-border bg-theme-surface/90 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-theme-accent text-theme-accentFg flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <Compass className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-base tracking-wide text-theme-text block">
                  Chronos Atlas
                </span>
                <span className="text-[10px] uppercase tracking-widest text-theme-muted hidden sm:block">
                  Thematic Research Archive
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-theme-border bg-theme-elevated text-[11px] text-theme-muted max-w-[240px] truncate">
              <Palette className="w-3.5 h-3.5 text-theme-accent shrink-0" />
              <span className="truncate">{theme.label}</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className={navLinkClass('/')}>
              <Compass className="w-4 h-4" /> Explore (20)
            </Link>
            {user && (
              <Link href="/saved" className={navLinkClass('/saved')}>
                <Bookmark className="w-4 h-4" /> Saved
              </Link>
            )}
            {user && (user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
              <Link href="/investigator" className={navLinkClass('/investigator')}>
                <Feather className="w-4 h-4" /> Investigator
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link href="/admin" className={navLinkClass('/admin')}>
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <Link href="/mail-sandbox" className={navLinkClass('/mail-sandbox')} title="Simulated Email Inbox for Password Recovery Testing">
              <Mail className="w-4 h-4" /> Inbox
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-border bg-theme-elevated hover:border-theme-accent transition"
                >
                  <User className="w-4 h-4 text-theme-accent" />
                  <span className="text-xs font-semibold text-theme-text max-w-[110px] truncate">
                    @{user.username}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      ROLE_BADGE_STYLES[user.role] || ''
                    }`}
                  >
                    {user.role === 'STANDARD_USER' ? 'USER' : user.role}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-theme-muted pl-1 border-l border-theme-border"
                    title="Active concurrent devices"
                  >
                    <Laptop className="w-3 h-3" />
                    {activeDeviceCount}/{maxConcurrentSessions}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme-border text-xs font-semibold text-theme-muted hover:text-red-400 hover:border-red-400/50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-theme-text hover:bg-theme-elevated transition"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-theme-accent text-theme-accentFg hover:opacity-90 transition shadow-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg border border-theme-border text-theme-text"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-theme-border bg-theme-surface px-4 py-4 space-y-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className={`block ${navLinkClass('/')}`}>
              <Compass className="w-4 h-4" /> Explore Topics
            </Link>
            {user && (
              <Link href="/saved" onClick={() => setMobileOpen(false)} className={`block ${navLinkClass('/saved')}`}>
                <Bookmark className="w-4 h-4" /> Saved Favorites & Bookmarks
              </Link>
            )}
            {user && (user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
              <Link href="/investigator" onClick={() => setMobileOpen(false)} className={`block ${navLinkClass('/investigator')}`}>
                <Feather className="w-4 h-4" /> Investigator Studio
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className={`block ${navLinkClass('/admin')}`}>
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            )}
            <Link href="/mail-sandbox" onClick={() => setMobileOpen(false)} className={`block ${navLinkClass('/mail-sandbox')}`}>
              <Mail className="w-4 h-4" /> Recovery Mail Inbox
            </Link>
            <div className="pt-2 border-t border-theme-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg bg-theme-elevated text-sm font-medium text-theme-text flex items-center justify-between"
                  >
                    <span>@{user.username} ({user.role})</span>
                    <span className="text-xs font-mono text-theme-accent">
                      {activeDeviceCount}/{maxConcurrentSessions} devices
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm font-semibold text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg border border-theme-border text-sm font-semibold text-theme-text"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg bg-theme-accent text-theme-accentFg text-sm font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {authNotice && (
        <div className="bg-theme-accentSoft border-b border-theme-border px-4 py-2.5 text-center text-xs sm:text-sm text-theme-text flex items-center justify-center gap-3">
          <span>{authNotice}</span>
          <button
            onClick={clearAuthNotice}
            className="text-theme-accent underline font-semibold text-xs hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
