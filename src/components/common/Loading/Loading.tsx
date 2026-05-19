import * as loading from "../../../../public/anim/loading_dots.json";

import { Fragment } from "react";
import Lottie from "react-lottie";
import Portal from "../Portal";
import { PropsLoading } from "./interfaces";
import styles from "./Loading.module.scss";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loading,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

function Loading({ loading }: PropsLoading) {
  return (
    <Fragment>
      {loading ? (
        <Portal>
          <div className={styles.container}>
            <div className={styles.load}>
              <Lottie options={defaultOptions} />
            </div>
          </div>
        </Portal>
      ) : null}
    </Fragment>
  );
}

export default Loading;
