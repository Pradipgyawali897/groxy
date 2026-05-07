// Design Tokens: Global Foundation
export const tokens = {
  typography: {
    display: "font-sans font-medium tracking-tight text-foreground",
    heading: "font-sans font-semibold tracking-[-0.01em] text-foreground",
    body: "font-sans text-foreground/80 leading-relaxed",
    ui: "font-sans text-sm font-medium",
  },
  spacing: {
    container: "mx-auto max-w-7xl px-6 lg:px-8",
    section: "py-16 md:py-24",
    stack: "gap-8",
    inline: "gap-4",
  },
  colors: {
    background: "bg-white dark:bg-zinc-950",
    surface: "border border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-900 dark:text-zinc-50",
    muted: "text-zinc-500 dark:text-zinc-400",
  },
  shadows: {
    subtle: "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]",
  }
};
