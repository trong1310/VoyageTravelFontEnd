import Image from "next/legacy/image";
import ImageCustom from "../ImageCustom";
import { PropsAvatar } from "./interfaces";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

function Avatar({ src, className, sizeAvatar = 34 }: PropsAvatar) {
  return (
    <div
      className={clsx(styles.container, className)}
      style={{ width: sizeAvatar, height: sizeAvatar }}
    >
      <ImageCustom
        className={styles.avatar}
        layout="fill"
        alt="avatar"
        src={src}
        priority
      />
    </div>
  );
}

export default Avatar;
