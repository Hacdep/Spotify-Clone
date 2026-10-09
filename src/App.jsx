import Sidebar from "./components/Sidebar";


export default function App() {
  return (
    <div className="h-screen  text-white grid gap-2 p-2 grid-cols-[300px_1fr_300px] grid-rows-[auto_1fr_auto]">
      <header className="col-span-3 bg-neutral-900 rounded-lg p-3">
        Tepa panel
      </header>

      <Sidebar />

      <aside className="bg-neutral-900 rounded-lg p-3">Sidebar</aside>

      <main className="bg-neutral-900 rounded-lg p-3 overflow-y-auto">
        Asosiy qism
      </main>

      <aside className="bg-neutral-900 rounded-lg p-3">Hozirgi qo'shiq</aside>

      <footer className="col-span-3 bg-neutral-900 rounded-lg p-3">
        Pleyer
      </footer>
    </div>
  );
}