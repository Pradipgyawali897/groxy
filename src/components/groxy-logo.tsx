"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
type dimenssion={
  width?:number;
  height?:number;
}
type prop={
  mybackground?: "different" | "same" ,
  dimenssion?:dimenssion
}

export function GroxyLogo({mybackground="same",dimenssion={width:80,height:80}}: prop) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [resolvedTheme]);

  if (!mounted) return null;
  let logoSrc = resolvedTheme === "dark" ? "/logol.png" : "/logod.png";
  if(mybackground=="different"){
    logoSrc = resolvedTheme === "dark" ? "/logod.png" : "/logol.png";
  }
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="flex flex-col leading-none">
        <Image
          key={resolvedTheme}
          src={logoSrc}
          alt="App Logo"
          width={dimenssion.width}
          height={dimenssion.height}
          className="drop-shadow-xl rounded-full object-cover"
          priority
        />
      </span>
    </Link>
  );
}