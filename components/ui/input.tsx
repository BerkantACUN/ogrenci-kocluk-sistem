import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-input border border-chalk bg-white px-3.5 text-[14px] text-ink",
        "placeholder:text-slate transition-colors duration-200",
        "focus:border-iris focus:outline-none focus:ring-2 focus:ring-iris/25",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
