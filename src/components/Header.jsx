import { Home, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import LanguagePicker from "./LanguagePicker";

export default function Header({
  query,
  onSearch,
  onHome,
  onPremium,
  onSupport,
  onDownload,
  onLibrary,
  locale,
  onLocaleChange,
  user,
  onSignUp,
  onSignIn,
  onSignOut,
  marketing = false,
  t,
}) {
  const [showMenu, setShowMenu] = useState(false);

  function selectMenuAction(action) {
    setShowMenu(false);
    action();
  }

  return (
    <header className={marketing
      ? "grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-neutral-800 px-4 sm:px-6 lg:px-10"
      : "col-span-1 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-1 md:col-span-2 md:px-2"}>
      <button type="button" onClick={onHome} aria-label={t("home")} className="flex items-center">
        <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="white" />
          <path d="M5.5 9.2c4.2-1.2 8.6-.9 12.5 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M6.2 12.6c3.5-.9 7-.6 10.2.9" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M7 15.8c2.8-.6 5.6-.4 8 .7" stroke="black" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        </svg>
        {marketing && <span className="ml-2 hidden text-lg font-bold sm:inline">Spotify</span>}
      </button>

      {!marketing && <div className="flex min-w-0 items-center justify-center gap-2">
        <button
          type="button"
          aria-label={t("home")}
          onClick={onHome}
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 transition hover:scale-105 hover:bg-neutral-800 sm:flex"
        >
          <Home size={24} />
        </button>

        <div className="group flex h-12 w-full max-w-[28rem] min-w-0 items-center gap-3 rounded-full border border-transparent bg-neutral-900 px-4 transition hover:bg-neutral-800 focus-within:border-white">
          <Search size={22} className="text-neutral-400 group-hover:text-white shrink-0" />
          <input
            value={query}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              aria-label={t("clearSearch")}
              onClick={() => onSearch("")}
              className="text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>}

      <nav
        aria-label="Spotify"
        className={`${marketing
          ? "hidden items-center gap-5 text-sm font-bold text-neutral-300 md:flex"
          : "hidden items-center gap-4 text-sm font-bold text-neutral-300 xl:flex"} ${marketing ? "justify-self-center" : ""}`}
      >
          <button type="button" onClick={onPremium} className="hover:text-white">
            {t("premium")}
          </button>
          <button type="button" onClick={onSupport} className="hover:text-white">{t("support")}</button>
          <button type="button" onClick={onDownload} className="hover:text-white">
            {t("download")}
          </button>
      </nav>

      <div className="relative flex items-center justify-end gap-3 sm:gap-5">
        {marketing && (
          <div className="hidden md:block">
            <LanguagePicker locale={locale} onLocaleChange={onLocaleChange} t={t} />
          </div>
        )}
        <div className="relative xl:hidden">
          <button
            type="button"
            aria-label={t("openMenu")}
            aria-expanded={showMenu}
            onClick={() => setShowMenu((visible) => !visible)}
            className={`${marketing ? "flex md:hidden" : "flex xl:hidden"} h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white`}
          >
            <Menu size={21} />
          </button>
          {showMenu && (
            <nav
              aria-label={t("navigationMenu")}
              className="absolute right-0 top-12 z-50 min-w-52 rounded-lg border border-neutral-800 bg-neutral-900 p-2 shadow-xl"
            >
              <button
                type="button"
                onClick={() => selectMenuAction(onPremium)}
                className="w-full rounded px-3 py-2 text-left text-sm font-bold hover:bg-neutral-800"
              >
                {t("premium")}
              </button>
              <button
                type="button"
                onClick={() => selectMenuAction(onSupport)}
                className="w-full rounded px-3 py-2 text-left text-sm font-bold hover:bg-neutral-800"
              >
                {t("support")}
              </button>
              <button
                type="button"
                onClick={() => selectMenuAction(onDownload)}
                className="w-full rounded px-3 py-2 text-left text-sm font-bold hover:bg-neutral-800"
              >
                {t("download")}
              </button>
              {!marketing && (
                <button
                  type="button"
                  onClick={() => selectMenuAction(onLibrary)}
                  className="w-full rounded px-3 py-2 text-left text-sm font-bold hover:bg-neutral-800"
                >
                  {t("library")}
                </button>
              )}
              <div className="mt-2 border-t border-neutral-700 px-2 pt-2">
                <LanguagePicker
                  locale={locale}
                  onLocaleChange={onLocaleChange}
                  t={t}
                  compact
                />
              </div>
            </nav>
          )}
        </div>
        <span aria-hidden="true" className={`${marketing ? "hidden md:block" : "hidden xl:block"} h-6 border-l border-neutral-700`} />
        {user ? (
          <>
            <span className="hidden max-w-36 truncate text-sm font-bold text-neutral-300 lg:block">
              {t("greet", { name: user.name })}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-105"
            >
              {t("signOut")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSignUp}
              className="hidden whitespace-nowrap text-sm font-bold text-neutral-300 transition hover:scale-105 hover:text-white sm:block"
            >
              {t("signUp")}
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-105 sm:min-w-28"
            >
              {t("signIn")}
            </button>
          </>
        )}
      </div>
    </header>
  );
}