"use client";

import { animated, useTrail } from "@react-spring/web";
import { Children, type ReactNode } from "react";

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  /** Öğeler arası gecikme (ms değil, spring trail). */
  itemClassName?: string;
}

/** Çocukları sırayla (stagger) fade-up ile getirir. */
export function StaggerList({ children, className, itemClassName }: StaggerListProps) {
  const items = Children.toArray(children);
  const trail = useTrail(items.length, {
    from: { opacity: 0, transform: "translateY(14px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { tension: 220, friction: 26 },
  });

  return (
    <div className={className}>
      {trail.map((style, i) => (
        <animated.div key={i} style={style} className={itemClassName}>
          {items[i]}
        </animated.div>
      ))}
    </div>
  );
}
