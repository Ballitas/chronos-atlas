'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Bookmark,
  Shield,
  Feather,
  LogOut,
  Laptop,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';

const ROLE_DOT: Record<string, string> = {
  ADMIN: 'bg-rose-400',
  INVESTIGATOR: 'bg-amber-400',
  STANDARD_USER: 'bg-sky-400',
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

  const navLinkClass = (href: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
      active
        ? 'bg-theme-elevated text-theme-text shadow-sm ring-1 ring-inset ring-theme-border'
        : 'text-theme-muted hover:text-theme-text'
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-theme-border/80 glass-nav transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Minimalist Brand + Live Theme Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-7 h-7 rounded-lg bg-theme-accent text-theme-accentFg flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-semibold text-[14px] tracking-tight text-theme-text">
                Chronos Atlas
              </span>
            </Link>

            <span className="hidden lg:inline-block h-3.5 w-px bg-theme-border" />

            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-theme-muted max-w-[220px] truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-colors duration-300"
                style={{ backgroundColor: theme.accent }}
              />
              <span className="truncate">{theme.label}</span>
            </div>
          </div>

          {/* Center Segmented Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            <Link href="/" className={navLinkClass('/')}>
              Archive
            </Link>
            {user && (
              <Link href="/saved" className={navLinkClass('/saved')}>
                Saved
              </Link>
            )}
            {user && (user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
              <Link href="/investigator" className={navLinkClass('/investigator')}>
                Investigator
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link href="/admin" className={navLinkClass('/admin')}>
                Admin
              </Link>
            )}
            <Link
              href="/mail-sandbox"
              className={navLinkClass('/mail-sandbox')}
              title="Simulated Recovery Email Inbox"
            >
              Inbox
            </Link>
          </nav>

          {/* Right Auth Pill */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-theme-border bg-theme-surface/80 hover:border-theme-accent/60 transition text-[12px]"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT[user.role] || 'bg-theme-accent'}`} />
                  <span className="font-medium text-theme-text max-w-[100px] truncate">
                    @{user.username}
                  </span>
                  <span className="text-[10px] font-mono text-theme-muted pl-1.5 border-l border-theme-border inline-flex items-center gap-1">
                    <Laptop className="w-3 h-3" />
                    {activeDeviceCount}/{maxConcurrentSessions}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-theme-muted hover:text-rose-400 hover:bg-theme-elevated transition"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-full text-[13px] font-medium text-theme-muted hover:text-theme-text transition"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-theme-text text-theme-bg hover:opacity-90 transition shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-elevated transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-theme-border bg-theme-surface/95 backdrop-blur-xl px-4 py-4 space-y-1.5">
            <Link href="/" onClick={() => setMobileOpen(false)} className={`flex ${navLinkClass('/')}`}>
              <Compass className="w-4 h-4" /> Archive (20)
            </Link>
            {user && (
              <Link href="/saved" onClick={() => setMobileOpen(false)} className={`flex ${navLinkClass('/saved')}`}>
                <Bookmark className="w-4 h-4" /> Saved Library
              </Link>
            )}
            {user && (user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
              <Link href="/investigator" onClick={() => setMobileOpen(false)} className={`flex ${navLinkClass('/investigator')}`}>
                <Feather className="w-4 h-4" /> Investigator Studio
              </Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className={`flex ${navLinkClass('/admin')}`}>
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            )}
            <Link href="/mail-sandbox" onClick={() => setMobileOpen(false)} className={`flex ${navLinkClass('/mail-sandbox')}`}>
              <Mail className="w-4 h-4" /> Mail Inbox
            </Link>
            <div className="pt-3 mt-2 border-t border-theme-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-theme-elevated text-xs font-medium text-theme-text flex items-center justify-between"
                  >
                    <span>@{user.username} · {user.role}</span>
                    <span className="font-mono text-theme-accent">
                      {activeDeviceCount}/{maxConcurrentSessions} devices
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-semibold text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-full border border-theme-border text-xs font-semibold text-theme-text"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-full bg-theme-text text-theme-bg text-xs font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {authNotice && (
        <div className="bg-theme-accentSoft border-b border-theme-border px-4 py-2 text-center text-xs text-theme-text flex items-center justify-center gap-3">
          <span>{authNotice}</span>
          <button
            onClick={clearAuthNotice}
            className="text-theme-accent underline font-medium text-xs hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
