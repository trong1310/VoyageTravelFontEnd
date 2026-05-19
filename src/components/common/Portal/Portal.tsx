import { memo, useEffect } from "react";

import ReactDOM from "react-dom";
import styles from "./Portal.module.scss";
import { useRef } from "react";

function Portal({ children }: any) {
  const portal = useRef(document.createElement("div"));

  useEffect(() => {
    const body = document.querySelector("body");
    // const body = document.body;
    if (body) {
      body.appendChild(portal.current);
      portal.current.classList.add(styles.modal);
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        body.removeChild(portal.current);
      };
    }
  }, []);

  return portal.current
    ? ReactDOM.createPortal(children, portal.current)
    : null;
}

export default memo(Portal);
