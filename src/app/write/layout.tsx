"use client";

import { useState, useEffect, ReactNode } from "react";
import WriteBottomBar from "@/components/WriteBottomBar";

export default function WriteLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("write-pw");
    if (saved) {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("write-pw", input);
    setAuthed(true);
  };

  if (checking) return null;

  if (!authed) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ fontFamily: "var(--font-display)", background: "var(--color-bg)" }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <span className="text-muted text-sm">password</span>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            className="bg-transparent border-b border-border text-fg text-center text-lg outline-none py-2 w-48"
            style={{ fontFamily: "var(--font-display)" }}
          />
        </form>
      </div>
    );
  }

  return (
    <>
      {children}
      <WriteBottomBar />
    </>
  );
}
