import React, { useState, useEffect } from 'react';
import { useStore } from '~/utils/store';

import SearchBar from '~/components/SearchBar';
import DateRangePicker from '~/components/DateRangePicker';

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-center flex-col sm:flex-row sm:justify-between gap-y-2 sm:gap-y-0 h-max py-3 sm:py-0 sm:h-14 bg-white px-2.5 md:px-2.5 sticky top-0">
      <div className="flex-0 lg:flex-1"></div>

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
