import axiosClient from "./index";

export interface ClientHotelGetRequest {
  limit: number;
  page: number;
  isHot?: number | null;
  ranking?: number | null;
  type?: number | null;
  locations?: string[];
}

export interface HotelItem {
  name: string;
  type: number;
  ranking: string;
  relativePrice: number;
  slug: string;
  thumbnail: string;
  locations: string;
  address: string;
  isHot: number;
}

export interface ClientHotelGetResponse {
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

export interface HotelBookingRequest {
  slug: string;
  startTime: string;
  endTime: string;
  totalCustomer: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  specialRequirements: string;
}

export interface HotelDetailItem {
  name: string;
  type: number;
  ranking: string;
  relativePrice: number;
  slug: string;
  thumbnail: string;
  slugLocations: string;
  locations: string;
  address: string;
  introduce: string;
  regulations: string;
  isHot: number;
  images: string[];
}

export interface ClientHotelDetailResponse {
  error: {
    code: number;
    message: string;
  };
  data: HotelDetailItem;
}

export const hotelService = {
  getClientHotels: async (payload: ClientHotelGetRequest): Promise<ClientHotelGetResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientHotels`,
      payload
    );
  },
  getClientHotelDetail: async (slug: string): Promise<ClientHotelDetailResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientHotels/detail/${slug}`
    );
  },
  bookHotel: async (payload: HotelBookingRequest): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientHotels/booking`,
      payload
    );
  },
  getLocations: async (): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Common/locations`,
      { limit: 0, page: 0 }
    );
  },
};
