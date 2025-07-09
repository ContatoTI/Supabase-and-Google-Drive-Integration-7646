/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1c3379', // Nova cor principal
          700: '#1c3379',
          800: '#1c3379',
          900: '#1c3379',
        },
        // Alias para facilitar a migração
        'falcon-blue': {
          50: '#f0f4ff',
          100: '#e0ebff',
          200: '#c7d8ff',
          300: '#a5bbff',
          400: '#8195ff',
          500: '#5d6fff',
          600: '#1c3379',
          700: '#1c3379',
          800: '#1c3379',
          900: '#1c3379',
        },
        // Verde escuro para botões de ação
        'falcon-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      borderRadius: {
        'sm': '0.2rem', // Novo padrão para elementos menos arredondados
        DEFAULT: '0.2rem',
        'md': '0.3rem',
        'lg': '0.4rem',
        'xl': '0.5rem',
        '2xl': '0.6rem',
        '3xl': '0.8rem',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // PWA specific breakpoints
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
        // iOS specific
        'iphone': { 'raw': '(max-width: 480px) and (-webkit-min-device-pixel-ratio: 2)' },
        'ipad': { 'raw': '(min-width: 768px) and (max-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)' },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
        'catalog-max': '700px', // Nova altura máxima para catálogo
      },
      maxHeight: {
        'catalog': '700px', // Nova altura máxima para catálogo
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom plugins for PWA
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        // Touch-friendly utilities
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },
        '.touch-pinch-zoom': {
          'touch-action': 'pinch-zoom',
        },
        // Safe area utilities
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-x': {
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-y': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        // PWA specific utilities
        '.pwa-no-select': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
        },
        '.pwa-no-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.pwa-smooth-scroll': {
          '-webkit-overflow-scrolling': 'touch',
        },
      };

      const newComponents = {
        // PWA Button Component
        '.btn-pwa': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'min-height': '44px',
          'min-width': '44px',
          'padding': '0.75rem 1.5rem',
          'border-radius': '0.2rem',
          'font-weight': '500',
          'text-align': 'center',
          'touch-action': 'manipulation',
          '-webkit-tap-highlight-color': 'transparent',
          'user-select': 'none',
          'transition': 'all 0.2s ease-in-out',
          '&:active': {
            'transform': 'scale(0.95)',
          },
        },
        // PWA Card Component
        '.card-pwa': {
          'background-color': theme('colors.white'),
          'border-radius': '0.4rem',
          'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'padding': '1.5rem',
          'margin-bottom': '1rem',
        },
        // PWA Modal Component
        '.modal-pwa': {
          'position': 'fixed',
          'inset': '0',
          'z-index': '50',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'padding': '1rem',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          'backdrop-filter': 'blur(4px)',
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
}