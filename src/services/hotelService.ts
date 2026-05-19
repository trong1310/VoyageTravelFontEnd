import axiosClient from "./index";

export interface HotelGetRequest {
  limit: number;
  page: number;
  keyword: string;
  ranking: number | null;
}

export interface HotelItem {
  slug: string;
  name: string;
  type: number;
  ranking: string;
  createdAt: string;
  relativePrice: number;
  thumbnail: string;
  locations: string;
  address: string;
  isHot: number;
}

export interface HotelGetResponse {
  error: {
    code: number;
    message: string;
  };
  data: {
    items: HotelItem[];
    pagination: {
      totalCount: number;
      totalPage: number;
    };
  };
}

export interface HotelCreateRequest {
  name: string;
  introduce: string;
  type: number; // e.g. 1: Khách sạn, 2: Resort, 3: Homestay
  isHot: number;
  ranking: number;
  relativePrice: number;
  thumbnail: string;
  regulations: string;
  slugLocations: string;
  description: string;
  address: string;
  imagesUrl: string[];
}

export interface HotelUpdateRequest extends HotelCreateRequest {
  slug: string;
}

export interface HotelCreateResponse {
  error: {
    code: number;
    message: string;
  };
  data: any;
}

export const hotelService = {
  getHotels: async (payload: HotelGetRequest): Promise<HotelGetResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Hotels/get`,
      payload
    );
  },
  createHotel: async (payload: HotelCreateRequest): Promise<HotelCreateResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Hotels/create`,
      payload
    );
  },
  getLocations: async (): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Common/locations`,
      { limit: 0, page: 0 }
    );
  },
  getHotelDetail: async (slug: string): Promise<any> => {
    return axiosClient.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Hotels/detail/${slug}`
    );
  },
  updateHotel: async (payload: HotelUpdateRequest): Promise<HotelCreateResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Hotels/update`,
      payload
    );
  },
  deleteHotel: async (slug: string): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Hotels/delete/${slug}`
    );
  },
};
