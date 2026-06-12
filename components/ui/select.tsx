import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-11 w-full appearance-none rounded-input border border-chalk bg-white pl-3.5 pr-10 text-[14px] text-ink",
        "transition-colors duration-200 focus:border-iris focus:outline-none focus:ring-2 focus:ring-iris/25",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
      strokeWidth={2}
    />
  </div>
));
Select.displayName = "Select";
