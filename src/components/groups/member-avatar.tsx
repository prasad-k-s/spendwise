import { initials } from "@/lib/initials";
import { cn } from "@/lib/utils";

export function MemberAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
