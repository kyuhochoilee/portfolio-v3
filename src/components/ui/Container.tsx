import { CSSProperties, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  style?: CSSProperties;
}

export default function Container({
  children,
  className = "",
  as: Tag = "div",
  style,
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-screen-xl px-6 ${className}`} style={style}>
      {children}
    </Tag>
  );
}
