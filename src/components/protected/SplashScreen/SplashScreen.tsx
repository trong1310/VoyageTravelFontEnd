import { Fragment, memo, useEffect } from "react";
import { RootState, store } from "~/redux/store";
import { getItemStorage, setItemStorage } from "~/common/func/localStorage";
import { setBalance, setUser } from "~/redux/reducer/user";
import { setFormLogin, setIsMobile, setLoading } from "~/redux/reducer/site";

import CryptoJS from "crypto-js";
import { PropsSplashScreen } from "./interfaces";
import clsx from "clsx";
import { login } from "~/redux/reducer/auth";
import styles from "./SplashScreen.module.scss";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

function SplashScreen({}: PropsSplashScreen) {
  const router = useRouter();
  const { balance, user } = useSelector((state: RootState) => state.user);
  const { loading, formLogin } = useSelector((state: RootState) => state.site);
  const { token, isLogin } = useSelector((state: RootState) => state.auth);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    // animationData: loading1,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    (async () => {
      const state = await getItemStorage(
        process.env.NEXT_PUBLIC_KEY_LOCALSTORAGE!
      );
      if (!!state) {
        const bytes = CryptoJS.AES.decrypt(
          state,
          process.env.NEXT_PUBLIC_KEY_CERT!
        );
        const decryptedData = JSON?.parse(bytes.toString(CryptoJS.enc.Utf8));

        if (decryptedData?.token && decryptedData?.isLogin) {
          store.dispatch(
            login({
              token: decryptedData?.token,
            })
          );
          store.dispatch(setUser(decryptedData?.user));
        }
        // if (decryptedData?.formLogin) {
        //   store.dispatch(setFormLogin(decryptedData.formLogin));
        // }
      }
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      store.dispatch(setIsMobile(isMobile));
      store.dispatch(setLoading(false));
    })();
  }, [router?.query]);

  useEffect(() => {
    if (!loading) {
      const ciphertext = CryptoJS?.AES?.encrypt(
        JSON.stringify({
          token,
          isLogin,
          user,
        }),
        process.env.NEXT_PUBLIC_KEY_CERT!
      ).toString();
      setItemStorage(process.env.NEXT_PUBLIC_KEY_LOCALSTORAGE!, ciphertext);
    }
  }, [token, isLogin, loading, user]);

  return (
    <Fragment>
      <div className={clsx(styles.container, { [styles.close]: !loading })}>
        <div className={styles.logo}>
          {/* <Lottie options={defaultOptions2} /> */}
        </div>
      </div>
    </Fragment>
  );
}

export default memo(SplashScreen);
