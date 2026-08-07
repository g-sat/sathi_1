/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Neutral surfaces — Apple-style light "grouped" backgrounds.
        cream: {
          DEFAULT: '#F2F2F7',
          50: '#FFFFFF',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
        },
        // Text scale — Apple label colors.
        ink: {
          DEFAULT: '#1C1C1E',
          700: '#48484A',
          800: '#1C1C1E',
          900: '#000000',
        },
        // Primary brand accent — systemBlue.
        terracotta: {
          DEFAULT: '#0A84FF',
          50: '#EAF3FF',
          100: '#D6E9FF',
          300: '#7FB8FF',
          500: '#0A84FF',
          600: '#0066CC',
          700: '#004C99',
        },
        // Secondary accent — systemOrange (warnings, draft states).
        mustard: {
          DEFAULT: '#FF9500',
          50: '#FFF4E5',
          100: '#FFE7C2',
          300: '#FFBB5C',
          500: '#FF9500',
          600: '#C9740A',
          700: '#8F5405',
        },
        // Tertiary accent — systemTeal (secondary actions, published states).
        teal: {
          DEFAULT: '#30B0C7',
          50: '#E9F8FA',
          100: '#CDEFF3',
          300: '#7ED4E0',
          500: '#30B0C7',
          600: '#238999',
          700: '#1B6B79',
        },
        // Danger / error — systemRed.
        danger: {
          DEFAULT: '#FF3B30',
          50: '#FFEFEE',
          100: '#FFD9D6',
          300: '#FF8A80',
          500: '#FF3B30',
          600: '#D70015',
          700: '#A30011',
        },
      },
      fontFamily: {
        display: ['Inter_700Bold', 'System'],
        body: ['Inter_400Regular', 'System'],
        'body-medium': ['Inter_500Medium', 'System'],
        'body-semibold': ['Inter_600SemiBold', 'System'],
      },
      boxShadow: {
        card: '0px 1px 2px rgba(0,0,0,0.04), 0px 4px 14px rgba(0,0,0,0.06)',
        'card-lg': '0px 2px 8px rgba(0,0,0,0.06), 0px 14px 28px rgba(0,0,0,0.09)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
