import { create } from "zustand";

export const usePlayer = create((set, get) => ({
  queue: [],
  current: null,
  isPlaying: false,
  shuffle: false,
  repeat: false,

  setQueue: (songs) => set({ queue: songs }),
  play: (song) => set({ current: song, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),

  next: () => {
    const { queue, current, shuffle } = get();
    if (!queue.length) return;

    if (shuffle && queue.length > 1) {
      let song;
      do {
        song = queue[Math.floor(Math.random() * queue.length)];
      } while (song.id === current?.id);
      set({ current: song, isPlaying: true });
      return;
    }

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