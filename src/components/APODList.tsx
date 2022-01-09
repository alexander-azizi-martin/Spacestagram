import React from 'react';
import { APODData } from '~/types';
import APOD from '~/components/APOD';

type APODListProps = {
  apodList: APODData[];
};

function APODList({ apodList }: APODListProps) {
  return (
    <div className="flex flex-col gap-y-5">
      {apodList.map((apodData) => (
        <APOD apodData={apodData} key={apodData.date} />
      ))}
    </div>
  );
}

export default APODList;
