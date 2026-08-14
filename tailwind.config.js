/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Neutral surfaces — dark ERP dashboard. `100`/`DEFAULT` is the page
        // background; `50` is the elevated card surface sitting on top of it;
        // `200` is a secondary/recessed surface (inputs, secondary buttons);
        // `300` is the hairline border color used throughout on dark surfaces.
        cream: {
          DEFAULT: '#0A0A0F',
          50: '#16161D',
          100: '#0A0A0F',
          200: '#1D1D26',
          300: '#2A2A35',
        },
        // Text scale — light text on dark surfaces.
        ink: {
          DEFAULT: '#F2F2F5',
          700: '#96969F',
          800: '#F2F2F5',
          900: '#FFFFFF',
        },
        // Primary brand accent — vivid violet.
        terracotta: {
          DEFAULT: '#8B5CF6',
          50: '#1B1730',
          100: '#241D40',
          300: '#A78BFA',
          500: '#8B5CF6',
          600: '#B9A6FB',
          700: '#DDD6FE',
        },
        // Secondary accent — amber (warnings, draft states).
        mustard: {
          DEFAULT: '#F59E0B',
          50: '#2A2013',
          100: '#3A2C16',
          300: '#FCD34D',
          500: '#F59E0B',
          600: '#FBBF24',
          700: '#FDE68A',
        },
        // Tertiary accent — cyan (secondary actions, published/good states).
        teal: {
          DEFAULT: '#22D3EE',
          50: '#122228',
          100: '#173038',
          300: '#67E8F9',
          500: '#22D3EE',
          600: '#67E8F9',
          700: '#A5F3FC',
        },
        // Danger / error — rose.
        danger: {
          DEFAULT: '#F43F5E',
          50: '#2A1218',
          100: '#3A1820',
          300: '#FB7185',
          500: '#F43F5E',
          600: '#FB7185',
          700: '#FDA4AF',
        },
      },
      fontFamily: {
        display: ['Inter_700Bold', 'System'],
        body: ['Inter_400Regular', 'System'],
        'body-medium': ['Inter_500Medium', 'System'],
        'body-semibold': ['Inter_600SemiBold', 'System'],
      },
      boxShadow: {
        card: '0px 1px 2px rgba(0,0,0,0.2), 0px 4px 14px rgba(0,0,0,0.24)',
        'card-lg': '0px 2px 8px rgba(0,0,0,0.24), 0px 14px 28px rgba(0,0,0,0.32)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
