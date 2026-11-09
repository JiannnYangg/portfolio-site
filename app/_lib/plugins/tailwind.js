import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export const tailwindPlugin = plugin(
  //? Add CSS variable definitions to the base layer
  function ({ addBase }) {
    addBase({
      ':root': {
        '--background': '0 0% 100%',
        '--foreground': '20 35% 9%',
        '--card': '0 0% 100%',
        '--card-foreground': '20 35% 9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '20 35% 9%',
        '--primary': '19 84% 53%',
        '--primary-foreground': '27 88% 55%',
        '--secondary': '34 32% 88%',
        '--secondary-foreground': '28 18% 52%',
        '--muted': '36 45% 94%',
        '--muted-foreground': '24 14% 36%',
        '--accent': '36 45% 94%',
        '--accent-foreground': '28 18% 52%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '32 30% 85%',
        '--input': '32 30% 85%',
        '--ring': '19 84% 53%',
        '--radius': '0.5rem',
      },
    });
  },
  //? Extend the Tailwind theme with 'themable' utilities
  {
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      extend: {
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        keyframes: {
          'accordion-down': {
            from: { height: 0 },
            to: { height: 'var(--radix-accordion-content-height)' },
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: 0 },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
        },
        fontFamily: {
          neue_montreal: ['var(--font-neue-montreal)'],
        },
        transitionDuration: {
          1500: '1500ms',
          2000: '2000ms',
          2500: '2500ms',
          3000: '3000ms',
        },
        transitionTimingFunction: {
          'in-expo': 'cubic-bezier(0.1, 0, 0.3, 1)',
        },
      },
    },
  },
);
