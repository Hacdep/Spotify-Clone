import { Play } from "lucide-react";

export default function SongCard({ song, onPlay, t }) {
  return (
    <div className="group min-w-0 rounded-lg bg-neutral-900/70 p-3 transition duration-300 hover:bg-neutral-800">
      <button
        type="button"
        onClick={() => onPlay(song)}
        aria-label={`${t("playTrack")}: ${song.title} — ${song.artist}`}
        className="relative block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
      >
        <span className="relative block">
          <img
            src={song.cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full aspect-square object-cover rounded-md"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-green-500 text-black opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            <Play size={22} fill="currentColor" />
          </span>
        </span>
        <span className="mt-3 block truncate font-semibold">{song.title}</span>
        <span className="block truncate text-sm text-neutral-400">{song.artist}</span>
      </button>
      <a
        href={song.source}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block text-xs text-neutral-500 underline-offset-2 hover:text-white hover:underline"
      >
        {song.preview ? t("previewCredits") : `${song.license} · ${t("trackCredits")}`}
      </a>
    </div>
  );
}