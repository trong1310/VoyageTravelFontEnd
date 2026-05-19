import * as loading from "../../../../public/anim/loading_data.json";

import { Fragment } from "react";
import clsx from "clsx";
import style from "./LoadingData.module.scss";

function LoadingData({
  isLoading,
  load,
  children,
  noti,
  data,
  absoluteFull,
  minHeight = 0
}: {
  isLoading?: boolean;
  absoluteFull?: boolean;
  minHeight?: number;
  children: any;
  load?: any;
  noti?: any;
  data?: any;
}) {
  const defaultOptions2 = {
    loop: true,
    autoplay: true,
    animationData: loading,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Fragment>
      {isLoading ? (
        load ? (
          load
        ) : (
          <div
            className={clsx(style.container, style.itemlist, {
              [style.absoluteFull]: absoluteFull,
            })}

            style={{ minHeight }}
          >
            <div className={style.ldsSpinner}>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )
      ) : !!noti ? (
        data?.length > 0 ? (
          <Fragment>{children}</Fragment>
        ) : (
          noti
        )
      ) : (
        <Fragment>{children}</Fragment>
      )}
    </Fragment>
  );
}

export default LoadingData;
