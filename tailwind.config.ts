import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/design-system/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { primary: "var(--bg-primary)" },
        text: { primary: "var(--text-primary)" },
      },
    },
  },
  plugins: [],
};

export default config;
