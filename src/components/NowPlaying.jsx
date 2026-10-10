import { usePlayer } from "../store/usePlayer";

export default function NowPlaying() {
  const current = usePlayer((s) => s.current);

  return (
    <aside className="bg-neutral-900 rounded-lg p-4 overflow-y-auto">
      {current ? (
        <>
          <h2 className="font-bold mb-4">{current.title}</h2>
          <img
            src={current.cover}
            alt={current.title}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <p className="mt-4 text-2xl font-bold">{current.title}</p>
          <p className="text-neutral-400">{current.artist}</p>
        </>
      ) : (
        <p className="text-neutral-400">Hozirgi qo'shiq</p>
      )}
    </aside>
  );
}