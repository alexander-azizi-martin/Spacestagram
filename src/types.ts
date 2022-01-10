export type ApodInfo = {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  thumbnail_url?: string;
};

export type SortOptions = 'newest' | 'oldest';

export type FilterOptions = 'all' | 'liked' | 'unliked';
