import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Hotels.module.scss";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiStar, FiActivity, FiEye, FiCompass } from "react-icons/fi";
import Link from "next/link";
import { hotelService, HotelItem } from "~/services/hotelService";
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

export default function HotelsManagement() {
  const [keyword, setKeyword] = useState("");
  const [rankingFilter, setRankingFilter] = useState<number | null>(null);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPage: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await hotelService.getHotels({
        limit,
        page: page - 1, // API is 0-indexed
        keyword,
        ranking: rankingFilter,
      });

      if (res && res.error && res.error.code === 0) {
        setHotels(res.data.items || []);
        setPagination({
          totalCount: res.data.pagination.totalCount || 0,
          totalPage: res.data.pagination.totalPage || 0,
        });
      } else {
        toast.error(res?.error?.message || "Không thể tải danh sách khách sạn!");
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword, rankingFilter]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleDelete = async (slug: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách sạn này?")) {
      try {
        const res = await hotelService.deleteHotel(slug);
        if (res && res.error && res.error.code === 0) {
          toast.success("Xóa khách sạn thành công!");
          fetchHotels();
        } else {
          toast.error(res?.error?.message || "Có lỗi xảy ra khi xóa khách sạn!");
        }
      } catch (err) {
        console.error("Error deleting hotel:", err);
        toast.error("Không thể kết nối tới Backend!");
      }
    }
  };

  const handleViewDetail = async (slug: string) => {
    setIsLoadingDetail(true);
    setIsDetailOpen(true);
    setSelectedHotel(null);
    try {
      const res = await hotelService.getHotelDetail(slug);
      if (res && res.error && res.error.code === 0 && res.data) {
        setSelectedHotel(res.data);
      } else {
        toast.error("Không thể tải thông tin chi tiết khách sạn!");
        setIsDetailOpen(false);
      }
    } catch (err) {
      console.error("Error fetching hotel details:", err);
      toast.error("Lỗi khi tải chi tiết khách sạn!");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getHotelTypeLabel = (type: number) => {
    switch (type) {
      case 1: return "Khách sạn";
      case 2: return "Resort";
      case 3: return "Homestay";
      case 4: return "Villa/Biệt thự";
      default: return "Cơ sở lưu trú";
    }
  };

  const renderStars = (count: number) => {
    const starCount = Math.round(count);
    return Array.from({ length: 5 }).map((_, idx) => (
      <FiStar
        key={idx}
        className={idx < starCount ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản lý Khách Sạn / Resort</h1>
          <p className={styles.subtitle}>Tạo mới, chỉnh sửa thông tin lưu trú, resort và homestay trên VOYAGE</p>
        </div>
        <Link href="/admin/hotels/create" className={styles.addBtn}>
          <FiPlus /> Thêm Khách sạn mới
        </Link>
      </div>

      {/* Filter Block */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tên khách sạn, resort..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.filtersGroup}>
          <div className={styles.filterSelect}>
            <label>Hạng sao</label>
            <select
              value={rankingFilter === null ? "" : rankingFilter}
              onChange={(e) => {
                const val = e.target.value;
                setRankingFilter(val === "" ? null : Number(val));
                setPage(1);
              }}
            >
              <option value="">Tất cả hạng sao</option>
              <option value="5">5 Sao ⭐⭐⭐⭐⭐</option>
              <option value="4">4 Sao ⭐⭐⭐⭐</option>
              <option value="3">3 Sao ⭐⭐⭐</option>
              <option value="2">2 Sao ⭐⭐</option>
              <option value="1">1 Sao ⭐</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Đang tải danh sách khách sạn...</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th style={{ minWidth: "260px" }}>Tên Khách Sạn / Resort</th>
                    <th>Địa chỉ chi tiết</th>
                    <th style={{ textAlign: "center" }}>Hạng Sao</th>
                    <th style={{ textAlign: "right" }}>Giá từ</th>
                    <th style={{ textAlign: "center" }}>Trạng thái</th>
                    <th style={{ textAlign: "center", width: "140px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.length > 0 ? (
                    hotels.map((h) => (
                      <tr key={h.slug}>
                        <td>
                          <div className={styles.hotelItemCell}>
                            <img src={getImageUrl(h.thumbnail)} alt={h.name} className={styles.hotelThumb} />
                            <div className={styles.hotelMeta}>
                              <span className={styles.hotelName}>{h.name}</span>
                              <span className={styles.hotelSpecs}>
                                <FiMapPin style={{ marginRight: "2px" }} /> {h.locations || "Đang cập nhật"}
                                <span className={styles.typeTag}>{getHotelTypeLabel(h.type)}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.addressCell}>{h.address || "Chưa cập nhật địa chỉ"}</td>
                        <td style={{ textAlign: "center" }}>
                          <div className={styles.starsGroup}>{renderStars(Number(h.ranking))}</div>
                        </td>
                        <td className={styles.priceCell}>
                          {h.relativePrice > 0 ? `${h.relativePrice.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={h.isHot === 1 ? styles.badgeActive : styles.badgeHidden}>
                            {h.isHot === 1 ? "Hot 🔥" : "Thường"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button onClick={() => handleViewDetail(h.slug)} className={styles.viewBtn} title="Xem chi tiết">
                              <FiEye />
                            </button>
                            <Link href={`/admin/hotels/create?edit=${h.slug}`} className={styles.editBtn} title="Sửa khách sạn">
                              <FiEdit2 />
                            </Link>
                            <button onClick={() => handleDelete(h.slug)} className={styles.deleteBtn} title="Xóa khách sạn">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        <FiCompass className={styles.emptyIcon} />
                        <p>Không tìm thấy khách sạn phù hợp với bộ lọc.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={styles.tableFooter}>
              <span>
                Hiển thị <strong>{hotels.length}</strong> trên <strong>{pagination.totalCount}</strong> khách sạn
              </span>

              {pagination.totalPage > 1 && (
                <ul className={styles.pagination}>
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
              <h3>Chi tiết Khách Sạn / Resort</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsDetailOpen(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {isLoadingDetail || !selectedHotel ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                  <div className={styles.spinner}></div>
                  <p style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: '500' }}>Đang tải thông tin chi tiết...</p>
                </div>
              ) : (
                <>
                  {/* Gallery */}
                  <div className={styles.modalSection}>
                    <h4>Hình ảnh phòng nghỉ & Cảnh quan</h4>
                    <div className={styles.modalGalleryTrack}>
                      <img src={getImageUrl(selectedHotel.thumbnail)} alt="Thumbnail" />
                      {selectedHotel.images && selectedHotel.images.map((img: string, idx: number) => (
                        <img key={idx} src={getImageUrl(img)} alt={`Gallery ${idx}`} />
                      ))}
                    </div>
                  </div>

                  {/* Basic details */}
                  <div className={styles.modalSection}>
                    <h4>Thông tin cơ bản</h4>
                    <div className={styles.modalGrid}>
                      <div className={styles.modalInfoItem}>
                        <strong>Tên cơ sở</strong>
                        <span>{selectedHotel.name}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Loại dịch vụ</strong>
                        <span>{getHotelTypeLabel(selectedHotel.type)}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Địa điểm khu vực</strong>
                        <span>{selectedHotel.locations || "Đang cập nhật"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Địa chỉ chi tiết</strong>
                        <span>{selectedHotel.address || "Đang cập nhật"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Hạng sao</strong>
                        <span style={{ color: '#f1c40f' }}>{selectedHotel.ranking} ⭐</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Độ nổi bật</strong>
                        <span>{selectedHotel.isHot === 1 ? "Hot 🔥" : "Thường"}</span>
                      </div>
                      <div className={styles.modalInfoItem}>
                        <strong>Giá tham khảo từ</strong>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                          {selectedHotel.relativePrice > 0 ? `${selectedHotel.relativePrice.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedHotel.description && (
                    <div className={styles.modalSection}>
                      <h4>Mô tả tiện ích & Dịch vụ</h4>
                      <div className={styles.modalTextareaView}>
                        {selectedHotel.description}
                      </div>
                    </div>
                  )}

                  {/* Policy / Regulations */}
                  {selectedHotel.regulations && (
                    <div className={styles.modalSection}>
                      <h4>Quy định & Chính sách nhận phòng</h4>
                      <div className={styles.modalTextareaView}>
                        {selectedHotel.regulations}
                      </div>
                    </div>
                  )}

                  {/* Introduce */}
                  {selectedHotel.introduce && (
                    <div className={styles.modalSection}>
                      <h4>Giới thiệu chung</h4>
                      <div
                        className={styles.modalTextareaView}
                        dangerouslySetInnerHTML={{ __html: selectedHotel.introduce }}
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

HotelsManagement.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
