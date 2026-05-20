"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GiSittingDog, GiDuck } from "react-icons/gi";
import type { IconType } from "react-icons";
import type { RunKey } from "@/lib/notion";

const ITEMS: { key: RunKey; label: string; Icon: IconType }[] = [
  { key: "kyu", label: "kyu", Icon: GiSittingDog },
  { key: "zaza", label: "zaza", Icon: GiDuck },
];

interface Props {
  run: RunKey;
  onSelect: (run: RunKey) => void;
  hidden: boolean;
}

/* Floating pill that scrolls the run-snap container. The active pill is a
   shared-layout element so it slides between kyu / zaza. */
export default function RunSwitcher({ run, onSelect, hidden }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.nav
      className="rb-switcher"
      aria-label="whose rebuild"
      initial={false}
      animate={{ y: hidden ? 96 : 0, opacity: hidden ? 0 : 1 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 40 }}
    >
      {ITEMS.map(({ key, label, Icon }) => {
        const active = key === run;
        return (
          <button
            key={key}
            type="button"
            className={`rb-sw-item ${active ? "rb-sw-active" : ""}`}
            onClick={() => onSelect(key)}
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <motion.span
                layoutId="rb-sw-bg"
                className="rb-sw-bg"
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 40 }
                }
              />
            )}
            <Icon className="rb-sw-icon" aria-hidden />
            <span className="rb-sw-label">{label}</span>
          </button>
        );
      })}
    </motion.nav>
  );
}
