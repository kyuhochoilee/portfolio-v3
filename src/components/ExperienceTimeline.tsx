"use client";

import { useEffect, useRef } from "react";

const PULSE_CHARS = ["*", "·", "•", "○", "●", "◦", "+", "×"];

function AsciiPulse() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let i = 0;
    const tick = () => {
      i = (i + 1) % PULSE_CHARS.length;
      el.textContent = PULSE_CHARS[i];
    };
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      ref={ref}
      style={{
        color: "var(--color-purple)",
        fontSize: "10px",
        lineHeight: 1,
      }}
    >
      {PULSE_CHARS[0]}
    </span>
  );
}

interface Role {
  title: string;
  dates: string;
  current?: boolean;
}

interface Experience {
  company: string;
  logo: string;
  link: string;
  roles: Role[];
}

const EXPERIENCES: Experience[] = [
  {
    company: "speak (openai)",
    logo: "/logo-speak.jpeg",
    link: "https://speak.com",
    roles: [
      { title: "product - growth", dates: "2025 - present", current: true },
      { title: "design engineer - iOS", dates: "2024 - 2025" },
      { title: "design", dates: "2024" },
    ],
  },
  {
    company: "clique",
    logo: "/logo-clique.png",
    link: "https://cliqueapp.org",
    roles: [{ title: "founder", dates: "2024 - present" }],
  },
  {
    company: "district (a16z)",
    logo: "/logo-district.png",
    link: "https://district.net",
    roles: [{ title: "growth", dates: "2024" }],
  },
  {
    company: "dyneti (yc w19)",
    logo: "/logo-dyneti.png",
    link: "https://dyneti.com",
    roles: [{ title: "marketing & business development", dates: "2023" }],
  },
  {
    company: "isteam academy",
    logo: "/logo-isteam.png",
    link: "https://isteamacademy.org",
    roles: [{ title: "brand designer", dates: "2022 - 2023" }],
  },
];

export default function ExperienceTimeline() {
  return (
    <div style={{ fontFamily: "var(--font-display)" }}>
      <ul className="flex flex-col gap-4">
        {EXPERIENCES.map((exp) => (
          <li key={exp.company}>
            <a
              href={exp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group"
            >
              <img
                src={exp.logo}
                alt={exp.company}
                className="w-8 h-8 rounded-md border border-border shrink-0 mt-0.5"
                style={{ objectFit: "cover" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted group-hover:text-fg transition-colors leading-tight">{exp.company}</span>
                  <span className="text-xs text-muted shrink-0">
                    {exp.roles.length === 1 ? exp.roles[0].dates : `${exp.roles[exp.roles.length - 1].dates.split(" - ")[0]} - ${exp.roles[0].current ? "present" : exp.roles[0].dates.split(" - ").pop()}`}
                  </span>
                </div>

                {/* Roles -vertical dashed line for multi-role */}
                {exp.roles.length > 1 ? (
                  <div
                    className="mt-1.5 flex gap-2.5"
                  >
                    <div
                      className="shrink-0"
                      style={{
                        width: "1px",
                        background: "repeating-linear-gradient(to bottom, var(--color-border) 0px, var(--color-border) 3px, transparent 3px, transparent 6px)",
                      }}
                    />
                    <div className="flex flex-col gap-1.5">
                      {exp.roles.map((role) => (
                        <div key={role.title} className="flex items-center gap-1.5">
                          <span className="text-sm text-fg group-hover:text-fg transition-colors leading-tight">
                            {role.title}
                          </span>
                          {role.current && (
                            <AsciiPulse />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-fg group-hover:text-fg transition-colors flex items-center gap-1.5 leading-tight mt-0.5">
                    {exp.roles[0].title}
                    {exp.roles[0].current && (
                      <AsciiPulse />
                    )}
                  </span>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
