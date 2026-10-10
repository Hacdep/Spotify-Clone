export default function SongCard({ song, onPlay }) {
  return (
    <div
      onClick={() => onPlay(song)}
      className="group relative p-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition cursor-pointer"
    >
      <div className="relative">
        <img
          src={song.cover}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-md"
        />
        <button
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 text-black text-xl
                     flex items-center justify-center shadow-lg
                     opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
        >
          ▶
        </button>
      </div>
      <p className="mt-3 font-semibold truncate">{song.title}</p>
      <p className="text-sm text-neutral-400 truncate">{song.artist}</p>
    </div>
  );
}