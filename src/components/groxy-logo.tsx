import Link from "next/link";

export function GroxyLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 shadow-sm">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_60%)]" />
        <span className="relative text-sm font-semibold text-white">G</span>
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        Groxy
      </span>
    </Link>
  );
}
