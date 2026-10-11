import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { supportedLocales } from "../i18n";

const languageNames = {
  en: "English",
  ru: "Русский",
  uz: "O‘zbekcha",
};

export default function LanguagePicker({
  locale,
  onLocaleChange,
  t,
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-500 px-3 text-sm font-bold text-white transition hover:border-white hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
          compact ? "w-full justify-between" : ""
        }`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <Globe size={17} aria-hidden="true" />
          <span className="truncate">{languageNames[locale]}</span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          role="listbox"
          aria-label={t("language")}
          className={`absolute z-[60] min-w-48 rounded-lg border border-neutral-700 bg-[#282828] p-2 shadow-2xl ${
            compact ? "bottom-12 right-0" : "bottom-12 left-0"
          }`}
        >
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            {t("language")}
          </p>
          {supportedLocales.map((supportedLocale) => (
            <button
              key={supportedLocale}
              type="button"
              role="option"
              aria-selected={locale === supportedLocale}
              onClick={() => {
                onLocaleChange(supportedLocale);
                setIsOpen(false);
              }}
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                locale === supportedLocale ? "font-bold text-green-400" : "text-white"
              }`}
            >
              <span>{languageNames[supportedLocale]}</span>
              {locale === supportedLocale && <Check size={17} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
