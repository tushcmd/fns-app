/**
 * FNS Design System — Dark only
 *
 * ALL color and font styling must use these constants + inline styles.
 * NativeWind is used ONLY for layout (flex, padding, margin, gap, border-radius, dimensions).
 * Never use NativeWind color/font className tokens — they are unreliable in NativeWind v5 preview.
 */

export const colors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg: '#0a0a0b',
  surface: '#111113',
  surface2: '#161618',

  // ── Borders ──────────────────────────────────────────────────────────────
  border: '#1e1e22',

  // ── Status ───────────────────────────────────────────────────────────────
  safe: '#22c55e',
  blocked: '#f59e0b',
  urgent: '#ef4444',
  accent: '#fbbf24',

  // ── Text ─────────────────────────────────────────────────────────────────
  text: '#e8e8ed',
  dim: '#6b6b7a',
  faint: '#3a3a44',
} as const;

export type ColorKey = keyof typeof colors;

export function alpha(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

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

export const fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  bold: 'JetBrainsMono_700Bold',
  extraBold: 'JetBrainsMono_800ExtraBold',
} as const;
