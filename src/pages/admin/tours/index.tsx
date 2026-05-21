import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Tours.module.scss";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCompass, FiEye } from "react-icons/fi";
import Link from "next/link";
import { tourService, TourItem } from "~/services/tourService";
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

export default function ToursManagement() {
  const [keyword, setKeyword] = useState("");
  const [rankingFilter, setRankingFilter] = useState<number | null>(null);
  const [tours, setTours] = useState<TourItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPage: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await tourService.getTours({
        limit,
        page: page - 1, // Convert 1-indexed UI page to 0-indexed API page
        keyword,
        ranking: rankingFilter,
      });

      if (res && res.error && res.error.code === 0) {
        setTours(res.data.items || []);
        setPagination({
          totalCount: res.data.pagination.totalCount || 0,
          totalPage: res.data.pagination.totalPage || 0,
        });
      } else {
        toast.error(res?.error?.message || "Không thể tải danh sách tour!");
      }
    } catch (err: any) {
      console.error("Error fetching tours:", err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword, rankingFilter]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleDelete = async (slug: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa Tour này?")) {
      try {
        const res = await tourService.deleteTour(slug);
        if (res && res.error && res.error.code === 0) {
          toast.success("Xóa tour thành công!");
          fetchTours();
        } else {
          toast.error(res?.error?.message || "Có lỗi xảy ra khi xóa tour!");
        }
      } catch (err) {
        console.error("Error deleting tour:", err);
        toast.error("Không thể kết nối tới Backend!");
      }
    }
  };

  const handleToggleStatus = (slug: string) => {
    toast.success("Cập nhật trạng thái tour thành công!");
    setTours(prev => prev.map(t => {
      if (t.slug === slug) {
        return { ...t, isHot: t.isHot === 1 ? 0 : 1 };
      }
      return t;
    }));
  };

  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleViewDetail = async (slug: string) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    setSelectedTour(null); // Clear previous detail
    try {
      const res = await tourService.getTourDetail(slug);
      if (res && res.error && res.error.code === 0 && res.data) {
        setSelectedTour(res.data);
      } else {
        toast.error("Không thể tải thông tin chi tiết tour!");
        setIsDetailOpen(false);
      }
    } catch (err) {
      console.error("Error fetching tour details:", err);
      toast.error("Lỗi khi tải chi tiết tour!");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản lý Tour</h1>
          <p className={styles.subtitle}>Tạo mới, chỉnh sửa thông tin chương trình du lịch và combo VOYAGE</p>
        </div>
        <Link href="/admin/tours/create" className={styles.addBtn}>
          <FiPlus /> Thêm Tour mới
        </Link>
      </div>

      {/* Filter Block */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tên tour, hành trình..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1); // Reset to page 1 on filter change
            }}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterSelect}>
            <label>Thứ tự xếp hạng (Ranking)</label>
            <select
              value={rankingFilter ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setRankingFilter(val ? Number(val) : null);
                setPage(1); // Reset to page 1 on filter change
              }}
            >
              <option value="">Tất cả xếp hạng</option>
              <option value={1}>Hạng 1</option>
              <option value={2}>Hạng 2</option>
              <option value={3}>Hạng 3</option>
              <option value={4}>Hạng 4</option>
              <option value={5}>Hạng 5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingOverlay}>
            <span className={styles.spinner} />
            Đang tải dữ liệu tours...
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th style={{ width: "120px" }}>Khởi Hành</th>
                    <th style={{ minWidth: "300px" }}>Tên Tour / Combo</th>
                    <th>Xếp hạng</th>
                    <th style={{ textAlign: "right" }}>Giá Gốc</th>
                    <th style={{ textAlign: "right" }}>Giá Khuyến Mãi</th>
                    <th style={{ textAlign: "center" }}>Bán chạy (Hot)</th>
                    <th style={{ textAlign: "center", width: "120px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.length > 0 ? (
                    tours.map((t, idx) => (
                      <tr key={t.slug || idx}>
                        <td className={styles.tourCode}>
                          <div className={styles.journeyCell}>
                            <FiMapPin className={styles.pinIcon} />
                            <span>{t.departure || "Chưa rõ"}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.tourItemCell}>
                            {/* Thumbnail */}
                            {t.thumbnail && (
                              <img
                                src={getImageUrl(t.thumbnail)}
                                alt={t.title}
                                className={styles.tourThumb}
                              />
                            )}
                            <div className={styles.tourMeta}>
                              <span className={styles.tourName}>{t.title}</span>
                              <span className={styles.tourSpecs}>
                                {t.durationDays > 0 ? `${t.durationDays} Ngày ${t.durationNights} Đêm` : "Liên hệ"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.tourSpecs}>Hạng {t.ranking || "N/A"}</span>
                        </td>
                        <td className={styles.priceCell}>
                          {t.originalPrices > 0 ? t.originalPrices.toLocaleString("vi-VN") + " ₫" : "Liên hệ"}
                        </td>
                        <td className={styles.priceSaleCell}>
                          {t.salePrices > 0 ? t.salePrices.toLocaleString("vi-VN") + " ₫" : "Liên hệ"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => handleToggleStatus(t.slug)}
                            className={styles.statusToggleBtn}
                            title="Click để đổi trạng thái Hot"
                          >
                            <span className={t.isHot === 1 ? styles.badgeActive : styles.badgeHidden}>
                              {t.isHot === 1 ? "Hot 🔥" : "Thường"}
                            </span>
                          </button>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button onClick={() => handleViewDetail(t.slug)} className={styles.viewBtn} title="Xem chi tiết">
                              <FiEye />
                            </button>
                            <Link href={`/admin/tours/create?edit=${t.slug}`} className={styles.editBtn} title="Sửa thông tin">
                              <FiEdit2 />
                            </Link>
                            <button onClick={() => handleDelete(t.slug)} className={styles.deleteBtn} title="Xóa tour">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.emptyCell}>
                        <FiCompass className={styles.emptyIcon} />
                        <p>Không tìm thấy tour phù hợp với bộ lọc.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className={styles.tableFooter}>
              <span>Hiển thị <strong>{tours.length}</strong> trên <strong>{pagination.totalCount}</strong> tours</span>

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

      {/* Detail Modal */}
      {isDetailOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Chi tiết Tour / Combo</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsDetailOpen(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {isLoadingDetail || !selectedTour ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                  <div className={styles.spinner}></div>
                  <p style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: '500' }}>Đang tải thông tin chi tiết...</p>
                </div>
              ) : (
                <>
                  {/* Gallery & Media */}
                  <div className={styles.modalSection}>
                    <h4>Hình ảnh chương trình</h4>
                    <div className={styles.modalGalleryTrack}>
                      <img src={getImageUrl(selectedTour.thumbnail)} alt="Thumbnail" />
                      {selectedTour.images && selectedTour.images.map((img: string, idx: number) => (
                        <img key={idx} src={getImageUrl(img)} alt={`Gallery ${idx}`} />
                      ))}
                    </div>
                  </div>

                  {/* Details Information */}
                  <div className={styles.modalSection}>
                    <h4>Thông tin cơ bản</h4>
                    <div className={styles.modalGrid}>
                      <div className={styles.modalInfoItem}>
                        <strong>Tên chương trình</strong>
                        <span>{selectedTour.title}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Loại dịch vụ</strong>
                        <span>{selectedTour.type === 1 ? "Tour du lịch" : "Combo du lịch"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Điểm khởi hành</strong>
                        <span>{selectedTour.departure || "Chưa thiết lập"} ({selectedTour.slugDeparture})</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Điểm đến</strong>
                        <span>
                          {selectedTour.tourDestinations && selectedTour.tourDestinations.length > 0
                            ? selectedTour.tourDestinations.map((d: any) => d.name).join(", ")
                            : "Chưa thiết lập"}
                        </span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Thời lượng</strong>
                        <span>{selectedTour.durationDays} ngày {selectedTour.durationNights} đêm</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Xếp hạng hiển thị</strong>
                        <span>Hạng {selectedTour.ranking} ⭐</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Độ hot</strong>
                        <span>{selectedTour.isHot === 1 ? "Hot 🔥" : "Thường"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Giá bán khuyến mãi</strong>
                        <span style={{ color: 'var(--primary)' }}>
                          {selectedTour.salePrices > 0 ? selectedTour.salePrices.toLocaleString('vi-VN') + " ₫" : "Liên hệ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Description text */}
                  {selectedTour.description && (
                    <div className={styles.modalSection}>
                      <h4>Mô tả lịch trình & Dịch vụ chi tiết</h4>
                      <div className={styles.modalTextareaView}>
                        {selectedTour.description}
                      </div>
                    </div>
                  )}

                  {/* Introduce / Policy text */}
                  {selectedTour.introduce && (
                    <div className={styles.modalSection}>
                      <h4>Giới thiệu ngắn / Chính sách</h4>
                      <div
                        className={styles.modalTextareaView}
                        dangerouslySetInnerHTML={{ __html: selectedTour.introduce }}
                      />
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

ToursManagement.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
