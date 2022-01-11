import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { ApodInfo } from '~/types';
import { useStore } from '~/utils/store';
import Cache from '~/utils/cache';

const MAX_CASH_SIZE = 1000;
const cache = new Cache<number, ApodInfo>(MAX_CASH_SIZE);

const SECONDS_IN_DAY = 60 * 60 * 24;

async function fetchApods(start: Dayjs, end: Dayjs): Promise<ApodInfo[]> {
  let apods: ApodInfo[] = [];

  let request: number | undefined;

  const start_unix = start.startOf('day').unix();
  const end_unix = end.startOf('day').unix();

  for (let day = start_unix; day <= end_unix; day += SECONDS_IN_DAY) {
    if (cache.has(day)) {
      apods.push(cache.get(day) as ApodInfo);
    } else if (!request) {
      request = day;
    }

    // Sends request if the next item is cached or it is at the end of the loop
    if ((cache.has(day + SECONDS_IN_DAY) || day == end_unix) && request) {
      // Requests apod information
      const resData: ApodInfo[] = (
        await axios.get('https://api.nasa.gov/planetary/apod', {
          params: {
            api_key: import.meta.env.VITE_API_KEY,
            start_date: dayjs.unix(request).format('YYYY-MM-DD'),
            end_date: dayjs.unix(day).format('YYYY-MM-DD'),
            thumbs: true,
          },
        })
      ).data;

      for (let apod of resData) {
        apods.push(apod);
        cache.set(dayjs(apod.date, 'YYYY-MM-DD').unix(), apod);
      }
      
      // Requests apod's image
      await Promise.all(
        resData.map((apod) => {
          return new Promise<void>((resolve, reject) => {
            const image = new Image();

            image.src =
              apod.media_type == 'video'
                ? (apod.thumbnail_url as string)
                : apod.url;
            image.onload = () => {
              resolve();
            };
          });
        }),
      );

      request = undefined;
    }
  }

  return apods;
}

function useApods(): [boolean, ApodInfo[]] {
  const [startDate, endDate] = useStore((state) => [
    state.startDate,
    state.endDate,
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apods, setApods] = useState<ApodInfo[]>([]);

  useEffect(() => {
    setLoading(true);

    fetchApods(startDate, endDate)
      .then((apods) => {
        setApods(apods);
        setLoading(false);
      })
  }, [startDate, endDate]);

  return [loading, apods];
}

export { useApods, fetchApods };
