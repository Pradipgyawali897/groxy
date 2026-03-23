// components/SpinnerLoading.tsx
import Image from "next/image";

export default function SpinnerLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="relative">
          <div className="w-20 aspect-square rounded-full overflow-hidden">
            <Image
              src="/logo.png"
              alt="App Logo"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute inset-[-14px] rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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