export function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  // Manual toggle takes priority, then system preference
  if (document.documentElement.classList.contains("dark")) return true;
  const stored = localStorage.getItem("theme");
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
