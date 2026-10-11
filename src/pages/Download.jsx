import { Apple, Download as DownloadIcon, Headphones, Smartphone } from "lucide-react";

const downloads = [
  {
    label: "downloadWindowsStore",
    href: "https://apps.microsoft.com/store/detail/9NCBCSZSJRSB?launch=true&mode=mini&cid=spotifyweb-store-button",
    icon: Smartphone,
  },
  {
    label: "downloadAppStore",
    href: "https://apps.apple.com/app/spotify-music-and-podcasts/id324684580",
    icon: Apple,
  },
  {
    label: "downloadGooglePlay",
    href: "https://play.google.com/store/apps/details?id=com.spotify.music",
    icon: Smartphone,
  },
];

export default function Download({ t }) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-2xl bg-neutral-100 px-6 py-12 text-center text-black sm:px-12 sm:py-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
          <Headphones size={34} aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{t("downloadTitle")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-700">
          {t("downloadDescription")}
        </p>
        <a
          href="https://download.scdn.co/SpotifySetup.exe"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-7 py-3 font-bold text-black transition hover:scale-105 hover:bg-green-400"
        >
          <DownloadIcon size={19} aria-hidden="true" />
          {t("downloadWindows")}
        </a>
        <p className="mt-4 text-sm text-neutral-600">{t("downloadWindowsStoreHint")}</p>
      </section>

      <section className="mt-8 rounded-2xl bg-neutral-800 px-6 py-8 sm:px-10">
        <h2 className="text-2xl font-bold">{t("downloadMobileTitle")}</h2>
        <p className="mt-2 text-neutral-300">{t("downloadMobileDescription")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {downloads.slice(1).map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-500 px-5 py-3 text-sm font-bold transition hover:border-white hover:bg-neutral-700"
            >
              <Icon size={18} aria-hidden="true" />
              {t(label)}
            </a>
          ))}
        </div>
        <a
          href={downloads[0].href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 underline underline-offset-4 hover:text-white"
        >
          {t("downloadMicrosoftStore")}
        </a>
      </section>
      <p className="mt-5 text-center text-xs text-neutral-500">{t("downloadOfficialNotice")}</p>
    </div>
  );
}
