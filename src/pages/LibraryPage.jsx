import { Heart, Plus } from "lucide-react";

export default function LibraryPage({
  user,
  library,
  onOpenCollection,
  onCreatePlaylist,
  onSignIn,
  t,
}) {
  if (!user) {
    return (
      <section className="mx-auto mt-10 max-w-lg rounded-xl bg-neutral-900 p-6 text-center sm:p-10">
        <h1 className="text-3xl font-black">{t("library")}</h1>
        <p className="mt-3 text-neutral-300">{t("librarySignInHint")}</p>
        <button
          type="button"
          onClick={onSignIn}
          className="mt-6 rounded-full bg-white px-6 py-3 font-bold text-black transition hover:scale-[1.02]"
        >
          {t("signIn")}
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-300">{t("library")}</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">{t("library")}</h1>
        </div>
        <button
          type="button"
          onClick={onCreatePlaylist}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black transition hover:scale-[1.02]"
        >
          <Plus size={18} aria-hidden="true" />
          {t("createPlaylistButton")}
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] sm:gap-4">
        <button
          type="button"
          onClick={() => onOpenCollection({ kind: "liked" })}
          className="group rounded-lg bg-neutral-900 p-3 text-left transition hover:bg-neutral-800"
        >
          <span className="flex aspect-square items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-violet-900 shadow-lg">
            <Heart size={48} fill="white" aria-hidden="true" />
          </span>
          <span className="mt-3 block truncate font-bold">{t("likedSongs")}</span>
          <span className="mt-1 block text-sm text-neutral-400">
            {t(library.likedSongs.length === 1 ? "trackCountOne" : "trackCount", {
              count: library.likedSongs.length,
            })}
          </span>
        </button>
        {library.playlists.map((playlist) => (
          <button
            key={playlist.id}
            type="button"
            onClick={() => onOpenCollection({ kind: "playlist", id: playlist.id })}
            className="group rounded-lg bg-neutral-900 p-3 text-left transition hover:bg-neutral-800"
          >
            <img
              src={playlist.songs[0]?.cover ?? "https://picsum.photos/seed/playlist/300"}
              alt=""
              className="aspect-square w-full rounded object-cover shadow-lg"
            />
            <span className="mt-3 block truncate font-bold">{playlist.name}</span>
            <span className="mt-1 block text-sm text-neutral-400">
              {t(playlist.songs.length === 1 ? "trackCountOne" : "trackCount", {
                count: playlist.songs.length,
              })}
            </span>
          </button>
        ))}
      </div>
      {!library.playlists.length && !library.likedSongs.length && (
        <p className="mt-5 text-sm text-neutral-400">{t("emptyLibrary")}</p>
      )}
    </section>
  );
}
