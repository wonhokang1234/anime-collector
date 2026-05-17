import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  rarityTier?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, "id">) => void;
  removeToast: (id: number) => void;
}

let _counter = 0;
const _timers = new Map<number, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (item) => {
    const id = ++_counter;
    set((state) => ({ toasts: [...state.toasts, { ...item, id }] }));
    const timer = setTimeout(() => {
      _timers.delete(id);
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2800);
    _timers.set(id, timer);
  },

  removeToast: (id) => {
    const timer = _timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      _timers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
