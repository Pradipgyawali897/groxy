"use client";

import * as React from "react";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function getAuthRedirectPath(nextPath?: string) {
  const next = nextPath ?? "/service/select";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
  return callbackUrl;
}

export function OAuthButtons({ nextPath }: { nextPath?: string }) {
  const [loadingProvider, setLoadingProvider] = React.useState<string>("");
  const [error, setError] = React.useState("");

  const signInWithOAuth = async (provider: "google" | "facebook") => {
    setError("");
    setLoadingProvider(provider);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = getAuthRedirectPath(nextPath);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    setLoadingProvider("");
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => signInWithOAuth("google")}
          disabled={loadingProvider.length > 0}
        >
          <LogInIcon className="size-4" />
          {loadingProvider === "google"
            ? "Connecting..."
            : "Continue with Google"}
        </Button>
        <Button
          variant="outline"
          onClick={() => signInWithOAuth("facebook")}
          disabled={loadingProvider.length > 0}
        >
          <LogInIcon className="size-4" />
          {loadingProvider === "facebook"
            ? "Connecting..."
            : "Continue with Facebook"}
        </Button>
      </div>
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
    setError("");
    setLoading(true);
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

    router.push(nextPath ?? "/service/select");
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      <input
        required
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" variant="secondary" disabled={loading}>
        <LogInIcon className="size-4" />
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export function EmailSignUpForm({
  defaultService = "customer",
}: {
  defaultService?: "customer" | "merchant";
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [service, setService] = React.useState<"customer" | "merchant">(defaultService);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectPath(`/service/select?intent=${service}`),
        data: {
          preferred_service: service,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage(
      "Account created. Verify email and continue to service selection."
    );
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      <input
        required
        type="password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Minimum 8 characters"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      <select
        value={service}
        onChange={(event) => setService(event.target.value as "customer" | "merchant")}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <option value="customer">Register for Customer service</option>
        <option value="merchant">Register for Merchant service</option>
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button type="submit" variant="secondary" disabled={loading}>
        <LogInIcon className="size-4" />
        {loading ? "Creating account..." : "Create account"}
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
    setError("");
    setMessage("");
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
        }/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button type="submit" variant="secondary" disabled={loading}>
        <LogInIcon className="size-4" />
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

    setMessage("Password updated. Redirecting to your services...");
    setTimeout(() => {
      router.push("/service/select");
      router.refresh();
    }, 1000);
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        type="password"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      <input
        required
        type="password"
        minLength={8}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Confirm password"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button type="submit" variant="secondary" disabled={loading}>
        <LogInIcon className="size-4" />
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
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={onSignOut} className="gap-2">
      <LogOutIcon className="size-4" />
      Sign out
    </Button>
  );
}
