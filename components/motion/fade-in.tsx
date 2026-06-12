"use client";

import { animated, useSpring } from "@react-spring/web";
import { type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** Mount anında yumuşak fade + yukarı kayma (react-spring). */
export function FadeIn({ children, delay = 0, y = 12, className }: FadeInProps) {
  const styles = useSpring({
    from: { opacity: 0, transform: `translateY(${y}px)` },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay,
    config: { tension: 210, friction: 24 },
  });

  return (
    <animated.div style={styles} className={className}>
      {children}
    </animated.div>
  );
}
