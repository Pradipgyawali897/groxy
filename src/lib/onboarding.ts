import { z } from "zod";

import { isAppRole, type AppRole } from "@/lib/roles";

export const basicProfileSchema = z.object({
  full_name: z.string().min(2).max(120),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const roleSelectionSchema = z.object({
  role: z.enum(["customer", "merchant"]),
});

export const customerPreferencesSchema = z.object({
  favorite_genres: z.array(z.string().min(2).max(60)).min(1).max(6),
  reading_interests: z.array(z.string().min(2).max(60)).min(1).max(6),
  newsletter_opt_in: z.boolean(),
});

export const merchantSetupSchema = z.object({
  store_name: z.string().min(2).max(120),
  store_slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes only."),
  description: z.string().min(20).max(280),
  logo_url: z.string().url().optional().or(z.literal("")),
  banner_url: z.string().url().optional().or(z.literal("")),
});

export const onboardingPayloadSchema = z.discriminatedUnion("step", [
  z.object({
    step: z.literal("basic"),
    data: basicProfileSchema,
  }),
  z.object({
    step: z.literal("role"),
    data: roleSelectionSchema,
  }),
  z.object({
    step: z.literal("customer"),
    data: customerPreferencesSchema,
  }),
  z.object({
    step: z.literal("merchant"),
    data: merchantSetupSchema,
  }),
  z.object({
    step: z.literal("complete"),
    data: z.object({}),
  }),
]);

export function normalizeStoredRole(value: string | null | undefined): AppRole | null {
  return isAppRole(value) ? value : null;
}
