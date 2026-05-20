"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { key: "kyu", label: "kyu", emoji: "🐶", href: "/rebuilding" },
  { key: "zaza", label: "zaza", emoji: "🦆", href: "/rebuilding/zaza" },
];

export default function BottomBar() {
  const pathname = usePathname() || "";
  const current = pathname.startsWith("/rebuilding/zaza") ? "zaza" : "kyu";

  return (
    <nav className="rb-bottombar" aria-label="whose rebuild">
      {ITEMS.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          className={`rb-bb-item ${current === it.key ? "rb-bb-active" : ""}`}
          aria-current={current === it.key ? "page" : undefined}
        >
          <span className="rb-bb-emoji">{it.emoji}</span>
          <span className="rb-bb-label">{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}
