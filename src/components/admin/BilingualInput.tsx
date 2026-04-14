"use client";

import { useState } from "react";

type CommonProps = {
  label: string;
  valuePt: string;
  valueEn: string;
  onChangePt: (v: string) => void;
  onChangeEn: (v: string) => void;
  englishEnabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
};

type InputProps = CommonProps & {
  as?: "input";
  type?: string;
};

type TextareaProps = CommonProps & {
  as: "textarea";
  rows?: number;
};

type Props = InputProps | TextareaProps;

/**
 * A labelled pair of fields (PT + EN) that share state. The EN field is only
 * shown when `englishEnabled` is true. Falls back to a plain single-language
 * field when English is disabled.
 */
export default function BilingualInput(props: Props) {
  const {
    label,
    valuePt,
    valueEn,
    onChangePt,
    onChangeEn,
    englishEnabled = true,
    required,
    placeholder,
    helpText,
  } = props;

  const [tab, setTab] = useState<"pt" | "en">("pt");

  const baseClass =
    "w-full px-3 py-2 bg-jungle-950 border border-jungle-700/30 rounded-sm text-white text-sm placeholder-gray-500 focus:outline-none focus:border-jungle-500/50";

  const renderField = (lang: "pt" | "en") => {
    const value = lang === "pt" ? valuePt : valueEn;
    const handler = lang === "pt" ? onChangePt : onChangeEn;
    const effectivePlaceholder =
      lang === "en" && !value ? placeholder ?? valuePt : placeholder;

    if (props.as === "textarea") {
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => handler(e.target.value)}
          required={lang === "pt" && required}
          placeholder={effectivePlaceholder}
          rows={props.rows ?? 3}
          className={baseClass}
        />
      );
    }
    return (
      <input
        type={props.type ?? "text"}
        value={value ?? ""}
        onChange={(e) => handler(e.target.value)}
        required={lang === "pt" && required}
        placeholder={effectivePlaceholder}
        className={baseClass}
      />
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {englishEnabled && (
          <div className="flex gap-1 text-[10px] uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setTab("pt")}
              className={`px-2 py-0.5 rounded-sm border ${
                tab === "pt"
                  ? "bg-jungle-700/40 border-jungle-500/50 text-white"
                  : "border-jungle-700/30 text-gray-400 hover:text-white"
              }`}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => setTab("en")}
              className={`px-2 py-0.5 rounded-sm border ${
                tab === "en"
                  ? "bg-jungle-700/40 border-jungle-500/50 text-white"
                  : "border-jungle-700/30 text-gray-400 hover:text-white"
              } ${valueEn?.trim() ? "" : "opacity-70"}`}
              title={valueEn?.trim() ? "EN definido" : "EN vazio — usa PT"}
            >
              EN
            </button>
          </div>
        )}
      </div>

      {englishEnabled ? (
        <div className="relative">
          {tab === "pt" ? renderField("pt") : renderField("en")}
        </div>
      ) : (
        renderField("pt")
      )}

      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}
