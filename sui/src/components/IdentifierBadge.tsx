import { cn } from "@/lib/utils";

interface IdentifierBadgeProps {
  label?: string;
  value: string;
  displayValue?: string;
  className?: string;
}

export function IdentifierBadge({ label, value, displayValue, className }: IdentifierBadgeProps) {
  const text = displayValue ?? value;

  return (
    <span
      title={value}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[11px] text-muted-foreground uppercase tracking-wide",
        className,
      )}
    >
      {label && <span className="font-semibold text-[10px] text-muted-foreground">{label}:</span>}
      <span className="text-foreground">{text}</span>
    </span>
  );
}
