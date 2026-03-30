"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Work" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg/80 border-b border-border">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-fg hover:opacity-60 transition-opacity"
        >
          Kyuho Lee
        </Link>

        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/" || pathname.startsWith("/projects")
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-opacity ${
                  isActive
                    ? "text-fg font-medium"
                    : "text-muted hover:text-fg"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
