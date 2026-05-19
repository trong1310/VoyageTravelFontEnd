import { useMemo, useState } from "react";

import Image from "next/image";
import { PropsImageCustom } from "./interfaces";
import backgrounds from "~/constants/background";
import styles from "./ImageCustom.module.scss";

function ImageCustom({
  alt = "error images",
  src,
  fill = true,
  ...props
}: PropsImageCustom) {
  const [isError, setIsError] = useState(false);

  const checkSrc = useMemo(() => {
    if (
      !`${src}`?.startsWith("blob") &&
      !`${src}`?.startsWith("/") &&
      typeof src == "string" &&
      !src.startsWith("http")
    ) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      src = process.env.NEXT_PUBLIC_API_MEDIA + "/" + src;
    }
    return src || backgrounds.placeholder;
  }, [src]);

  return (
    <Image
      alt={alt}
      src={isError ? backgrounds.placeholder : checkSrc}
      {...props}
      fill={fill}
      sizes="100"
      onError={() => setIsError(true)}
    />
  );
}

export default ImageCustom;
