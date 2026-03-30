interface TagProps {
  children: string;
  className?: string;
}

export default function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-block rounded-[var(--radius-full)] border border-border px-2.5 py-0.5 text-xs text-muted ${className}`}
    >
      {children}
    </span>
  );
}
