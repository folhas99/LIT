"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { cn } from "@/lib/utils";

export type RevealAnimation =
  | "fadeIn"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "zoomIn"
  | "blurIn"
  | "flipIn";

type RevealProps = {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Delay before the entry transition begins, in milliseconds. */
  delay?: number;
  /** Whether to fire only once on first viewport entry. */
  once?: boolean;
  /** IntersectionObserver threshold (0..1). */
  threshold?: number;
  /** Which entry animation to play. Defaults to `slideUp` (the legacy behaviour). */
  animation?: RevealAnimation;
  /** When true, direct children cascade in progressively (handled in globals.css). */
  stagger?: boolean;
  /** Step between consecutive staggered children, in ms (default 80). */
  staggerStep?: number;
};

/**
 * Fades / transitions children in when they enter the viewport.
 * Respects `prefers-reduced-motion` (renders fully visible without animation).
 *
 * The default `slideUp` matches the original behaviour so existing callers
 * don't need to be migrated.
 *
 * When `stagger` is true, emits `data-lit-reveal` + `data-stagger` + the
 * `data-visible` flag so the CSS in `globals.css` can cascade child reveals
 * without spawning an IntersectionObserver per child.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  once = true,
  threshold = 0.15,
  animation = "slideUp",
  stagger = false,
  staggerStep = 80,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, threshold]);

  // Map animation name to the "before" state (off-screen / hidden) classes.
  // The shared transition handles the "after" state once `visible` flips.
  const hiddenClasses: Record<RevealAnimation, string> = {
    fadeIn: "opacity-0",
    slideUp: "opacity-0 translate-y-4",
    slideDown: "opacity-0 -translate-y-4",
    slideLeft: "opacity-0 translate-x-6",
    slideRight: "opacity-0 -translate-x-6",
    zoomIn: "opacity-0 scale-95",
    blurIn: "opacity-0 blur-md",
    flipIn: "opacity-0 [transform:perspective(800px)_rotateX(12deg)]",
  };

  const visibleClasses =
    "opacity-100 translate-x-0 translate-y-0 scale-100 blur-0 [transform:perspective(800px)_rotateX(0deg)]";

  // When stagger is on, the wrapper itself shouldn't animate (otherwise children
  // inherit both the wrapper fade and their own). CSS handles child cascade via
  // the data attributes.
  const wrapperHidden = stagger ? "" : hiddenClasses[animation];
  const wrapperVisible = stagger ? "" : visibleClasses;

  const TagComponent = Tag as unknown as React.ElementType;
  return (
    <TagComponent
      ref={ref}
      data-lit-reveal=""
      data-stagger={stagger ? "" : undefined}
      data-visible={visible ? "true" : "false"}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? wrapperVisible : wrapperHidden,
        className
      )}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
        ...(stagger ? ({ ["--stagger-step" as string]: `${staggerStep}ms` } as React.CSSProperties) : {}),
      }}
    >
      {children}
    </TagComponent>
  );
}
