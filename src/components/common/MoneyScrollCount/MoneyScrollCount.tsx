import { memo } from "react";

import { PropsMoneyScrollCount } from "./interfaces";
import styles from "./MoneyScrollCount.module.scss";
import clsx from "clsx";

function MoneyScrollCount({
  value,
  className,
  height = 22,
}: PropsMoneyScrollCount) {
  return (
    <div className={clsx(styles.container, className)}>
      {`${value}`.split("").map((char, i) => (
        <div
          key={i}
          className={styles.col}
          style={{
            transform: `translate(0, ${
              isNaN(Number(char)) ? "0" : `${height * -Number(char)}px`
            })`,
          }}
        >
          {isNaN(Number(char)) ? (
            <div className={styles.item} style={{ height }}>
              {char}
            </div>
          ) : (
            new Array(10).fill(0).map((_, index) => (
              <div key={index} className={styles.item} style={{ height }}>
                {index}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

export default memo(MoneyScrollCount);
