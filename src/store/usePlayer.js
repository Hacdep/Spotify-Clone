// store/usePlayer.js
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
    const i = queue.findIndex((s) => s.id === current?.id);
    set({ current: queue[(i + 1) % queue.length], isPlaying: true });
  },
}));