import { create } from "zustand";
import { api } from "../api/client";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  bootstrap: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ user: AuthUser }>("/auth/me");
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ user: AuthUser }>("/auth/login", {
        identifier,
        password
      });
      set({ user: res.data.user, loading: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to login. Please try again.";
      set({ error: message, loading: false });
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ user: AuthUser }>("/auth/register", {
        username,
        email,
        password
      });
      set({ user: res.data.user, loading: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "Failed to register. Please try again.";
      set({ error: message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null, loading: false });
    }
  }
}));

