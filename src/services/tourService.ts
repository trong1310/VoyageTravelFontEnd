import axiosClient from "./index";

export interface TourGetRequest {
  limit: number;
  page: number;
  keyword: string;
  ranking: number | null;
}

export interface TourItem {
  slug: string;
  title: string;
  createdAt: string;
  originalPrices: number;
  salePrices: number;
  thumbnail: string;
  isHot: number;
  ranking: string;
  departure: string;
  slugDeparture: string;
  durationDays: number;
  durationNights: number;
}

export interface TourGetResponse {
  error: {
    code: number;
    message: string;
  };
  data: {
    items: TourItem[];
    pagination: {
      totalCount: number;
      totalPage: number;
    };
  };
}

export interface DestinationCreate {
  slug: string;
  displayOrder: number;
}

export interface TourCreateRequest {
  title: string;
  introduce: string;
  departure: string;
  thumbnail: string;
  description: string;
  imagesUrl: string[];
  durationDays: number;
  durationNights: number;
  salePrices: number;
  ranking: number;
  originalPrices: number;
  isHot: number;
  destinations: DestinationCreate[];
}

export interface TourUpdateRequest extends TourCreateRequest {
  slug: string;
}

export interface TourCreateResponse {
  error: {
    code: number;
    message: string;
  };
  data: any;
}

export const tourService = {
  getTours: async (payload: TourGetRequest): Promise<TourGetResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Tours/get`,
      payload
    );
  },
  getClientTours: async (payload: {
    limit: number;
    page: number;
    isHot?: number | null;
    ranking?: number | null;
    departures?: string[];
    destinations?: string[];
  }): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientTour`,
      payload
    );
  },
  createTour: async (payload: TourCreateRequest): Promise<TourCreateResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Tours/create`,
      payload
    );
  },
  getLocations: async (): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Common/locations`,
      { limit: 0, page: 0 }
    );
  },
  getTourDetail: async (slug: string): Promise<any> => {
    return axiosClient.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Tours/detail/${slug}`
    );
  },
  getClientTourDetail: async (slug: string): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientTour/detail/${slug}`
    );
  },
  bookTour: async (payload: {
    slug: string;
    startTime: string;
    totalCustomer: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    specialRequirements: string;
  }): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientTour/booking`,
      payload
    );
  },
  updateTour: async (payload: TourUpdateRequest): Promise<TourCreateResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Tours/update`,
      payload
    );
  },
  deleteTour: async (slug: string): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Tours/delete/${slug}`
    );
  },
};

