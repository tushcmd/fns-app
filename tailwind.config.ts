import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        mono: "'JetBrainsMono_400Regular', ui-monospace, monospace",
        'mono-medium': "'JetBrainsMono_500Medium', ui-monospace, monospace",
        'mono-bold': "'JetBrainsMono_700Bold', ui-monospace, monospace",
        'mono-extrabold': "'JetBrainsMono_800ExtraBold', ui-monospace, monospace",
      },
      letterSpacing: {
        widest: '0.2em',
        wider: '0.1em',
        wide: '0.05em',
      },
    },
  },
  plugins: [],
} satisfies Config;
