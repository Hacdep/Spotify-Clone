import { Heart, Plus } from "lucide-react";
import LanguagePicker from "./LanguagePicker";

export default function Sidebar({
  user,
  library,
  locale,
  onLocaleChange,
  onSignUp,
  onRequestCreatePlaylist,
  onOpenCollection,
  t,
}) {
  return (
    <aside className="hidden min-h-0 flex-col overflow-hidden rounded-lg bg-neutral-950 md:flex">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-bold text-neutral-300">{t("library")}</h2>
        <button
          type="button"
          aria-label={t(user ? "createPlaylistButton" : "createPlaylist")}
          onClick={() => user ? onRequestCreatePlaylist() : onSignUp()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      {user ? (
        <>
          <div className="px-3 pb-2">
            <ul className="max-h-52 overflow-y-auto">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCollection({ kind: "liked" })}
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-neutral-900"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-violet-900">
                    <Heart size={22} fill="white" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{t("likedSongs")}</span>
                    <span className="block truncate text-sm text-neutral-400">
                      {t("playlistLabel")} · {library.likedSongs.length}
                    </span>
                  </span>
                </button>
              </li>
              {library.playlists.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCollection({ kind: "playlist", id: playlist.id })}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-neutral-900"
                  >
                    <img
                      src={playlist.songs[0]?.cover ?? "https://picsum.photos/seed/playlist/100"}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{playlist.name}</span>
                      <span className="block truncate text-sm text-neutral-400">
                        {t("playlistLabel")} · {playlist.songs.length}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="mx-2 mt-2 rounded-lg bg-neutral-900 p-4">
          <h3 className="mb-2 text-sm font-bold">{t("createPlaylist")}</h3>
          <p className="mb-4 text-sm text-neutral-300">{t("playlistHint")}</p>
          <button
            type="button"
            onClick={onSignUp}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition hover:scale-105"
          >
            {t("createPlaylistButton")}
          </button>
        </div>
      )}

      <div className="mt-auto space-y-5 px-4 pb-5 pt-6 text-[11px] text-neutral-400">
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <a href="https://www.spotify.com/legal/" className="hover:text-white">{t("legal")}</a>
          <a href="https://www.spotify.com/safetyandprivacy/" className="hover:text-white">{t("safety")}</a>
          <a href="https://www.spotify.com/legal/privacy-policy/" className="hover:text-white">{t("privacy")}</a>
          <a href="https://www.spotify.com/legal/cookies-policy/" className="hover:text-white">{t("cookies")}</a>
          <a href="https://www.spotify.com/legal/privacy-policy/#s3" className="hover:text-white">{t("aboutAds")}</a>
          <a href="https://www.spotify.com/accessibility/" className="hover:text-white">{t("accessibility")}</a>
        </div>
        <LanguagePicker locale={locale} onLocaleChange={onLocaleChange} t={t} />
      </div>
    </aside>
  );
}
