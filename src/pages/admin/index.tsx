import React, { useEffect, useState } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./AdminDashboard.module.scss";
import { FiTrendingUp, FiCompass, FiBriefcase, FiCalendar, FiArrowRight, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import Link from "next/link";
import clsx from "clsx";
import { statisticsService, StatisticsData } from "~/services/statisticsService";
import { bookingService, BookingAdminItem } from "~/services/bookingService";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<StatisticsData | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const statsRes = await statisticsService.getStatistics({
          limit: 0,
          page: 0,
          from: startOfMonth.toISOString(),
          to: now.toISOString(),
        });

        if (statsRes?.error?.code === 0 && statsRes.data) {
          setStatsData(statsRes.data);
        }

        // Fetch recent bookings
        const bookingsRes = await bookingService.getBookings({
          limit: 5,
          page: 0,
        });

        if (bookingsRes?.error?.code === 0 && bookingsRes.data?.items) {
          setRecentBookings(bookingsRes.data.items);
        }

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        toast.error("Không thể lấy dữ liệu dashboard từ máy chủ!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = statsData ? [
    { title: "Tour Đang Mở", value: statsData.totalActiveTours.toString(), icon: FiCompass, color: "orange", desc: `Tổng số ${statsData.totalSoldTours} lượt tour bán ra` },
    { title: "Khách Sạn Đang Mở", value: statsData.totalActiveHotels.toString(), icon: FiBriefcase, color: "blue", desc: `Tổng số ${statsData.totalSoldHotels} lượt phòng đã đặt` },
    { title: "Xe Đang Cho Thuê", value: statsData.totalActiveCars.toString(), icon: FiTrendingUp, color: "purple", desc: `Đã có ${statsData.totalCustomerCars} lượt khách thuê` },
    { title: "Tổng Booking Hệ Thống", value: (statsData.totalSoldTours + statsData.totalSoldHotels + statsData.totalCustomerCars).toString(), icon: FiCalendar, color: "green", desc: "Bao gồm tất cả các dịch vụ" },
  ] : [
    { title: "Tour Đang Mở", value: "-", icon: FiCompass, color: "orange", desc: "Đang tải dữ liệu..." },
    { title: "Khách Sạn Đang Mở", value: "-", icon: FiBriefcase, color: "blue", desc: "Đang tải dữ liệu..." },
    { title: "Xe Đang Cho Thuê", value: "-", icon: FiTrendingUp, color: "purple", desc: "Đang tải dữ liệu..." },
    { title: "Tổng Booking Hệ Thống", value: "-", icon: FiCalendar, color: "green", desc: "Đang tải dữ liệu..." },
  ];

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
            <h3>Phân tích tỷ trọng đặt dịch vụ thực tế</h3>
            <span className={styles.chartLegend}>
              <span className={styles.legendColorTour} /> Lượt đặt thành công
            </span>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.customChartContainer} style={{ justifyContent: 'space-around' }}>
              {[
                { name: "Tour du lịch", value: statsData?.totalSoldTours || 0, colorClass: styles.barTour },
                { name: "Khách sạn", value: statsData?.totalSoldHotels || 0, colorClass: styles.barHotel },
                { name: "Xe du lịch", value: statsData?.totalCustomerCars || 0, colorClass: styles.barCar },
              ].map((data, idx) => {
                const maxValue = Math.max(
                  statsData?.totalSoldTours || 0,
                  statsData?.totalSoldHotels || 0,
                  statsData?.totalCustomerCars || 0,
                  1
                );
                const heightPercent = `${(data.value / maxValue) * 100}%`;
                return (
                  <div key={idx} className={styles.chartColumn} style={{ width: '120px' }}>
                    <div className={styles.barGroup} style={{ height: '140px', justifyContent: 'center' }}>
                      <div
                        className={data.colorClass}
                        style={{ height: heightPercent, width: '40px', transition: 'height 0.5s ease-out' }}
                        title={`${data.name}: ${data.value} lượt đặt`}
                      />
                    </div>
                    <span className={styles.chartMonthLabel} style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      {data.name} ({data.value})
                    </span>
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
                <h4>Bookings cần duyệt gấp</h4>
                <p>Kiểm tra các khách hàng đang chờ phản hồi xác nhận từ hệ thống</p>
              </div>
            </div>
            <div className={styles.opsItem}>
              <div className={clsx(styles.opsIcon, styles.opsGreen)}>
                <FiCheckCircle />
              </div>
              <div className={styles.opsContent}>
                <h4>Tour khởi hành trong ngày</h4>
                <p>Hướng dẫn viên đã nhận đủ danh sách đoàn và chuẩn bị tốt nhất</p>
              </div>
            </div>
            <div className={styles.opsItem}>
              <div className={clsx(styles.opsIcon, styles.opsBlue)}>
                <FiCalendar />
              </div>
              <div className={styles.opsContent}>
                <h4>Phòng Check-in hôm nay</h4>
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
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                    <p style={{ marginTop: "16px", color: "#7f8c8d" }}>Đang tải danh sách Bookings...</p>
                  </td>
                </tr>
              ) : recentBookings.length > 0 ? (
                recentBookings.map((bk) => (
                  <tr key={bk.uuid}>
                    <td className={styles.bookingId}>{bk.uuid.split('-')[0].toUpperCase()}</td>
                    <td className={styles.customerName}>{bk.fullName}</td>
                    <td className={styles.serviceName}>{bk.serviceName}</td>
                    <td>
                      <span className={clsx(styles.typePill, bk.categoryName === "Tour" ? styles.typeTour : styles.typeHotel)}>
                        {bk.categoryName}
                      </span>
                    </td>
                    <td>{new Date(bk.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <span className={clsx(styles.statusBadge, getStatusBadgeClass(bk.state))}>
                        {getStatusLabel(bk.state)}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/bookings/${bk.uuid}`} className={styles.detailBtn}>
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
                    Chưa có đơn đặt hàng nào trong hệ thống.
                  </td>
                </tr>
              )}
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
