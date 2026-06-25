/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sici: {
          primary:    '#0f172a',
          secondary:  '#505f76',
          accent:     '#3b82f6',
          background: '#f7f9fb',
          surface:    '#ffffff',
          border:     '#e2e8f0',
          success:    '#10b981',
          warning:    '#f59e0b',
          error:      '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:      '0.125rem',
        DEFAULT: '0.25rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
      },
    },
  },
  plugins: [],
}
