//"use client";

import { memo, useEffect } from "react";

import ROUTER from "~/constants/router";
import { updateRouterPrev } from "~/redux/reducer/site";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";

function UpdateRouter() {
  const dispatch = useDispatch();
  const search = useSearchParams();
  const router = useRouter();
  const typeForm = search.get("formAuth");

  useEffect(() => {
    return () => {
      if (
        router.pathname != ROUTER.HOME &&
        router.pathname != ROUTER.LOGIN &&
        router.pathname != ROUTER.SIGNUP &&
        !typeForm
      ) {
        dispatch(updateRouterPrev(router.asPath));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath, typeForm]);
  return null;
}

export default UpdateRouter;
