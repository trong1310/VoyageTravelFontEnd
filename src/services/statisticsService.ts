import axiosClient from "./index";

export interface GetStatisticsPayload {
  limit: number;
  page: number;
  from?: string;
  to?: string;
}

export interface StatisticsData {
  totalActiveTours: number;
  totalActiveCars: number;
  totalActiveHotels: number;
  totalSoldTours: number;
  totalCustomerCars: number;
  totalSoldHotels: number;
}

export const statisticsService = {
  async getStatistics(payload: GetStatisticsPayload): Promise<any> {
    return axiosClient.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Statistics/get-statistics`, payload);
  }
};
