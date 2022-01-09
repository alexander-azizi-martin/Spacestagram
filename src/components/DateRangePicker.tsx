import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

function DateRangePicker() {
  const today = new Date();

  const [startDate, setStartDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [endDate, setEndDate] = useState(
    new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
  );

  return (
    <div className="flex items-center">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => {
            setStartDate(newValue as Date);
          }}
          renderInput={({ inputRef, inputProps, InputProps }) => (
            <div className="flex items-center">
              <input
                ref={inputRef}
                {...inputProps}
                className="w-[80px]"
                disabled
              />
              <div className="date-picker-calendar-icon">
                {InputProps?.endAdornment}
              </div>
            </div>
          )}
        />

        <div className="mr-[10px] ml-[25px]">to</div>

        <DesktopDatePicker
          label="End Date"
          value={endDate}
          shouldDisableDate={(day) => {
            console.log(day, startDate, day < startDate);
            return day < startDate;
          }}
          onChange={(newValue) => {
            setEndDate(newValue as Date);
          }}
          renderInput={({ inputRef, inputProps, InputProps }) => (
            <div className="flex items-center">
              <input
                ref={inputRef}
                {...inputProps}
                className="w-[80px]"
                disabled
              />
              <div className="date-picker-calendar-icon">
                {InputProps?.endAdornment}
              </div>
            </div>
          )}
        />
      </LocalizationProvider>
    </div>
  );
}

export default DateRangePicker;
