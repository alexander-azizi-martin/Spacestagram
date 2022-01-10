import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { useStore } from '~/utils/store';
import { ApodInfo } from '~/types';

import CircularProgress from '@mui/material/CircularProgress';
import Header from '~/components/Header';
import ApodList from '~/components/ApodList';

function App() {
  const [loading, apods] = useApods();
  const [searchQuery, filterOption, sortOption, likedApods] = useStore(
    (state) => [
      state.searchQuery,
      state.filterOption,
      state.sortOption,
      state.likedApods,
    ],
  );

  const filterApods = (apods: ApodInfo[]) => {
    return apods.filter((apod) => {
      let filter = true;

      switch (filterOption) {
        case 'liked':
          filter &&= likedApods.has(apod.date);
          break;
        case 'unliked':
          filter &&= !likedApods.has(apod.date);
          break;
      }

      if (searchQuery) {
        filter &&= Boolean(apod.title.toLowerCase().match(searchQuery));
      }

      return filter;
    });
  };

  const sortApods = (apods: ApodInfo[]) => {
    apods.sort((apod1, apod2) => {
      const apod1Time = dayjs(apod1.date, 'YYYY-MM-DD');
      const apod2time = dayjs(apod2.date, 'YYYY-MM-DD');

      const result = Boolean(
        sortOption == 'newest' ? apod1Time < apod2time : apod1Time > apod2time,
      );

      return result ? 1 : -1;
    });

    return apods;
  };

  return (
    <>
      <Header />
      <main className="flex justify-center p-[20px]">
        {loading ? (
          <CircularProgress />
        ) : (
          <ApodList apodList={sortApods(filterApods(apods))} />
        )}
      </main>
    </>
  );
}

function useApods(): [boolean, ApodInfo[]] {
  const [loading, setLoading] = useState(true);
  const [apods, setApods] = useState([]);

  const [startDate, endDate] = useStore((state) => [
    state.startDate,
    state.endDate,
  ]);

  useEffect(() => {
    setLoading(true);
    setApods([]);

    axios
      .get('https://api.nasa.gov/planetary/apod', {
        params: {
          api_key: import.meta.env.VITE_API_KEY,
          start_date: startDate.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD'),
          thumbs: true,
        },
      })
      .then((res) => {
        console.log(res.data);
        setApods(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setApods([]);
        setLoading(false);
      });
  }, [startDate, endDate]);

  return [loading, apods];
}

export default App;
