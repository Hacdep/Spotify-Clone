import { useEffect, useRef, useState } from "react";
import {
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Volume2,
  VolumeX,
  Plus,
  Check,
  ListPlus,
  X,
} from "lucide-react";
import { usePlayer } from "../store/usePlayer";

const formatTime = (sec) => {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function startAudio(audioElement, onSuccess, onError) {
  audioElement.play().then(onSuccess).catch((error) => {
    if (!(error instanceof DOMException && error.name === "AbortError")) onError();
  });
}

export default function Player({
  isAuthenticated,
  onSignUp,
  likedSongs,
  playlists,
  onToggleLike,
  onAddToPlaylist,
  onRequestCreatePlaylist,
  t,
}) {
  const audio = useRef(null);
  const {
    current, isPlaying, shuffle, repeat,
    toggle, pause, next, prev, toggleShuffle, toggleRepeat,
  } = usePlayer();

  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedPlaylist, setAddedPlaylist] = useState("");
  const [playbackError, setPlaybackError] = useState({ trackId: null, type: null });
  const [previewDismissed, setPreviewDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("spotify-preview-dismissed") === "true";
    } catch {
      return false;
    }
  });

  // Play / pause
  useEffect(() => {
    if (!audio.current || !current) return;
    if (isPlaying) {
      startAudio(
        audio.current,
        () => setPlaybackError({ trackId: current.id, type: null }),
        () => setPlaybackError({
          trackId: current.id,
          type: audio.current?.error?.code === 4 && current.preview ? "unsupported" : "generic",
        }),
      );
    }
    else audio.current.pause();
  }, [isPlaying, current]);

  // Ovoz balandligi
  useEffect(() => {
    if (audio.current) audio.current.volume = muted ? 0 : volume;
  }, [volume, muted, current]);

  const handleEnded = () => {
    if (current.preview) {
      pause();
    } else if (repeat) {
      audio.current.currentTime = 0;
      startAudio(
        audio.current,
        () => setPlaybackError({ trackId: current.id, type: null }),
        () => setPlaybackError({
          trackId: current.id,
          type: audio.current?.error?.code === 4 && current.preview ? "unsupported" : "generic",
        }),
      );
    } else {
      next();
    }
  };

  const seek = (e) => {
    const value = Number(e.target.value);
    audio.current.currentTime = value;
    setTime(value);
  };

  const currentPlaybackError = playbackError.trackId === current?.id
    ? playbackError.type
    : null;

  if (!current) {
    if (!isAuthenticated && previewDismissed) return null;

    function dismissPreview() {
      setPreviewDismissed(true);
      try {
        sessionStorage.setItem("spotify-preview-dismissed", "true");
      } catch {
        // The banner still closes for this render if session storage is unavailable.
      }
    }

    return (
      <footer className="col-span-1 flex min-h-20 items-center justify-between gap-4 rounded-lg bg-gradient-to-r from-fuchsia-700 via-purple-600 to-blue-500 px-4 py-3 text-white md:col-span-2 md:px-5">
        {isAuthenticated ? (
          <p className="text-sm font-semibold">{t("chooseSong")}</p>
        ) : (
          <div className="min-w-0">
            <p className="text-xs font-bold sm:text-sm">{t("previewTitle")}</p>
            <p className="mt-1 line-clamp-2 text-xs font-medium sm:text-sm">
              {t("previewText")}
            </p>
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onSignUp}
              className="rounded-full bg-white px-4 py-3 text-xs font-bold text-black transition hover:scale-105 sm:px-6 sm:text-sm"
            >
              {t("signUp")}
            </button>
            <button
              type="button"
              aria-label={t("dismissPreview")}
              title={t("dismissPreview")}
              onClick={dismissPreview}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-black/15 hover:text-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </footer>
    );
  }

  const isLiked = likedSongs.some((song) => song.id === current.id);

  return (
    <footer className="col-span-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-neutral-800 bg-black px-2 py-2 md:col-span-2 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:gap-4 md:px-3">
      {/* CHAP: qo'shiq */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={current.cover}
          alt={current.title}
          className="h-10 w-10 rounded object-cover sm:h-12 sm:w-12"
        />
        <div className="min-w-0">
          <p className="font-semibold truncate text-sm">{current.title}</p>
          <p className="text-xs text-neutral-400 truncate">{current.artist}</p>
          {current.source && (
            <a
              href={current.source}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-[10px] text-neutral-500 underline-offset-2 hover:text-white hover:underline"
            >
              {current.preview ? t("previewCredits") : `${current.license} · ${t("trackCredits")}`}
            </a>
          )}
        </div>
        <button
          type="button"
          aria-label={isLiked ? t("removeFromLiked") : t("addToLiked")}
          onClick={() => onToggleLike(current)}
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition ${
            isLiked
              ? "bg-green-500 border-green-500 text-black"
              : "border-neutral-400 text-neutral-400 hover:text-white hover:border-white"
          }`}
        >
          {isLiked ? <Check size={14} /> : <Plus size={14} />}
        </button>
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label={t("addToPlaylist")}
            aria-expanded={showPlaylistMenu}
            onClick={() => setShowPlaylistMenu((shown) => !shown)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <ListPlus size={18} />
          </button>
          {showPlaylistMenu && (
            <div className="absolute bottom-10 left-0 z-40 max-h-56 w-56 overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-2 shadow-xl">
              <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-neutral-400">
                {t("addToPlaylist")}
              </p>
              {playlists.length ? playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => {
                    void onAddToPlaylist(playlist.id, current).then((added) => {
                      if (added) setAddedPlaylist(`${current.id}:${playlist.id}`);
                    });
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left text-sm hover:bg-neutral-800"
                >
                  <span className="truncate">{playlist.name}</span>
                  {addedPlaylist === `${current.id}:${playlist.id}` && (
                    <Check size={16} className="shrink-0 text-green-400" />
                  )}
                </button>
              )) : (
                <div className="px-2 py-2 text-sm text-neutral-300">
                  <p>{t("noPlaylists")}</p>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={onRequestCreatePlaylist}
                      className="mt-2 font-bold text-white underline"
                    >
                      {t("createPlaylistButton")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onSignUp}
                      className="mt-2 font-bold text-white underline"
                    >
                      {t("createPlaylistButton")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* O'RTA: boshqaruv + progress */}
      <div className="col-span-2 flex min-w-0 flex-col items-center gap-1 md:col-span-1 md:gap-2">
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            aria-label={t("shuffle")}
            onClick={toggleShuffle}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-neutral-800 ${
              shuffle ? "text-green-500" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Shuffle size={18} />
          </button>
          <button type="button" aria-label={t("previous")} onClick={prev} className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition hover:bg-neutral-800 hover:text-white">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            aria-label={currentPlaybackError === "unsupported"
              ? t("previewUnsupported")
              : isPlaying ? t("pause") : t("play")}
            onClick={toggle}
            disabled={currentPlaybackError === "unsupported"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button type="button" aria-label={t("next")} onClick={next} className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition hover:bg-neutral-800 hover:text-white">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            aria-label={t("repeat")}
            onClick={toggleRepeat}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-neutral-800 ${
              repeat ? "text-green-500" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Repeat size={18} />
          </button>
        </div>

        {currentPlaybackError !== "unsupported" && (
          <div className="flex w-full max-w-xl items-center gap-2 text-[10px] text-neutral-400 sm:text-xs">
            <span className="w-8 text-right sm:w-10">{formatTime(time)}</span>
            <input
              aria-label={t("playbackPosition")}
              type="range"
              min={0}
              max={duration || 0}
              value={time}
              onChange={seek}
              className="h-1 min-w-0 flex-1 cursor-pointer py-2 accent-white hover:accent-green-500"
            />
            <span className="w-8 sm:w-10">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* O'NG: ovoz */}
      <div className="hidden min-w-0 items-center justify-end gap-2 md:flex">
        <button
          type="button"
          aria-label={t(muted || volume === 0 ? "unmute" : "mute")}
          onClick={() => setMuted((m) => !m)}
          className="text-neutral-400 hover:text-white"
        >
          {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setMuted(false);
          }}
          className="w-28 h-1 accent-white hover:accent-green-500 cursor-pointer"
        />
      </div>

      {currentPlaybackError && (
        <div
          id="player-playback-status"
          role={currentPlaybackError === "unsupported" ? "status" : "alert"}
          className={`col-span-full flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-md px-3 py-2 text-center text-xs ${
            currentPlaybackError === "unsupported"
              ? "bg-neutral-900 text-neutral-300"
              : "text-red-400"
          }`}
        >
          <span>{t(currentPlaybackError === "unsupported" ? "previewUnsupported" : "playbackError")}</span>
          {currentPlaybackError === "unsupported" && current.source && (
            <a
              href={current.source}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-green-400 underline underline-offset-2 hover:text-green-300"
            >
              {t("openAppleMusic")}
            </a>
          )}
        </div>
      )}

      <audio
        ref={audio}
        src={current.preview
          ? `/api/music/preview?url=${encodeURIComponent(current.url)}`
          : current.url}
        onTimeUpdate={(e) => setTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(current.preview
            ? Math.min(e.currentTarget.duration, current.previewDuration ?? 30)
            : e.currentTarget.duration);
          setPlaybackError({ trackId: current.id, type: null });
        }}
        onError={(e) => {
          setPlaybackError({
            trackId: current.id,
            type: e.currentTarget.error?.code === 4 && current.preview ? "unsupported" : "generic",
          });
          pause();
        }}
        onEnded={handleEnded}
      />
    </footer>
  );
}