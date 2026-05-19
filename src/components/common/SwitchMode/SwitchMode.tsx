import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { RootState, store } from "~/redux/store";
import { getItemStorage, setItemStorage } from "~/common/func/localStorage";

import { PropsSwitchMode } from "./interfaces";
import clsx from "clsx";
import styles from "./SwitchMode.module.scss";
import { toogleDarkMode } from "~/redux/reducer/site";
import { useEffect } from "react";
import useQueryParams from "~/common/hooks/useQueryParams";
import { useSelector } from "react-redux";

function SwitchMode({ }: PropsSwitchMode) {
  const { darkMode } = useSelector((state: RootState) => state.site);
  const { isReady } = useQueryParams();

  useEffect(() => {
    const darkModeOn = getItemStorage("ui-mode");
    if (darkModeOn != null) store.dispatch(toogleDarkMode(darkModeOn));
  }, []);

  useEffect(() => {
    if (isReady) {
      setItemStorage("ui-mode", darkMode);
    }
  }, [darkMode, isReady]);

  return (
    <div
      className={clsx(styles.container, { [styles.dark]: darkMode })}
      onClick={() => store.dispatch(toogleDarkMode(!darkMode))}
    >
      <div className={styles.sun}>
        <RiSunFill />
      </div>
      <div className={styles.moon}>
        <RiMoonFill />
      </div>
    </div>
  );
}

export default SwitchMode;
