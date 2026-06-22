/**
 * FNS Design System — Dark only (mirrors the Chrome extension)
 *
 * Used for native props that can't use NativeWind className:
 *   - ActivityIndicator color
 *   - Switch trackColor / thumbColor
 *   - RefreshControl tintColor
 *   - placeholderTextColor
 *   - TextInput selectionColor
 *
 * For everything else, use className with the Tailwind tokens defined in global.css.
 */

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg: '#0a0a0b', // page / screen background      → bg-bg
  surface: '#111113', // card / input surface           → bg-surface
  surface2: '#161618', // nested surface (badge bg etc.) → bg-surface2

  // ── Borders ──────────────────────────────────────────────────────────────
  border: '#1e1e22', // default border                 → border-border

  // ── Status ───────────────────────────────────────────────────────────────
  safe: '#22c55e', // CLEAR signal (green)           → text-safe / bg-safe
  blocked: '#f59e0b', // BLOCKED signal (amber)         → text-blocked / bg-blocked
  urgent: '#ef4444', // error / high-impact (red)      → text-urgent / bg-urgent
  accent: '#fbbf24', // brand accent (yellow-gold)     → text-accent / bg-accent

  // ── Text ─────────────────────────────────────────────────────────────────
  text: '#e8e8ed', // primary text                   → text-text
  dim: '#6b6b7a', // secondary / muted text         → text-dim
  faint: '#3a3a44', // tertiary / disabled text       → text-faint
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Opacity variants — used for transparent overlays where Tailwind
 * arbitrary values aren't convenient.
 *
 * e.g.  backgroundColor: alpha(colors.accent, 0.1)
 */
export function alpha(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Status-specific colour sets — convenient for dynamic styling
 * where you branch on safe/blocked/urgent.
 */
export const statusColors = {
  safe: {
    bg: alpha(colors.safe, 0.1),
    border: alpha(colors.safe, 0.3),
    text: colors.safe,
    dot: colors.safe,
  },
  blocked: {
    bg: alpha(colors.blocked, 0.1),
    border: alpha(colors.blocked, 0.3),
    text: colors.blocked,
    dot: colors.blocked,
  },
  urgent: {
    bg: alpha(colors.urgent, 0.1),
    border: alpha(colors.urgent, 0.2),
    text: colors.urgent,
    dot: colors.urgent,
  },
  neutral: {
    bg: colors.surface,
    border: colors.border,
    text: colors.dim,
    dot: colors.dim,
  },
} as const;

/**
 * Font family strings — keep in sync with the names passed to useFonts()
 * in app/_layout.tsx. Used when fontFamily must be passed as a style prop
 * (e.g. inside Animated.Text, or third-party components that don't accept className).
 */
export const fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  bold: 'JetBrainsMono_700Bold',
  extraBold: 'JetBrainsMono_800ExtraBold',
} as const;
