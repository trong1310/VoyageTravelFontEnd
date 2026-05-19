import { BsStarFill } from "react-icons/bs";
import { memo } from "react";
import styles from "./StarRating.module.scss";

function StarRating({ star }: { star: number }) {
  return (
    <span className={styles.container}>
      {new Array(5).fill(0).map((_, i) =>
        i < Math.round(star) ? (
          <span key={i} className={styles.star}>
            <BsStarFill />
          </span>
        ) : (
          <span key={i} className={styles.notStar}>
            <BsStarFill />
          </span>
        )
      )}
    </span>
  );
}

export default memo(StarRating);
