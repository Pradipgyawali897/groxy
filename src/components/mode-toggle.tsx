"use client";

import * as React from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = (mounted ? theme : "system") ?? "system";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-background/80 p-1">
      <Button
        variant={selectedTheme === "light" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-2"
        onClick={() => setTheme("light")}
        type="button"
      >
        <SunIcon className="size-4" />
      </Button>
      <Button
        variant={selectedTheme === "dark" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-2"
        onClick={() => setTheme("dark")}
        type="button"
      >
        <MoonIcon className="size-4" />
      </Button>
      <Button
        variant={selectedTheme === "system" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-2"
        onClick={() => setTheme("system")}
        type="button"
      >
        <MonitorIcon className="size-4" />
      </Button>
    </div>
  );
}
