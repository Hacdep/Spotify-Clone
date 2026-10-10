import { useEffect, useRef } from "react";
import { usePlayer } from "../store/usePlayer";

export default function Player() {
  const audio = useRef(null);
  const { current, isPlaying, toggle, next, prev } = usePlayer();

  useEffect(() => {
    if (!audio.current || !current) return;
    if (isPlaying) {
      audio.current.play().catch(() => {});
    } else {
      audio.current.pause();
    }
  }, [isPlaying, current]);

  if (!current) {
    return (
      <footer className="col-span-3 bg-neutral-900 rounded-lg p-3 text-neutral-400">
        Qo'shiq tanlang
      </footer>
    );
  }

  return (
    <footer className="col-span-3 bg-neutral-900 rounded-lg p-3 grid grid-cols-3 items-center">
      {/* Chap: qo'shiq */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={current.cover}
          alt={current.title}
          className="w-14 h-14 rounded object-cover"
        />
        <div className="min-w-0">
          <p className="font-semibold truncate">{current.title}</p>
          <p className="text-sm text-neutral-400 truncate">{current.artist}</p>
        </div>
      </div>

      {/* O'rta: boshqaruv */}
      <div className="flex items-center justify-center gap-5">
        <button onClick={prev} className="text-xl hover:text-green-400">⏮</button>
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={next} className="text-xl hover:text-green-400">⏭</button>
      </div>

      <div />

      <audio ref={audio} src={current.url} onEnded={next} />
    </footer>
  );
}