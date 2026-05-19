import { useEffect, useState } from "react";

import { ArrowDown2 } from "iconsax-react";
import DateTypeOption from "./components/DateTypeOption";
import Moment from "react-moment";
import { PropsDateRangerCustom } from "./interfaces";
import { TYPE_DATE } from "~/constants/enum";
import TippyHeadless from "@tippyjs/react/headless";
import clsx from "clsx";
import { getDateRange } from "~/common/func/selectDate";
import styles from "./DateRangerCustom.module.scss";
import { timeSubmit } from "~/common/func/optionConvert";
import { useQueryNextJS } from "~/common/hooks/useQueryParams";
import { useSearchParams } from "next/navigation";

function DateRangerCustom({
  titleTime = "Thời gian",
  keyTypeDate = "typeDate",
  keydateFrom = "dateFrom",
  keyDateTo = "dateTo",
}: PropsDateRangerCustom) {
  const searchParams = useSearchParams();
  const { setQuery } = useQueryNextJS();

  const typeDate = searchParams.get(keyTypeDate);
  const dateFrom = searchParams.get(keydateFrom);
  const dateTo = searchParams.get(keyDateTo);

  const [show, setShow] = useState<boolean>(false);

  const [date, setDate] = useState<{
    from: Date | null;
    to: Date | null;
  } | null>(null);

  useEffect(() => {
    if (Number(typeDate) != TYPE_DATE.LUA_CHON) {
      setDate(() => getDateRange(Number(typeDate))!);
    } else {
      if (!!dateFrom && !!dateTo) {
        setDate(() => ({
          from: new Date(dateFrom as string),
          to: new Date(timeSubmit(new Date(dateTo as string)) as string),
        }));
      }
    }
  }, [typeDate]);

  useEffect(() => {
    if (date?.from && date?.to) {
      setQuery({
        [keydateFrom]: date?.from ? timeSubmit(date?.from) : "",
        [keyDateTo]: date?.to ? timeSubmit(date?.to, true) : "",
      });
    }
  }, [date?.from, date?.to]);

  return (
    <TippyHeadless
      visible={show}
      onClickOutside={() => setShow(false)}
      placement="bottom-start"
      interactive
      render={() => (
        <DateTypeOption
          date={date}
          setDate={setDate}
          show={show}
          setShow={setShow}
          keyTypeDate={keyTypeDate}
          keydateFrom={keydateFrom}
          keyDateTo={keyDateTo}
        />
      )}
    >
      <div
        className={clsx(styles.style2, { [styles.focus]: show })}
        onClick={() => setShow(!show)}
      >
        <span>
          {titleTime}:
          {date?.from && date?.to ? (
            <span className={styles.value}>
              <Moment date={date?.from} format="DD/MM/YYYY" /> -{" "}
              <Moment date={date?.to} format="DD/MM/YYYY" />
            </span>
          ) : (
            <span className={styles.value}>Tất cả</span>
          )}
        </span>
        <div
          className={clsx(styles.icon_arrow, { [styles.active_icon]: show })}
        >
          <ArrowDown2 size={18} color="#3F4752" />
        </div>
      </div>
    </TippyHeadless>
  );
}

export default DateRangerCustom;
