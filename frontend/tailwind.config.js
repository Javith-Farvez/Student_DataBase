/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vsb: {
          maroon:        '#6E0F0F',
          maroonDark:    '#4B0808',
          gold:          '#D49A17',
          goldLight:     '#F5E8CC',
          pageBg:        '#DED9D0',
          sectionBg:     '#E5E0D7',
          cardBg:        '#F1EDE5',
          inputBg:       '#EAE5DC',
          headerBg:      '#F1EDE5',
          headingText:   '#5B0B0B',
          primaryText:   '#242424',
          secondaryText: '#4F4A45',
          mutedText:     '#68615A',
          border:        '#C9C0B2',
          success:       '#2E7D32',
          warning:       '#B7791F',
          error:         '#B42318',
          info:          '#6E0F0F',
        },
        ai: {
          space:   '#DED9D0',
          navy:    '#F1EDE5',
          slate:   '#E5E0D7',
          card:    '#F1EDE5',
          border:  '#C9C0B2',
          blue:    '#6E0F0F',
          cyan:    '#D49A17',
          violet:  '#4B0808',
          indigo:  '#6E0F0F',
          emerald: '#2E7D32',
          amber:   '#B7791F',
          rose:    '#B42318',
          maroon:  '#6E0F0F',
          gold:    '#D49A17',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif:   ['Inter', 'system-ui', 'sans-serif'],   // legacy alias → still Inter
        display: ['Inter', 'system-ui', 'sans-serif'],   // legacy alias → still Inter
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '16px',
      },
      boxShadow: {
        'vsb-subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'vsb-card': '0 4px 12px rgba(110, 15, 15, 0.05)',
        'ai-glow': '0 2px 8px rgba(110, 15, 15, 0.08)',
        'cyan-glow': '0 2px 8px rgba(212, 154, 23, 0.12)',
        'violet-glow': '0 2px 8px rgba(75, 8, 8, 0.1)',
        'maroon-glow': '0 2px 10px rgba(110, 15, 15, 0.15)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

