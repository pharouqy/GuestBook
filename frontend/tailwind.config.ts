import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cal-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: 'hsl(248, 100%, 97%)',
          100: 'hsl(248, 96%, 93%)',
          200: 'hsl(248, 94%, 85%)',
          300: 'hsl(248, 90%, 74%)',
          400: 'hsl(248, 85%, 62%)',
          500: 'hsl(248, 82%, 52%)',  // Couleur principale
          600: 'hsl(248, 78%, 44%)',
          700: 'hsl(248, 74%, 36%)',
          800: 'hsl(248, 68%, 30%)',
          900: 'hsl(248, 60%, 24%)',
          950: 'hsl(248, 50%, 15%)',
        },
        success: {
          50: 'hsl(142, 76%, 96%)',
          100: 'hsl(142, 72%, 91%)',
          200: 'hsl(142, 71%, 81%)',
          300: 'hsl(142, 69%, 68%)',
          400: 'hsl(142, 64%, 53%)',
          500: 'hsl(142, 71%, 45%)',
          600: 'hsl(142, 78%, 36%)',
          700: 'hsl(142, 76%, 29%)',
          800: 'hsl(142, 73%, 24%)',
          900: 'hsl(142, 70%, 20%)',
        },
        warning: {
          50: 'hsl(48, 100%, 96%)',
          100: 'hsl(48, 97%, 90%)',
          200: 'hsl(48, 95%, 80%)',
          300: 'hsl(48, 94%, 68%)',
          400: 'hsl(48, 95%, 53%)',
          500: 'hsl(38, 92%, 50%)',
          600: 'hsl(32, 98%, 44%)',
          700: 'hsl(25, 97%, 36%)',
          800: 'hsl(22, 93%, 29%)',
          900: 'hsl(20, 84%, 24%)',
        },
        accent: {
          50: 'hsl(280, 100%, 97%)',
          100: 'hsl(280, 95%, 93%)',
          200: 'hsl(280, 93%, 85%)',
          300: 'hsl(280, 89%, 74%)',
          400: 'hsl(280, 85%, 62%)',
          500: 'hsl(280, 81%, 52%)',
          600: 'hsl(280, 77%, 44%)',
          700: 'hsl(280, 73%, 36%)',
          800: 'hsl(280, 67%, 30%)',
          900: 'hsl(280, 59%, 24%)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
