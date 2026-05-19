import clsx from "clsx";

function LayoutGrid({ children, className }: any) {
  return <div className={clsx("grid wide ", className)}>{children}</div>;
}

export default LayoutGrid;
