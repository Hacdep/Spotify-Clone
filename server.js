import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const port = Number(process.env.API_PORT ?? 3002);
const root = dirname(fileURLToPath(import.meta.url));
const usersFile = resolve(root, ".data", "users.json");
const librariesFile = resolve(root, ".data", "libraries.json");
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
const sessionCookie = "spotify_session";
const passwordOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const sessions = new Map();
const attempts = new Map();
const catalogCache = new Map();
const appleMusicCache = new Map();
let mutationQueue = Promise.resolve();

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

async function proxyApplePreview(request, response, previewUrlValue) {
  let previewUrl;
  try {
    previewUrl = new URL(previewUrlValue);
  } catch {
    return sendJson(response, 400, { error: "invalid_preview_url" });
  }

  if (
    previewUrl.protocol !== "https:"
    || previewUrl.hostname !== "audio-ssl.itunes.apple.com"
    || previewUrl.port
    || previewUrl.username
    || previewUrl.password
    || previewUrl.search
    || previewUrl.hash
    || !/^\/itunes-assets\/AudioPreview[^/]*\/v4\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9-]{36}\/mzaf_[a-z0-9_-]+\.plus\.aac\.p\.m4a$/i.test(previewUrl.pathname)
  ) {
    return sendJson(response, 400, { error: "invalid_preview_url" });
  }

  const range = request.headers.range;
  if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) {
    return sendJson(response, 400, { error: "invalid_range" });
  }

  const controller = new AbortController();
  request.on("aborted", () => controller.abort());
  const upstream = await fetch(previewUrl, {
    headers: range ? { Range: range } : {},
    redirect: "error",
    signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
  });
  if (![200, 206, 416].includes(upstream.status)) {
    return sendJson(response, 502, { error: "preview_unavailable" });
  }

  const headers = {
    "Content-Type": "audio/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  for (const header of ["content-length", "content-range"]) {
    const value = upstream.headers.get(header);
    if (value) headers[header] = value;
  }
  response.writeHead(upstream.status, headers);
  if (!upstream.body) return response.end();

  response.on("close", () => {
    if (!response.writableEnded) controller.abort();
  });
  const audioStream = Readable.fromWeb(upstream.body);
  audioStream.on("error", (error) => response.destroy(error));
  audioStream.pipe(response);
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").flatMap((part) => {
      const separator = part.indexOf("=");
      if (separator < 0) return [];
      return [[part.slice(0, separator).trim(), part.slice(separator + 1).trim()]];
    }),
  );
}

function sessionCookieHeader(token, maxAge) {
  const parts = [
    `${sessionCookie}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

async function readUsers() {
  try {
    const content = await readFile(usersFile, "utf8");
    const users = JSON.parse(content);
    if (!Array.isArray(users)) throw new Error("User store must contain an array");
    return users;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveUsers(users) {
  await mkdir(dirname(usersFile), { recursive: true });
  const temporaryFile = `${usersFile}.${randomBytes(8).toString("hex")}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(users, null, 2), { mode: 0o600 });
  await rename(temporaryFile, usersFile);
}

