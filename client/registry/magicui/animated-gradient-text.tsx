import { type CSSProperties, type PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export type AnimatedGradientTextProps = PropsWithChildren<{
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}>;

export function AnimatedGradientText({
  speed = 2,
  colorFrom = "#4ade80",
  colorTo = "#06b6d4",
  className,
  children,
}: AnimatedGradientTextProps) {
  const style: CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
    backgroundSize: "200% 100%",
    animationDuration: `${speed}s`,
  };

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-no-repeat animate-gradient-x",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}
