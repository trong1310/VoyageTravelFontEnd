import { RootState, store } from "~/redux/store";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Calendar } from "iconsax-react";
import Moment from "react-moment";
import { PropsInputDateRanger } from "./interfaces";
import RangeDatePicker from "~/components/common/RangeDatePicker";
import TippyHeadless from "@tippyjs/react/headless";
import clsx from "clsx";
import styles from "./InputDateRanger.module.scss";
import { useSelector } from "react-redux";

function InputDateRanger({
  placeholder,
  name = "ranger-date",
  form,
  setForm,
}: PropsInputDateRanger) {
  const [show, setShow] = useState(false);

  const handleChangeValue = (data: any) => {
    setForm((prev: any) => ({ ...prev, [name]: data }));
  };

  return (
    <div>
      <span className={styles.label}>Ngày giảm giá</span>
      <div>
        <TippyHeadless
          interactive
          visible={show}
          onClickOutside={() => setShow(false)}
          placement="bottom"
          render={() => (
            <RangeDatePicker
              onClose={() => setShow(false)}
              onSetValue={handleChangeValue}
              value={form[name]}
              open={show}
            />
          )}
        >
          <div
            className={clsx(styles.style2, { [styles.focus]: show })}
            onClick={() => setShow(!show)}
          >
            {form[name]?.from ? (
              <div>
                <Moment format="DD/MM/YYYY" date={form[name]?.from} /> -{" "}
                <Moment format="DD/MM/YYYY" date={form[name]?.to} />
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <Calendar color="#888888" variant="Bold" size={24} />
          </div>
        </TippyHeadless>
      </div>
    </div>
  );
}

export default InputDateRanger;
