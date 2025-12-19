import { create } from "zustand";

export type User = {
  avatar_url: string | null;
  email: string;
  id: string;
  username: string;
};

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));