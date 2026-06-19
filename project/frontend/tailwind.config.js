/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inmo: {
          brand: '#0A2540',      // Azul Ultra Profundo (Sidebar, Textos Principales)
          primary: '#1E3A8A',    // Azul Real Corporativo (Botones principales, Enlaces)
          light: '#F4F6F9',      // Fondo de la aplicación (Limpio)
        },
        goiania: {
          green: '#0F5132',      // Verde Esmeralda Oscuro (KPIs positivos, Tasas de ocupación)
          accent: '#198754',     // Verde Activo (Éxito, badges activos)
          ipe: '#FFC107',        // Oro Ipê (Alertas críticas, contratos a 60 días de vencer)
          ipeHover: '#E0A800',
        },
        neutral: {
          dark: '#212529',       // Texto principal (Alta legibilidad)
          muted: '#6C757D',      // Subtítulos y etiquetas secundarias
          border: '#DEE2E6',     // Líneas de tablas y divisiones limpias
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
