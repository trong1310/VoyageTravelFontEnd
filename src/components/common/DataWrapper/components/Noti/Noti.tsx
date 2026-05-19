import Button from "~/components/common/Button";
import Image from "next/image";
import { PropsNoti } from "./interfaces";
import clsx from "clsx";
import styles from "./Noti.module.scss";

function Noti({
  disableButton,
  img = "/empty.png",
  title = "Empty data",
  des = "Currently the data is empty!",
  titleButton = "Create now",
  customClassImg = "",
  onClick = () => {},
}: PropsNoti) {
  return (
    <div className={styles.container}>
      {img ? (
        <div className={clsx(styles.img, customClassImg)}>
          <Image
            className={styles.icon}
            src={img}
            layout="intrinsic"
            width={200}
            height={200}
            alt="Empty data"
          />
        </div>
      ) : null}
      <h3>{title}</h3>
      <div>{des}</div>
      {!disableButton ? (
        <div className={styles.btn}>
          <Button primary bold rounded_8 onClick={onClick}>
            {titleButton}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default Noti;
