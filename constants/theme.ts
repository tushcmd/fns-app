/**
 * FNS Design System
 *
 * ALL color and font styling must use these constants + inline styles.
 * NativeWind is used ONLY for layout (flex, padding, margin, gap, border-radius, dimensions).
 * Never use NativeWind color/font className tokens — they are unreliable in NativeWind v5 preview.
 */

export const darkColors = {
  bg: '#0a0a0b',
  surface: '#111113',
  surface2: '#161618',
  border: '#1e1e22',
  safe: '#22c55e',
  blocked: '#f59e0b',
  urgent: '#ef4444',
  accent: '#fbbf24',
  text: '#e8e8ed',
  dim: '#6b6b7a',
  faint: '#3a3a44',
} as const;

export const lightColors = {
  bg: '#f5f5f7',
  surface: '#ffffff',
  surface2: '#f0f0f2',
  border: '#e0e0e4',
  safe: '#16a34a',
  blocked: '#d97706',
  urgent: '#dc2626',
  accent: '#ca8a04',
  text: '#1a1a1e',
  dim: '#6b6b7a',
  faint: '#a0a0aa',
} as const;

export type ColorTheme = typeof darkColors;
export type ColorKey = keyof ColorTheme;

export function alpha(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export const fonts = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  bold: 'JetBrainsMono_700Bold',
  extraBold: 'JetBrainsMono_800ExtraBold',
} as const;
