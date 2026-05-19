import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "moment/locale/vi";
import "tippy.js/dist/tippy.css";
import "~/styles/globals.scss";

import { Fragment, ReactElement, ReactNode } from "react";

import type { AppProps } from "next/app";
import AppProvider from "~/contexts/AppProvider";
import Head from "next/head";
import { NextPage } from "next";
import i18n from "~/locale/i18n";
import trans from "~/locale/i18n";
import { useRouter } from "next/router";

export const metadata = {
  icons: {
    icon: "/favicon.png",
  },
};

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const router = useRouter();
  const { locale } = router;
  trans.changeLanguage(locale);

  return (
    <Fragment>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale = 1.0"
        />
      </Head>
      <AppProvider pageProps={pageProps}>
        {getLayout(<Component {...pageProps} />)}
      </AppProvider>
    </Fragment>
  );
}
