export enum QUERY_KEY {
  login,
  positions,
  accounts,
  team,
  projects,
  getBasicInfo,
}
export enum TYPE_DATE {
  ALL = -1,
  TODAY = 1,
  YESTERDAY = 2,
  THIS_WEEK = 3,
  LAST_WEEK = 4,
  THIS_MONTH = 5,
  LAST_MONTH = 6,
  THIS_YEAR = 7,
  LUA_CHON = 8,
}

export const ListOptionTimePicker: {
  name: string;
  value: number;
}[] = [
  {
    name: "Hôm nay",
    value: TYPE_DATE.TODAY,
  },
  {
    name: "Tuần này",
    value: TYPE_DATE.THIS_WEEK,
  },
  {
    name: "Tuần trước",
    value: TYPE_DATE.LAST_WEEK,
  },
  {
    name: "Tháng này",
    value: TYPE_DATE.THIS_MONTH,
  },
  {
    name: "Tháng trước",
    value: TYPE_DATE.LAST_MONTH,
  },
  {
    name: "Năm này",
    value: TYPE_DATE.THIS_YEAR,
  },
  {
    name: "Lựa chọn",
    value: TYPE_DATE.LUA_CHON,
  },
];
