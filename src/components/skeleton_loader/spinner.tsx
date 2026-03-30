// components/SpinnerLoading.tsx
import Image from "next/image";

export default function SpinnerLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="relative">
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

          <div className="absolute inset-[-16px] rounded-full border-4 border-primary/60 border-t-transparent animate-spin"></div>
        </div>

      <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">Loading</p>
          <p className="text-sm text-muted-foreground">Please wait a moment...</p>
        </div>

        <div className="flex gap-1.5 mt-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
