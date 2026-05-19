import { toastInfo, toastSuccess, toastWarn } from "~/common/func/toast";

import axios from "axios";
import { logout } from "~/redux/reducer/auth";
import { store } from "~/redux/store";

export enum RESULT {
  SUCCESSFUL = 200,
  ERR = 400,
  OTHER_ERROR = 500,
}

const axiosClient = axios.create({
  headers: {
    "content-type": "application/json",
  },
  timeout: 60000,
  timeoutErrorMessage: "Request timeout",
});

axiosClient.interceptors.request.use(async (config) => {
  const { token } = store.getState().auth;
  if (config.headers["Content-Type"] != "multipart/form-data") {
    config.data = {
      ...config.data,
    };
  }
  config.headers.Authorization = token ? "Bearer " + token : null;
  return config;
});
axiosClient.interceptors.response.use(
  (response: any) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error: any) => {
    if (error.response && error.response.data) {
      throw error.response.data;
    }

    if (!axios.isCancel(error)) throw error;
  }
);
export default axiosClient;

export const httpRequest = async ({
  http,
  setLoading,
  msgSuccess = "Thành công",
  showMessageSuccess = false,
  showMessageFailed = false,
  onError,
}: {
  http: any;
  setLoading?: (any: any) => void;
  onError?: () => void;
  showMessageSuccess?: boolean;
  showMessageFailed?: boolean;
  msgSuccess?: string;
}) => {
  setLoading && setLoading(() => true);
  try {
    const res: any = await http;

    if (res?.statusCode === RESULT.SUCCESSFUL) {
      showMessageSuccess && toastSuccess({ msg: msgSuccess || res?.message });
      return res?.data || true;
    } else {
      onError && onError();
      throw res?.message;
    }
  } catch (err: any) {
    if (
      err?.statusCode == 401 ||
      err?.status == 401 ||
      err?.err?.response?.status == 401 ||
      err?.response?.status == 401
    ) {
      store.dispatch(logout());
      toastWarn({ msg: "Hết hạn đăng nhập" });
    } else if (typeof err == "string") {
      showMessageFailed && toastWarn({ msg: err || "Có lỗi đã xảy ra" });
    } else if (
      err?.error?.code == "ERR_NETWORK" ||
      err?.error?.code == "ECONNABORTED"
    ) {
      showMessageFailed && toastInfo({ msg: "Kiểm tra kết nối internet" });
    }
  } finally {
    setLoading && setLoading(() => false);
  }
};
