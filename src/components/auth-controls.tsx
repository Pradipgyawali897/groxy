"use client";

import * as React from "react";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { signIn, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignInButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
        <LogInIcon className="size-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      >
        <LogInIcon className="size-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}

export function CredentialsSignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials. Check DEV_AUTH_EMAIL / DEV_AUTH_PASSWORD.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="dev@example.com"
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
        {loading ? "Signing in..." : "Sign in with Credentials"}
      </Button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="gap-2"
    >
      <LogOutIcon className="size-4" />
      Sign out
    </Button>
  );
}
