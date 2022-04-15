import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'react-feather';
import DropDown from '~/components/DropDown';
import { useStore } from '~/utils/store';
import { SortOptions } from '~/types';

const SORT_OPTIONS = {
  newest: (
    <div className="flex items-center">
      <div className="pr-2">
        <ArrowUp size={15} />
      </div>
      Newest
    </div>
  ),
  oldest: (
    <div className="flex items-center">
      <div className="pr-2">
        <ArrowDown size={15} />
      </div>
      Oldest
    </div>
  ),
};

function SortDropDown() {
  const [sortOption, setSortOption] = useStore((state) => [
    state.sortOption,
    state.setSortOption,
  ]);

  return (
    <DropDown button={SORT_OPTIONS[sortOption]}>
      <div className="option-category flex flex-col gap-y-2">
        <h3 className="w-full text-center text-base border-b">Sort By</h3>
        <ul className="list-none flex flex-col">
          {Object.entries(SORT_OPTIONS).map(([key, element]) => (
            <li
              key={key}
              onClick={() => {
                setSortOption(key as SortOptions);
              }}
              className="text-sm pb-2 flex items-center px-3 py-1 hover:bg-[#f6f7f8] hover:rounded hover:cursor-pointer"
            >
              {element}
            </li>
          ))}
        </ul>
      </div>
    </DropDown>
  );
}

export default SortDropDown;
