import React, { useState, useRef, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '~/utils/store';

import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import Tooltip from '@mui/material/Tooltip';
import { Calendar } from 'react-feather';

type DatePickerProps = {
  label: string;
  date: Dayjs;
  setDate: (newDate: Dayjs) => void;
  shouldDisableDate: (date: Dayjs) => boolean;
};

const DatePicker = function (props: DatePickerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.getElementById('root');

    const clickListener = (event: Event) => {
      // The popper material ui uses is placed outside the root element so
      // if the click is coming from inside the root element its not from
      // the popper; hence, the popper gets closed.
      if (open && root?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.body.addEventListener('click', clickListener);

    return () => {
      document.body.removeEventListener('click', clickListener);
    };
  }, [open]);

  return (
    <DesktopDatePicker
      disableHighlightToday
      label={props.label}
      value={props.date}
      open={open}
      shouldDisableDate={props.shouldDisableDate}
      onChange={(newValue) => {
        props.setDate(dayjs(newValue));
        setOpen(false);
      }}
      renderInput={({ inputRef }) => (
        <Tooltip title={props.label} describeChild arrow>
          <button
            className="flex items-center hover:bg-[#e7e7e7] hover:rounded h-11 p-2"
            ref={inputRef}
            onClick={() => {
              setOpen(!open);
            }}
          >
            <time className="truncate pr-2">
              {props.date.format('MMM D, YYYY')}
            </time>
            <Calendar size={20} />
          </button>
        </Tooltip>
      )}
    />
  );
};

function DateRangePicker() {
  const today = dayjs();

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const [startDate, endDate, setStartDate, setEndDate] = useStore((state) => [
    state.startDate,
    state.endDate,
    state.updateStartDate,
    state.updateEndDate,
  ]);

  return (
    <div className="flex items-center">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Start Date"
          date={startDate}
          setDate={setStartDate}
          shouldDisableDate={(date) => endDate < date}
        />

        <span className="mx-2">to</span>

        <DatePicker
          label="End Date"
          date={endDate}
          setDate={setEndDate}
          shouldDisableDate={(date) => today < date || date < startDate}
        />
      </LocalizationProvider>
    </div>
  );
}

export default DateRangePicker;
