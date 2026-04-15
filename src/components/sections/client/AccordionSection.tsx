"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

type AccordionItem = {
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
};

type Props = {
  content: Record<string, unknown>;
  ctx: { locale: "pt" | "en" };
};

/**
 * Collapsible FAQ-style list. Multiple panels can be open at once.
 * Heading + intro text are optional.
 */
export default function AccordionSection({ content, ctx }: Props) {
  const items = Array.isArray(content.items) ? (content.items as AccordionItem[]) : [];
  const [openIdx, setOpenIdx] = useState<Set<number>>(new Set([0]));

  const title =
    ctx.locale === "en" && content.titleEn ? String(content.titleEn) : String(content.title || "");
  const intro =
    ctx.locale === "en" && content.introEn ? String(content.introEn) : String(content.intro || "");

  const toggle = (i: number) => {
    setOpenIdx((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (items.length === 0 && !title) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center">{title}</h2>
      )}
      {intro && <p className="text-gray-400 text-center mb-8">{intro}</p>}

      <div className="space-y-3">
        {items.map((item, i) => {
          const q = ctx.locale === "en" && item.questionEn ? item.questionEn : item.question;
          const a = ctx.locale === "en" && item.answerEn ? item.answerEn : item.answer;
          const isOpen = openIdx.has(i);
          return (
            <div
              key={i}
              className="border border-jungle-700/40 rounded-sm bg-jungle-900/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-white hover:bg-jungle-800/40 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-medium">{q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-jungle-400 transition-transform shrink-0",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div
                    className="px-5 pb-5 text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(a) }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
