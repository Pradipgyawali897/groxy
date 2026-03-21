"use client";

import * as React from "react";
import { BellIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StarterActions() {
  const [email, setEmail] = React.useState("");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="starter-email">
          Test a client-side interaction
        </label>
        <Input
          id="starter-email"
          type="email"
          placeholder="hello@shop.dev"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1"
          onClick={() =>
            toast.success("Starter ready", {
              description: email
                ? `A sample toast fired for ${email}.`
                : "Theme switching, shadcn/ui, and Sonner are wired up.",
            })
          }
        >
          <BellIcon className="size-4" />
          Trigger Toast
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setEmail("")}
        >
          <RefreshCwIcon className="size-4" />
          Reset
        </Button>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        This gives you a quick smoke test for client components and the base UI
        stack without adding app-specific logic yet.
      </p>
    </div>
  );
}
