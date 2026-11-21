import { create } from 'zustand';
import api from './api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  init: async () => {
    if (!api.accessToken) {
      set({ loading: false });
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, token: api.accessToken, isAuthenticated: true, loading: false });
    } catch {
      api.clearTokens();
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  login: (accessToken, refreshToken) => {
    api.setTokens(accessToken, refreshToken);
    set({ token: accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.logout(); } catch {}
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
