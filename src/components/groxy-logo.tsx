import Image from "next/image";

import { InteractiveLink } from "@/components/interactive-link";

type dimenssion={
  width?:number;
  height?:number;
}
type prop={
  mybackground?: "different" | "same" ,
  dimenssion?:dimenssion
}

export function GroxyLogo({mybackground="same",dimenssion={width:80,height:80}}: prop) {
  const darkOnLight = mybackground === "same";
  const lightSrc = darkOnLight ? "/logod.png" : "/logol.png";
  const darkSrc = darkOnLight ? "/logol.png" : "/logod.png";

  return (
    <InteractiveLink href="/" className="inline-flex items-center gap-3 rounded-2xl">
      <span className="relative flex flex-col leading-none">
        <Image
          src={lightSrc}
          alt="Groxy Books"
          width={dimenssion.width}
          height={dimenssion.height}
          className="rounded-full object-cover drop-shadow-xl dark:hidden"
          priority
        />
        <Image
          src={darkSrc}
          alt="Groxy Books"
          width={dimenssion.width}
          height={dimenssion.height}
          className="hidden rounded-full object-cover drop-shadow-xl dark:block"
          priority
        />
      </span>
    </InteractiveLink>
  );
}
