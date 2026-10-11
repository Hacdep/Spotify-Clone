import { useState } from "react";
import {
  CreditCard,
  Headphones,
  LifeBuoy,
  ListMusic,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

const categories = [
  {
    title: "supportPayments",
    icon: CreditCard,
    articles: [
      ["supportFailedPayment", "failed-payment"],
      ["supportPaymentMethods", "payment-methods"],
      ["supportCancelPremium", "cancel-premium"],
    ],
  },
  {
    title: "supportAccount",
    icon: UserRound,
    articles: [
      ["supportLoginHelp", "cannot-remember-login"],
      ["supportResetPassword", "reset-password"],
      ["supportChangeEmail", "change-email-address"],
    ],
  },
  {
    title: "supportPlans",
    icon: Headphones,
    articles: [
      ["supportIndividualPlan", "premium-individual"],
      ["supportDuoPlan", "duo-plan"],
      ["supportFamilyPlan", "family-plan"],
    ],
  },
  {
    title: "supportApp",
    icon: ListMusic,
    articles: [
      ["supportCreatePlaylist", "create-playlists"],
      ["supportFindPlaylists", "find-playlists"],
      ["supportOffline", "listen-offline"],
    ],
  },
  {
    title: "supportDevices",
    icon: Smartphone,
    articles: [
      ["supportSpotifyConnect", "spotify-connect"],
      ["supportSpeakers", "spotify-on-speakers"],
      ["supportBluetooth", "bluetooth"],
    ],
  },
  {
    title: "supportSafety",
    icon: ShieldCheck,
    articles: [
      ["supportProtectAccount", "protect-your-account"],
      ["supportHackedAccount", "hacked-account-help"],
      ["supportPrivacyControls", "privacy-and-social-controls"],
    ],
  },
];

const supportArticleUrl = (slug) => `https://support.spotify.com/article/${slug}/`;

export default function Support({ t }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleCategories = categories
    .map((category) => {
      const matchingArticles = category.articles.filter(([title]) =>
        t(title).toLocaleLowerCase().includes(normalizedQuery),
      );
      const categoryMatches = t(category.title).toLocaleLowerCase().includes(normalizedQuery);
      return {
        ...category,
        articles: categoryMatches ? category.articles : matchingArticles,
      };
    })
    .filter((category) => category.articles.length > 0);

  return (
    <div className="mx-auto max-w-5xl">
      <section className="mb-10 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 px-6 py-10 text-center sm:px-10 sm:py-14">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-green-400">
          Spotify
        </p>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{t("supportTitle")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-300">{t("supportDescription")}</p>
        <label className="mx-auto mt-7 flex h-14 max-w-2xl items-center gap-3 rounded-lg bg-white px-4 text-black shadow-xl focus-within:ring-2 focus-within:ring-green-400">
          <Search size={22} className="shrink-0 text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("supportSearch")}
            aria-label={t("supportSearch")}
            className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-500"
          />
        </label>
      </section>

      <section aria-labelledby="support-categories" className="mb-10">
        <h2 id="support-categories" className="mb-5 text-2xl font-bold">
          {t("supportBrowse")}
        </h2>
        {visibleCategories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleCategories.map(({ title, icon: Icon, articles }) => (
              <article key={title} className="rounded-xl bg-neutral-800 p-5 sm:p-6">
                <h3 className="mb-4 flex items-center gap-3 text-lg font-bold">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-green-400">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  {t(title)}
                </h3>
                <ul className="divide-y divide-neutral-700">
                  {articles.map(([label, slug]) => (
                    <li key={slug}>
                      <a
                        href={supportArticleUrl(slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="block py-3 text-sm text-neutral-300 transition hover:text-white"
                      >
                        {t(label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-neutral-800 p-6 text-neutral-300">
            {t("supportNoResults", { query })}
          </p>
        )}
      </section>

      <section className="grid gap-4 pb-4 md:grid-cols-2">
        <article className="rounded-xl bg-neutral-800 p-6">
          <LifeBuoy size={24} className="mb-4 text-green-400" aria-hidden="true" />
          <h2 className="text-xl font-bold">{t("supportQuickHelp")}</h2>
          <p className="mt-2 text-sm text-neutral-300">{t("supportContactDescription")}</p>
          <a
            href={supportArticleUrl("contact-us")}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-105"
          >
            {t("supportContact")}
          </a>
        </article>
        <article className="rounded-xl bg-neutral-800 p-6">
          <h2 className="text-xl font-bold">{t("supportCommunity")}</h2>
          <p className="mt-2 text-sm text-neutral-300">{t("supportCommunityDescription")}</p>
          <a
            href="https://community.spotify.com/forum/en/kb/faq"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full border border-neutral-500 px-5 py-2.5 text-sm font-bold transition hover:border-white"
          >
            {t("supportVisitCommunity")}
          </a>
        </article>
      </section>
    </div>
  );
}