async function readLibraries() {
  try {
    const content = await readFile(librariesFile, "utf8");
    const libraries = JSON.parse(content);
    if (!libraries || Array.isArray(libraries) || typeof libraries !== "object") {
      throw new Error("Library store must contain an object");
    }
    return libraries;
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function saveLibraries(libraries) {
  await mkdir(dirname(librariesFile), { recursive: true });
  const temporaryFile = `${librariesFile}.${randomBytes(8).toString("hex")}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(libraries, null, 2), { mode: 0o600 });
  await rename(temporaryFile, librariesFile);
}

async function requestUser(request) {
  const token = parseCookies(request.headers.cookie)[sessionCookie];
  const session = token && sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  const user = (await readUsers()).find((entry) => entry.id === session.userId);
  if (!user) sessions.delete(token);
  return user ?? null;
}

async function readSongs() {
  const database = JSON.parse(await readFile(resolve(root, "db.json"), "utf8"));
  if (!Array.isArray(database.songs)) throw new Error("Song store must contain an array");
  return database.songs;
}

function publicLibrary(library, songs) {
  const songById = new Map(songs.map((song) => [String(song.id), song]));
  for (const [id, song] of Object.entries(library.songsById ?? {})) {
    songById.set(id, song);
  }
  return {
    likedSongs: library.likedSongIds.map((id) => songById.get(String(id))).filter(Boolean),
    playlists: library.playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      songs: playlist.songIds.map((id) => songById.get(String(id))).filter(Boolean),
    })),
  };
}

function plainText(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => {
      const point = Number(code);
      return point <= 0x10ffff ? String.fromCodePoint(point) : " ";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const point = parseInt(code, 16);
      return point <= 0x10ffff ? String.fromCodePoint(point) : " ";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function catalogTrackFromPage(page) {
  const image = page.imageinfo?.[0];
  const metadata = image?.extmetadata ?? {};
  const filename = page.title.replace(/^File:/, "");
  const extension = filename.match(/\.(ogg|mp3)$/i)?.[1]?.toLowerCase();
  if (
    !extension
    || metadata.LicenseShortName?.value !== "CC0"
    || !image.url?.startsWith("https://upload.wikimedia.org/")
    || image.size > 20 * 1024 * 1024
  ) return null;

  const description = plainText(metadata.ImageDescription?.value ?? "");
  const describedTrack = description.length <= 180
    ? description.match(/^(.+?)\s+by\s+(.+)$/i)
    : null;
  const artist = describedTrack?.[2] ?? plainText(metadata.Artist?.value ?? "");
  const titleWithoutExtension = filename.replace(/\.(ogg|mp3)$/i, "").replace(/_/g, " ");
  const titleFromMetadata = describedTrack?.[1] ?? titleWithoutExtension;
  const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const title = titleFromMetadata.replace(
    new RegExp(`^${escapedArtist}\\s*[-–]\\s*(?:\\d+\\s*[-–]\\s*)?`, "i"),
    "",
  );

  return {
    id: `commons:${page.pageid}`,
    title: title.trim() || titleWithoutExtension,
    artist: artist || "Unknown artist",
    cover: "/covers/music.svg",
    url: image.url.split("?")[0],
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_")).replace(/^File%3A/i, "File:")}`,
  };
}

function validCatalogTrack(song) {
  if (
    song
    && typeof song.id === "string"
    && /^itunes:\d+$/.test(song.id)
    && typeof song.title === "string"
    && song.title.trim()
    && song.title.length <= 250
    && typeof song.artist === "string"
    && song.artist.trim()
    && song.artist.length <= 250
    && song.preview === true
    && song.previewDuration === 30
  ) {
    try {
      const audioUrl = new URL(song.url);
      const coverUrl = new URL(song.cover);
      const sourceUrl = new URL(song.source);
      return audioUrl.protocol === "https:"
        && audioUrl.hostname === "audio-ssl.itunes.apple.com"
        && /\.(m4a|mp4)$/i.test(audioUrl.pathname)
        && coverUrl.protocol === "https:"
        && /^is\d+-ssl\.mzstatic\.com$/.test(coverUrl.hostname)
        && sourceUrl.protocol === "https:"
        && sourceUrl.hostname === "music.apple.com";
    } catch {
      return false;
    }
  }

  if (
    !song
    || typeof song.id !== "string"
    || !/^commons:\d+$/.test(song.id)
    || typeof song.title !== "string"
    || !song.title.trim()
    || song.title.length > 250
    || typeof song.artist !== "string"
    || !song.artist.trim()
    || song.artist.length > 250
    || song.cover !== "/covers/music.svg"
    || song.license !== "CC0 1.0"
    || song.licenseUrl !== "https://creativecommons.org/publicdomain/zero/1.0/"
  ) return false;

  try {
    const audioUrl = new URL(song.url);
    const sourceUrl = new URL(song.source);
    return audioUrl.protocol === "https:"
      && audioUrl.hostname === "upload.wikimedia.org"
      && /\.(ogg|mp3)$/i.test(audioUrl.pathname)
      && sourceUrl.protocol === "https:"
      && sourceUrl.hostname === "commons.wikimedia.org"
      && sourceUrl.pathname.startsWith("/wiki/File:");
  } catch {
    return false;
  }
}

const appleStoreSettings = {
  uz: {
    country: "uz",
    terms: ["Jaloliddin Ahmadaliyev", "Munisa Rizayeva", "Yulduz Usmonova", "Ozodbek Nazarbekov"],
  },
  ru: {
    country: "ru",
    terms: ["русская поп музыка", "Zivert", "ARTIK & ASTI", "Jah Khalib"],
  },
  en: {
    country: "us",
    terms: ["pop hits", "Taylor Swift", "The Weeknd", "Dua Lipa"],
  },
};

function applePreviewFromResult(result) {
  const previewUrl = result.previewUrl;
  const artworkUrl = result.artworkUrl100;
  const sourceUrl = result.trackViewUrl;
  if (
    !Number.isSafeInteger(result.trackId)
    || typeof result.trackName !== "string"
    || !result.trackName.trim()
    || typeof result.artistName !== "string"
    || !result.artistName.trim()
    || typeof previewUrl !== "string"
    || typeof artworkUrl !== "string"
    || typeof sourceUrl !== "string"
  ) return null;

  try {
    const audio = new URL(previewUrl);
    const artwork = new URL(artworkUrl);
    const source = new URL(sourceUrl);
    if (
      audio.protocol !== "https:"
      || audio.hostname !== "audio-ssl.itunes.apple.com"
      || !/\.(m4a|mp4)$/i.test(audio.pathname)
      || artwork.protocol !== "https:"
      || !/^is\d+-ssl\.mzstatic\.com$/.test(artwork.hostname)
      || source.protocol !== "https:"
      || source.hostname !== "music.apple.com"
    ) return null;

    return {
      id: `itunes:${result.trackId}`,
      title: result.trackName.trim().slice(0, 250),
      artist: result.artistName.trim().slice(0, 250),
      cover: artworkUrl.replace(/\/\d+x\d+bb\./, "/300x300bb."),
      url: previewUrl,
      source: sourceUrl,
      preview: true,
      previewDuration: 30,
    };
  } catch {
    return null;
  }
}

async function fetchAppleMusicResults(term, country) {
  const apiUrl = new URL("https://itunes.apple.com/search");
  apiUrl.searchParams.set("term", term);
  apiUrl.searchParams.set("country", country);
  apiUrl.searchParams.set("media", "music");
  apiUrl.searchParams.set("entity", "song");
  apiUrl.searchParams.set("limit", "25");

  const response = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw Object.assign(new Error(`Apple Music catalog returned ${response.status}`), {
      status: 502,
      code: "catalog_unavailable",
    });
  }
  const payload = await response.json();
  if (!Array.isArray(payload.results)) {
    throw Object.assign(new Error("Apple Music returned an invalid catalog response"), {
      status: 502,
      code: "catalog_unavailable",
    });
  }
  return payload.results.map(applePreviewFromResult).filter(Boolean);
}

