import clsx from "clsx";
import styles from "./GridColumn.module.scss";
import { useStyleClass } from "~/common/hooks/usStyleClass";

function GridColumn({ children, className, ...props }: any) {
  const styleClass = useStyleClass(props, styles);
  return (
    <div className={clsx(styles.container, className, styleClass)}>
      {children}
    </div>
  );
}

export default GridColumn;
