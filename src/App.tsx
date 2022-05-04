import React, { useState, useEffect, useRef } from 'react';
import { AxiosError } from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '~/utils/store';
import { ApodInfo } from '~/types';
import fetchApods, { SECONDS_IN_DAY } from '~/utils/fetchApods';
import InfiniteScroll from 'react-infinite-scroll-component';
import CircularProgress from '@mui/material/CircularProgress';
import Alert, { AlertColor } from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import { X as CloseIcon, Plus } from 'react-feather';
import Header from '~/components/Header';
import ApodList from '~/components/ApodList';
import { start } from 'repl';

function App() {
  const [sortOption, startDate, endDate] = useStore((state) => [
    state.sortOption,
    state.startDate,
    state.endDate,
  ]);

  const [alert, setAlert] = useAlert();
  const [apods, appendApods, clearApods] = useFilteredApods();
  const [fetchNextApods, resetApods, hasMore] = usePaginatedApods(
    appendApods,
    clearApods,
  );

  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (loadingMore) {
      setLoadingMore(false);
    } else {
      resetApods();
    }
  }, [startDate, endDate, sortOption]);

  useEffect(() => {
    // InfiniteScroll component won't trigger without a scroll event
    // even if it is at the bottom of the page
    if (hasMore) {
      window.dispatchEvent(new CustomEvent('scroll'));
    }
  });

  return (
    <>
      <Header />
      <main id="main" className="flex justify-center p-[20px]">
        <InfiniteScroll
          className="flex flex-1 flex-col items-center gap-y-5"
          dataLength={Math.random()}
          next={fetchNextApods}
          hasMore={hasMore}
          endMessage={<LoadMoreButton setLoadingMore={setLoadingMore} />}
          loader={<CircularProgress />}
        >
          <ApodList apodList={apods} />
        </InfiniteScroll>
        {apods.length > 1 && <BackToTopButton />}
        {alert != undefined && (
          <Slide className="absolute bottom-10" direction="up" in={true}>
            <Alert
              style={{ position: 'fixed' }}
              severity={alert.severity}
              onClose={() => {
                setAlert(undefined);
              }}
            >
              <div className="flex items-center h-full">{alert.message}</div>
            </Alert>
          </Slide>
        )}
      </main>
    </>
  );
}