async function searchAppleMusicCatalog(query, language) {
  const settings = appleStoreSettings[language];
  const cacheKey = `${language}:${query.toLocaleLowerCase()}`;
  const cached = appleMusicCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.songs;

  const terms = query ? [query] : settings.terms;
  const resultPages = await Promise.all(
    terms.map((term) => fetchAppleMusicResults(term, settings.country)),
  );
  const seenIds = new Set();
  const songs = resultPages.flat().filter((song) => {
    if (seenIds.has(song.id)) return false;
    seenIds.add(song.id);
    return true;
  });

  if (appleMusicCache.size >= 100) appleMusicCache.delete(appleMusicCache.keys().next().value);
  appleMusicCache.set(cacheKey, { songs, expiresAt: Date.now() + 5 * 60 * 1000 });
  return songs;
}

async function searchCommonsCatalog(query, offset) {
  const cacheKey = `${query.toLocaleLowerCase()}:${offset}`;
  const cached = catalogCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  const apiUrl = new URL("https://commons.wikimedia.org/w/api.php");
  apiUrl.searchParams.set("action", "query");
  apiUrl.searchParams.set("generator", "search");
  apiUrl.searchParams.set("gsrsearch", `filetype:audio CC0 music ${query}`);
  apiUrl.searchParams.set("gsrnamespace", "6");
  apiUrl.searchParams.set("gsrlimit", "50");
  apiUrl.searchParams.set("prop", "imageinfo");
  apiUrl.searchParams.set("iiprop", "url|size|extmetadata");
  apiUrl.searchParams.set("format", "json");
  apiUrl.searchParams.set("formatversion", "2");
  if (offset > 0) {
    apiUrl.searchParams.set("continue", "gsroffset||");
    apiUrl.searchParams.set("gsroffset", String(offset));
  }

  const response = await fetch(apiUrl, {
    headers: { "User-Agent": "SpotifyCloneDemo/1.0 (local development)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw Object.assign(new Error(`Commons catalog returned ${response.status}`), {
      status: 502,
      code: "catalog_unavailable",
    });
  }
  const payload = await response.json();
  if (payload.error) {
    throw Object.assign(new Error(`Commons catalog error: ${payload.error.info}`), {
      status: 502,
      code: "catalog_unavailable",
    });
  }

  const pages = Array.isArray(payload.query?.pages) ? payload.query.pages : [];
  const continuedOffset = payload.continue?.gsroffset;
  const result = {
    songs: pages.map(catalogTrackFromPage).filter(Boolean),
    nextOffset: Number.isInteger(continuedOffset) && continuedOffset <= 500
      ? continuedOffset
      : null,
  };
  if (catalogCache.size >= 100) catalogCache.delete(catalogCache.keys().next().value);
  catalogCache.set(cacheKey, { result, expiresAt: Date.now() + 5 * 60 * 1000 });
  return result;
}

