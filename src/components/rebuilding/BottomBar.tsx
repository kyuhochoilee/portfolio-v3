"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GiSittingDog, GiDuck } from "react-icons/gi";

const ITEMS = [
  { key: "kyu", label: "kyu", Icon: GiSittingDog, href: "/rebuilding" },
  { key: "zaza", label: "zaza", Icon: GiDuck, href: "/rebuilding/zaza" },
];

export default function BottomBar() {
  const pathname = usePathname() || "";
  const current = pathname.startsWith("/rebuilding/zaza") ? "zaza" : "kyu";

  return (
    <nav className="rb-bottombar" aria-label="whose rebuild">
      {ITEMS.map(({ key, label, Icon, href }) => (
        <Link
          key={key}
          href={href}
          className={`rb-bb-item ${current === key ? "rb-bb-active" : ""}`}
          aria-current={current === key ? "page" : undefined}
        >
          <Icon className="rb-bb-icon" aria-hidden />
          <span className="rb-bb-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
