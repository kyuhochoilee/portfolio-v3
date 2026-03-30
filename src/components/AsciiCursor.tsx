"use client";

import { useEffect, useRef } from "react";

export default function AsciiCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const trail = useRef<{ x: number; y: number; ch: string; age: number }[]>([]);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; ch: string; age: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const chars = "#*+×%@&~";
    let raf = 0;
    let frame = 0;
    let lastX = -1;
    let lastY = -1;

    function resize() {
      const dpr = devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }

    function onClick(e: MouseEvent) {
      // Check if click is inside hero grid
      const gr = (window as unknown as Record<string, unknown>).__heroGridRect as
        { left: number; top: number; right: number; bottom: number } | null;
      if (gr && e.clientX >= gr.left && e.clientX <= gr.right &&
          e.clientY >= gr.top && e.clientY <= gr.bottom) return;

      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16;
        const speed = 2 + Math.random() * 3;
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ch: chars[Math.floor(Math.random() * chars.length)],
          age: 0,
        });
      }
    }

    let lastFrame = 0;
    let accentColor = "rgb(255, 180, 100)";

    function updateAccentColor() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--color-orange").trim();
      if (raw) accentColor = raw;
    }
    updateAccentColor();

    // Watch for dark mode changes
    const colorObserver = new MutationObserver(updateAccentColor);
    colorObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", updateAccentColor);

    function loop() {
      // Throttle to ~30fps
      const now = performance.now();
      if (now - lastFrame < 33) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastFrame = now;

      ctx.clearRect(0, 0, innerWidth, innerHeight);
      frame++;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Check if mouse is inside hero grid
      const gr = (window as unknown as Record<string, unknown>).__heroGridRect as
        { left: number; top: number; right: number; bottom: number } | null;
      const insideGrid = gr != null &&
        mx >= gr.left && mx <= gr.right &&
        my >= gr.top && my <= gr.bottom;

      // --- Trail ---
      if (!insideGrid && mx > 0 && my > 0 && frame % 3 === 0) {
        const sx = Math.round(mx / 14) * 14;
        const sy = Math.round(my / 14) * 14;
        if (sx !== lastX || sy !== lastY) {
          lastX = sx;
          lastY = sy;
          trail.current.push({
            x: sx, y: sy,
            ch: chars[Math.floor(Math.random() * chars.length)],
            age: 0,
          });
          if (trail.current.length > 12) trail.current.shift();
        }
      }

      ctx.font = 'bold 16px "GT Alpina Typewriter Trial", "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = trail.current.length - 1; i >= 0; i--) {
        const t = trail.current[i];
        t.age++;
        if (t.age % 4 === 0) t.ch = chars[Math.floor(Math.random() * chars.length)];
        const life = 1 - t.age / 35;
        if (life <= 0) { trail.current.splice(i, 1); continue; }
        ctx.globalAlpha = life * 0.7;
        ctx.fillStyle = accentColor;
        ctx.fillText(t.ch, t.x, t.y);
      }

      // --- Burst particles ---
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.age++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vy += 0.06;
        // Snap position to grid for pixelated feel
        const dx = Math.round(p.x / 14) * 14;
        const dy = Math.round(p.y / 14) * 14;
        if (p.age % 3 === 0) p.ch = chars[Math.floor(Math.random() * chars.length)];
        const life = 1 - p.age / 45;
        if (life <= 0) { particles.current.splice(i, 1); continue; }
        ctx.globalAlpha = life * 0.8;
        ctx.fillStyle = accentColor;
        ctx.fillText(p.ch, dx, dy);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      colorObserver.disconnect();
      mq.removeEventListener("change", updateAccentColor);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
    />
  );
}
