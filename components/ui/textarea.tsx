import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[88px] w-full rounded-input border border-chalk bg-white px-3.5 py-2.5 text-[14px] text-ink",
      "placeholder:text-slate transition-colors duration-200 resize-y",
      "focus:border-iris focus:outline-none focus:ring-2 focus:ring-iris/25 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
