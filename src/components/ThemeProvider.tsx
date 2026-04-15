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
  // Buttons
  themeButtonPrimaryBg: "--btn-primary-bg",
  themeButtonPrimaryText: "--btn-primary-text",
  themeButtonPrimaryHoverBg: "--btn-primary-hover-bg",
  themeButtonSecondaryBg: "--btn-secondary-bg",
  themeButtonSecondaryText: "--btn-secondary-text",
  themeButtonSecondaryBorder: "--btn-secondary-border",
  themeButtonSecondaryHoverBg: "--btn-secondary-hover-bg",
  themeButtonGhostText: "--btn-ghost-text",
  themeButtonGhostHoverBg: "--btn-ghost-hover-bg",
  // Cards
  themeCardBg: "--card-bg",
  themeCardBorderColor: "--card-border",
  // Inputs
  themeInputBg: "--input-bg",
  themeInputBorderColor: "--input-border",
  themeInputText: "--input-text",
  themeInputFocusColor: "--input-focus",
};

// Numeric values that need a unit appended.
const CSS_VAR_PX_MAP: Record<string, string> = {
  themeButtonRadius: "--btn-radius",
  themeButtonPaddingX: "--btn-padding-x",
  themeButtonPaddingY: "--btn-padding-y",
  themeCardRadius: "--card-radius",
  themeCardBorderWidth: "--card-border-width",
  themeInputRadius: "--input-radius",
};

// Scalar values applied as-is (no unit conversion).
const CSS_VAR_RAW_MAP: Record<string, string> = {
  themeButtonFontWeight: "--btn-font-weight",
  themeButtonTextTransform: "--btn-text-transform",
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

        // Apply px-suffixed numeric variables
        for (const [key, cssVar] of Object.entries(CSS_VAR_PX_MAP)) {
          if (theme[key]) {
            root.style.setProperty(cssVar, `${theme[key]}px`);
          }
        }

        // Apply raw scalar variables
        for (const [key, cssVar] of Object.entries(CSS_VAR_RAW_MAP)) {
          if (theme[key]) {
            root.style.setProperty(cssVar, theme[key]);
          }
        }

        // Letter-spacing wants an em unit
        if (theme.themeButtonLetterSpacing) {
          root.style.setProperty(
            "--btn-letter-spacing",
            `${theme.themeButtonLetterSpacing}em`
          );
        }

        // Card shadow preset → CSS variable
        if (theme.themeCardShadow) {
          const shadows: Record<string, string> = {
            none: "none",
            soft: "0 2px 8px rgba(0, 0, 0, 0.25)",
            medium: "0 4px 16px rgba(0, 0, 0, 0.35)",
            glow: "0 0 25px rgba(57, 255, 20, 0.08), 0 4px 30px rgba(0, 0, 0, 0.3)",
          };
          root.style.setProperty(
            "--card-shadow",
            shadows[theme.themeCardShadow] || shadows.soft
          );
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
