import React, { useState, MouseEvent } from 'react';
import ReactPlayer from 'react-player';
import { Heart } from 'react-feather';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { Highlight } from '@mantine/core';
import { useStore } from '~/utils/store';
import { ApodInfo } from '~/types';
import '~/styles/Apod.css';

type ApodProps = {
  apodData: ApodInfo;
};

function Apod({ apodData }: ApodProps) {
  const [searchQuery, likedApods, likeApod, unlikeApod] = useStore((state) => [
    state.searchQuery,
    state.likedApods,
    state.likeApod,
    state.unlikeApod,
  ]);

  const [showDescription, setShowDescription] = useState(false);

  const handleClick = (event: MouseEvent) => {
    const isLicked = likedApods.has(apodData.date);

    if (isLicked) {
      unlikeApod(apodData.date);

      (event.currentTarget as HTMLElement).style['animation'] = '';
    } else {
      likeApod(apodData.date);

      (event.currentTarget as HTMLElement).style['animation'] =
        'like-animation 0.5s';
    }
  };

  return (
    <article className="Apod">
      <aside className="bg-[#f7f9fa]">
        <div
          className={`Apod-sidebar-heart ${
            likedApods.has(apodData.date) ? 'Apod-sidebar-heart-liked' : ''
          }`}
        >
          <Heart size={25} onClick={handleClick} />
        </div>
      </aside>

      <div className="bg-white">
        <div className="flex justify-between items-end m-2.5">
          <Highlight
            highlight={searchQuery}
            component="h3"
            className="text-xl font-medium leading-none"
          >
            {apodData.title}
          </Highlight>
          
          <time className="text-xs">
            {dayjs(apodData.date, 'YYYY-MM-DD').format('MMM D, YYYY')}
          </time>
        </div>

        <div className="w-full">
          {apodData.media_type == 'image' ? (
            <img className="w-full" src={apodData.url} alt={apodData.title} />
          ) : (
            <ReactPlayer
              url={apodData.url}
              width="100%"
              light={apodData.thumbnail_url}
              controls
              playing
            />
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                setShowDescription(!showDescription);
              }}
            >
              Learn More
            </Button>
            {apodData.copyright && (
              <div className="text-xs pr-2">By {apodData.copyright}</div>
            )}
          </div>
          <Collapse in={showDescription}>
            <div className="px-5 py-3">{apodData.explanation}</div>
          </Collapse>
        </div>
      </div>
    </article>
  );
}

export default Apod;
