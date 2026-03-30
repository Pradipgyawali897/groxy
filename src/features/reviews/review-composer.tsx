"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ReviewComposer({ bookId }: { bookId: string }) {
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          book_id: bookId,
          rating,
          title,
          body,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!res.ok) {
        toast.error(
          res.status === 401
            ? "Sign in to leave a review."
            : json?.error ?? "Could not submit review."
        );
        return;
      }

      setTitle("");
      setBody("");
      setRating(5);
      toast.success(json?.message ?? "Review submitted.");
    });
  };

  return (
    <form className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-sm" onSubmit={onSubmit}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Share your review</p>
        <p className="text-sm text-muted-foreground">
          Reviews are moderated before going live so the storefront stays useful and trustworthy.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/80 transition hover:border-primary/40 hover:text-primary",
                value <= rating && "border-primary/40 bg-primary/10 text-primary"
              )}
              aria-label={`Rate ${value} stars`}
            >
              <Star className={cn("size-4", value <= rating && "fill-current")} />
            </button>
          );
        })}
      </div>

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Review title"
        className="h-12 rounded-2xl px-4"
      />
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What stood out, who is this book for, and would you recommend it?"
        className="min-h-36 rounded-2xl"
      />
      <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
