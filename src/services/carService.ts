import axiosClient from "./index";

export interface CarGetRequest {
  limit: number;
  page: number;
  keyword: string;
  seatCount: number | null;
}
export interface ClientCarGetRequest {
  limit: number;
  page: number;
  isHot: number | null,
  ranking: number | null,
}

export interface CarRouteObject {
  name: string;
  slug: string;
  displayOrder: number;
}

export interface CarItem {
  name: string;
  slug: string;
  licensePlate: string;
  seatCount: number;
  brand: string;
  color: string;
  manufactureYear: number;
  thumbNail?: string;
  thumbnail?: string; // Standardized case
  createdAt: string;
  routes: CarRouteObject[];
}

export interface CarGetResponse {
  error: {
    code: number;
    message: string;
  };
  data: {
    items: CarItem[];
    pagination: {
      totalCount: number;
      totalPage: number;
    };
  };
}

export interface RouteCreate {
  slug: string;
  displayOrder: number;
}

export interface CarCreateRequest {
  name: string;
  licensePlate: string;
  seatCount: number;
  brand: string;
  color: string;
  manufactureYear: number;
  description: string;
  thumbNail: string;
  routes: RouteCreate[];
}
export interface ClientCarItem {
  name: string;
  slug: string;
  price: number;
  thumbNail?: string;
  thumbnail?: string; // Standardized case
  createdAt: string;
  description?: string;
}
export interface ClientCarGetResponse {
  error: {
    code: number;
    message: string;
  };
  data: {
    items: ClientCarItem[];
    pagination: {
      totalCount: number;
      totalPage: number;
    };
  };
}
export interface CarUpdateRequest extends CarCreateRequest {
  slug: string;
}

export const carService = {
  getCars: async (payload: CarGetRequest): Promise<CarGetResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Cars/get`,
      payload
    );
  },
  getClientCars: async (payload: ClientCarGetRequest): Promise<ClientCarGetResponse> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1.1/ClientCars`,
      payload
    );
  },
  createCar: async (payload: CarCreateRequest): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Cars/create`,
      payload
    );
  },
  getLocations: async (): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Common/locations`,
      { limit: 0, page: 0 }
    );
  },
  getCarDetail: async (slug: string): Promise<any> => {
    return axiosClient.get(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Cars/detail/${slug}`
    );
  },
  updateCar: async (payload: CarUpdateRequest): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Cars/update`,
      payload
    );
  },
  deleteCar: async (slug: string): Promise<any> => {
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Cars/delete/${slug}`
    );
  },
};
