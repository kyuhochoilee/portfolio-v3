import Link from "next/link";
import { RUNS, type RunKey } from "@/lib/notion";

interface Props {
  current: RunKey;
}

export default function Tabs({ current }: Props) {
  const order: RunKey[] = ["kyu", "zaza"];
  return (
    <div className="rb-tabs">
      {order.map((k) => {
        const href = k === "kyu" ? "/rebuilding" : `/rebuilding/${k}`;
        const active = k === current;
        return (
          <Link
            key={k}
            href={href}
            className={`rb-tab ${active ? "rb-tab-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {RUNS[k].label}
          </Link>
        );
      })}
    </div>
  );
}
