"use client";

import { useEffect, useState, useRef } from "react";
interface Track {
  isPlaying: boolean;
  title: string;
  artist: string;
  url: string;
  albumArt: string;
  hidden?: boolean;
}

const WAVE_CHARS = ["∘", "·", "◦", "°", "○", "◎", "●", "◉"];
const WAVE_BARS = 4;
const WAVE_WIDTH = WAVE_BARS * 7;

function AsciiWave({ playing }: { playing: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function draw() {
      if (!el) return;
      timeRef.current += playing ? 0.012 : 0.004;
      const t = timeRef.current;

      let out = "";
      for (let i = 0; i < WAVE_BARS; i++) {
        const wave = playing
          ? Math.sin(t * 0.8 + i * 1.8) * 0.5 + 0.5
          : 0.15;

        const charIdx = Math.floor(wave * (WAVE_CHARS.length - 1));
        out += WAVE_CHARS[Math.max(0, Math.min(WAVE_CHARS.length - 1, charIdx))];
      }

      el.textContent = out;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  return (
    <span
      ref={ref}
      className="shrink-0 text-current"
      style={{
        fontFamily: '"GT Alpina Typewriter Trial", "Courier New", monospace',
        fontSize: "11px",
        letterSpacing: "1px",
        width: WAVE_WIDTH,
        display: "inline-block",
        textAlign: "center",
      }}
    />
  );
}

export default function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchTrack = async () => {
      try {
        const res = await fetch("/api/spotify");
        const data = await res.json();
        if (data.title) setTrack(data);
        else setTrack(null);
      } catch {
        setTrack(null);
      }
    };

    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(fetchTrack, 30000);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchTrack();
        startPolling();
      }
    };

    fetchTrack();
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!track) {
    return (
      <div className="flex items-center gap-2 text-muted h-full">
        <AsciiWave playing={false} />
        <span>not playing</span>
      </div>
    );
  }

  if (track.hidden) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <AsciiWave playing={track.isPlaying} />
        <span>****</span>
      </div>
    );
  }

  const display = `${track.title.toLowerCase()} — ${track.artist.toLowerCase()}`;

  return (
    <div className="flex items-center gap-2 w-full min-w-0 h-full">
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 transition-colors min-w-0"
        style={{
          color: track.isPlaying ? "var(--color-purple)" : "var(--color-muted)",
          animation: track.isPlaying ? "purplePulse 4s ease-in-out infinite" : "none",
        }}
      >
        <AsciiWave playing={track.isPlaying} />
        <span className="truncate">{display}</span>
      </a>
    </div>
  );
}
