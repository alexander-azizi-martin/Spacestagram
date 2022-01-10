import React, { useState, useRef } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import { ChevronDown } from 'react-feather';

type DropDownProps = {
  button: React.ReactElement;
  children: React.ReactElement;
};

function DropDown(props: DropDownProps) {
  const [open, setOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div className="relative flex items-center">
        {/* Dropdown Button */}
        <div
          className="flex items-center select-none hover:cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {props.button}
          <div className={`ml-1.5 transition ${open ? 'rotate-180' : ''}`}>
            <ChevronDown size={15} />
          </div>
        </div>

        {/* Dropdown Menu */}
        <Fade in={open}>
          <div className="card absolute top-7" onClick={() => setOpen(false)}>
            {props.children}
          </div>
        </Fade>
      </div>
    </ClickAwayListener>
  );
}

export default DropDown;
