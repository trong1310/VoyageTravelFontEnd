import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Bookings.module.scss";
import { FiArrowLeft, FiUser, FiInfo, FiCheck, FiX, FiCheckSquare, FiMapPin, FiPhone, FiMail, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { bookingService, BookingDetailData } from "~/services/bookingService";

export default function BookingDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState<BookingDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await bookingService.getBookingDetail(id as string);
      if (res && res.error && res.error.code === 0 && res.data) {
        setBooking(res.data);
      } else {
        toast.error(res?.error?.message || "Không thể tải chi tiết booking!");
      }
    } catch (err) {
      console.error("Error fetching booking detail:", err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdateStatus = async (newState: number) => {
    try {
      const res = await bookingService.updateBookingState(booking!.uuid, newState);
      if (res && res.error && res.error.code === 0) {
        toast.success("Cập nhật trạng thái thành công!");
        fetchDetail();
      } else {
        toast.error(res?.error?.message || "Lỗi khi cập nhật trạng thái!");
      }
    } catch (err) {
      console.error("Error updating state:", err);
      toast.error("Không thể kết nối máy chủ!");
    }
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt này?")) {
      try {
        const res = await bookingService.deleteBooking(booking!.uuid);
        if (res && res.error && res.error.code === 0) {
          toast.success("Xóa đơn đặt thành công!");
          router.push("/admin/bookings");
        } else {
          toast.error(res?.error?.message || "Lỗi khi xóa đơn đặt!");
        }
      } catch (err) {
        console.error("Error deleting booking:", err);
        toast.error("Không thể kết nối máy chủ!");
      }
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

  const getStatusBadgeClass = (state: number) => {
    switch (state) {
      case 1: return styles.badgePending;
      case 2: return styles.badgeCompleted;
      case 3: return styles.badgeCancelled;
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "100px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "16px", color: "#7f8c8d" }}>Đang tải dữ liệu chi tiết đơn đặt...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "100px 0", textAlign: "center" }}>
          <h2>Không tìm thấy đơn booking này</h2>
          <Link href="/admin/bookings" className={styles.backLink} style={{ justifyContent: "center", marginTop: "16px" }}>
            <FiArrowLeft /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <div className={styles.backWrapper}>
            <Link href="/admin/bookings" className={styles.backLink}>
              <FiArrowLeft /> Quay lại danh sách Bookings
            </Link>
          </div>
          <h1 className={styles.title}>Chi tiết đơn hàng {booking.uuid.split('-')[0].toUpperCase()}</h1>
          <p className={styles.subtitle}>Quản lý vòng đời đơn hàng, xác thực thông tin khách và duyệt giao dịch</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className={styles.progressTracker}>
        <div className={styles.progressLine}>
          <div
            className={styles.progressLineActive}
            style={{
              width: booking.state === 1 ? "50%" :
                  booking.state === 2 ? "100%" : "0%"
            }}
          />
        </div>

        {booking.state !== 3 ? (
          <>
            <div className={styles.stepDone}>
              <div className={styles.stepIcon}><FiCheck /></div>
              <span className={styles.stepLabel}>Đã nhận đơn</span>
            </div>
            <div className={booking.state === 1 || booking.state === 2 ? styles.stepDone : styles.stepActive}>
              <div className={styles.stepIcon}>2</div>
              <span className={styles.stepLabel}>Chưa xử lý</span>
            </div>
            <div className={booking.state === 2 ? styles.stepDone : styles.stepActive}>
              <div className={styles.stepIcon}>3</div>
              <span className={styles.stepLabel}>Đã xác nhận</span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.stepDone}>
              <div className={styles.stepIcon}><FiCheck /></div>
              <span className={styles.stepLabel}>Đã nhận đơn</span>
            </div>
            <div className={styles.stepCancelled}>
              <div className={styles.stepIcon}><FiX /></div>
              <span className={styles.stepLabel}>Hủy đơn</span>
            </div>
          </>
        )}
      </div>

      {/* Detail Grid */}
      <div className={styles.detailGrid}>
        {/* Main Info Columns */}
        <div className={styles.detailCard}>
          {/* Customer info */}
          <div>
            <h3 className={styles.sectionTitle}>Thông tin khách hàng</h3>
            <div className={styles.infoGrid} style={{ marginTop: "12px" }}>
              <div className={styles.infoItem}>
                <label>Họ và tên khách</label>
                <span><FiUser style={{ marginRight: "4px", color: "var(--primary)" }} /> {booking.fullName}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Số điện thoại</label>
                <span><FiPhone style={{ marginRight: "4px", color: "var(--primary)" }} /> {booking.phoneNumber}</span>
              </div>
              <div className={styles.infoItemFull}>
                <label>Địa chỉ email</label>
                <span><FiMail style={{ marginRight: "4px", color: "var(--primary)" }} /> {booking.email || "Không cung cấp"}</span>
              </div>
              <div className={styles.infoItemFull}>
                <label>Yêu cầu / Ghi chú đặc biệt</label>
                <span>{booking.specialRequirements || "Không có ghi chú."}</span>
              </div>
            </div>
          </div>

          {/* Service info */}
          <div>
            <h3 className={styles.sectionTitle}>Thông tin dịch vụ đặt chỗ</h3>
            <div className={styles.infoGrid} style={{ marginTop: "12px" }}>
              <div className={styles.infoItemFull}>
                <label>Tên Combo / Tour du lịch / Khách sạn</label>
                <span style={{ fontWeight: "700", color: "var(--primary)" }}>{booking.serviceName}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Phân loại dịch vụ</label>
                <span>
                  <span className={booking.categoryName === "Tour" ? styles.typeTour : styles.typeHotel}>
                    {booking.categoryName}
                  </span>
                </span>
              </div>
              <div className={styles.infoItem}>
                <label>Thời điểm đặt (Booking Date)</label>
                <span>{new Date(booking.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Ngày bắt đầu (Check-in/Khởi hành)</label>
                <span>{new Date(booking.startTime).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Số lượng khách hàng</label>
                <span>{booking.totalCustomer} người</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Actions Panel */}
        <div className={styles.sideCard}>
          <span className={styles.sideLabel}>Duyệt trạng thái bookings</span>
          <div className={styles.sideStatusBox}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#5c6b73" }}>Hiện tại:</span>
            <span className={getStatusBadgeClass(booking.state)}>
              {getStatusLabel(booking.state)}
            </span>
          </div>

          <div className={styles.actionBtnGroup}>
            {booking.state === 1 && (
              <>
                <button
                  onClick={() => handleUpdateStatus(2)}
                  className={styles.primaryActionBtn}
                  style={{ backgroundColor: "#9b59b6" }}
                >
                  <FiCheckSquare /> Xác nhận & xử lý đơn đặt
                </button>
                <button
                  onClick={() => handleUpdateStatus(3)}
                  className={styles.outlineActionBtn}
                >
                  <FiX /> Hủy đơn đặt hàng
                </button>
              </>
            )}

            {booking.state === 2 && (
              <p style={{ fontSize: "12px", color: "#95a5a6", textAlign: "center", lineHeight: "1.4" }}>
                Đơn hàng này đã được thực hiện và kết thúc hoàn toàn. Trạng thái không thể chỉnh sửa thêm.
              </p>
            )}

            {booking.state === 3 && (
              <p style={{ fontSize: "12px", color: "#e74c3c", textAlign: "center", fontWeight: "600" }}>
                Đơn đặt hàng này đã bị hủy bỏ bởi quản trị viên.
              </p>
            )}

            <button
              onClick={handleDelete}
              className={styles.outlineActionBtn}
              style={{ marginTop: "12px", color: "#e74c3c", borderColor: "#fdf2f2", backgroundColor: "#fdf2f2" }}
            >
              <FiTrash2 /> Xóa vĩnh viễn đơn đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

BookingDetails.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
