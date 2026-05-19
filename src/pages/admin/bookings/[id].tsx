import React, { useState, useEffect } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Bookings.module.scss";
import { FiArrowLeft, FiUser, FiInfo, FiCheck, FiX, FiCheckSquare, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

interface BookingDetail {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes: string;
  serviceName: string;
  type: "Tour" | "Khách sạn";
  travelDate: string;
  duration: string;
  paxCount: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Unpaid";
  originalPrice: number;
  discount: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

export default function BookingDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState<BookingDetail>({
    code: "BK-9824",
    customerName: "Lê Minh Tuấn",
    customerPhone: "0912345678",
    customerEmail: "tuan.le@gmail.com",
    customerNotes: "Yêu cầu phòng hướng biển tầng cao, không hút thuốc. Đoàn có trẻ em 3 tuổi cần chuẩn bị nôi em bé nếu có.",
    serviceName: "Combo Phú Quốc 3N2Đ - Pullman Beach Resort Siêu Vip",
    type: "Tour",
    travelDate: "28/05/2026",
    duration: "3 Ngày 2 Đêm",
    paxCount: "2 Người lớn, 1 Trẻ em",
    paymentMethod: "Chuyển khoản Ngân hàng (Techcombank)",
    paymentStatus: "Paid",
    originalPrice: 8500000,
    discount: 610000,
    totalPrice: 7890000,
    status: "Pending"
  });

  useEffect(() => {
    if (id && id !== "BK-9824") {
      // If navigating to another booking code, mock its detail
      setBooking({
        code: id as string,
        customerName: "Trần Thị Lan",
        customerPhone: "0987654321",
        customerEmail: "lan.tran@yahoo.com",
        customerNotes: "Khách check-in muộn lúc 18:00 do chuyến bay trễ.",
        serviceName: "Hồ Tràm Beach Resort & Spa (Deluxe Ocean View)",
        type: "Khách sạn",
        travelDate: "05/06/2026",
        duration: "1 Đêm",
        paxCount: "2 Người lớn",
        paymentMethod: "Thanh toán bằng thẻ tín dụng (Visa)",
        paymentStatus: "Paid",
        originalPrice: 3800000,
        discount: 300000,
        totalPrice: 3500000,
        status: "Confirmed"
      });
    }
  }, [id]);

  const handleUpdateStatus = (newStatus: "Confirmed" | "Completed" | "Cancelled") => {
    setBooking({ ...booking, status: newStatus });
    toast.success(`Đã cập nhật trạng thái đơn hàng sang ${newStatus === "Confirmed" ? "Đã xác nhận" : newStatus === "Completed" ? "Đã hoàn thành" : "Đã hủy"
      }`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending": return "Chờ xử lý";
      case "Confirmed": return "Đã xác nhận";
      case "Completed": return "Đã hoàn thành";
      case "Cancelled": return "Đã hủy";
      default: return "";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending": return styles.badgePending;
      case "Confirmed": return styles.badgeConfirmed;
      case "Completed": return styles.badgeCompleted;
      case "Cancelled": return styles.badgeCancelled;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <div className={styles.backWrapper}>
            <Link href="/admin/bookings" className={styles.backLink}>
              <FiArrowLeft /> Quay lại danh sách Bookings
            </Link>
          </div>
          <h1 className={styles.title}>Chi tiết đơn hàng {booking.code}</h1>
          <p className={styles.subtitle}>Quản lý vòng đời đơn hàng, xác thực thông tin khách và duyệt giao dịch</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className={styles.progressTracker}>
        <div className={styles.progressLine}>
          <div
            className={styles.progressLineActive}
            style={{
              width: booking.status === "Pending" ? "0%" :
                booking.status === "Confirmed" ? "50%" :
                  booking.status === "Completed" ? "100%" : "0%"
            }}
          />
        </div>

        {booking.status !== "Cancelled" ? (
          <>
            <div className={styles.stepDone}>
              <div className={styles.stepIcon}><FiCheck /></div>
              <span className={styles.stepLabel}>Đã nhận đơn</span>
            </div>
            <div className={booking.status === "Confirmed" || booking.status === "Completed" ? styles.stepDone : styles.stepActive}>
              <div className={styles.stepIcon}>2</div>
              <span className={styles.stepLabel}>Đã xác nhận</span>
            </div>
            <div className={booking.status === "Completed" ? styles.stepDone : styles.stepActive}>
              <div className={styles.stepIcon}>3</div>
              <span className={styles.stepLabel}>Đã hoàn thành</span>
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
              <span className={styles.stepLabel}>Đã hủy đơn đặt</span>
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
                <span><FiUser style={{ marginRight: "4px" }} /> {booking.customerName}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Số điện thoại</label>
                <span><FiPhone style={{ marginRight: "4px" }} /> {booking.customerPhone}</span>
              </div>
              <div className={styles.infoItemFull}>
                <label>Địa chỉ email</label>
                <span><FiMail style={{ marginRight: "4px" }} /> {booking.customerEmail}</span>
              </div>
              <div className={styles.infoItemFull}>
                <label>Ghi chú đặc biệt từ khách</label>
                <span>{booking.customerNotes || "Không có ghi chú."}</span>
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
                  <span className={booking.type === "Tour" ? styles.typeTour : styles.typeHotel}>
                    {booking.type}
                  </span>
                </span>
              </div>
              <div className={styles.infoItem}>
                <label>Ngày đi / Check-in</label>
                <span>{booking.travelDate}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Thời lượng lưu trú</label>
                <span>{booking.duration}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Số lượng khách hàng</label>
                <span>{booking.paxCount}</span>
              </div>
            </div>
          </div>

          {/* Pricing info */}
          <div>
            <h3 className={styles.sectionTitle}>Bảng kê thanh toán</h3>
            <div className={styles.pricingSheet} style={{ marginTop: "12px" }}>
              <div className={styles.pricingRow}>
                <span>Đơn giá niêm yết:</span>
                <span>{booking.originalPrice.toLocaleString()} ₫</span>
              </div>
              <div className={styles.pricingRow}>
                <span>Chiết khấu khuyến mãi VOYAGE:</span>
                <span style={{ color: "#e74c3c" }}>-{booking.discount.toLocaleString()} ₫</span>
              </div>
              <div className={styles.pricingRow}>
                <span>Phương thức thanh toán:</span>
                <span>{booking.paymentMethod}</span>
              </div>
              <div className={styles.pricingRow}>
                <span>Trạng thái giao dịch:</span>
                <span style={{ fontWeight: "700", color: booking.paymentStatus === "Paid" ? "#2ecc71" : "#e74c3c" }}>
                  {booking.paymentStatus === "Paid" ? "Đã thanh toán đủ" : "Chưa thanh toán"}
                </span>
              </div>
              <div className={styles.pricingTotalRow}>
                <span>Tổng chi phí khách trả:</span>
                <span>{booking.totalPrice.toLocaleString()} ₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Actions Panel */}
        <div className={styles.sideCard}>
          <span className={styles.sideLabel}>Duyệt trạng thái bookings</span>
          <div className={styles.sideStatusBox}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#5c6b73" }}>Hiện tại:</span>
            <span className={getStatusBadgeClass(booking.status)}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className={styles.actionBtnGroup}>
            {booking.status === "Pending" && (
              <>
                <button
                  onClick={() => handleUpdateStatus("Confirmed")}
                  className={styles.primaryActionBtn}
                >
                  <FiCheck /> Xác nhận bookings
                </button>
                <button
                  onClick={() => handleUpdateStatus("Cancelled")}
                  className={styles.outlineActionBtn}
                >
                  <FiX /> Hủy đơn đặt hàng
                </button>
              </>
            )}

            {booking.status === "Confirmed" && (
              <>
                <button
                  onClick={() => handleUpdateStatus("Completed")}
                  className={styles.primaryActionBtn}
                  style={{ backgroundColor: "#9b59b6" }}
                >
                  <FiCheckSquare /> Hoàn thành dịch vụ
                </button>
                <button
                  onClick={() => handleUpdateStatus("Cancelled")}
                  className={styles.outlineActionBtn}
                >
                  <FiX /> Hủy đơn đặt hàng
                </button>
              </>
            )}

            {booking.status === "Completed" && (
              <p style={{ fontSize: "12px", color: "#95a5a6", textAlign: "center", lineHeight: "1.4" }}>
                Đơn hàng này đã được thực hiện và kết thúc hoàn toàn. Trạng thái không thể chỉnh sửa thêm.
              </p>
            )}

            {booking.status === "Cancelled" && (
              <p style={{ fontSize: "12px", color: "#e74c3c", textAlign: "center", fontWeight: "600" }}>
                Đơn đặt hàng này đã bị hủy bỏ bởi quản trị viên.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

BookingDetails.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
