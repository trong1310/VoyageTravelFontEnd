import React, { Fragment, memo, useEffect, useState } from "react";

import Portal from "../Portal";
import clsx from "clsx";
import style from "./Popup.module.scss";

/*===========> INTERFACE <==========*/
interface props {
  open: boolean;
  isFull?: boolean;
  classMain?: string;
  onClose: () => void;
  children?: React.ReactNode;
  [props: string]: any;
}

/*===========> MAIN COMPONENT <==========*/
function Popup({ open, onClose, isFull, children, classMain }: props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "overlay";
    }

    return () => {
      document.body.style.overflowY = "overlay";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setIsOpen(open);
    } else {
      const id = setTimeout(() => {
        setIsOpen(open);
        clearTimeout(id);
      }, 200);

      return () => clearTimeout(id);
    }
  }, [open]);

  return (
    <Fragment>
      {isOpen && (
        <Portal>
          <div
            className={clsx(style.overlay, { [style.hidden]: !open })}
            onClick={onClose}
          ></div>
          <div
            className={clsx(style.main, classMain, {
              [style.isFull]: isFull,
              [style.hidden]: !open,
            })}
          >
            {children}
          </div>
        </Portal>
      )
      }
    </Fragment >
  );
}

export default memo(Popup);
