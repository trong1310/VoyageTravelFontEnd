import { Fragment, ReactElement } from "react";
import Head from "next/head";
import MainIndex from "~/components/MainIndex";
import ClientLayout from "~/components/layout/ClientLayout";

export default function Page() {
  return (
    <Fragment>
      <Head>
        <title>VOYAGE Travel - Tour Du Lịch Lữ Hành & Cho Thuê Xe Cao Cấp</title>
        <meta name="description" content="VOYAGE Travel là người đồng hành đáng tin cậy cung cấp các tour du lịch nghỉ dưỡng trọn gói, combo tiết kiệm và dịch vụ thuê xe du lịch đời mới đưa đón an toàn chuyên nghiệp." />
      </Head>
      <MainIndex />
    </Fragment>
  );
}

Page.getLayout = function (page: ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};

