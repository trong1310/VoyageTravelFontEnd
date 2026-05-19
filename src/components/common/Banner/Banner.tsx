import Image from "next/image";
import ImageCustom from "../ImageCustom";
import { PropsBanner } from "./interfaces";
import Slider from "react-slick";
import clsx from "clsx";
import styles from "./Banner.module.scss";

const settings = {
  dots: true,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  speed: 500,
  autoplaySpeed: 5000,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  dotsClass: "slick-dots slick-thumb",
  centerPadding: "60px",
  appendDots: (dots: any) => (
    <div>
      <ul style={{ margin: "0px" }}> {dots} </ul>
    </div>
  ),
  customPaging: (i: number) => {
    return <div className={styles.dot}>{i}</div>;
  },
};

function SampleNextArrow(props: any) {
  const { className, onClick } = props;
  return null;
  // <div
  //   className={clsx(className, styles.arrow, styles.next)}
  //   onClick={onClick}
  // >
  //   <Image
  //     className={styles.img}
  //     src="/icons/arrow.png"
  //     layout="fixed"
  //     width={24}
  //     height={24}
  //     alt="arrow"
  //   />
  // </div>
}

function SamplePrevArrow(props: any) {
  const { className, style, onClick } = props;
  return null;
  // <div className={clsx(className, styles.arrow)} onClick={onClick}>
  //   <Image
  //     className={styles.img}
  //     src="/icons/arrow.png"
  //     layout="fixed"
  //     width={24}
  //     height={24}
  //     alt="arrow"
  //   />
  // </div>
}

function Banner({ list }: PropsBanner) {
  return list?.length == 1 ? (
    <div>
      <div className={styles.item}>
        <ImageCustom
          className={styles.img}
          fill
          priority
          src={list[0].img}
          alt="event"
        />
      </div>
    </div>
  ) : (
    <Slider {...settings}>
      {list.map((x, i) => (
        <div key={i}>
          <div className={styles.item}>
            <ImageCustom
              className={styles.img}
              fill
              priority
              src={x.img}
              alt="event"
            />
          </div>
        </div>
      ))}
    </Slider>
  );
}

export default Banner;
