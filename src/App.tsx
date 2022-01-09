import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '~/utils/store';
import { APODData } from '~/types';

import CircularProgress from '@mui/material/CircularProgress';
import Header from '~/components/Header';
import APODList from '~/components/APODList';

function App() {
  const [loading, apods] = useApods();
  const searchQuery = useStore((state) => state.searchQuery);

  return (
    <>
      <Header />
      <main className="flex justify-center p-[20px]">
        {loading ? (
          <CircularProgress />
        ) : (
          <APODList
            apodList={apods.filter((apod) =>
              apod.title.toLowerCase().match(searchQuery),
            )}
          />
        )}
      </main>
    </>
  );
}

function useApods(): [boolean, APODData[]] {
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
        setApods(res.data);
        setLoading(false);
      });
  }, [startDate, endDate]);

  return [loading, apods];
}

export default App;
