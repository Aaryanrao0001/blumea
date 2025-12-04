import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#121212',
          secondary: '#1A1A1A',
          tertiary: '#242424',
        },
        text: {
          primary: '#F2F2F2',
          secondary: '#A3A3A3',
          tertiary: '#737373',
        },
        accent: {
          DEFAULT: '#D4AF37',
          hover: '#EAC763',
          light: '#E5DCC5',
        },
        border: {
          subtle: '#2A2A2A',
          highlight: '#D4AF37',
        },
        success: '#4E9F3D',
        error: '#B91C1C',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
