import React, { useState, useEffect, forwardRef } from 'react';
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

type Alert = {
  message: string;
  severity: AlertColor;
};

const firstDate = dayjs('1995-06-16', 'YYYY-MM-DD');
const today = dayjs().startOf('day');

function App() {
  const [
    searchQuery,
    filterOption,
    sortOption,
    likedApods,
    startDate,
    endDate,
    updateStartDate,
    updateEndDate,
  ] = useStore((state) => [
    state.searchQuery,
    state.filterOption,
    state.sortOption,
    state.likedApods,
    state.startDate,
    state.endDate,
    state.updateStartDate,
    state.updateEndDate,
  ]);

  const selectApods = (apods: ApodInfo[]) => {
    return apods
      .filter((apod) => {
        if (filterOption == 'liked' && !likedApods.has(apod.date)) {
          return false;
        } else if (filterOption == 'unliked' && likedApods.has(apod.date)) {
          return false;
        } else if (
          searchQuery &&
          !apod.title.toLowerCase().match(escapeStringRegexp(searchQuery))
        ) {
          return false;
        }

        return true;
      })
      .sort((apod1, apod2) => {
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

  const removeDuplicates = (apods: ApodInfo[]) => {
    const seen = new Set<string>();

    return apods.filter((apod) => {
      if (seen.has(apod.date)) {
        return false;
      }

      seen.add(apod.date);
      return true;
    });
  };

  const [alert, setAlert] = useState<Alert>();
  const [cursor, setCursor] = useState(
    sortOption == 'newest' ? endDate : startDate,
  );
  const [apods, setApods] = useState<ApodInfo[]>([]);
  const fetchNextApods = () => {
    console.log('Fetching data');
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
        if (timeoutID) {
          clearTimeout(timeoutID);
        }

        setApods(removeDuplicates(apods.concat(newApods)));
        setCursor(nextCursor);
      })
      .catch((error) => {
        const errorType = error.response.status / 100;

        switch (errorType) {
          case 5:
            setAlert({
              message:
                'Something went wrong with Nasa servers while fetching api data try refreshing the page',
              severity: 'error',
            });
            break;
          case 4:
            setAlert({
              message:
                "Something went wrong while fetching data from Nasa's api try refreshing the page",
              severity: 'error',
            });
            break;
          default:
            setAlert({
              message: 'Unknown error occurred',
              severity: 'error',
            });
            break;
        }

        // Prevents more request being sent
        if (sortOption == 'newest') {
          updateStartDate(cursor);
        } else if (sortOption == 'oldest') {
          updateEndDate(cursor);
        }
      });
  };

  const [loadedMonth, setLoadedMonth] = useState(false);
  const loadMonth = () => {
    if (sortOption == 'newest') {
      let nextStartDate = startDate.subtract(1, 'month');
      if (!nextStartDate.isAfter(firstDate)) {
        nextStartDate = firstDate;
      }

      updateStartDate(nextStartDate);
    } else if (sortOption == 'oldest') {
      let nextEndDate = endDate.add(1, 'month');
      if (!nextEndDate.isBefore(today)) {
        nextEndDate = today;
      }

      updateEndDate(nextEndDate);
    }

    setLoadedMonth(true);
  };

  let showLoadMonth: boolean;
  if (sortOption == 'newest') {
    showLoadMonth = !startDate.isSame(firstDate, 'day');
  } else {
    showLoadMonth = !endDate.isSame(today, 'day');
  }

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

  useEffect(() => {
    if (!loadedMonth) {
      setCursor(sortOption == 'newest' ? endDate : startDate);
      setApods([]);
    } else {
      setLoadedMonth(false);
    }
  }, [startDate, endDate, sortOption]);

  const hasMore = () => {
    const numApods =
      Math.round((endDate.unix() - startDate.unix()) / SECONDS_IN_DAY) + 1;
    let hasMore: boolean;
    if (sortOption == 'newest') {
      hasMore = !cursor.isSame(startDate, 'day') || 1 > apods.length;
    } else {
      hasMore = !cursor.isSame(endDate, 'day') || 1 > apods.length;
    }

    return hasMore;
  };

  useEffect(() => {
    // InfiniteScroll component won't trigger without a scroll event
    // even if it is at the bottom of the page
    if (hasMore()) {
      window.dispatchEvent(new CustomEvent('scroll'));
    }
  });
  
  const selectedApods = selectApods(apods);

  return (
    <>
      <Header />
      <main id="main" className="flex justify-center p-[20px]">
        <InfiniteScroll
          className="flex flex-1 flex-col items-center gap-y-5"
          dataLength={Math.random()}
          next={fetchNextApods}
          hasMore={hasMore()}
          scrollThreshold="0px"
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
          <ApodList apodList={selectedApods} />
        </InfiniteScroll>
        {selectedApods.length > 1 && (
          <div className="hidden lg:block flex-0 sticky top-0 h-[100vh] self-start">
            <div className="sticky top-[calc(100vh-60px)] w-max">
              <div className="relative left-10">
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
        )}
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

export default App;
