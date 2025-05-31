import { writable } from 'svelte/store';

interface AppState {
  isLoading: boolean;
  sidebarOpen: boolean;
  error: string | null;
}

const initialState: AppState = {
  isLoading: false,
  sidebarOpen: true,
  error: null
};

const { subscribe, set, update } = writable(initialState);

export const appStore = {
  subscribe,
  setLoading: (isLoading: boolean) => {
    update(state => ({ ...state, isLoading }));
  },
  toggleSidebar: () => {
    update(state => ({ ...state, sidebarOpen: !state.sidebarOpen }));
  },
  setError: (error: string | null) => {
    update(state => ({ ...state, error }));
  },
  reset: () => set(initialState)
};