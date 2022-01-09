import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useStore } from '~/utils/store';

import SearchBar from '~/components/SearchBar';
import DateRangePicker from '~/components/DateRangePicker';

function Header() {
  const setQuery = useStore((state) => state.updateSearchQuery);
  const searchQuery = useStore((state) => state.searchQuery);

  const [value, setValue] = useState(new Date());

  return (
    <header className="flex items-center justify-between h-14 bg-white pr-[50px] pl-[50px]">
      <div className="flex-1 md:flex-0"></div>
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
