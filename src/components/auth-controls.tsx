"use client";

import * as React from "react";
import { ArrowRight, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeNextPath } from "@/lib/redirects";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { APP_ROUTES } from "@/lib/roles";

function getBrowserAppOrigin() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

function getAuthRedirectPath(
  nextPath?: string,
  {
    allowResetPassword = false,
    fallbackPath = APP_ROUTES.onboardingStep1,
  }: {
    allowResetPassword?: boolean;
    fallbackPath?: string;
  } = {}
) {
  const next = normalizeNextPath(nextPath, { allowResetPassword }) ?? fallbackPath;
  const callbackUrl = new URL("/auth/callback", getBrowserAppOrigin());
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}

function getDestinationCopy(nextPath?: string) {
  const next = normalizeNextPath(nextPath) ?? APP_ROUTES.onboardingStep1;
  if (next.startsWith("/customer")) return "Returns to your reader space.";
  if (next.startsWith("/merchant")) return "Returns to your seller workspace.";
  if (next.startsWith("/admin")) return "Returns to admin.";
  if (next.startsWith("/onboarding")) return "Continues to onboarding.";
  return `Returns to ${next}.`;
}

async function resolveClientPostAuthPath(nextPath?: string) {
  const fallback = normalizeNextPath(nextPath) ?? APP_ROUTES.onboardingStep1;

  try {
    const search = normalizeNextPath(nextPath)
      ? `?next=${encodeURIComponent(normalizeNextPath(nextPath) as string)}`
      : "";
    const res = await fetch(`/api/auth/destination${search}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const json = (await res.json().catch(() => null)) as { next?: string } | null;
    return typeof json?.next === "string" ? json.next : fallback;
  } catch {
    return fallback;
  }
}

export function OAuthButtons({ nextPath }: { nextPath?: string }) {
  const [loadingProvider, setLoadingProvider] = React.useState("");
  const [error, setError] = React.useState("");
  const destinationCopy = getDestinationCopy(nextPath);

  const signInWithOAuth = async (provider: "google") => {
    setError("");
    setLoadingProvider(provider);
    const supabase = createSupabaseBrowserClient();

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectPath(nextPath),
        queryParams: {
          prompt: "select_account",
        },
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) {
      setLoadingProvider("");
      setError(oauthError.message);
      return;
    }

    if (!data?.url) {
      setLoadingProvider("");
      setError("Google sign-in could not start. Please try again.");
      return;
    }

    window.location.assign(data.url);
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => signInWithOAuth("google")}
        disabled={loadingProvider.length > 0}
        className="h-12 w-full rounded-2xl border-border bg-background/80"
      >
        {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">{destinationCopy}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function EmailSignInForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    const target = await resolveClientPostAuthPath(nextPath);
    router.push(target);
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        required
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="h-12 rounded-2xl px-4"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export function EmailMagicLinkForm({ nextPath }: { nextPath?: string }) {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const destinationCopy = getDestinationCopy(nextPath);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthRedirectPath(nextPath),
        shouldCreateUser: false,
      },
    });

    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage("Check your email for a sign-in link.");
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email for a magic link"
        className="h-12 rounded-2xl px-4"
      />
      <p className="text-xs leading-5 text-muted-foreground">{destinationCopy}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
      <Button type="submit" variant="secondary" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? "Sending link..." : "Email me a sign-in link"}
      </Button>
    </form>
  );
}

export function EmailSignUpForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectPath(APP_ROUTES.onboardingStep1),
      },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      const target = await resolveClientPostAuthPath(APP_ROUTES.onboardingStep1);
      router.push(target);
      router.refresh();
      return;
    }

    setMessage("Account created. Check your email to verify it.");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        required
        type="password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Minimum 8 characters"
        className="h-12 rounded-2xl px-4"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
      <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectPath(APP_ROUTES.resetPassword, {
        allowResetPassword: true,
        fallbackPath: APP_ROUTES.resetPassword,
      }),
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent.");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-12 rounded-2xl px-4"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
      <Button type="submit" variant="secondary" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? "Sending..." : "Send reset email"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. Redirecting...");
    setTimeout(() => {
      router.push(APP_ROUTES.signIn);
      router.refresh();
    }, 800);
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        required
        type="password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        className="h-12 rounded-2xl px-4"
      />
      <Input
        required
        type="password"
        minLength={8}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm password"
        className="h-12 rounded-2xl px-4"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
      <Button type="submit" variant="secondary" className="h-12 w-full rounded-2xl" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(APP_ROUTES.signIn);
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={onSignOut} className="h-11 w-full rounded-2xl">
      <LogOutIcon className="size-4" />
      Sign out
    </Button>
  );
}
