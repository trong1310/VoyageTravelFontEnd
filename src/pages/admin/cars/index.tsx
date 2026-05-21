import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Cars.module.scss";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiEye, FiActivity, FiTruck } from "react-icons/fi";
import Link from "next/link";
import { carService, CarItem } from "~/services/carService";
import { toast } from "react-toastify";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function CarsManagement() {
  const [keyword, setKeyword] = useState("");
  const [seatCountFilter, setSeatCountFilter] = useState<number | null>(null);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPage: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await carService.getCars({
        limit,
        page: page - 1, // API is 0-indexed
        keyword,
        seatCount: seatCountFilter,
      });

      if (res && res.error && res.error.code === 0) {
        setCars(res.data.items || []);
        setPagination({
          totalCount: res.data.pagination.totalCount || 0,
          totalPage: res.data.pagination.totalPage || 0,
        });
      } else {
        toast.error(res?.error?.message || "Không thể tải danh sách xe!");
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword, seatCountFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleDelete = async (slug: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa xe này khỏi hệ thống?")) {
      try {
        const res = await carService.deleteCar(slug);
        if (res && res.error && res.error.code === 0) {
          toast.success("Xóa xe thành công!");
          fetchCars();
        } else {
          toast.error(res?.error?.message || "Có lỗi xảy ra khi xóa xe!");
        }
      } catch (err) {
        console.error("Error deleting car:", err);
        toast.error("Không thể kết nối tới Backend!");
      }
    }
  };

  const handleViewDetail = async (slug: string) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    setSelectedCar(null);
    try {
      const res = await carService.getCarDetail(slug);
      if (res && res.error && res.error.code === 0 && res.data) {
        setSelectedCar(res.data);
      } else {
        toast.error("Không thể tải thông tin chi tiết xe!");
        setIsDetailOpen(false);
      }
    } catch (err) {
      console.error("Error fetching car details:", err);
      toast.error("Lỗi khi tải chi tiết xe!");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản Lý Đội Xe</h1>
          <p className={styles.subtitle}>Quản lý thông tin xe dịch vụ, biển số, số chỗ ngồi và các tuyến đường phục vụ</p>
        </div>
        <Link href="/admin/cars/create" className={styles.addBtn}>
          <FiPlus /> Thêm Xe Mới
        </Link>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên xe, hãng xe, biển số..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterSelect}>
            <label>Số ghế ngồi</label>
            <select
              value={seatCountFilter || ""}
              onChange={(e) => {
                setSeatCountFilter(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
            >
              <option value="">Tất cả số ghế</option>
              <option value="4">Xe 4 chỗ</option>
              <option value="7">Xe 7 chỗ</option>
              <option value="16">Xe 16 chỗ</option>
              <option value="29">Xe 29 chỗ</option>
              <option value="35">Xe 35 chỗ</option>
              <option value="45">Xe 45 chỗ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.customTable}>
            <thead>
              <tr>
                <th style={{ width: "300px" }}>Thông tin xe</th>
                <th>Biển số</th>
                <th style={{ textAlign: "center" }}>Số chỗ</th>
                <th>Hãng xe / Màu sắc</th>
                <th>Năm sản xuất</th>
                <th style={{ width: "200px" }}>Lộ trình phục vụ</th>
                <th style={{ textAlign: "center", width: "120px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className="spinner"></div>
                      <span style={{ color: '#7f8c8d' }}>Đang tải dữ liệu đội xe...</span>
                    </div>
                  </td>
                </tr>
              ) : cars.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    <FiTruck className={styles.emptyIcon} />
                    <p>Không tìm thấy xe dịch vụ nào phù hợp!</p>
                  </td>
                </tr>
              ) : (
                cars.map((c) => (
                  <tr key={c.slug}>
                    <td>
                      <div className={styles.carItemCell}>
                        {(c.thumbnail || c.thumbNail) && (
                          <img
                            src={getImageUrl(c.thumbnail || c.thumbNail || "")}
                            alt={c.name}
                            className={styles.carThumb}
                          />
                        )}
                        <div className={styles.carMeta}>
                          <span className={styles.carName}>{c.name}</span>
                          <span className={styles.carSpecs}>Ngày tạo: {new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "#e9680c" }}>{c.licensePlate}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{c.seatCount} chỗ</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{c.brand || "N/A"}</span>
                      {c.color && <span style={{ color: "#7f8c8d", fontSize: "12px", marginLeft: "6px" }}>({c.color})</span>}
                    </td>
                    <td>{c.manufactureYear || "N/A"}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {c.routes && c.routes.length > 0 ? (
                          c.routes.map((r, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                                backgroundColor: idx === 0 ? "rgba(233,104,12,0.08)" : "rgba(52,152,219,0.08)",
                                color: idx === 0 ? "#e9680c" : "#3498db",
                                fontSize: "11px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: 500,
                              }}
                            >
                              <FiMapPin style={{ fontSize: "9px" }} />
                              {r.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "#bdc3c7", fontStyle: "italic", fontSize: "12px" }}>Chưa xếp lộ trình</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button onClick={() => handleViewDetail(c.slug)} className={styles.viewBtn} title="Xem chi tiết">
                          <FiEye />
                        </button>
                        <Link href={`/admin/cars/create?edit=${c.slug}`} className={styles.editBtn} title="Sửa thông tin xe">
                          <FiEdit2 />
                        </Link>
                        <button onClick={() => handleDelete(c.slug)} className={styles.deleteBtn} title="Xóa xe">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        {pagination.totalPage > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={styles.pageBtn}
            >
              Trước
            </button>
            {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.pageBtn} ${page === p ? styles.activePageBtn : ""}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPage))}
              disabled={page === pagination.totalPage}
              className={styles.pageBtn}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Thông Tin Chi Tiết Xe</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsDetailOpen(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {isLoadingDetail || !selectedCar ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                  <div className="spinner"></div>
                  <p style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: '500' }}>Đang tải chi tiết xe...</p>
                </div>
              ) : (
                <>
                  <div className={styles.modalSection}>
                    <h4>Hình ảnh xe</h4>
                    <div style={{ width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                      {(selectedCar.thumbNail || selectedCar.thumbnail) && (
                        <img
                          src={getImageUrl(selectedCar.thumbNail || selectedCar.thumbnail)}
                          alt={selectedCar.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </div>

                  <div className={styles.modalSection}>
                    <h4>Thông số kỹ thuật</h4>
                    <div className={styles.modalGrid}>
                      <div className={styles.modalInfoItem}>
                        <strong>Tên xe dịch vụ</strong>
                        <span>{selectedCar.name}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Biển kiểm soát</strong>
                        <span style={{ color: "#e9680c", fontWeight: "bold" }}>{selectedCar.licensePlate}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Số ghế ngồi</strong>
                        <span>{selectedCar.seatCount} chỗ</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Hãng sản xuất / Thương hiệu</strong>
                        <span>{selectedCar.brand || "N/A"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Màu sắc thân xe</strong>
                        <span>{selectedCar.color || "N/A"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Năm sản xuất</strong>
                        <span>{selectedCar.manufactureYear || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {selectedCar.routes && selectedCar.routes.length > 0 && (
                    <div className={styles.modalSection}>
                      <h4>Lộ trình & Điểm đi qua (Sắp xếp theo thứ tự)</h4>
                      <div className={styles.modalRoutesList}>
                        {selectedCar.routes.map((r: any, idx: number) => (
                          <div key={idx} className={styles.modalRouteItem}>
                            <span className={styles.routeBadge}>{r.displayOrder || idx + 1}</span>
                            <span>{r.name}</span>
                            <span style={{ color: "#95a5a6", fontSize: "12px" }}>({r.slug})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCar.description && (
                    <div className={styles.modalSection}>
                      <h4>Mô tả tình trạng & Ghi chú xe</h4>
                      <div className={styles.modalTextareaView} dangerouslySetInnerHTML={{ __html: selectedCar.description }} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CarsManagement.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
