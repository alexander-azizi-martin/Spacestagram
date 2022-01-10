import create from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import { FilterOptions, SortOptions } from '~/types';

type State = {
  searchQuery: string;
  updateSearchQuery: (newQuery: string) => void;

  startDate: Dayjs;
  updateStartDate: (newDate: Dayjs) => void;

  endDate: Dayjs;
  updateEndDate: (newDate: Dayjs) => void;

  likedApods: Set<string>;
  likeApod: (apodDate: string) => void;
  unlikeApod: (apodDate: string) => void;

  filterOption: FilterOptions;
  setFilterOption: (newFilter: FilterOptions) => void;

  sortOption: SortOptions;
  setSortOption: (newFilter: SortOptions) => void;
};

export const useStore = create<State>((set, get) => ({
  searchQuery: '',
  updateSearchQuery(newQuery: string) {
    set((state) => ({ searchQuery: newQuery }));
  },

  startDate: dayjs().subtract(1, 'day').startOf('day'),
  updateStartDate(newDate: Dayjs) {
    set((state) => ({ startDate: newDate }));
  },

  endDate: dayjs().startOf('day'),
  updateEndDate(newDate: Dayjs) {
    set((state) => ({ endDate: newDate }));
  },

  likedApods: new Set(),
  likeApod(apodDate) {
    set((state) => {
      likedApods: state.likedApods.add(apodDate);
    });
  },
  unlikeApod(apodDate) {
    set((state) => {
      state.likedApods.delete(apodDate);

      return {
        likedApods: state.likedApods,
      };
    });
  },

  filterOption: 'all',
  setFilterOption(newFilter) {
    set((state) => ({ filterOption: newFilter }));
  },

  sortOption: 'newest',
  setSortOption(newFilter) {
    set((state) => ({ sortOption: newFilter }));
  },
}));
