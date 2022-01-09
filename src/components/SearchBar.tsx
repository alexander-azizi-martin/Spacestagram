import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useStore } from '~/utils/store';
import '~/styles/SearchBar.css';

function SearchBar() {
  const setQuery = useStore((state) => state.updateSearchQuery);
  const [focus, setFocus] = useState(false);

  return (
    <div className={`search-bar ${focus ? 'search-bar-focus' : ''}`}>
      <div className="pr-[10px]">
        <FiSearch className="w-[20px] h-[20px]" />
      </div>

      <input
        onChange={(event) => setQuery(event.target.value.trim())}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="search-bar-input"
        placeholder="Search"
      />
    </div>
  );
}

export default SearchBar;
