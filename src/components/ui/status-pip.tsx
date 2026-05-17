type WatchStatus = "watching" | "completed" | "plan_to_watch" | "dropped";

interface StatusPipProps {
  status: WatchStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const STATUS_COLOR: Record<WatchStatus, string> = {
  watching: "var(--accent)",
  completed: "var(--status-success)",
  plan_to_watch: "var(--text-muted)",
  dropped: "var(--status-error)",
};

const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
  dropped: "Dropped",
};

const STATUS_CLASS: Record<WatchStatus, string> = {
  watching: "watching",
  completed: "watched",
  plan_to_watch: "plan",
  dropped: "dropped",
};

const SIZE_PX: Record<"sm" | "md", number> = {
  sm: 6,
  md: 8,
};

export function StatusPip({
  status,
  size = "sm",
  showLabel = false,
  className,
}: StatusPipProps) {
  const px = SIZE_PX[size];

  return (
    <span
      role="img"
      aria-label={STATUS_LABELS[status]}
      className={`status-pip status-pip--${STATUS_CLASS[status]}${className ? ` ${className}` : ""}`}
      style={{
        width: px,
        height: px,
        background: STATUS_COLOR[status],
        outline: "2px solid var(--bg-card)",
        outlineOffset: "1px",
      }}
    >
      {showLabel && <span className="sr-only">{STATUS_LABELS[status]}</span>}
    </span>
  );
}
