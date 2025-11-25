import { useEffect } from 'react';
import { useSettings } from '@/hooks/useEncryptedStorage';

const colorSchemes = {
  blue: {
    light: { primary: '221 83% 53%', ring: '221 83% 53%' },
    dark: { primary: '217 91% 60%', ring: '217 91% 60%' },
  },
  green: {
    light: { primary: '142 76% 36%', ring: '142 76% 36%' },
    dark: { primary: '142 70% 45%', ring: '142 70% 45%' },
  },
  purple: {
    light: { primary: '262 83% 58%', ring: '262 83% 58%' },
    dark: { primary: '263 70% 65%', ring: '263 70% 65%' },
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

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const colors = colorSchemes[primaryColor]?.[theme] || colorSchemes.blue.light;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--ring', colors.ring);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.ring);
  }, [settings]);

  return <>{children}</>;
}
