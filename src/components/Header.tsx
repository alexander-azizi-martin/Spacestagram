import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Heart } from 'react-feather';
import { useStore } from '~/utils/store';
import FilterDropDown from '~/components/DropDowns/FilterDropDown';
import SortDropDown from '~/components/DropDowns/SortDropDown';
import SearchBar from '~/components/SearchBar';
import DateRangePicker from '~/components/DateRangePicker';

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-center flex-col sm:flex-row sm:justify-between gap-y-2 sm:gap-y-0 h-max py-3 sm:py-0 sm:h-14 bg-white px-2.5 md:px-14 sticky top-0">
      <div className="flex-0 lg:flex-1 flex gap-x-10">
        <div className='w-20'>
          <FilterDropDown />
        </div>
        <div className='w-20'>
          <SortDropDown />
        </div>
      </div>

      <div className="flex-1">
        <SearchBar />
      </div>

      <div className="flex-1 flex justify-end">
        <DateRangePicker />
      </div>
    </header>
  );
}

export default Header;
