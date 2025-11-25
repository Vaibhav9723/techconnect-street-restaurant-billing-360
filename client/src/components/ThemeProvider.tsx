import { useEffect } from 'react';
import { useSettings } from '@/hooks/useEncryptedStorage';

// Convert hex to HSL
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '221 83% 53%';
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

const colorSchemes = {
  blue: {
    light: { primary: '221 83% 53%', ring: '221 83% 53%' },
    dark: { primary: '217 91% 60%', ring: '217 91% 60%' },
  },
  green: {
    light: { primary: '142 76% 36%', ring: '142 76% 36%' },
    dark: { primary: '142 70% 45%', ring: '142 70% 45%' },
  },
  yellow: {
    light: { primary: '51 100% 50%', ring: '51 100% 50%' },
    dark: { primary: '51 100% 60%', ring: '51 100% 60%' },
  },
  orange: {
    light: { primary: '27 87% 52%', ring: '27 87% 52%' },
    dark: { primary: '27 96% 61%', ring: '27 96% 61%' },
  },
  red: {
    light: { primary: '0 84% 48%', ring: '0 84% 48%' },
    dark: { primary: '0 72% 55%', ring: '0 72% 55%' },
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const theme = settings?.theme || 'light';
    const primaryColor = settings?.primaryColor || 'blue';
    const customColor = settings?.customColor;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    let colors;
    if (primaryColor === 'custom' && customColor) {
      const hsl = hexToHSL(customColor);
      colors = { primary: hsl, ring: hsl };
    } else {
      colors = colorSchemes[primaryColor as keyof typeof colorSchemes]?.[theme] || colorSchemes.blue.light;
    }
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--ring', colors.ring);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.ring);
  }, [settings]);

  return <>{children}</>;
}
