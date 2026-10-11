import { usePlayer } from "../store/usePlayer";
import SongCard from "../components/SongCard";

export default function LibraryCollection({ collection, t }) {
  const { play, setQueue } = usePlayer();

  if (!collection) return null;

  const songs = collection.songs;
  const title = collection.kind === "liked" ? t("likedSongs") : collection.name;

  function playFromCollection(song) {
    setQueue(songs);
    play(song);
  }

  return (
    <section>
      <div className="mb-8 flex items-end gap-5">
        <div className={`flex h-36 w-36 shrink-0 items-center justify-center rounded-lg shadow-xl sm:h-48 sm:w-48 ${
          collection.kind === "liked"
            ? "bg-gradient-to-br from-indigo-500 to-violet-900"
            : "bg-neutral-800"
        }`}>
          {collection.kind === "liked" ? (
            <span aria-hidden="true" className="text-6xl">♥</span>
          ) : (
            <img
              src={songs[0]?.cover ?? "https://picsum.photos/seed/playlist/300"}
              alt=""
              className="h-full w-full rounded-lg object-cover"
            />
          )}
        </div>
        <div className="min-w-0 pb-2">
          <p className="text-sm font-semibold">{t("playlistLabel")}</p>
          <h1 className="mt-2 break-words text-3xl font-black sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-neutral-300">
            {t(songs.length === 1 ? "trackCountOne" : "trackCount", { count: songs.length })}
          </p>
        </div>
      </div>
      {songs.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(176px,1fr))] sm:gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} onPlay={playFromCollection} t={t} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-neutral-900/70 p-5 text-neutral-300">{t("emptyCollection")}</p>
      )}
    </section>
  );
}
