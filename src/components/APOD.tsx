import React, { MouseEvent, useState } from 'react';
import ReactPlayer from 'react-player';
import { Heart } from 'react-feather';
import dayjs from 'dayjs';
import { useStore } from '~/utils/store';
import { APODData } from '~/types';
import '~/styles/APOD.css';

type APODProps = {
  apodData: APODData;
};

function APOD({ apodData }: APODProps) {
  const [likedApods, likeApod, unlikeApod] = useStore((state) => [
    state.likedApods,
    state.likeApod,
    state.unlikeApod,
  ]);

  const handleClick = (event: MouseEvent) => {
    const isLicked = likedApods.has(apodData.date);

    if (isLicked) {
      unlikeApod(apodData.date);

      (event.target as HTMLElement).style['animation'] = '';
    } else {
      likeApod(apodData.date);

      (event.target as HTMLElement).style['animation'] = 'like-animation 0.5s';
    }
  };

  return (
    <article className="apod">
      <aside className="bg-[#f7f9fa]">
        <div
          className={`apod-sidebar-heart ${
            likedApods.has(apodData.date) ? 'apod-sidebar-heart-liked' : ''
          }`}
          onClick={handleClick}
        >
          <Heart size={25} />
        </div>
      </aside>

      <div className="bg-white">
        <div className="flex justify-between items-end m-2.5">
          <h3 className="text-xl font-medium leading-none">{apodData.title}</h3>
          <time className="text-xs">
            {dayjs(apodData.date, 'YYYY-MM-DD').format('MMM D, YYYY')}
          </time>
        </div>

        <div className="w-full">
          {apodData.media_type == 'image' ? (
            <img src={apodData.url} alt={apodData.title}></img>
          ) : (
            <ReactPlayer url={apodData.url} width="100%" controls />
          )}
        </div>
      </div>
    </article>
  );
}

export default APOD;
