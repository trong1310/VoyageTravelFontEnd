import {
  Bill,
  Briefcase,
  Layer,
  People,
  Setting3,
  UserOctagon,
} from "iconsax-react";

import ROUTER from "./router";

export const MENU = [
  {
    title: "Công việc",
    group: [
      {
        title: "Dự án",
        path: ROUTER.HOME,
        icon: Layer,
      },
      {
        title: "Công việc",
        path: ROUTER.HOME,
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Nhân sự",
    group: [
      {
        title: "Quản lí team",
        path: ROUTER.HOME,
        icon: People,
      },
      {
        title: "Thành viên",
        path: ROUTER.HOME,
        icon: UserOctagon,
      },
    ],
  },
  {
    title: "Cấu hình",
    group: [
      {
        title: "Chức vụ",
        path: ROUTER.HOME,
        icon: Bill,
      },
      {
        title: "Thao tác với dự án",
        path: ROUTER.HOME,
        icon: Setting3,
      },
    ],
  },
];
