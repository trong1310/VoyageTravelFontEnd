import React from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./AdminDashboard.module.scss";
import { FiTrendingUp, FiCompass, FiBriefcase, FiCalendar, FiArrowRight, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import Link from "next/link";
import clsx from "clsx";

interface BookingItem {
  id: string;
  customer: string;
  service: string;
  type: "Tour" | "Khách sạn";
  date: string;
  amount: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

export default function AdminDashboard() {
  const stats = [
    { title: "Tổng số Tour", value: "24", icon: FiCompass, color: "orange", desc: "4 tour mới thêm trong tháng" },
    { title: "Tổng Khách sạn", value: "15", icon: FiBriefcase, color: "blue", desc: "Đang hoạt động trên 5 tỉnh thành" },
    { title: "Lượt Bookings", value: "1,482", icon: FiCalendar, color: "green", desc: "+12% so với tháng trước" },
    { title: "Doanh thu", value: "2.4B ₫", icon: FiTrendingUp, color: "purple", desc: "Mục tiêu đạt 3B trong Q2" },
  ];

  const recentBookings: BookingItem[] = [
    { id: "BK-9824", customer: "Lê Minh Tuấn", service: "Combo Phú Quốc 3N2Đ - Pullman", type: "Tour", date: "19/05/2026", amount: "7,890,000 ₫", status: "Pending" },
    { id: "BK-9823", customer: "Trần Thị Lan", service: "Hồ Tràm Beach Resort & Spa", type: "Khách sạn", date: "18/05/2026", amount: "3,500,000 ₫", status: "Confirmed" },
    { id: "BK-9822", customer: "Nguyễn Văn Hùng", service: "Tour Vịnh Hạ Long Du Thuyền 5 Sao", type: "Tour", date: "18/05/2026", amount: "12,400,000 ₫", status: "Completed" },
    { id: "BK-9821", customer: "Phạm Thảo Vy", service: "InterContinental Đà Nẵng Resort", type: "Khách sạn", date: "17/05/2026", amount: "9,200,000 ₫", status: "Cancelled" },
    { id: "BK-9820", customer: "Đỗ Hoàng Nam", service: "Tour Đà Lạt Ngàn Hoa 4N3Đ", type: "Tour", date: "16/05/2026", amount: "5,600,000 ₫", status: "Confirmed" },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending": return styles.badgePending;
      case "Confirmed": return styles.badgeConfirmed;
      case "Completed": return styles.badgeCompleted;
      case "Cancelled": return styles.badgeCancelled;
      default: return "";
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Tổng quan Dashboard</h1>
          <p className={styles.subtitle}>Báo cáo kinh doanh và thống kê quản trị Travel</p>
        </div>
        <div className={styles.dateBadge}>
          Cập nhật: {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Grid Stats */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <div className={styles.statInfo}>
                  <span className={styles.statTitle}>{stat.title}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
                <div className={clsx(styles.statIconWrapper, styles[`icon_${stat.color}`])}>
                  <Icon />
                </div>
              </div>
              <div className={styles.statCardFooter}>
                <span className={styles.statDesc}>{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Summary Grid */}
      <div className={styles.analyticsGrid}>
        {/* Custom Visual Performance Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Thống kê lượt Bookings 6 tháng gần nhất</h3>
            <span className={styles.chartLegend}>
              <span className={styles.legendColorTour} /> Tour
              <span className={styles.legendColorHotel} /> Khách sạn
            </span>
          </div>
          <div className={styles.chartBody}>
            {/* Elegant SVG-based bar chart for zero runtime exceptions and perfect rendering */}
            <div className={styles.customChartContainer}>
              {[
                { month: "T12", tour: 110, hotel: 90 },
                { month: "T01", tour: 130, hotel: 105 },
                { month: "T02", tour: 155, hotel: 120 },
                { month: "T03", tour: 120, hotel: 95 },
                { month: "T04", tour: 180, hotel: 140 },
                { month: "T05", tour: 220, hotel: 175 },
              ].map((data, idx) => {
                const tourHeight = `${(data.tour / 250) * 100}%`;
                const hotelHeight = `${(data.hotel / 250) * 100}%`;
                return (
                  <div key={idx} className={styles.chartColumn}>
                    <div className={styles.barGroup}>
                      <div
                        className={styles.barTour}
                        style={{ height: tourHeight }}
                        title={`Tour: ${data.tour} bookings`}
                      />
                      <div
                        className={styles.barHotel}
                        style={{ height: hotelHeight }}
                        title={`Khách sạn: ${data.hotel} bookings`}
                      />
                    </div>
                    <span className={styles.chartMonthLabel}>{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operational Overview Panel */}
        <div className={styles.operationalCard}>
          <div className={styles.cardHeader}>
            <h3>Hoạt động vận hành hôm nay</h3>
          </div>
          <div className={styles.opsList}>
            <div className={styles.opsItem}>
              <div className={clsx(styles.opsIcon, styles.opsOrange)}>
                <FiClock />
              </div>
              <div className={styles.opsContent}>
                <h4>5 Bookings cần duyệt gấp</h4>
                <p>Khách hàng đang chờ phản hồi xác nhận phòng từ hệ thống</p>
              </div>
            </div>
            <div className={styles.opsItem}>
              <div className={clsx(styles.opsIcon, styles.opsGreen)}>
                <FiCheckCircle />
              </div>
              <div className={styles.opsContent}>
                <h4>12 Tour khởi hành trong ngày</h4>
                <p>Hướng dẫn viên đã nhận đủ danh sách đoàn và khởi hành tốt đẹp</p>
              </div>
            </div>
            <div className={styles.opsItem}>
              <div className={clsx(styles.opsIcon, styles.opsBlue)}>
                <FiCalendar />
              </div>
              <div className={styles.opsContent}>
                <h4>8 phòng Check-in hôm nay</h4>
                <p>Đã liên hệ khách sạn chuẩn bị phòng đón tiếp chu đáo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className={styles.recentBookingsSection}>
        <div className={styles.sectionHeader}>
          <h2>Danh sách Bookings mới nhất</h2>
          <Link href="/admin/bookings" className={styles.viewAllLink}>
            Xem tất cả bookings <FiArrowRight />
          </Link>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.recentTable}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Loại hình</th>
                <th>Ngày đặt</th>
                <th>Tổng thanh toán</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((bk) => (
                <tr key={bk.id}>
                  <td className={styles.bookingId}>{bk.id}</td>
                  <td className={styles.customerName}>{bk.customer}</td>
                  <td className={styles.serviceName}>{bk.service}</td>
                  <td>
                    <span className={clsx(styles.typePill, bk.type === "Tour" ? styles.typeTour : styles.typeHotel)}>
                      {bk.type}
                    </span>
                  </td>
                  <td>{bk.date}</td>
                  <td className={styles.amount}>{bk.amount}</td>
                  <td>
                    <span className={clsx(styles.statusBadge, getStatusBadgeClass(bk.status))}>
                      {getStatusLabel(bk.status)}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/bookings/${bk.id}`} className={styles.detailBtn}>
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

AdminDashboard.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