function withMutationLock(operation) {
  const result = mutationQueue.then(operation);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function checkRateLimit(request) {
  const now = Date.now();
  const key = request.socket.remoteAddress ?? "unknown";
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 10) return false;
  recent.push(now);
  attempts.set(key, recent);
  return true;
}

async function readRequestJson(request) {
  const maximumSize = 8192;
  if (Number(request.headers["content-length"] ?? 0) > maximumSize) {
    throw Object.assign(new Error("Request body is too large"), { status: 413, code: "invalid_input" });
  }

  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    let settled = false;

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      if (settled) return;
      body += chunk;
      if (Buffer.byteLength(body) > maximumSize) {
        settled = true;
        rejectBody(Object.assign(new Error("Request body is too large"), { status: 413, code: "invalid_input" }));
        request.resume();
      }
    });
    request.on("end", () => {
      if (settled) return;
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch {
        rejectBody(Object.assign(new Error("Malformed JSON"), { status: 400, code: "invalid_input" }));
      }
    });
    request.on("error", (error) => {
      if (!settled) rejectBody(error);
    });
  });
}

function validateEmail(email) {
  return typeof email === "string"
    && email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string"
    && password.length >= 8
    && Buffer.byteLength(password, "utf8") <= 128;
}

function createSession(user) {
  const token = randomBytes(32).toString("base64url");
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + sessionLifetime });
  return token;
}

