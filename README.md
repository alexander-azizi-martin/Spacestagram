# Spacestagram

Spacestagram is a frontend website that displays Nasa's astronomy picture of the day (APOD). The website was built using Vite, React, Typescript, Tailwind, and Material UI. The website can be viewed at [sspacestagram.netlify.app](https://sspacestagram.netlify.app).

## Features

- Like your favorite APODs by clicking on the heart (likes persist between page loads)
- Date range picker to select which APODs to view by clicking on the dates in the top right
- Filter by liked and unliked APODs
- Sort by new and old APODs
- Search APODs by their title
- Infinite scrolling

## Getting Started

```
> git clone https://github.com/alexander-azizi-martin/Spacestagram.git
> cd Spacestagram
> yarn install
> yarn build
> yarn preview
```

> Note: you need to create a `.env.local` file in the root directory of the project with the contents `VITE_API_KEY=<API KEY>`.
