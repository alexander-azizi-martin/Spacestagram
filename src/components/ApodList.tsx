import React from 'react';
import { ApodInfo } from '~/types';
import Apod from '~/components/Apod';

type ApodListProps = {
  apodList: ApodInfo[];
};

function ApodList({ apodList }: ApodListProps) {
  return (
    <div className="flex flex-col gap-y-5">
      {apodList.map((apodData) => (
        <Apod apodData={apodData} key={apodData.date} />
      ))}
    </div>
  );
}

export default ApodList;
