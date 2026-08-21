/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'mobile': { 'max': '812px' },
      'sm-desktop': '1122px',
    },
    extend: {
      colors: {
        primary: "#0A2FFF",
        secondary: "#79BCC2",
        "grey-lightGrey1": "#D1D5DB",
        "grey-lightGrey2": "#E5E7EB",
        "grey-dimGrey": "#374151",
        "neutral-neutral1": "#1F2937",
        "neutral-white": "#FFFFFF",
        adminBg: "#0F172A",
        adminSidebar: "#1E293B",
        adminPrimary: "#3B82F6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "'Be Vietnam Pro'", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-sans)", "'Be Vietnam Pro'", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-sans)", "'Be Vietnam Pro'", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'footer-gradient': 'linear-gradient(to top, #030612 0%, #1A284F 100%)',
      }
    },
  },
  plugins: [],
}
