import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SongCard from "../components/SongCard";
import { usePlayer } from "../store/usePlayer";

function Section({ title, songs, onPlay, t }) {
  const [showAll, setShowAll] = useState(false);
  const carousel = useRef(null);
  if (songs.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="min-w-0 truncate text-xl font-bold sm:text-2xl">{title}</h2>
        <div className="ml-3 flex shrink-0 items-center gap-2">
          {!showAll && songs.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t("scrollLeft")}
                onClick={() => carousel.current?.scrollBy({ left: -carousel.current.clientWidth * 0.8, behavior: "smooth" })}
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/70 sm:flex"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t("scrollRight")}
                onClick={() => carousel.current?.scrollBy({ left: carousel.current.clientWidth * 0.8, behavior: "smooth" })}
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/70 sm:flex"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((shown) => !shown)}
            className="text-xs font-bold text-neutral-400 hover:text-white sm:text-sm"
          >
            {t(showAll ? "showLess" : "showAll")}
          </button>
        </div>
      </div>
      <div
        ref={carousel}
        className={showAll
          ? "grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
          : "spotify-carousel -mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-3 sm:gap-4"}
      >
        {(showAll ? songs : songs.slice(0, 12)).map((song) => (
          <div
            key={song.id}
            className={showAll ? "min-w-0" : "w-[min(44vw,11rem)] shrink-0 snap-start sm:w-44 lg:w-48"}
          >
            <SongCard song={song} onPlay={onPlay} t={t} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home({ query, onSearch, locale, t }) {
  const { play, setQueue } = usePlayer();
  const [musicLanguage, setMusicLanguage] = useState(() => (
    locale === "ru" ? "ru" : locale === "en" ? "en" : "uz"
  ));
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [catalogResults, setCatalogResults] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/songs", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Music request failed");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Music response was invalid");
        setSongs(data);
        setQueue(data);
      })
      .catch((loadError) => {
        if (loadError.name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [setQueue]);

  useEffect(() => {
    const searchQuery = query.trim();
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (searchQuery.length === 1) {
        setCatalogResults([]);
        setCatalogLoading(false);
        setCatalogError(false);
        return;
      }

      setCatalogResults([]);
      setCatalogLoading(true);
      setCatalogError(false);
      try {
        const params = new URLSearchParams({ language: musicLanguage });
        if (searchQuery) params.set("q", searchQuery);
        const response = await fetch(`/api/music/search?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Official music search failed");
        const result = await response.json();
        if (!Array.isArray(result.songs)) throw new Error("Music catalog response was invalid");
        if (!controller.signal.aborted) setCatalogResults(result.songs);
      } catch (searchError) {
        if (searchError.name !== "AbortError") setCatalogError(true);
      } finally {
        if (!controller.signal.aborted) setCatalogLoading(false);
      }
    }, searchQuery ? 350 : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, musicLanguage]);

  if (loading) return <p className="text-neutral-400">{t("loading")}</p>;
  if (error) return <p role="alert" className="text-red-400">{t("loadError")}</p>;

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const localMatches = normalizedQuery
    ? songs.filter((song) =>
        `${song.title} ${song.artist}`.toLocaleLowerCase().includes(normalizedQuery),
      )
    : [];
  const visibleSongs = normalizedQuery
    ? [...localMatches, ...catalogResults.filter(
        (remoteSong) => !localMatches.some((localSong) => localSong.id === remoteSong.id),
      )]
    : catalogResults;

  function playSearchResult(song) {
    setQueue(visibleSongs);
    play(song);
  }

  const sectionLabels = {
    mix: t("popularTracks"),
    recent: t("recentlyAdded"),
    folk: t("folk"),
    jazz: t("jazz"),
    electronic: t("electronic"),
    classical: t("classical"),
    ambient: t("ambient"),
    rock: t("rock"),
    world: t("world"),
  };

  const groupedSections = songs.reduce((acc, song) => {
    const section = song.section || "mix";
    if (!acc[section]) acc[section] = [];
    acc[section].push(song);
    return acc;
  }, {});

  const sectionOrder = ["mix", "recent", "folk", "jazz", "electronic", "classical", "ambient", "rock", "world"];

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2" aria-label={t("musicLanguage")}>
        {["uz", "ru", "en"].map((language) => (
          <button
            key={language}
            type="button"
            aria-pressed={musicLanguage === language}
            onClick={() => {
              setMusicLanguage(language);
              if (query) onSearch("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              musicLanguage === language
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            }`}
          >
            {t(`musicLanguage_${language}`)}
          </button>
        ))}
      </div>
      <p className="mb-5 text-sm text-neutral-400">{t("officialPreviewNotice")}</p>
      {catalogLoading && (
        <p role="status" className="mt-4 text-neutral-400">{t("catalogSearching")}</p>
      )}
      {catalogError && (
        <p role="alert" className="mt-4 text-sm text-red-400">{t("catalogError")}</p>
      )}
      {normalizedQuery ? (
        <>
          <Section title={t("searchResults")} songs={visibleSongs} onPlay={playSearchResult} t={t} />
          {visibleSongs.length === 0 && !catalogLoading && !catalogError && normalizedQuery.length >= 2 && (
            <p className="mt-4 text-neutral-400">{t("noResults", { query })}</p>
          )}
        </>
      ) : (
        <>
          {sectionOrder.map((section) => {
            const sectionSongs = groupedSections[section];
            if (!sectionSongs || sectionSongs.length === 0) return null;
            return (
              <Section
                key={section}
                title={sectionLabels[section] || section}
                songs={sectionSongs}
                onPlay={playSearchResult}
                t={t}
              />
            );
          })}
        </>
      )}
    </>
  );
}
