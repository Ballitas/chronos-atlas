import { resolveTheme } from '@/lib/themes';

interface ArchivalPlateInput {
  plateCode: string;
  title: string;
  caption: string;
  category: string;
  topicTitle: string;
  region: string;
  era: string;
  themeKey: string;
  motif: string;
  viewerUsername: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildMotifArtwork(motif: string, accent: string, textPrimary: string, border: string): string {
  switch (motif) {
    case 'pyramid':
      return `
        <g opacity="0.92">
          <polygon points="220,330 340,115 460,330" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="2.5"/>
          <polygon points="390,330 495,145 600,330" fill="${accent}" fill-opacity="0.16" stroke="${textPrimary}" stroke-width="1.8"/>
          <polygon points="120,330 190,195 260,330" fill="${accent}" fill-opacity="0.14" stroke="${border}" stroke-width="1.6"/>
          <line x1="80" y1="330" x2="720" y2="330" stroke="${accent}" stroke-width="1.5" stroke-dasharray="6 4"/>
          <circle cx="590" cy="120" r="34" fill="none" stroke="${accent}" stroke-width="1.8" stroke-dasharray="4 4"/>
          <circle cx="590" cy="120" r="14" fill="${accent}" fill-opacity="0.5"/>
        </g>`;
    case 'temple':
    case 'facade':
    case 'monastery':
      return `
        <g opacity="0.92">
          <rect x="200" y="295" width="400" height="35" fill="${accent}" fill-opacity="0.2" stroke="${accent}" stroke-width="2"/>
          <rect x="245" y="210" width="310" height="85" fill="none" stroke="${textPrimary}" stroke-width="2"/>
          <line x1="285" y1="210" x2="285" y2="295" stroke="${accent}" stroke-width="3"/>
          <line x1="340" y1="210" x2="340" y2="295" stroke="${accent}" stroke-width="3"/>
          <line x1="460" y1="210" x2="460" y2="295" stroke="${accent}" stroke-width="3"/>
          <line x1="515" y1="210" x2="515" y2="295" stroke="${accent}" stroke-width="3"/>
          <polygon points="225,210 400,120 575,210" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="2.2"/>
          <polygon points="355,155 400,95 445,155" fill="${accent}" fill-opacity="0.32" stroke="${textPrimary}" stroke-width="1.5"/>
          <rect x="372" y="235" width="56" height="60" fill="${accent}" fill-opacity="0.25" stroke="${accent}" stroke-width="1.8"/>
        </g>`;
    case 'atoll':
    case 'lagoon':
    case 'voyage':
      return `
        <g opacity="0.9">
          <ellipse cx="400" cy="235" rx="220" ry="95" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="8 5"/>
          <ellipse cx="400" cy="235" rx="155" ry="62" fill="${accent}" fill-opacity="0.14" stroke="${textPrimary}" stroke-width="1.8"/>
          <ellipse cx="400" cy="235" rx="85" ry="34" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="2"/>
          <path d="M120 290 Q 200 265 280 290 T 440 290 T 600 290 T 700 290" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>
          <path d="M120 315 Q 200 290 280 315 T 440 315 T 600 315 T 700 315" fill="none" stroke="${textPrimary}" stroke-width="1.2" opacity="0.5"/>
          <line x1="400" y1="95" x2="400" y2="345" stroke="${border}" stroke-width="1" stroke-dasharray="4 4"/>
          <line x1="150" y1="235" x2="650" y2="235" stroke="${border}" stroke-width="1" stroke-dasharray="4 4"/>
        </g>`;
    case 'coinage':
    case 'seal':
      return `
        <g opacity="0.92">
          <circle cx="320" cy="225" r="88" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="3"/>
          <circle cx="320" cy="225" r="70" fill="none" stroke="${textPrimary}" stroke-width="1.4" stroke-dasharray="5 4"/>
          <polygon points="320,175 335,212 374,212 342,235 354,272 320,248 286,272 298,235 266,212 305,212" fill="${accent}" fill-opacity="0.35" stroke="${accent}" stroke-width="1.8"/>
          <circle cx="515" cy="235" r="64" fill="${accent}" fill-opacity="0.12" stroke="${textPrimary}" stroke-width="2"/>
          <circle cx="515" cy="235" r="46" fill="none" stroke="${accent}" stroke-width="1.5"/>
          <rect x="493" y="213" width="44" height="44" transform="rotate(45 515 235)" fill="none" stroke="${accent}" stroke-width="1.8"/>
        </g>`;
    case 'mountain':
    case 'volcanic':
      return `
        <g opacity="0.92">
          <path d="M90 330 L240 165 L350 250 L455 110 L590 275 L710 330 Z" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="2.4"/>
          <path d="M240 165 L275 220 L210 220 Z" fill="${textPrimary}" fill-opacity="0.22"/>
          <path d="M455 110 L495 175 L415 175 Z" fill="${textPrimary}" fill-opacity="0.28"/>
          <line x1="90" y1="330" x2="710" y2="330" stroke="${textPrimary}" stroke-width="1.5"/>
          <line x1="90" y1="275" x2="710" y2="275" stroke="${border}" stroke-width="1" stroke-dasharray="4 6"/>
          <line x1="90" y1="220" x2="710" y2="220" stroke="${border}" stroke-width="1" stroke-dasharray="4 6"/>
        </g>`;
    case 'botanical':
      return `
        <g opacity="0.92">
          <path d="M400 330 L400 225" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
          <path d="M400 245 L335 190 M400 245 L465 190 M400 230 L365 175 M400 230 L435 175 M400 225 L400 170" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="400" cy="162" rx="155" ry="44" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="2.5"/>
          <ellipse cx="400" cy="154" rx="115" ry="26" fill="${textPrimary}" fill-opacity="0.12" stroke="${textPrimary}" stroke-width="1.3"/>
          <line x1="180" y1="330" x2="620" y2="330" stroke="${border}" stroke-width="1.5" stroke-dasharray="6 4"/>
        </g>`;
    default:
      return `
        <g opacity="0.9">
          <rect x="150" y="115" width="500" height="215" rx="8" fill="${accent}" fill-opacity="0.09" stroke="${accent}" stroke-width="2"/>
          <circle cx="400" cy="222" r="78" fill="none" stroke="${accent}" stroke-width="2.2"/>
          <circle cx="400" cy="222" r="54" fill="${accent}" fill-opacity="0.18" stroke="${textPrimary}" stroke-width="1.4" stroke-dasharray="4 4"/>
          <line x1="170" y1="222" x2="630" y2="222" stroke="${border}" stroke-width="1.2"/>
          <line x1="400" y1="125" x2="400" y2="320" stroke="${border}" stroke-width="1.2"/>
          <polygon points="400,152 414,222 400,292 386,222" fill="${accent}" fill-opacity="0.45"/>
          <polygon points="330,222 400,208 470,222 400,236" fill="${textPrimary}" fill-opacity="0.3"/>
        </g>`;
  }
}

/**
 * Generates an authenticated archival SVG museum plate strictly on the server
 * (outside /public) so direct unauthenticated URL access is impossible.
 */
export function renderProtectedArchivalSvg(input: ArchivalPlateInput): string {
  const theme = resolveTheme(input.themeKey);
  const bg = theme.bgPrimary;
  const surface = theme.bgSurface;
  const text = theme.textPrimary;
  const muted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.border;

  const artwork = buildMotifArtwork(input.motif, accent, text, border);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${border}" stroke-width="0.6" opacity="0.45"/>
    </pattern>
    <linearGradient id="headerBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${surface}" stop-opacity="0.95"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="${bg}"/>
  <rect width="800" height="500" fill="url(#grid)"/>

  <!-- Archival double frame -->
  <rect x="18" y="18" width="764" height="464" rx="10" fill="none" stroke="${border}" stroke-width="2"/>
  <rect x="26" y="26" width="748" height="448" rx="6" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="6 4" opacity="0.7"/>

  <!-- Top Archive Metadata Strip -->
  <rect x="34" y="34" width="732" height="50" rx="4" fill="url(#headerBar)" stroke="${border}" stroke-width="1"/>
  <text x="50" y="57" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="${accent}" letter-spacing="2">
    PROTECTED ARCHIVE · PLATE ${escapeXml(input.plateCode)}
  </text>
  <text x="50" y="75" font-family="system-ui, sans-serif" font-size="11" fill="${muted}">
    ${escapeXml(input.category.toUpperCase())} · ${escapeXml(input.region)} · ${escapeXml(input.era)}
  </text>
  <text x="750" y="64" text-anchor="end" font-family="monospace" font-size="11" fill="${text}" opacity="0.85">
    AUTHORIZED: @${escapeXml(input.viewerUsername)}
  </text>

  <!-- Central Thematic Artwork -->
  ${artwork}

  <!-- Bottom Caption Plaque -->
  <rect x="34" y="366" width="732" height="100" rx="6" fill="${surface}" stroke="${border}" stroke-width="1.2"/>
  <text x="54" y="394" font-family="Georgia, serif" font-size="19" font-weight="bold" fill="${text}">
    ${escapeXml(input.title)}
  </text>
  <text x="54" y="418" font-family="system-ui, sans-serif" font-size="12.5" fill="${muted}">
    ${escapeXml(input.caption.slice(0, 108))}
  </text>
  <text x="54" y="446" font-family="monospace" font-size="11" fill="${accent}">
    SUBJECT: ${escapeXml(input.topicTitle)} · THEME: ${escapeXml(input.themeKey)}
  </text>
  <text x="748" y="446" text-anchor="end" font-family="monospace" font-size="10.5" fill="${muted}">
    JWT-PROTECTED MEDIA STREAM
  </text>
</svg>`;
}
