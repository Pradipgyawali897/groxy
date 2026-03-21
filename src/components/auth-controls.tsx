"use client";

import * as React from "react";
import { ArrowRight, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { APP_ROUTES } from "@/lib/roles";

function getAuthRedirectPath(nextPath?: string) {
  const next = nextPath ?? APP_ROUTES.onboardingStep1;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function OAuthButtons({ nextPath }: { nextPath?: string }) {
  const [loadingProvider, setLoadingProvider] = React.useState("");
  const [error, setError] = React.useState("");

  const signInWithOAuth = async (provider: "google") => {
    setError("");
    setLoadingProvider(provider);
    const supabase = createSupabaseBrowserClient();

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectPath(nextPath),
      },
    });

    setLoadingProvider("");
    if (oauthError) {
      setError(oauthError.message);
    }
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
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(nextPath ?? APP_ROUTES.onboardingStep1);
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

export function EmailSignUpForm() {
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
    const { error: signUpError } = await supabase.auth.signUp({
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

    setMessage("Account created. Check your email, verify, and continue into onboarding.");
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
      redirectTo: `${
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      }${APP_ROUTES.resetPassword}`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
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
