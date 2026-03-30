import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        rounded-[var(--radius-lg)] border border-border bg-surface
        shadow-[var(--shadow-sm)]
        ${hover ? "transition-shadow duration-[var(--duration-normal)] hover:shadow-[var(--shadow-md)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
