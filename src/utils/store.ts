import create from 'zustand';

type State = {
  searchQuery: string;
  updateSearchQuery: (newQuery: string) => void;
};

export const useStore = create<State>((set) => ({
  searchQuery: '',
  updateSearchQuery(newQuery: string) {
    set((state) => ({ ...state, searchQuery: newQuery }));
  },
}));
