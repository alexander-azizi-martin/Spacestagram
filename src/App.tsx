import React, { useState, useEffect, useRef } from 'react';
import escapeStringRegexp from 'escape-string-regexp';
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

const FIRST_DAY = dayjs('1995-06-16', 'YYYY-MM-DD');
const TODAY = dayjs().startOf('day');

interface Errors {
  [errorCode: number]: string;
}

const ERROR_MESSAGES: Errors = {
  4: 'Something went wrong with Nasa servers while fetching api data try refreshing the page',
  5: "Something went wrong while fetching data from Nasa's api try refreshing the page",
};

function App() {
  const [sortOption, startDate, endDate, updateStartDate, updateEndDate] =
    useStore((state) => [
      state.sortOption,
      state.startDate,
      state.endDate,
      state.updateStartDate,
      state.updateEndDate,
    ]);

  const [alert, setAlert] = useAlert();
  const [apods, addApods, clearApods] = useFilteredApods();

  const [cursor, setCursor] = useState(
    sortOption == 'newest' ? endDate : startDate,
  );
  const errorOccurred = useRef(false);
  const fetchingApods = useRef(false);
  const fetchNextApods = () => {
    if (fetchingApods.current) {
      return;
    }
    fetchingApods.current = true;

    let nextCursor: Dayjs;
    if (sortOption == 'newest') {
      nextCursor = cursor.subtract(5, 'days');

      if (!nextCursor.isAfter(startDate)) {
        nextCursor = startDate;
      }
    } else {
      nextCursor = cursor.add(5, 'days');

      if (!nextCursor.isBefore(endDate)) {
        nextCursor = endDate;
      }
    }

    let timeoutID: NodeJS.Timeout | null = setTimeout(() => {
      timeoutID = null;

      setAlert({
        message: "It is taking a while to load data from Nasa's servers",
        severity: 'warning',
      });
    }, 15000);

    fetchApods(cursor, nextCursor)
      .then((newApods) => {
        addApods(newApods);

        if (sortOption == 'newest') {
          nextCursor = nextCursor.subtract(1, 'day');
        } else {
          nextCursor = nextCursor.add(1, 'day');
        }
        setCursor(nextCursor);
      })
      .catch((error) => {
        const errorType = Math.floor(error.response.status / 100);
        if (errorType in ERROR_MESSAGES) {
          setAlert({ message: ERROR_MESSAGES[errorType], severity: 'error' });
        } else {
          setAlert({ message: 'Unknown error occurred', severity: 'error' });
        }

        // Prevents more request being sent
        errorOccurred.current = true;
      })
      .finally(() => {
        if (timeoutID) {
          clearTimeout(timeoutID);
        }

        fetchingApods.current = false;
      });
  };

  // Handles loading another month
  const [loadedMonth, setLoadedMonth] = useState(false);
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
    setLoadedMonth(true);
  };

  useEffect(() => {
    if (!loadedMonth) {
      setCursor(sortOption == 'newest' ? endDate : startDate);
      clearApods();
    } else {
      setLoadedMonth(false);
    }
  }, [startDate, endDate, sortOption]);

  useEffect(() => {
    // InfiniteScroll component won't trigger without a scroll event
    // even if it is at the bottom of the page
    if (hasMore()) {
      window.dispatchEvent(new CustomEvent('scroll'));
    }
  });

  const hasMore = () => {
    let hasMore: boolean;
    if (sortOption == 'newest') {
      hasMore =
        cursor.isAfter(startDate, 'day') || cursor.isSame(startDate, 'day');
    } else {
      hasMore =
        cursor.isBefore(endDate, 'day') || cursor.isSame(endDate, 'day');
    }

    return hasMore && !errorOccurred.current;
  };

  let showLoadMonth: boolean;
  if (sortOption == 'newest') {
    showLoadMonth = !startDate.isSame(FIRST_DAY, 'day');
  } else {
    showLoadMonth = !endDate.isSame(TODAY, 'day');
  }

  return (
    <>
      <Header />
      <main id="main" className="flex justify-center p-[20px]">
        <InfiniteScroll
          className="flex flex-1 flex-col items-center gap-y-5"
          dataLength={Math.random()}
          next={fetchNextApods}
          hasMore={hasMore()}
          endMessage={
            showLoadMonth ? (
              <Button
                variant="outlined"
                startIcon={<Plus size={20} />}
                onClick={loadMonth}
              >
                Load Another Month
              </Button>
            ) : (
              <div>No More to Load</div>
            )
          }
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

  const [filteredApods, setFilteredApods] = useState<ApodInfo[]>([]);
  const apods = useRef<ApodInfo[]>([]);

  const addApods = (newApods: ApodInfo[]) => {
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
          return apod.title
            .toLowerCase()
            .match(escapeStringRegexp(searchQuery));
        }

        return true;
      }),
    );
  }, [apods.current, searchQuery, filterOption, sortOption, likedApods]);

  return [filteredApods, addApods, clearApods];
}

export default App;
