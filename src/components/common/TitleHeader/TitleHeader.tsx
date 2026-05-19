import Button from "../Button";
import { PropsTitleHeader } from "./interfaces";
import { memo } from "react";
import styles from "./TitleHeader.module.scss";
import { useQueryNextJS } from "~/common/hooks/useQueryParams";

function TitleHeader({ title }: PropsTitleHeader) {
  const { setQuery } = useQueryNextJS();
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <Button
        green
        small
        maxContent
        rounded_4
        onClick={() => setQuery({ create: "open" })}
      >
        Thêm mới
      </Button>
    </div>
  );
}

export default memo(TitleHeader);
