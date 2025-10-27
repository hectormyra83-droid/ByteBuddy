/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(220 13% 18%)', // Darker, less saturated border
        input: 'hsl(220 13% 18%)',
        ring: 'hsl(260 100% 70%)', // Vibrant purple for rings
        background: 'hsl(222 47% 11%)', // Deep navy background
        foreground: 'hsl(210 40% 98%)',
        primary: {
          DEFAULT: 'hsl(220 90% 60%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(220 14% 20%)', // Slightly lighter bg for elements
          foreground: 'hsl(210 40% 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 63% 31%)',
          foreground: 'hsl(0 86% 97%)',
        },
        muted: {
          DEFAULT: 'hsl(220 14% 20%)',
          foreground: 'hsl(220 9% 65%)',
        },
        accent: {
          DEFAULT: 'hsl(260 100% 70%)', // Vibrant purple
          foreground: 'hsl(210 40% 98%)',
        },
        card: {
          DEFAULT: 'hsl(222 47% 14%)', // Card bg slightly lighter than main bg
          foreground: 'hsl(210 40% 98%)',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
      keyframes: {
        typing: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        "aurora": {
          "from": {
            "background-position": "50% 50%, 50% 50%"
          },
          "to": {
            "background-position": "350% 50%, 350% 50%"
          }
        },
        "fadeInUp": {
          "from": {
            "opacity": "0",
            "transform": "translateY(10px)"
          },
          "to": {
            "opacity": "1",
            "transform": "translateY(0)"
          }
        }
      },
      animation: {
        'typing-1': 'typing 0.8s ease-in-out infinite',
        'typing-2': 'typing 0.8s ease-in-out 0.1s infinite',
        'typing-3': 'typing 0.8s ease-in-out 0.2s infinite',
        "aurora": "aurora 60s linear infinite",
        "fade-in-up": "fadeInUp 0.4s ease-out forwards"
      },
       boxShadow: {
        'glow-primary': '0 0 20px hsl(220 90% 60% / 0.4)',
        'glow-accent': '0 0 20px hsl(260 100% 70% / 0.4)',
      }
    },
  },
  plugins: [],
}
