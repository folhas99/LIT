"use client";

import { useEffect, useState } from "react";

type ThemeSettings = Record<string, string>;

const CSS_VAR_MAP: Record<string, string> = {
  themeColorPrimary: "--theme-primary",
  themeColorAccent: "--theme-accent",
  themeColorAccentPurple: "--theme-accent-purple",
  themeColorAccentPink: "--theme-accent-pink",
  themeColorAccentBlue: "--theme-accent-blue",
  themeColorAccentGold: "--theme-accent-gold",
  themeColorBackground: "--theme-bg",
  themeColorSurface: "--theme-surface",
  themeColorText: "--theme-text",
  themeColorTextMuted: "--theme-text-muted",
};

const GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2?display=swap";

export default function ThemeProvider() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/theme")
      .then((r) => r.json())
      .then((theme: ThemeSettings) => {
        const root = document.documentElement;

        // Apply color CSS variables
        for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
          if (theme[key]) {
            root.style.setProperty(cssVar, theme[key]);
          }
        }

        // Apply font CSS variables
        if (theme.themeFontHeading) {
          root.style.setProperty("--theme-font-heading", `"${theme.themeFontHeading}", sans-serif`);
        }
        if (theme.themeFontBody) {
          root.style.setProperty("--theme-font-body", `"${theme.themeFontBody}", sans-serif`);
        }

        // Load Google Fonts dynamically
        const fonts = new Set<string>();
        if (theme.themeFontHeading && theme.themeFontHeading !== "Inter") {
          fonts.add(theme.themeFontHeading);
        }
        if (theme.themeFontBody && theme.themeFontBody !== "Inter") {
          fonts.add(theme.themeFontBody);
        }

        if (fonts.size > 0) {
          const families = Array.from(fonts)
            .map((f) => `family=${f.replace(/\s/g, "+")}:wght@400;500;600;700`)
            .join("&");

          // Remove any existing dynamic font link
          const existing = document.getElementById("dynamic-fonts");
          if (existing) existing.remove();

          const link = document.createElement("link");
          link.id = "dynamic-fonts";
          link.rel = "stylesheet";
          link.href = `${GOOGLE_FONTS_BASE}&${families}`;
          document.head.appendChild(link);
        }

        // Apply animation toggle
        if (theme.themeAnimations === "false") {
          root.classList.add("no-animations");
        } else {
          root.classList.remove("no-animations");
        }

        // Apply particles toggle
        if (theme.themeParticles === "false") {
          root.classList.add("no-particles");
        } else {
          root.classList.remove("no-particles");
        }

        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  return null; // Invisible component
}
