import { ListOptionTimePicker, TYPE_DATE } from "~/constants/enum";
import { useRouter, useSearchParams } from "next/navigation";

import { BiCheck } from "react-icons/bi";
import { PropsDateTypeOption } from "./interfaces";
import RangeDatePicker from "~/components/common/RangeDatePicker";
import TippyHeadless from "@tippyjs/react/headless";
import clsx from "clsx";
import styles from "./DateTypeOption.module.scss";
import { useQueryNextJS } from "~/common/hooks/useQueryParams";

function DateTypeOption({
  date,
  show,
  setDate,
  setShow,
  keyTypeDate = "typeDate",
  keydateFrom = "dateFrom",
  keyDateTo = "dateTo",
}: PropsDateTypeOption) {
  const searchParams = useSearchParams();
  const { setQuery } = useQueryNextJS();
  const typeDate = searchParams.get(keyTypeDate);

  const handleSetQuery = (value: any) => {
    if (!!value) {
      setQuery({
        [keyTypeDate]: value,
      });
    }
  };

  return (
    <TippyHeadless
      maxWidth={"100%"}
      interactive
      visible={Number(typeDate) == TYPE_DATE.LUA_CHON}
      placement="right-start"
      render={(attrs) => (
        <div className={styles.main_calender}>
          <RangeDatePicker
            value={date}
            onSetValue={setDate}
            onClose={() => setShow(false)}
            open={show && Number(typeDate) == TYPE_DATE.LUA_CHON}
          />
        </div>
      )}
    >
      <div className={styles.mainOption}>
        <div
          className={clsx(styles.option, {
            [styles.option_active]: typeDate == null,
          })}
          onClick={() => {
            setShow(false);
            setQuery({
              [keyTypeDate]: null,
              [keydateFrom]: null,
              [keyDateTo]: null,
            });
          }}
        >
          <p>{"Tất cả"}</p>
          {typeDate == null && (
            <div className={styles.icon_check}>
              <BiCheck
                fontSize={22}
                color="rgb(251, 192, 0)"
                fontWeight={600}
              />
            </div>
          )}
        </div>
        {ListOptionTimePicker.map((v, i) => (
          <div
            key={i}
            className={clsx(styles.option, {
              [styles.option_active]: Number(typeDate) == v.value,
            })}
            onClick={() => {
              if (v.value != TYPE_DATE.LUA_CHON) {
                setShow(false);
              }
              handleSetQuery(v.value);
            }}
          >
            <p>{v.name}</p>
            {Number(typeDate) == v.value && (
              <div className={styles.icon_check}>
                <BiCheck
                  fontSize={22}
                  color="rgb(251, 192, 0)"
                  fontWeight={600}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </TippyHeadless>
  );
}

export default DateTypeOption;
