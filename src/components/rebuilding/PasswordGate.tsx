"use client";

import { useState } from "react";

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !password) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/thoughts/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Reload so the server can read the new cookie and render the dashboard.
        window.location.reload();
      } else {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rb-gate">
      <div className="rb-gate-inner">
        <div className="rb-gate-title">rebuilding in 50</div>
        <div className="rb-gate-sub">private · enter password to view</div>
        <form onSubmit={onSubmit} className="rb-gate-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoFocus
            disabled={submitting}
            className="rb-gate-input"
          />
          <button
            type="submit"
            disabled={!password || submitting}
            className="rb-gate-button"
          >
            {submitting ? "..." : "enter"}
          </button>
        </form>
        {error && <div className="rb-gate-error">wrong password</div>}
      </div>
    </div>
  );
}
