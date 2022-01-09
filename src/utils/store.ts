import create from 'zustand';
import dayjs, { Dayjs } from 'dayjs';

type State = {
  searchQuery: string;
  updateSearchQuery: (newQuery: string) => void;

  startDate: Dayjs;
  updateStartDate: (newDate: Dayjs) => void;

  endDate: Dayjs;
  updateEndDate: (newDate: Dayjs) => void;

  likedApods: string[];
  likeApod: (apodDate: string) => void;
  unlikeApod: (apodDate: string) => void;
};

export const useStore = create<State>((set) => ({
  searchQuery: '',
  updateSearchQuery(newQuery: string) {
    set((state) => ({ ...state, searchQuery: newQuery }));
  },

  startDate: dayjs().subtract(1, 'month').startOf('day'),
  updateStartDate(newDate: Dayjs) {
    set((state) => ({ ...state, startDate: newDate }));
  },

  endDate: dayjs().startOf('day'),
  updateEndDate(newDate: Dayjs) {
    set((state) => ({ ...state, endDate: newDate }));
  },

  likedApods: [],
  likeApod(apodDate) {
    set((state) => ({
      ...state,
      likedApods: state.likedApods.concat(apodDate),
    }));
  },
  unlikeApod(apodDate) {
    set((state) => ({
      ...state,
      likedApods: state.likedApods.filter((apod) => apod != apodDate),
    }));
  },
}));