function BackToTopButton() {
  return (
    <div className="hidden lg:block flex-0 sticky top-0 h-[100vh] self-start">
      <div className="relative sticky top-[calc(100vh-60px)]">
        <div className="absolute left-10 w-max">
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
}

const FIRST_DAY = dayjs('1995-06-16', 'YYYY-MM-DD');
const TODAY = dayjs().startOf('day');

interface LoadMoreButtonProps {
  setLoadingMore: (value: boolean) => void;
}

function LoadMoreButton(props: LoadMoreButtonProps) {
  const [sortOption, startDate, endDate, updateStartDate, updateEndDate] =
    useStore((state) => [
      state.sortOption,
      state.startDate,
      state.endDate,
      state.updateStartDate,
      state.updateEndDate,
    ]);

  // Handles loading another month
  const loadMonth = () => {
    if (sortOption == 'newest') {
      let nextStartDate = startDate.subtract(1, 'month');

      // Rounds to the first date that APOD started
      if (!nextStartDate.isAfter(FIRST_DAY)) {
        nextStartDate = FIRST_DAY;
      }

      updateStartDate(nextStartDate);
    } else if (sortOption == 'oldest') {
      let nextEndDate = endDate.add(1, 'month');

      // Rounds to today since you cant see APODS of the future
      if (!nextEndDate.isBefore(TODAY)) {
        nextEndDate = TODAY;
      }

      updateEndDate(nextEndDate);
    }

    // Prevents whole screen from refreshing
    props.setLoadingMore(true);
  };

  let showLoadMonth: boolean;
  if (sortOption == 'newest') {
    showLoadMonth = !startDate.isSame(FIRST_DAY, 'day');
  } else {
    showLoadMonth = !endDate.isSame(TODAY, 'day');
  }

  return (
    <Button
      variant="outlined"
      startIcon={<Plus size={20} />}
      onClick={loadMonth}
      disabled={!showLoadMonth}
    >
      Load Another Month
    </Button>
  );
}

type Alert = {
  message: string;
  severity: AlertColor;
};

type UseAlert = [Alert | undefined, (alert: Alert | undefined) => void];

function useAlert(): UseAlert {
  const [alert, setAlert] = useState<Alert>();

  useEffect(() => {
    if (alert) {
      let timeoutID: NodeJS.Timeout | null = setTimeout(() => {
        timeoutID = null;
        setAlert(undefined);
      }, 10000);

      return () => {
        if (timeoutID) {
          clearTimeout(timeoutID);
        }
      };
    }
  }, [alert]);

  return [alert, setAlert];
}

type UseFilteredApods = [ApodInfo[], (apods: ApodInfo[]) => void, () => void];

function useFilteredApods(): UseFilteredApods {
  const [searchQuery, filterOption, sortOption, likedApods] = useStore(
    (state) => [
      state.searchQuery,
      state.filterOption,
      state.sortOption,
      state.likedApods,
    ],
  );

  const apods = useRef<ApodInfo[]>([]);
  const [filteredApods, setFilteredApods] = useState<ApodInfo[]>([]);

  const appendApods = (newApods: ApodInfo[]) => {
    apods.current = apods.current.concat(newApods).sort((apod1, apod2) => {
      const apod1Date = dayjs(apod1.date, 'YYYY-MM-DD');
      const apod2Date = dayjs(apod2.date, 'YYYY-MM-DD');

      if (sortOption == 'newest') {
        return apod1Date.isBefore(apod2Date) ? 1 : -1;
      } else if (sortOption == 'oldest') {
        return apod1Date.isBefore(apod2Date) ? -1 : 1;
      }

      return 0;
    });
  };

  const clearApods = () => {
    setFilteredApods([]);
    apods.current = [];
  };

  useEffect(() => {
    setFilteredApods(
      apods.current.filter((apod) => {
        switch (filterOption) {
          case 'liked':
            if (!likedApods.has(apod.date)) return false;
            break;
          case 'unliked':
            if (likedApods.has(apod.date)) return false;
            break;
        }

        if (searchQuery) {
          return apod.title.match(new RegExp(searchQuery, 'i')) != null;
        }

        return true;
      }),
    );
  }, [apods.current, searchQuery, filterOption, sortOption, likedApods]);

  return [filteredApods, appendApods, clearApods];
}

interface Errors {
  [errorCode: number]: string;
}

const ERROR_MESSAGES: Errors = {
  4: 'Something went wrong with Nasa servers while fetching api data try refreshing the page',
  5: "Something went wrong while fetching data from Nasa's api try refreshing the page",
};

const PAGE_SIZE = 5;

type UsePaginatedApods = [() => void, () => void, boolean];

function usePaginatedApods(
  appendApods: (apods: ApodInfo[]) => void,
  clearApods: () => void,
): UsePaginatedApods {
  const [alert, setAlert] = useAlert();
  const [sortOption, startDate, endDate] = useStore((state) => [
    state.sortOption,
    state.startDate,
    state.endDate,
  ]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const fetchingPage = useRef(false);

  const fetchNextPage = () => {
    if (fetchingPage.current || !hasMore) {
      return;
    }

    fetchingPage.current = true;

    // Notifies use when request is taking too long
    let timeoutID: NodeJS.Timeout | null = setTimeout(() => {
      timeoutID = null;

      setAlert({
        message: "It is taking a while to load data from Nasa's servers",
        severity: 'warning',
      });
    }, 10000);

    // Calculates the start and end date for the current page
    let pageStartDate: Dayjs;
    let pageEndDate: Dayjs;
    if (sortOption == 'newest') {
      pageEndDate = endDate.subtract(PAGE_SIZE * page, 'days');
      pageStartDate = pageEndDate.subtract(PAGE_SIZE - 1, 'days');

      if (
        pageStartDate.isBefore(startDate, 'day') ||
        pageStartDate.isSame(startDate, 'day')
      ) {
        pageStartDate = startDate;
        setHasMore(false);
      }
    } else {
      pageStartDate = startDate.add(PAGE_SIZE * page, 'days');
      pageEndDate = pageStartDate.add(PAGE_SIZE - 1, 'days');

      if (
        pageEndDate.isAfter(endDate, 'day') ||
        pageEndDate.isSame(endDate, 'day')
      ) {
        pageEndDate = endDate;
        setHasMore(false);
      }
    }

    // console.log('FETCHING START DATE', pageStartDate.format('MMM D, YYYY'));
    // console.log('FETCHING START DATE', pageEndDate.format('MMM D, YYYY'));

    fetchApods(pageStartDate, pageEndDate)
      .then((newApods) => {
        appendApods(newApods);

        setPage(page + newApods.length / PAGE_SIZE);
      })
      .catch((error) => {
        const errorType = Math.floor(error.response.status / 100);
        if (errorType in ERROR_MESSAGES) {
          setAlert({ message: ERROR_MESSAGES[errorType], severity: 'error' });
        } else {
          setAlert({ message: 'Unknown error occurred', severity: 'error' });
        }

        // Prevents more request from being sent
        setHasMore(false);
      })
      .finally(() => {
        if (timeoutID) {
          clearTimeout(timeoutID);
        }

        fetchingPage.current = false;
      });
  };

  const resetPage = () => {
    setPage(0);
    setHasMore(true);
    clearApods();
  };

  useEffect(() => {
    setHasMore(true);
  }, [startDate, endDate]);

  return [fetchNextPage, resetPage, hasMore];
}

export default App;
