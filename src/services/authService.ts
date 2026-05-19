import axiosClient from "./index";

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  error: {
    code: number;
    message: string;
  };
  data: {
    uuid: string;
    userName: string;
    fullName: string;
    accessToken: string;
    refreshToken: string;
    timeExpired: string;
    timeStart: string;
  };
}

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Auth/login`,
      payload
    );
  },
};