async function handleRequest(request, response) {
  const url = new URL(request.url, "http://localhost");
  const { pathname } = url;

  if (request.method === "GET" && (pathname === "/songs" || pathname === "/library")) {
    const database = JSON.parse(await readFile(resolve(root, "db.json"), "utf8"));
    const data = database[pathname.slice(1)];
    return sendJson(response, 200, data);
  }

  if (pathname === "/api/catalog/search" && request.method === "GET") {
    const query = url.searchParams.get("q")?.trim() ?? "";
    const offsetValue = Number(url.searchParams.get("offset") ?? 0);
    if (query.length < 2 || query.length > 100 || !Number.isInteger(offsetValue) || offsetValue < 0 || offsetValue > 500) {
      return sendJson(response, 400, { error: "invalid_catalog_query" });
    }
    try {
      const result = await searchCommonsCatalog(query, offsetValue);
      return sendJson(response, 200, result, { "Cache-Control": "public, max-age=300" });
    } catch (error) {
      if (error.status) throw error;
      throw Object.assign(new Error("Could not load Commons catalog", { cause: error }), {
        status: 502,
        code: "catalog_unavailable",
      });
    }
  }

  if (pathname === "/api/music/search" && request.method === "GET") {
    const query = url.searchParams.get("q")?.trim() ?? "";
    const language = url.searchParams.get("language") ?? "";
    if (
      query.length > 100
      || (query && query.length < 2)
      || !Object.hasOwn(appleStoreSettings, language)
    ) {
      return sendJson(response, 400, { error: "invalid_catalog_query" });
    }
    try {
      const songs = await searchAppleMusicCatalog(query, language);
      return sendJson(response, 200, { songs }, { "Cache-Control": "public, max-age=300" });
    } catch (error) {
      if (error.status) throw error;
      throw Object.assign(new Error("Could not load official music previews", { cause: error }), {
        status: 502,
        code: "catalog_unavailable",
      });
    }
  }

  if (pathname === "/api/music/preview" && request.method === "GET") {
    const previewUrl = url.searchParams.get("url");
    if (!previewUrl || previewUrl.length > 2000) {
      return sendJson(response, 400, { error: "invalid_preview_url" });
    }
    return proxyApplePreview(request, response, previewUrl);
  }

  if (pathname.startsWith("/api/library")) {
    const user = await requestUser(request);
    if (!user) return sendJson(response, 401, { error: "unauthorized" });

    const songs = await readSongs();
    const libraries = await readLibraries();
    const library = libraries[user.id] ?? { likedSongIds: [], playlists: [] };

    if (pathname === "/api/library" && request.method === "GET") {
      return sendJson(response, 200, publicLibrary(library, songs));
    }

    if (pathname === "/api/library/liked" && request.method === "POST") {
      const input = await readRequestJson(request);
      const song = songs.find((entry) => String(entry.id) === String(input.songId))
        ?? (validCatalogTrack(input.song) && input.song.id === input.songId ? input.song : null);
      if (!song) return sendJson(response, 400, { error: "invalid_song" });
      await withMutationLock(async () => {
        const currentLibraries = await readLibraries();
        const current = currentLibraries[user.id] ?? { likedSongIds: [], playlists: [], songsById: {} };
        current.songsById ??= {};
        if (typeof song.id === "string") current.songsById[song.id] = song;
        if (!current.likedSongIds.some((id) => String(id) === String(song.id))) {
          current.likedSongIds.push(song.id);
        }
        currentLibraries[user.id] = current;
        await saveLibraries(currentLibraries);
      });
      return sendJson(response, 200, { liked: true });
    }

    const likedSongMatch = pathname.match(/^\/api\/library\/liked\/([^/]+)$/);
    if (likedSongMatch && request.method === "DELETE") {
      const songId = decodeURIComponent(likedSongMatch[1]);
      await withMutationLock(async () => {
        const currentLibraries = await readLibraries();
        const current = currentLibraries[user.id] ?? { likedSongIds: [], playlists: [], songsById: {} };
        current.likedSongIds = current.likedSongIds.filter((id) => String(id) !== songId);
        currentLibraries[user.id] = current;
        await saveLibraries(currentLibraries);
      });
      return sendJson(response, 200, { liked: false });
    }

    if (pathname === "/api/library/playlists" && request.method === "POST") {
      const input = await readRequestJson(request);
      const name = typeof input.name === "string" ? input.name.trim() : "";
      if (name.length < 1 || name.length > 60) {
        return sendJson(response, 400, { error: "invalid_playlist_name" });
      }
      const playlist = {
        id: randomBytes(12).toString("hex"),
        name,
        songIds: [],
      };
      await withMutationLock(async () => {
        const currentLibraries = await readLibraries();
        const current = currentLibraries[user.id] ?? { likedSongIds: [], playlists: [] };
        current.playlists.push(playlist);
        currentLibraries[user.id] = current;
        await saveLibraries(currentLibraries);
      });
      return sendJson(response, 201, {
        playlist: { ...playlist, songs: [] },
      });
    }

    const playlistSongMatch = pathname.match(/^\/api\/library\/playlists\/([^/]+)\/songs$/);
    if (playlistSongMatch && request.method === "POST") {
      const playlistId = decodeURIComponent(playlistSongMatch[1]);
      const input = await readRequestJson(request);
      const song = songs.find((entry) => String(entry.id) === String(input.songId))
        ?? (validCatalogTrack(input.song) && input.song.id === input.songId ? input.song : null);
      if (!song) return sendJson(response, 400, { error: "invalid_song" });
      const added = await withMutationLock(async () => {
        const currentLibraries = await readLibraries();
        const current = currentLibraries[user.id] ?? { likedSongIds: [], playlists: [], songsById: {} };
        const playlist = current.playlists.find((entry) => entry.id === playlistId);
        if (!playlist) return false;
        current.songsById ??= {};
        if (typeof song.id === "string") current.songsById[song.id] = song;
        if (!playlist.songIds.some((id) => String(id) === String(song.id))) {
          playlist.songIds.push(song.id);
        }
        currentLibraries[user.id] = current;
        await saveLibraries(currentLibraries);
        return true;
      });
      if (!added) return sendJson(response, 404, { error: "playlist_not_found" });
      return sendJson(response, 200, { added: true });
    }

    return sendJson(response, 404, { error: "not_found" });
  }

  if (pathname === "/api/auth/session" && request.method === "GET") {
    const token = parseCookies(request.headers.cookie)[sessionCookie];
    const session = token && sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token);
      return sendJson(response, 200, { user: null });
    }
    const user = (await readUsers()).find((entry) => entry.id === session.userId);
    if (!user) {
      sessions.delete(token);
      return sendJson(response, 200, { user: null });
    }
    return sendJson(response, 200, { user: publicUser(user) });
  }

  if (pathname === "/api/auth/signout" && request.method === "POST") {
    const token = parseCookies(request.headers.cookie)[sessionCookie];
    if (token) sessions.delete(token);
    return sendJson(response, 200, { user: null }, {
      "Set-Cookie": sessionCookieHeader("", 0),
    });
  }

  if (
    (pathname === "/api/auth/signup" || pathname === "/api/auth/signin")
    && request.method === "POST"
  ) {
    if (!checkRateLimit(request)) {
      return sendJson(response, 429, { error: "too_many_requests" });
    }

    const input = await readRequestJson(request);
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = input.password;
    const signingUp = pathname.endsWith("/signup");

    if (!validateEmail(email)) {
      return sendJson(response, 400, { error: "invalid_email" });
    }
    if (!validatePassword(password)) {
      return sendJson(response, 400, { error: "weak_password" });
    }
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (signingUp && (name.length < 1 || name.length > 60)) {
      return sendJson(response, 400, { error: "invalid_name" });
    }

    const user = await withMutationLock(async () => {
      const users = await readUsers();
      const existing = users.find((entry) => entry.email === email);
      if (signingUp && existing) return { error: "email_exists" };
      if (!signingUp && !existing) return { error: "invalid_credentials" };

      if (signingUp) {
        const salt = randomBytes(16).toString("hex");
        const hash = await scrypt(password, salt, 64, passwordOptions);
        const createdUser = {
          id: randomBytes(16).toString("hex"),
          name,
          email,
          salt,
          passwordHash: hash.toString("hex"),
        };
        users.push(createdUser);
        await saveUsers(users);
        return createdUser;
      }

      const hash = await scrypt(password, existing.salt, 64, passwordOptions);
      const storedHash = Buffer.from(existing.passwordHash, "hex");
      if (storedHash.length !== hash.length || !timingSafeEqual(hash, storedHash)) {
        return { error: "invalid_credentials" };
      }
      return existing;
    });

    if (user.error) {
      const status = user.error === "email_exists" ? 409 : 401;
      return sendJson(response, status, { error: user.error });
    }

    const token = createSession(user);
    return sendJson(response, signingUp ? 201 : 200, { user: publicUser(user) }, {
      "Set-Cookie": sessionCookieHeader(token, sessionLifetime / 1000),
    });
  }

  return sendJson(response, 404, { error: "not_found" });
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    if (error.status) {
      sendJson(response, error.status, { error: error.code ?? "invalid_input" });
      return;
    }
    console.error("API request failed:", error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: "internal_error" });
    } else {
      response.destroy(error);
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Spotify Clone API listening on http://127.0.0.1:${port}`);
});
