import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Bookings.module.scss";
import { FiSearch, FiCalendar, FiArrowRight, FiInfo, FiCheck, FiX, FiCheckSquare, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { toast } from "react-toastify";
import { bookingService, BookingAdminItem } from "~/services/bookingService";

export default function BookingsLedger() {
  const [keyword, setKeyword] = useState("");
  const [bookings, setBookings] = useState<BookingAdminItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPage: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getBookings({
        limit,
        page: page - 1,
        keyword,
      });

      if (res && res.error && res.error.code === 0) {
        setBookings(res.data.items || []);
        setPagination({
          totalCount: res.data.pagination?.totalCount || 0,
          totalPage: res.data.pagination?.totalPage || 0,
        });
      } else {
        toast.error(res?.error?.message || "Không thể tải danh sách bookings!");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (uuid: string, newState: number) => {
    try {
      const res = await bookingService.updateBookingState(uuid, newState);
      if (res && res.error && res.error.code === 0) {
        toast.success("Cập nhật trạng thái thành công!");
        fetchBookings();
      } else {
        toast.error(res?.error?.message || "Lỗi khi cập nhật trạng thái!");
      }
    } catch (err) {
      console.error("Error updating state:", err);
      toast.error("Không thể kết nối máy chủ!");
    }
  };

  const handleDelete = async (uuid: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn đặt này? Hành động này không thể hoàn tác.")) {
      try {
        const res = await bookingService.deleteBooking(uuid);
        if (res && res.error && res.error.code === 0) {
          toast.success("Xóa đơn đặt thành công!");
          fetchBookings();
        } else {
          toast.error(res?.error?.message || "Lỗi khi xóa đơn đặt!");
        }
      } catch (err) {
        console.error("Error deleting booking:", err);
        toast.error("Không thể kết nối máy chủ!");
      }
    }
  };

  const getStatusBadgeClass = (state: number) => {
    switch (state) {
      case 1: return styles.badgePending;
      case 2: return styles.badgeCompleted;
      case 3: return styles.badgeCancelled;
      default: return "";
    }
  };

  const getStatusLabel = (state: number) => {
    switch (state) {
      case 1: return "Chưa xử lý";
      case 2: return "Đã xác nhận";
      case 3: return "Hủy đơn";
      default: return "Chưa xác định";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản lý Bookings</h1>
          <p className={styles.subtitle}>Kiểm duyệt, theo dõi hóa đơn và thay đổi trạng thái dịch vụ của khách hàng</p>
        </div>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo khách hàng, số điện thoại..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1); // Reset to page 1 on filter change
            }}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingOverlay} style={{ padding: "40px", textAlign: "center" }}>
            <span className="spinner" />
            <p>Đang tải dữ liệu bookings...</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Tên Dịch Vụ</th>
                    <th style={{ textAlign: "center" }}>Phân loại</th>
                    <th>Ngày tạo</th>
                    <th style={{ textAlign: "center" }}>Trạng thái</th>
                    <th style={{ textAlign: "center", width: "160px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.uuid}>
                        <td className={styles.bookingCode}>
                           {b.uuid.split('-')[0].toUpperCase()}
                        </td>
                        <td>
                          <div className={styles.customerCell}>
                            <span className={styles.customerName}>{b.fullName}</span>
                            <span className={styles.customerPhone}>{b.phoneNumber}</span>
                          </div>
                        </td>
                        <td className={styles.serviceCell}>{b.serviceName}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={b.categoryName === "Tour" ? styles.typeTour : styles.typeHotel}>
                            {b.categoryName}
                          </span>
                        </td>
                        <td>
                          <div className={styles.dateCell}>
                            <FiCalendar style={{ marginRight: "4px", color: "var(--primary)" }} /> 
                            {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={getStatusBadgeClass(b.state)}>
                            {getStatusLabel(b.state)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <Link href={`/admin/bookings/${b.uuid}`} className={styles.detailBtn} title="Xem hóa đơn chi tiết">
                              <FiInfo />
                            </Link>
                            {b.state === 1 && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(b.uuid, 2)}
                                  className={styles.approveBtn}
                                  title="Xác nhận & xử lý đơn đặt"
                                >
                                  <FiCheck />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(b.uuid, 3)}
                                  className={styles.cancelBtn}
                                  title="Hủy đơn đặt"
                                >
                                  <FiX />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(b.uuid)}
                              className={styles.cancelBtn}
                              title="Xóa đơn đặt vĩnh viễn"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.emptyCell}>
                        <FiInfo className={styles.emptyIcon} />
                        <p>Không tìm thấy booking nào thỏa mãn điều kiện.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination footer */}
            <div className={styles.tableFooter}>
              <span>Hiển thị <strong>{bookings.length}</strong> trên <strong>{pagination.totalCount}</strong> đơn bookings</span>

              {pagination.totalPage > 1 && (
                <ul className={styles.paginationList}>
                  <li>
                    <button
                      className={styles.pageBtn}
                      disabled={page === 1}
                      onClick={() => setPage(prev => prev - 1)}
                    >
                      Trước
                    </button>
                  </li>
                  {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map((p) => (
                    <li key={p}>
                      <button
                        className={`${styles.pageBtn} ${page === p ? styles.activePageBtn : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      className={styles.pageBtn}
                      disabled={page === pagination.totalPage}
                      onClick={() => setPage(prev => prev + 1)}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

BookingsLedger.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
