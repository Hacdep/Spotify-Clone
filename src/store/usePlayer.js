import { create } from "zustand";

export const usePlayer = create((set, get) => ({
  queue: [],
  current: null,
  isPlaying: false,

  setQueue: (songs) => set({ queue: songs }),

  play: (song) => set({ current: song, isPlaying: true }),

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, current } = get();
    if (!queue.length) return;
    const i = queue.findIndex((s) => s.id === current?.id);
    set({ current: queue[(i + 1) % queue.length], isPlaying: true });
  },

  prev: () => {
    const { queue, current } = get();
    if (!queue.length) return;
    const i = queue.findIndex((s) => s.id === current?.id);
    set({
      current: queue[(i - 1 + queue.length) % queue.length],
      isPlaying: true,
    });
  },
}));