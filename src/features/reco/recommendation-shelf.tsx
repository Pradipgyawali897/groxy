"use client";

import * as React from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { BookShelf } from "@/features/reco/book-shelf";

export function RecommendationShelf({
  title = "Recommended for you",
  eyebrow = "For you",
  description = "A hybrid recommender blending popularity, collaborative signals, and your reading intent.",
  limit = 8,
}: {
  title?: string;
  eyebrow?: string;
  description?: string;
  limit?: number;
}) {
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();
    let channel: any = null;

    void supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;

      channel = supabase
        .channel("reco-cache")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_reco_cache",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            if (!mounted) return;
            setRefreshToken((t) => t + 1);
          }
        )
        .subscribe();
    });

    return () => {
      mounted = false;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <BookShelf
      key={refreshToken}
      eyebrow={eyebrow}
      title={title}
      description={description}
      endpoint="/api/recommendations?surface=home"
      limit={limit}
      compact
    />
  );
}
