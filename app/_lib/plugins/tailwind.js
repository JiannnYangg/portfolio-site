import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export const tailwindPlugin = plugin(
  //? Add CSS variable definitions to the base layer
  //? Palette: soft grey-beige paper, vermilion orange (#e24a28), pure neutral
  //? charcoal / grey ink. No brown anywhere: every neutral has a near-zero hue.
  function ({ addBase, addVariant }) {
    //? `wide:` = the roomy layout. Anything from a tablet up, plus a phone held
    //? sideways (at least 520px wide): there the hero is wider than it is
    //? tall, so it uses the side-by-side arrangement instead of the stacked
    //? portrait one. Same idea as `md:` everywhere else, with that one extra case.
    addVariant(
      'wide',
      '@media (min-width: 768px), (orientation: landscape) and (min-width: 520px)',
    );

    addBase({
      ':root': {
        '--background': '0 0% 100%',
        '--foreground': '20 4% 10%',
        '--card': '0 0% 100%',
        '--card-foreground': '20 4% 10%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '20 4% 10%',
        '--primary': '10 77% 52%',
        '--primary-foreground': '14 85% 58%',
        '--secondary': '45 9% 86%',
        '--secondary-foreground': '0 0% 45%',
        '--muted': '45 12% 92%',
        '--muted-foreground': '0 0% 30%',
        '--accent': '45 12% 92%',
        '--accent-foreground': '0 0% 45%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '0 0% 98%',
        '--border': '40 8% 80%',
        '--input': '40 8% 80%',
        '--ring': '10 77% 52%',
        '--radius': '0.5rem',
      },
    });
  },
  //? Extend the Tailwind theme with 'themable' utilities
  {
    theme: {
      container: {
        center: true,
        //? same token as the dashed page guides (globals.css), so content and
        //? guides always share one edge: 1rem on phones, 2rem from 640px up
        padding: 'var(--guide-inset, 2rem)',
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
