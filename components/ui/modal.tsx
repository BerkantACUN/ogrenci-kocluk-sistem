"use client";

import { animated, useTransition } from "@react-spring/web";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, footer, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const transitions = useTransition(open, {
    from: { opacity: 0, scale: 0.96, y: 8 },
    enter: { opacity: 1, scale: 1, y: 0 },
    leave: { opacity: 0, scale: 0.97, y: 6 },
    config: { tension: 280, friction: 26 },
  });

  if (typeof document === "undefined") return null;

  return createPortal(
    transitions((style, item) =>
      item ? (
        <animated.div
          style={{ opacity: style.opacity }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <animated.div
            style={{
              transform: style.scale.to((s) => `scale(${s})`),
              translate: style.y.to((y) => `0 ${y}px`),
            }}
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-chalk bg-white shadow-pop",
              className,
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-chalk px-5 py-4">
                <div>
                  {title && <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>}
                  {description && <p className="mt-0.5 text-[12.5px] text-gravel">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-input p-1.5 text-slate transition-colors hover:bg-cloud hover:text-ink"
                  aria-label="Kapat"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="border-t border-chalk bg-cloud/40 px-5 py-3.5">{footer}</div>}
          </animated.div>
        </animated.div>
      ) : null,
    ),
    document.body,
  );
}
