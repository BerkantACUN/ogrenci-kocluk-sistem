import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-chalk bg-cloud/40 px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-pill bg-iris-soft">
        <Icon className="h-7 w-7 text-iris" strokeWidth={1.8} />
      </span>
      <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13px] text-gravel">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
