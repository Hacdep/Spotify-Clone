import { useEffect, useState } from "react";

const filters = [
  { key: "all", label: "Hammasi" },
  { key: "playlist", label: "Pleylistlar" },
  { key: "artist", label: "Ijrochilar" },
];

export default function Sidebar() {
  const [filter, setFilter] = useState("all");
  const [library, setLibrary] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLibrary() {
      try {
        const response = await fetch("http://localhost:3001/library", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Kutubxonani yuklab bo'lmadi (${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("db.json ichidagi library ro'yxati noto'g'ri formatda");
        }

        setLibrary(data);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Kutubxonani yuklashda noma'lum xatolik yuz berdi",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadLibrary();
    return () => controller.abort();
  }, []);

  const items =
    filter === "all" ? library : library.filter((i) => i.type === filter);

  return (
    <aside className="bg-neutral-900 rounded-lg flex flex-col overflow-hidden">
      {/* Sarlavha */}
      <div className="flex items-center justify-between p-4">
        <h2 className="font-bold text-neutral-300">Mediateka</h2>
        <button className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xl leading-none">
          +
        </button>
      </div>

      {/* Filtrlar */}
      <div className="flex gap-2 px-4 pb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              filter === f.key
                ? "bg-white text-black"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ro'yxat */}
      <ul className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && (
          <li className="p-2 text-sm text-neutral-400">Yuklanmoqda...</li>
        )}
        {error && (
          <li className="p-2 text-sm text-red-400">
            {error}. npm run server buyrug'i ishlayotganini tekshiring.
          </li>
        )}
        {!isLoading &&
          !error &&
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-800 cursor-pointer"
            >
              {item.cover ? (
                <img
                  src={item.cover}
                  alt={item.title}
                  className={`w-12 h-12 object-cover ${
                    item.type === "artist" ? "rounded-full" : "rounded"
                  }`}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className={`w-12 h-12 bg-neutral-800 ${
                    item.type === "artist" ? "rounded-full" : "rounded"
                  }`}
                />
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{item.title}</p>
                <p className="truncate text-sm text-neutral-400">
                  {item.subtitle}
                </p>
              </div>
            </li>
          ))}
      </ul>
    </aside>
  );
}