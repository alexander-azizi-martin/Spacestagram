import React, { useState } from 'react';
import { Heart } from 'react-feather';
import DropDown from '~/components/DropDown';
import { useStore } from '~/utils/store';
import { FilterOptions } from '~/types';

const FILTER_OPTIONS = {
  all: (
    <div className="flex items-center">
      <div className="pr-2">
        <Heart size={15} color="red" />
      </div>
      All
    </div>
  ),
  liked: (
    <div className="flex items-center">
      <div className="pr-2">
        <Heart size={15} color="red" fill="red" />
      </div>
      Liked
    </div>
  ),
  unliked: (
    <div className="flex items-center">
      <div className="pr-2">
        <Heart size={15} />
      </div>
      Unlike
    </div>
  ),
};

function FilterDropDown() {
  const [filterOption, setFilerOption] = useStore((state) => [
    state.filterOption,
    state.setFilterOption,
  ]);

  return (
    <DropDown button={FILTER_OPTIONS[filterOption]}>
      <div className="option-category flex flex-col gap-y-2">
        <h3 className="w-full text-center text-base border-b">Filter By</h3>
        <ul className="list-none flex flex-col">
          {Object.entries(FILTER_OPTIONS).map(([key, element]) => (
            <li
              key={key}
              onClick={() => {
                setFilerOption(key as FilterOptions);
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

export default FilterDropDown;
