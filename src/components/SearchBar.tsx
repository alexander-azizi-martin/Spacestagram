import React, { useState, useEffect, ChangeEvent } from 'react';
import escapeStringRegexp from 'escape-string-regexp';
import { Search } from 'react-feather';
import { useStore } from '~/utils/store';

function SearchBar() {
  const [setStoreQuery] = useStore((state) => [state.updateSearchQuery]);
  const [query, setQuery] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setQuery(value);
    setStoreQuery(escapeStringRegexp(value.trim()));
  };

  return (
    <div className="input-field flex items-center">
      <div className="pr-2.5">
        <Search size={20} />
      </div>

      <input
        value={query}
        onChange={handleChange}
        className="w-full h-9 bg-inherit focus:text-black"
        placeholder="Search"
      />
    </div>
  );
}

export default SearchBar;
