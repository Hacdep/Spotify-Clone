import { useState } from "react";
import { library } from "../data/songs";

const filters = [
  { key: "all", label: "Hammasi" },
  { key: "playlist", label: "Pleylistlar" },
  { key: "artist", label: "Ijrochilar" },
];

export default function Sidebar() {
  const [filter, setFilter] = useState("all");

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
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-800 cursor-pointer"
          >
            <img
              src={item.cover}
              alt={item.title}
              className={`w-12 h-12 object-cover ${
                item.type === "artist" ? "rounded-full" : "rounded"
              }`}
            />
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