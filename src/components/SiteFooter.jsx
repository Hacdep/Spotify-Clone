import { Globe, MessageCircle, Play } from "lucide-react";

const sections = [
  {
    title: "footerCompany",
    links: [
      ["footerAbout", "https://www.spotify.com/about-us/contact/"],
      ["footerJobs", "https://www.lifeatspotify.com/"],
      ["footerForTheRecord", "https://newsroom.spotify.com/"],
    ],
  },
  {
    title: "footerCommunities",
    links: [
      ["footerForArtists", "https://artists.spotify.com/"],
      ["footerDevelopers", "https://developer.spotify.com/"],
      ["footerAdvertising", "https://ads.spotify.com/"],
    ],
  },
  {
    title: "footerUsefulLinks",
    links: [
      ["support", "support"],
      ["download", "download"],
      ["premium", "premium"],
    ],
  },
];

const socialLinks = [
  ["Instagram", Globe, "https://www.instagram.com/spotify/"],
  ["Twitter", MessageCircle, "https://twitter.com/spotify"],
  ["YouTube", Play, "https://www.youtube.com/spotify"],
];

export default function SiteFooter({ t, onNavigate }) {
  return (
    <footer className="border-t border-neutral-800 bg-black px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr]">
        <a
          href="/"
          className="flex h-fit items-center gap-2 text-lg font-bold text-white hover:text-green-400"
          aria-label={t("home")}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="white" />
            <path d="M5.5 9.2c4.2-1.2 8.6-.9 12.5 1M6.2 12.6c3.5-.9 7-.6 10.2.9M7 15.8c2.8-.6 5.6-.4 8 .7" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <span>Spotify</span>
        </a>

        <div className="grid gap-8 sm:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
                {t(section.title)}
              </h2>
              <ul className="space-y-3">
                {section.links.map(([label, destination]) => (
                  <li key={label}>
                    {["support", "download", "premium"].includes(destination) ? (
                      <button
                        type="button"
                        onClick={() => onNavigate(destination)}
                        className="text-left text-sm text-neutral-200 hover:text-green-400 hover:underline"
                      >
                        {t(label)}
                      </button>
                    ) : (
                      <a
                        href={destination}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-neutral-200 hover:text-green-400 hover:underline"
                      >
                        {t(label)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex gap-3 lg:justify-end">
          {socialLinks.map(([label, Icon, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800 text-white transition hover:bg-neutral-700 hover:text-green-400"
            >
              <Icon size={19} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-neutral-800 pt-6 text-xs text-neutral-500">
        <p>{t("footerDisclaimer")}</p>
        <p className="mt-3">© {new Date().getFullYear()} Spotify</p>
      </div>
    </footer>
  );
}
