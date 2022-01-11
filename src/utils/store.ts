import create, { StateCreator } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';
import { FilterOptions, SortOptions } from '~/types';

type SearchSlice = {
  searchQuery: string;
  updateSearchQuery: (newQuery: string) => void;
};

const createSearchSlice: StateCreator<SearchSlice> = (set, get) => ({
  searchQuery: '',
  updateSearchQuery(newQuery: string) {
    set((state) => ({ searchQuery: newQuery }));
  },
});

type DateRangeSlice = {
  startDate: Dayjs;
  endDate: Dayjs;

  updateStartDate: (newDate: Dayjs) => void;
  updateEndDate: (newDate: Dayjs) => void;
};

const createDateRangeSlice: StateCreator<DateRangeSlice> = (set, get) => ({
  startDate: dayjs().subtract(10, 'days').startOf('day'),
  endDate: dayjs().startOf('day'),

  updateStartDate(newDate: Dayjs) {
    set((state) => ({ startDate: newDate }));
  },
  updateEndDate(newDate: Dayjs) {
    set((state) => ({ endDate: newDate }));
  },
});

type LikedApodsSlice = {
  likedApods: Set<string>;

  likeApod: (apodDate: string) => void;
  unlikeApod: (apodDate: string) => void;
};

const createLikedApodsSlice: StateCreator<LikedApodsSlice> = (set, get) => ({
  likedApods: new Set(JSON.parse(localStorage.getItem('likedApods') || '[]')),

  likeApod(apodDate) {
    set((state) => {
      state.likedApods.add(apodDate);

      localStorage.setItem(
        'likedApods',
        JSON.stringify(Array.from(state.likedApods)),
      );

      return {
        likedApods: state.likedApods,
      };
    });
  },
  unlikeApod(apodDate) {
    set((state) => {
      state.likedApods.delete(apodDate);

      localStorage.setItem(
        'likedApods',
        JSON.stringify(Array.from(state.likedApods)),
      );

      return {
        likedApods: state.likedApods,
      };
    });
  },
});

type OptionsSlice = {
  filterOption: FilterOptions;
  sortOption: SortOptions;

  setFilterOption: (newFilter: FilterOptions) => void;
  setSortOption: (newFilter: SortOptions) => void;
};

const createOptionsSlice: StateCreator<OptionsSlice> = (set, get) => ({
  filterOption: 'all',
  sortOption: 'newest',

  setFilterOption(newFilter) {
    set((state) => ({ filterOption: newFilter }));
  },
  setSortOption(newFilter) {
    set((state) => ({ sortOption: newFilter }));
  },
});

type State = SearchSlice & DateRangeSlice & LikedApodsSlice & OptionsSlice;

export const useStore = create<State>((set, get, api) => ({
  ...createSearchSlice(set as any, get, api),
  ...createDateRangeSlice(set as any, get, api),
  ...createLikedApodsSlice(set as any, get, api),
  ...createOptionsSlice(set as any, get, api),
}));
