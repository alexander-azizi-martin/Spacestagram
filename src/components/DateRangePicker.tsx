import React, { useState, useRef, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import Tooltip from '@mui/material/Tooltip';
import { Calendar } from 'react-feather';
import { useStore } from '~/utils/store';

type DatePickerProps = {
  label: string;
  date: Dayjs;
  setDate: (newDate: Dayjs) => void;
  shouldDisableDate: (date: Dayjs) => boolean;
};

function DatePicker (props: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
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
                className="flex items-center hover:bg-[#f6f7f8] hover:rounded h-11 p-2"
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
      </div>
    </ClickAwayListener>
  );
};

const FIRST_DAY = dayjs('1995-06-16', 'YYYY-MM-DD');
const TODAY = dayjs();

function DateRangePicker() {
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
          shouldDisableDate={(date) => date < FIRST_DAY || endDate < date}
        />

        <span className="mx-2">to</span>

        <DatePicker
          label="End Date"
          date={endDate}
          setDate={setEndDate}
          shouldDisableDate={(date) => TODAY < date || date < startDate}
        />
      </LocalizationProvider>
    </div>
  );
}

export default DateRangePicker;
