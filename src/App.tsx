import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '~/utils/store';
import { ApodInfo } from '~/types';
import fetchApods, { SECONDS_IN_DAY } from '~/utils/fetchApods';

import InfiniteScroll from 'react-infinite-scroll-component';
import CircularProgress from '@mui/material/CircularProgress';
import Header from '~/components/Header';
import ApodList from '~/components/ApodList';

function App() {
  const [
    searchQuery,
    filterOption,
    sortOption,
    likedApods,
    startDate,
    endDate,
  ] = useStore((state) => [
    state.searchQuery,
    state.filterOption,
    state.sortOption,
    state.likedApods,
    state.startDate,
    state.endDate,
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
          !apod.title.toLowerCase().match(searchQuery)
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

  const [cursor, setCursor] = useState(
    sortOption == 'newest' ? endDate : startDate,
  );
  const [apods, setApods] = useState<ApodInfo[]>([]);
  const fetchNextApods = () => {
    console.log('Fetching apods');
    let nextCursor: Dayjs;

    if (sortOption == 'newest') {
      nextCursor = cursor.subtract(5, 'days');

      if (!nextCursor.isAfter(startDate)) {
        nextCursor = startDate;
      }
    } else if (sortOption == 'oldest') {
      nextCursor = cursor.add(5, 'days');

      if (!nextCursor.isBefore(endDate)) {
        nextCursor = endDate;
      }
    }

    fetchApods(cursor, nextCursor).then((newApods) => {
      setApods(removeDuplicates(apods.concat(newApods)));

      setCursor(nextCursor);
    });
  };

  // For some reason the InfiniteScroll component won't send an initial data request
  // so this is for making the initial request
  const [initialLoad, setInitialLoad] = useState(false);
  useEffect(() => {
    fetchNextApods();
  }, [initialLoad]);

  useEffect(() => {
    setInitialLoad(!initialLoad);
    setCursor(sortOption == 'newest' ? endDate : startDate);
    setApods([]);
  }, [startDate, endDate]);

  const num_apods = (endDate.unix() - startDate.unix()) / SECONDS_IN_DAY + 1;

  return (
    <>
      <Header />
      <main id="main" className="flex items-center justify-center p-[20px]">
        <InfiniteScroll
          className="flex flex-col items-center gap-y-5"
          dataLength={apods.length}
          next={fetchNextApods}
          hasMore={num_apods != apods.length}
          initialScrollY={100}
          scrollThreshold="0px"
          loader={<CircularProgress />}
        >
          <ApodList apodList={selectApods(apods)} />
        </InfiniteScroll>
      </main>
    </>
  );
}

export default App;
