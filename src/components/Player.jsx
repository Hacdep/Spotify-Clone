// components/Player.jsx
import { useEffect, useRef } from "react";
import { usePlayer } from "../store/usePlayer";

export default function Player() {
  const audio = useRef(null);
  const { current, isPlaying, toggle, next } = usePlayer();

  useEffect(() => {
    if (!audio.current || !current) return;
    isPlaying ? audio.current.play() : audio.current.pause();
  }, [isPlaying, current]);

  if (!current) return null;

  return (
    <footer className="fixed bottom-0 w-full bg-neutral-900 text-white p-4 flex items-center gap-4">
      <img src={current.cover} className="w-14 h-14 rounded" />
      <div className="flex-1">
        <p className="font-semibold">{current.title}</p>
        <p className="text-sm text-neutral-400">{current.artist}</p>
      </div>
      <button onClick={toggle}>{isPlaying ? "⏸" : "▶"}</button>
      <button onClick={next}>⏭</button>
      <audio ref={audio} src={current.url} onEnded={next} />
    </footer>
  );
}