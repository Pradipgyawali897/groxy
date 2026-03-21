"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function CustomerRegistrationForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState("");
  const [shippingCity, setShippingCity] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/service/register/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: displayName,
        shipping_city: shippingCity || undefined,
        phone: phone || undefined,
      }),
    });
    setLoading(false);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Registration failed");
      return;
    }
    router.push("/customer");
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="Display name"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      <input
        value={shippingCity}
        onChange={(event) => setShippingCity(event.target.value)}
        placeholder="City (optional)"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Phone (optional)"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Activate customer service"}
      </Button>
    </form>
  );
}

export function MerchantRegistrationForm() {
  const router = useRouter();
  const [storeName, setStoreName] = React.useState("");
  const [businessEmail, setBusinessEmail] = React.useState("");
  const [supportPhone, setSupportPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/service/register/merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store_name: storeName,
        business_email: businessEmail,
        support_phone: supportPhone || undefined,
        city: city || undefined,
      }),
    });
    setLoading(false);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Registration failed");
      return;
    }
    router.push("/merchant");
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        required
        value={storeName}
        onChange={(event) => setStoreName(event.target.value)}
        placeholder="Store name"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      <input
        required
        type="email"
        value={businessEmail}
        onChange={(event) => setBusinessEmail(event.target.value)}
        placeholder="Business email"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      <input
        value={supportPhone}
        onChange={(event) => setSupportPhone(event.target.value)}
        placeholder="Support phone (optional)"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      <input
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="City (optional)"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Activate merchant service"}
      </Button>
    </form>
  );
}
