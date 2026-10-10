import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Player from "./components/Player";
import NowPlaying from "./components/NowPlaying";

export default function App() {
  return (
    <div className="h-screen bg-black text-white grid gap-2 p-2 grid-cols-[300px_1fr_300px] grid-rows-[auto_1fr_auto]">
      <header className="col-span-3 bg-neutral-900 rounded-lg p-3">
        Tepa panel
      </header>

      <Sidebar />

      <main className="bg-neutral-900 rounded-lg p-6 overflow-y-auto">
        <Home />
      </main>
    <NowPlaying />

    <Player   />
      <aside className="bg-neutral-900 rounded-lg p-3">Hozirgi qo'shiq</aside>

      <footer className="col-span-3 bg-neutral-900 rounded-lg p-3">
        Pleyer
      </footer>
    </div>
  );
}