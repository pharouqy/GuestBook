'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({
  className = '',
}: {
  className?: string;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const saved = window.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist choice
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
    console.log('[ThemeToggle] useEffect: theme set to', theme, 'classList:', document.documentElement.classList);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('[ThemeToggle] toggleTheme: changing from', prev, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${className}`}
      aria-label="Basculer entre le mode clair et sombre"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}