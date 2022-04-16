import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { ApodInfo } from '~/types';
import { useStore } from '~/utils/store';
import Cache from '~/utils/cache';

const MAX_CASH_SIZE = 1000;
const cache = new Cache<number, ApodInfo>(MAX_CASH_SIZE);

export const SECONDS_IN_DAY = 60 * 60 * 24;

/**
 * Returns all APODS between the given start and end date inclusive.
 */
async function fetchApods(start: Dayjs, end: Dayjs): Promise<ApodInfo[]> {
  let apods: ApodInfo[] = [];

  let request_start: number | undefined;

  // Rounds the start and end to the beginning of their respective day
  let start_unix = start.startOf('day').unix();
  let end_unix = end.startOf('day').unix();

  // Makes sure  that start < end
  if (end_unix < start_unix) {
    [start_unix, end_unix] = [end_unix, start_unix];
  }

  // Loops through every day between start and end
  for (let day = start_unix; day <= end_unix; day += SECONDS_IN_DAY) {
    // Checks whether day has been cached
    if (cache.has(day)) {
      apods.push(cache.get(day) as ApodInfo);
    } else if (!request_start) {
      request_start = day;
    }

    // Sends request if the next item is cached or it is at the end of the loop
    if ((cache.has(day + SECONDS_IN_DAY) || SECONDS_IN_DAY > Math.abs(end_unix - day)) && request_start) {
      // Requests apod information
      const resData: ApodInfo[] = (
        await axios.get('https://api.nasa.gov/planetary/apod', {
          params: {
            api_key: import.meta.env.VITE_API_KEY,
            start_date: dayjs.unix(request_start).format('YYYY-MM-DD'),
            end_date: dayjs.unix(day).format('YYYY-MM-DD'),
            thumbs: true,
          },
        })
      ).data;

      // Adds fetched apods to result list
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

      request_start = undefined;
    }
  }

  return apods;
}

export default fetchApods;
