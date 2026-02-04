import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <Icon
          className="text-muted-foreground size-12"
          aria-hidden
        />
      )}
      <p className="text-muted-foreground font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground max-w-sm text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
