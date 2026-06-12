import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-[var(--ease-out-soft)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-iris text-white shadow-soft hover:shadow-pop hover:brightness-105",
        secondary:
          "bg-cloud text-ink border border-chalk hover:bg-chalk/60",
        outline:
          "bg-transparent text-ink border border-chalk hover:bg-cloud",
        ghost: "bg-transparent text-gravel hover:bg-cloud hover:text-ink",
        danger: "bg-danger text-white hover:brightness-105 shadow-soft",
        soft: "bg-iris-soft text-iris hover:brightness-[0.98]",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] rounded-input",
        md: "h-11 px-5 text-[14px] rounded-input",
        lg: "h-12 px-6 text-[15px] rounded-card",
        icon: "h-10 w-10 rounded-input",
        pill: "h-11 px-6 text-[14px] rounded-pill",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
