import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--color-background))',
  			foreground: 'hsl(var(--color-foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--color-card))',
  				foreground: 'hsl(var(--color-card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--color-popover))',
  				foreground: 'hsl(var(--color-popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--color-primary))',
  				foreground: 'hsl(var(--color-primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--color-secondary))',
  				foreground: 'hsl(var(--color-secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--color-muted))',
  				foreground: 'hsl(var(--color-muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--color-accent))',
  				foreground: 'hsl(var(--color-accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--color-destructive))',
  				foreground: 'hsl(var(--color-destructive-foreground))'
  			},
  			border: 'hsl(var(--color-border))',
  			input: 'hsl(var(--color-input))',
  			ring: 'hsl(var(--color-ring))',
  			chart: {
  				'1': 'hsl(var(--color-chart-1))',
  				'2': 'hsl(var(--color-chart-2))',
  				'3': 'hsl(var(--color-chart-3))',
  				'4': 'hsl(var(--color-chart-4))',
  				'5': 'hsl(var(--color-chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease',
        'bounce-slow': 'bounce-slow 1.4s infinite',
        'loading-bar': 'loading-bar 1.2s cubic-bezier(0.4,0,0.2,1) infinite',
      },
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
