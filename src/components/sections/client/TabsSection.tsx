"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

type TabItem = {
  label: string;
  labelEn?: string;
  body: string;
  bodyEn?: string;
};

type Props = {
  content: Record<string, unknown>;
  ctx: { locale: "pt" | "en" };
};

/**
 * Tabbed content panel. Body cells accept HTML (TipTap output).
 * Layout switches between top tabs (default) and a vertical sidebar on `md`+
 * when `layout === "vertical"`.
 */
export default function TabsSection({ content, ctx }: Props) {
  const items = Array.isArray(content.items) ? (content.items as TabItem[]) : [];
  const layout = String(content.layout || "horizontal"); // "horizontal" | "vertical"
  const [active, setActive] = useState(0);

  const title = ctx.locale === "en" && content.titleEn ? String(content.titleEn) : String(content.title || "");
  const intro = ctx.locale === "en" && content.introEn ? String(content.introEn) : String(content.intro || "");

  if (items.length === 0 && !title) return null;

  const labelOf = (it: TabItem) => (ctx.locale === "en" && it.labelEn ? it.labelEn : it.label);
  const bodyOf = (it: TabItem) => (ctx.locale === "en" && it.bodyEn ? it.bodyEn : it.body);

  const isVertical = layout === "vertical";
  const safeActive = Math.min(active, Math.max(0, items.length - 1));
  const current = items[safeActive];

  return (
    <div className="max-w-5xl mx-auto">
      {(title || intro) && (
        <div className="text-center mb-8">
          {title && <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>}
          {intro && <p className="text-gray-400 mt-3 max-w-2xl mx-auto">{intro}</p>}
        </div>
      )}

      <div className={cn("flex gap-6", isVertical ? "flex-col md:flex-row" : "flex-col")}>
        {/* Tab list */}
        <div
          className={cn(
            "flex",
            isVertical
              ? "md:flex-col md:w-56 md:shrink-0 overflow-x-auto md:overflow-visible"
              : "flex-row overflow-x-auto border-b border-jungle-700/40"
          )}
        >
          {items.map((item, i) => {
            const isActive = i === safeActive;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  isVertical
                    ? cn(
                        "text-left border-l-2",
                        isActive
                          ? "border-jungle-400 text-white bg-jungle-900/40"
                          : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-jungle-900/30"
                      )
                    : cn(
                        "border-b-2 -mb-px",
                        isActive
                          ? "border-jungle-400 text-white"
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      )
                )}
                aria-selected={isActive}
                role="tab"
              >
                {labelOf(item)}
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        {current && (
          <div
            role="tabpanel"
            className="flex-1 min-w-0 text-gray-300 leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyOf(current)) }}
          />
        )}
      </div>
    </div>
  );
}
