"use client";

import Container from "@/components/ui/Container";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import NowPlaying from "@/components/NowPlaying";
import SongSuggest from "@/components/SongSuggest";

export default function AboutSection() {
  return (
    <section
      className="flex items-start justify-center w-full h-screen overflow-y-auto"
      style={{ background: "var(--color-bg)", paddingTop: "var(--header-safe)", paddingBottom: "var(--footer-safe)" }}
    >
      <Container className="max-w-4xl">
        <h2 className="subheading" style={{ marginBottom: "1.5rem" }}>
          about
        </h2>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Left column — bio, links, now playing */}
          <div className="flex-1" style={{ fontFamily: "var(--font-display)" }}>
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-relaxed)",
                color: "var(--color-fg)",
                marginBottom: "1rem",
              }}
            >
              product manager, growth hacker, designer, engineer, creative. penn grad. experience across startups backed by openai, yc, a16z, and founders fund. i love building systems that scale impactful products. currently shaping the future of learning at speak.
            </p>
            <p
              style={{
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-relaxed)",
                color: "var(--color-muted)",
                marginBottom: "2rem",
              }}
            >
              you&apos;ll probably find me somewhere between writing new music, hosting dinner parties, djing, drinking iced americanos, and flying back to the east coast.
            </p>

            {/* Now playing */}
            <div className="mb-6" style={{ fontSize: "var(--text-sm)" }}>
              <div className="flex items-baseline gap-3 mb-1.5">
                <span className="text-muted text-xs" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>now playing</span>
                <span className="text-muted">·</span>
                <SongSuggest showArrow />
              </div>
              <NowPlaying />
            </div>

            {/* Links */}
            <div style={{ fontSize: "var(--text-sm)" }}>
              <span className="text-muted text-xs block mb-1.5" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>find me</span>
              <div className="flex gap-4">
                <a href="https://linkedin.com/in/kyuholee0" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors">linkedin</a>
                <a href="https://github.com/kyuhochoilee" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors">github</a>
                <a href="https://x.com/kyumakes" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg transition-colors">twitter</a>
                <a href="/#thoughts" className="text-muted hover:text-fg transition-colors">thoughts</a>
              </div>
            </div>
          </div>

          {/* Right column — experience + education */}
          <div className="flex-1" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)" }}>
            <span className="text-muted text-xs block mb-1.5" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>experience</span>
            <ExperienceTimeline />

            <div className="mt-6">
              <span className="text-muted text-xs block mb-1.5" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>education</span>
              <a
                href="https://upenn.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <img
                  src="/logo-penn.png"
                  alt="university of pennsylvania"
                  className="w-8 h-8 rounded-md border border-border shrink-0"
                  style={{ objectFit: "cover" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted group-hover:text-fg transition-colors leading-tight">university of pennsylvania</span>
                    <span className="text-xs text-muted shrink-0">2021 - 2025</span>
                  </div>
                  <span className="text-sm text-fg group-hover:text-fg transition-colors leading-tight" style={{ marginTop: "1px", display: "block" }}>b.a. design, cs &amp; psych</span>
                </div>
              </a>
            </div>

            <div className="mt-6">
              <span className="text-muted text-xs block mb-1.5" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>organizations</span>
              <div className="flex flex-col gap-4">
                <a
                  href="https://web.sas.upenn.edu/penn-cssp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <img
                    src="/logo-cssp.jpg"
                    alt="cssp"
                    className="w-8 h-8 rounded-md border border-border shrink-0"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-muted group-hover:text-fg transition-colors leading-tight">community school student partnerships</span>
                      <span className="text-xs text-muted shrink-0">2021 - 2025</span>
                    </div>
                    <span className="text-sm text-fg group-hover:text-fg transition-colors leading-tight" style={{ marginTop: "1px", display: "block" }}>co-director</span>
                  </div>
                </a>
                <a
                  href="https://pennkeynotes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <img
                    src="/logo-keynotes.png"
                    alt="keynotes"
                    className="w-8 h-8 rounded-md border border-border shrink-0"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-muted group-hover:text-fg transition-colors leading-tight">keynotes a cappella</span>
                      <span className="text-xs text-muted shrink-0">2021 - 2025</span>
                    </div>
                    <span className="text-sm text-fg group-hover:text-fg transition-colors leading-tight" style={{ marginTop: "1px", display: "block" }}>president</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
