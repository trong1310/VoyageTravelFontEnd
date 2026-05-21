import axiosClient from "./index";

export interface BookingAdminItem {
  uuid: string;
  state: number; // 1: PendingProcessing, 2: Processed, 3: Cancelled
  categoryId: number;
  categoryName: string;
  createdAt: string;
  serviceName: string;
  slug: string;
  fullName: string;
  phoneNumber: string;
}

export interface GetBookingsPayload {
  limit: number;
  page: number; // 0-indexed
  keyword?: string;
}

export interface BookingDetailData {
  uuid: string;
  state: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  serviceName: string;
  fullName: string;
  phoneNumber: string;
  specialRequirements: string;
  email: string;
  startTime: string;
  totalCustomer: number;
}

export const bookingService = {
  /**
   * Admin: Get all bookings
   */
  async getBookings(payload: GetBookingsPayload): Promise<any> {
    return axiosClient.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Bookings/get`, payload);
  },

  /**
   * Admin: Get booking detail by UUID
   */
  async getBookingDetail(uuid: string): Promise<any> {
    return axiosClient.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Bookings/detail/${uuid}`);
  },

  /**
   * Admin: Update booking state
   */
  async updateBookingState(uuid: string, state: number): Promise<any> {
    return axiosClient.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Bookings/update-state`, {
      uuid,
      state,
    });
  },

  /**
   * Admin: Delete booking
   */
  async deleteBooking(uuid: string): Promise<any> {
    return axiosClient.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Bookings/delete/${uuid}`);
  },
};
