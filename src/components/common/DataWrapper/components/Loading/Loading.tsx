import { PropsLoading } from "./interfaces";
import styles from "./Loading.module.scss";

function Loading({}: PropsLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.ldsSpinner}>
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
      <h3 className={styles.text}>Loading . . .</h3>
      <p>Please wait!</p>
    </div>
  );
}

export default Loading;
