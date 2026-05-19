import React, { useState } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Bookings.module.scss";
import { FiSearch, FiCalendar, FiArrowRight, FiInfo, FiCheck, FiX, FiCheckSquare } from "react-icons/fi";
import Link from "next/link";
import { toast } from "react-toastify";

interface BookingItem {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  type: "Tour" | "Khách sạn";
  travelDate: string;
  totalAmount: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

export default function BookingsLedger() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: "1",
      code: "BK-9824",
      customerName: "Lê Minh Tuấn",
      customerPhone: "0912345678",
      serviceName: "Combo Phú Quốc 3N2Đ - Pullman Beach Resort Siêu Vip",
      type: "Tour",
      travelDate: "28/05/2026",
      totalAmount: "7,890,000 ₫",
      status: "Pending",
    },
    {
      id: "2",
      code: "BK-9823",
      customerName: "Trần Thị Lan",
      customerPhone: "0987654321",
      serviceName: "Hồ Tràm Beach Resort & Spa (Deluxe Ocean View)",
      type: "Khách sạn",
      travelDate: "05/06/2026",
      totalAmount: "3,500,000 ₫",
      status: "Confirmed",
    },
    {
      id: "3",
      code: "BK-9822",
      customerName: "Nguyễn Văn Hùng",
      customerPhone: "0909998887",
      serviceName: "Tour Vịnh Hạ Long Du Thuyền 5 Sao Ambassador",
      type: "Tour",
      travelDate: "18/05/2026",
      totalAmount: "12,400,000 ₫",
      status: "Completed",
    },
    {
      id: "4",
      code: "BK-9821",
      customerName: "Phạm Thảo Vy",
      customerPhone: "0933445566",
      serviceName: "InterContinental Đà Nẵng Sun Peninsula (Beach Suite)",
      type: "Khách sạn",
      travelDate: "20/05/2026",
      totalAmount: "9,200,000 ₫",
      status: "Cancelled",
    },
    {
      id: "5",
      code: "BK-9820",
      customerName: "Đỗ Hoàng Nam",
      customerPhone: "0977889900",
      serviceName: "Tour Đà Lạt Ngàn Hoa 4N3Đ (Wonder Resort)",
      type: "Tour",
      travelDate: "01/06/2026",
      totalAmount: "5,600,000 ₫",
      status: "Confirmed",
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: "Confirmed" | "Cancelled" | "Completed") => {
    setBookings(bookings.map(b => {
      if (b.id === id) {
        return { ...b, status: newStatus };
      }
      return b;
    }));
    toast.success(`Đã cập nhật trạng thái đơn hàng sang ${
      newStatus === "Confirmed" ? "Đã xác nhận" : newStatus === "Cancelled" ? "Đã hủy" : "Đã hoàn thành"
    }`);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending": return "Chờ xử lý";
      case "Confirmed": return "Đã xác nhận";
      case "Completed": return "Đã hoàn thành";
      case "Cancelled": return "Đã hủy";
      default: return "";
    }
  };

  // Filters
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.toLowerCase().includes(searchQuery.toLowerCase()) || b.customerPhone.includes(searchQuery);
    const matchesType = typeFilter === "All" || b.type === typeFilter;
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterSelect}>
            <label>Dịch vụ</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">Tất cả dịch vụ</option>
              <option value="Tour">Combo & Tours</option>
              <option value="Khách sạn">Khách sạn / Resort</option>
            </select>
          </div>

          <div className={styles.filterSelect}>
            <label>Trạng thái</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Tất cả trạng thái</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Completed">Đã hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Tên Dịch Vụ</th>
                <th style={{ textAlign: "center" }}>Phân loại</th>
                <th>Ngày khởi hành / check-in</th>
                <th style={{ textAlign: "right" }}>Tổng số tiền</th>
                <th style={{ textAlign: "center" }}>Trạng thái</th>
                <th style={{ textAlign: "center", width: "160px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className={styles.bookingCode}>{b.code}</td>
                    <td>
                      <div className={styles.customerCell}>
                        <span className={styles.customerName}>{b.customerName}</span>
                        <span className={styles.customerPhone}>{b.customerPhone}</span>
                      </div>
                    </td>
                    <td className={styles.serviceCell}>{b.serviceName}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={b.type === "Tour" ? styles.typeTour : styles.typeHotel}>
                        {b.type}
                      </span>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <FiCalendar style={{ marginRight: "4px", color: "var(--primary)" }} /> {b.travelDate}
                      </div>
                    </td>
                    <td className={styles.amountCell}>{b.totalAmount}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={getStatusBadgeClass(b.status)}>
                        {getStatusLabel(b.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <Link href={`/admin/bookings/${b.code}`} className={styles.detailBtn} title="Xem hóa đơn chi tiết">
                          <FiInfo />
                        </Link>
                        {b.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, "Confirmed")}
                              className={styles.approveBtn}
                              title="Xác nhận đơn đặt"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, "Cancelled")}
                              className={styles.cancelBtn}
                              title="Hủy đơn đặt"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                        {b.status === "Confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, "Completed")}
                            className={styles.completeBtn}
                            title="Hoàn thành dịch vụ"
                          >
                            <FiCheckSquare />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    <FiInfo className={styles.emptyIcon} />
                    <p>Không tìm thấy booking nào thỏa mãn bộ lọc tìm kiếm.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFooter}>
          <span>Hiển thị <strong>{filteredBookings.length}</strong> trên <strong>{bookings.length}</strong> đơn bookings</span>
        </div>
      </div>
    </div>
  );
}

BookingsLedger.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
