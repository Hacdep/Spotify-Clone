import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import SiteFooter from "./components/SiteFooter";
import AuthPage from "./pages/AuthPage";
import Download from "./pages/Download";
import Home from "./pages/Home";
import LibraryColle`ction from "./pages/LibraryCollection";
import LibraryPage from "./pages/LibraryPage";
import Premium from "./pages/Premium";
import Support from "./pages/Support";
import { getInitialLocale, translate } from "./i18n";
import { usePlayer } from "./store/usePlayer";

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState("home");
  const [locale, setLocale] = useState(getInitialLocale);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("");
  const [notice, setNotice] = useState("");
  const [library, setLibrary] = useState({ likedSongs: [], playlists: [] });
  const [activeCollection, setActiveCollection] = useState(null);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState(false);
  const pausePlayback = usePlayer((state) => state.pause);
  const t = useCallback((key, values) => translate(locale, key, values), [locale]);
  const handleSearch = useCallback((value) => {
    setQuery(value);
    setPage("home");
  }, []);
  const selectedCollection = activeCollection?.kind === "liked"
    ? { kind: "liked", songs: library.likedSongs }
    : library.playlists.find((playlist) => playlist.id === activeCollection?.id)
      ? { ...library.playlists.find((playlist) => playlist.id === activeCollection.id), kind: "playlist" }
      : null;

  useEffect(() => {
    try {
      localStorage.setItem("spotify-locale", locale);
    } catch {
      // Keep the selected language for this page even if storage is unavailable.
    }
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then(async (response) => {
        if (!response.ok) throw new Error("Session request failed");
        const result = await response.json();
        if (!cancelled) setUser(result.user);
      })
      .catch(() => {
        if (!cancelled) setNotice("error.network");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    fetch("/api/library")
      .then(async (response) => {
        if (!response.ok) throw new Error("Library request failed");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setLibrary(data);
      })
      .catch(() => {
        if (!cancelled) setNotice("libraryError");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function updateLibrary(path, method, body) {
    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) throw new Error("Library update failed");
      const libraryResponse = await fetch("/api/library");
      if (!libraryResponse.ok) throw new Error("Library refresh failed");
      setLibrary(await libraryResponse.json());
      return true;
    } catch {
      setNotice("libraryError");
      return false;
    }
  }

  function toggleLikedSong(song) {
    if (!user) {
      setAuthMode("signup");
      return;
    }
    const isLiked = library.likedSongs.some((likedSong) => likedSong.id === song.id);
    void updateLibrary(
      isLiked ? `/api/library/liked/${encodeURIComponent(song.id)}` : "/api/library/liked",
      isLiked ? "DELETE" : "POST",
      isLiked ? null : { songId: song.id, ...(typeof song.id === "string" ? { song } : {}) },
    );
  }

  function createPlaylist(name) {
    return fetch("/api/library/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(async (response) => {
      if (!response.ok) {
        setNotice("libraryError");
        throw new Error("Playlist creation failed");
      }
      const libraryResponse = await fetch("/api/library");
      if (!libraryResponse.ok) throw new Error("Library refresh failed");
      setLibrary(await libraryResponse.json());
    }).catch((error) => {
      setNotice("libraryError");
      throw error;
    });
  }

  async function submitPlaylist(event) {
    event.preventDefault();
    setCreatingPlaylist(true);
    setPlaylistError(false);
    try {
      await createPlaylist(playlistName);
      setPlaylistName("");
      setShowPlaylistDialog(false);
    } catch {
      setPlaylistError(true);
    } finally {
      setCreatingPlaylist(false);
    }
  }

  function addSongToPlaylist(playlistId, song) {
    return updateLibrary(
      `/api/library/playlists/${encodeURIComponent(playlistId)}/songs`,
      "POST",
      { songId: song.id, ...(typeof song.id === "string" ? { song } : {}) },
    );
  }

  function openLibrary() {
    setActiveCollection(null);
    setPage("library");
  }

  function openCollection(collection) {
    setActiveCollection(collection);
    setPage("library");
  }

  function openMarketingPage(target) {
    pausePlayback();
    setPage(target);
    setQuery("");
  }

  async function signOut() {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out request failed");
      setUser(null);
      setLibrary({ likedSongs: [], playlists: [] });
    } catch {
      setNotice("error.network");
    }
  }

  if (authMode) {
    return (
      <AuthPage
        key={authMode}
        mode={authMode}
        onClose={() => {
          setAuthMode("");
          setPage("home");
          setQuery("");
        }}
        onSwitch={() => setAuthMode((mode) => mode === "signup" ? "signin" : "signup")}
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthMode("");
        }}
        t={t}
      />
    );
  }

  const marketingPage = ["premium", "support", "download"].includes(page);

  return (
    <div className={marketingPage
      ? "flex min-h-dvh flex-col bg-black text-white"
      : "grid h-dvh min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[56px_minmax(0,1fr)_auto] gap-2 bg-black p-2 text-white md:grid-cols-[minmax(260px,314px)_minmax(0,1fr)] md:grid-rows-[48px_minmax(0,1fr)_88px]"}>
      <Header
        query={query}
        onSearch={handleSearch}
        onHome={() => {
          setPage("home");
          setQuery("");
        }}
        onPremium={() => openMarketingPage("premium")}
        onSupport={() => openMarketingPage("support")}
        onDownload={() => openMarketingPage("download")}
        onLibrary={openLibrary}
        locale={locale}
        onLocaleChange={setLocale}
        user={user}
        onSignUp={() => setAuthMode("signup")}
        onSignIn={() => setAuthMode("signin")}
        onSignOut={signOut}
        marketing={marketingPage}
        t={t}
      />
      {!marketingPage && (
        <Sidebar
          user={user}
          library={library}
          locale={locale}
          onLocaleChange={setLocale}
          onSignUp={() => setAuthMode("signup")}
          onRequestCreatePlaylist={() => setShowPlaylistDialog(true)}
          onOpenCollection={openCollection}
          t={t}
        />
      )}
      <main className={marketingPage
        ? "w-full flex-1 bg-[#121212]"
        : "min-h-0 overflow-y-auto rounded-lg bg-gradient-to-b from-neutral-800 to-neutral-950 px-4 py-5 md:px-10 md:py-6"}>
        {page === "premium" ? (
          <Premium t={t} onSignUp={() => setAuthMode("signup")} />
        ) : page === "support" ? (
          <Support t={t} />
        ) : page === "download" ? (
          <Download t={t} />
        ) : page === "library" && activeCollection ? (
          <LibraryCollection collection={selectedCollection} t={t} />
        ) : page === "library" ? (
          <LibraryPage
            user={user}
            library={library}
            onOpenCollection={openCollection}
            onCreatePlaylist={() => user ? setShowPlaylistDialog(true) : setAuthMode("signup")}
            onSignIn={() => setAuthMode("signin")}
            t={t}
          />
        ) : (
          <Home query={query} onSearch={handleSearch} locale={locale} t={t} />
        )}
      </main>
      {marketingPage ? (
        <SiteFooter t={t} onNavigate={openMarketingPage} />
      ) : (
        <Player
          isAuthenticated={Boolean(user)}
          onSignUp={() => setAuthMode("signup")}
          likedSongs={library.likedSongs}
          playlists={library.playlists}
          onToggleLike={toggleLikedSong}
          onAddToPlaylist={addSongToPlaylist}
          onRequestCreatePlaylist={() => setShowPlaylistDialog(true)}
          t={t}
        />
      )}
      {showPlaylistDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={submitPlaylist}
            className="w-full max-w-md rounded-xl bg-neutral-900 p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold">{t("createPlaylistButton")}</h2>
            <label className="mt-5 block text-sm font-semibold">
              {t("playlistName")}
              <input
                autoFocus
                required
                maxLength={60}
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                className="mt-2 h-12 w-full rounded border border-neutral-600 bg-neutral-950 px-3 outline-none focus:border-white"
              />
            </label>
            {playlistError && (
              <p role="alert" className="mt-3 text-sm text-red-400">{t("libraryError")}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPlaylistDialog(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-neutral-800"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={creatingPlaylist || !playlistName.trim()}
                className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black disabled:opacity-50"
              >
                {creatingPlaylist ? t("loading") : t("createPlaylistButton")}
              </button>
            </div>
          </form>
        </div>
      )}
      {notice && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-red-900 px-4 py-3 text-sm shadow-lg"
        >
          {t(notice)}
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-4 font-bold underline"
          >
            {t("close")}
          </button>
        </div>
      )}
    </div>
  );
}
