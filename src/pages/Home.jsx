import { useState, useEffect } from "react";
import SongCard from "../components/SongCard";
import { usePlayer } from "../store/usePlayer";

function Section({ title, songs, onPlay }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {songs.map((s) => (
          <SongCard key={s.id} song={s} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { play, setQueue } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/songs")
      .then((res) => {
        if (!res.ok) throw new Error("Server xatosi");
        return res.json();
      })
      .then((data) => {
        setSongs(data);
        setQueue(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-neutral-400">Yuklanmoqda...</p>;
  if (error)
    return <p className="text-red-400">Server ishlamayapti. `npm run server` ni yoqing.</p>;

  return (
    <>
      <Section
        title="Kun mixlari"
        songs={songs.filter((s) => s.section === "mix")}
        onPlay={play}
      />
      <Section
        title="So'nggi"
        songs={songs.filter((s) => s.section === "recent")}
        onPlay={play}
      />
    </>
  );
}