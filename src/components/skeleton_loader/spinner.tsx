// components/SpinnerLoading.tsx
import Image from "next/image";

export default function SpinnerLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 px-6 text-center animate-fade-in">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-1 ring-border/60 shadow-[0_26px_80px_-40px_rgba(15,23,42,0.55)] animate-float">
            <Image
              src="/logod.png"
              alt="Groxy logo"
              fill
              className="object-cover dark:hidden"
              priority
            />
            <Image
              src="/logol.png"
              alt="Groxy logo"
              fill
              className="hidden object-cover dark:block"
              priority
            />
          </div>

          <div className="absolute h-32 w-32 rounded-full border-4 border-primary/60 border-t-transparent animate-spin"></div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">Loading</p>
          <p className="text-sm text-muted-foreground">Preparing the next screen and aligning the right workspace.</p>
        </div>

        <div className="w-full max-w-56 space-y-2">
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 rounded-full bg-primary animate-pulse-slow" />
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Loading
          </p>
        </div>
      </div>
    </div>
  );
}
