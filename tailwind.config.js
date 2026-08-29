/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Neutral surfaces — light clinical. `100`/`DEFAULT` is the page
        // background; `50` is the elevated white card surface;
        // `200` is a recessed surface (inputs, chips); `300` is the border.
        cream: {
          DEFAULT: '#F8FAFC',
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#EEF2F7',
          300: '#DDE3EC',
        },
        // Text scale — dark text on light surfaces.
        ink: {
          DEFAULT: '#0F172A',
          700: '#64748B',
          800: '#0F172A',
          900: '#020617',
        },
        // Primary brand accent — medical blue (trust, clinical authority).
        terracotta: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          300: '#93C5FD',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        // Warning / draft accent — amber.
        mustard: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          100: '#FEF3C7',
          300: '#FCD34D',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        // Secondary accent — ocean teal (published / good states).
        teal: {
          DEFAULT: '#0891B2',
          50: '#ECFEFF',
          100: '#CFFAFE',
          300: '#22D3EE',
          500: '#0891B2',
          600: '#0E7490',
          700: '#155E75',
        },
        // Danger / error — rose-red.
        danger: {
          DEFAULT: '#E11D48',
          50: '#FFF1F2',
          100: '#FFE4E6',
          300: '#FB7185',
          500: '#E11D48',
          600: '#BE123C',
          700: '#9F1239',
        },
      },
      fontFamily: {
        display: ['Inter_700Bold', 'System'],
        body: ['Inter_400Regular', 'System'],
        'body-medium': ['Inter_500Medium', 'System'],
        'body-semibold': ['Inter_600SemiBold', 'System'],
      },
      boxShadow: {
        card: '0px 1px 3px rgba(15,23,42,0.05), 0px 4px 16px rgba(15,23,42,0.07)',
        'card-lg': '0px 2px 8px rgba(15,23,42,0.07), 0px 14px 28px rgba(15,23,42,0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
