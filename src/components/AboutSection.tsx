"use client";

import Container from "@/components/ui/Container";
import ExperienceTimeline from "@/components/ExperienceTimeline";

export default function AboutSection() {
  return (
    <section
      className="flex items-start justify-center w-full h-screen overflow-hidden"
      style={{ background: "var(--color-bg)", paddingTop: "var(--header-safe)", paddingBottom: "var(--footer-safe)" }}
    >
      <Container className="max-w-xl">
        <h2 className="subheading" style={{ marginBottom: "1rem" }}>
          about
        </h2>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-base)",
            lineHeight: "var(--leading-relaxed)",
            color: "var(--color-fg)",
            marginBottom: "2rem",
          }}
        >
          product manager, growth hacker, designer, engineer, creative. penn grad. experience across startups backed by openai, yc, a16z, and founders fund. i love building systems that help products scale. currently shaping the future of learning at speak.
        </p>

        <ExperienceTimeline />

        <div className="flex gap-4 mt-6" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)" }}>
          <a
            href="https://linkedin.com/in/kyuholee0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-fg transition-colors"
          >
            linkedin
          </a>
          <a
            href="https://github.com/kyuhochoilee"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-fg transition-colors"
          >
            github
          </a>
          <a
            href="/#thoughts"
            className="text-muted hover:text-fg transition-colors"
          >
            thoughts
          </a>
        </div>
      </Container>
    </section>
  );
}
