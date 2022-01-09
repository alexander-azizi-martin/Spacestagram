import React, { useState, useEffect, ChangeEvent } from 'react';
import { Search } from 'react-feather';
import { useStore } from '~/utils/store';

function SearchBar() {
  const [searchQuery, setQuery] = useStore((state) => [
    state.searchQuery,
    state.updateSearchQuery,
  ]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    if (value.startsWith('  ')) {
      value = value.slice(1);
    }
    if (value.endsWith('  ')) {
      value = value.slice(0, -1);
    }

    setQuery(value.toLowerCase());
  };

  return (
    <div className="input-field flex items-center">
      <div className="pr-2.5">
        <Search size={20} />
      </div>

      <input
        value={searchQuery}
        onChange={handleChange}
        className="w-full h-9 bg-inherit focus:text-black"
        placeholder="Search"
      />
    </div>
  );
}

export default SearchBar;
