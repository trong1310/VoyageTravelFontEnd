import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiStar, FiMapPin, FiChevronLeft, FiChevronRight, FiFilter, FiHome } from "react-icons/fi";
import ClientLayout from "~/components/layout/ClientLayout";
import { hotelService } from "~/services/hotelService";
import pageStyles from "./HotelsPage.module.scss";
import indexStyles from "~/components/MainIndex/MainIndex.module.scss";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function HotelsList() {
  // Raw metadata states
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRanking, setSelectedRanking] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all"); // e.g. type: 1 for Hotel, 2 for Resort

  // Dropdown open states
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Pagination & fetched list states
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  // 1. Fetch initial metadata (Locations)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await hotelService.getLocations();
        if (res && res.error && res.error.code === 0) {
          setLocations(res.data.items || []);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Document click to close dropdowns
  useEffect(() => {
    const handleDocumentClick = () => {
      setIsLocationOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // 3. Fetch hotels dynamically from API whenever filters or pagination change
  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = {
        limit: 9,
        page: currentPage - 1,
        isHot: null,
        ranking: selectedRanking === "all" ? null : Number(selectedRanking),
        type: selectedType === "all" ? null : Number(selectedType),
        locations: selectedLocations,
      };

      const res = await hotelService.getClientHotels(payload);
      if (res && res.error && res.error.code === 0) {
        setFilteredHotels(res.data.items || []);
        setTotalPage(res.data.pagination?.totalPage || 1);
      }
    } catch (err) {
      console.error("Error fetching client hotels:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedLocations, selectedRanking, selectedType]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleToggleLocation = (locSlug: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locSlug) ? prev.filter((l) => l !== locSlug) : [...prev, locSlug]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedLocations([]);
    setSelectedRanking("all");
    setSelectedType("all");
    setCurrentPage(1);
  };

  return (
    <>
      <Head>
        <title>Khách Sạn & Khu Nghỉ Dưỡng - VOYAGE Travel</title>
        <meta name="description" content="Danh sách các khách sạn và resort cao cấp tiện nghi của VOYAGE Travel." />
      </Head>

      <div className={pageStyles.container}>
        <div className={pageStyles.heroHeader}>
          <h1 className={pageStyles.title}>Hệ Thống Lưu Trú Tiện Nghi</h1>
          <p className={pageStyles.subtitle}>
            Trải nghiệm dịch vụ lưu trú đẳng cấp tại các khách sạn và khu nghỉ dưỡng hàng đầu. Phục vụ chu đáo, mang đến giấc ngủ vàng trên mọi hành trình.
          </p>
        </div>

        {/* Filter Widget Panel */}
        <div className={pageStyles.filterPanel}>

          {/* Multi-Select Location */}
          <div className={pageStyles.multiSelectWrapper} onClick={(e) => e.stopPropagation()}>
            <div
              className={`${pageStyles.multiSelectHeader} ${isLocationOpen ? pageStyles.active : ""}`}
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
              }}
            >
              {selectedLocations.length === 0
                ? "📍 Tất cả khu vực"
                : `📍 Khu vực (${selectedLocations.length})`}
            </div>

            {isLocationOpen && (
              <div className={pageStyles.multiSelectDropdown}>
                {locations.map((loc) => {
                  const isChecked = selectedLocations.includes(loc.slug);
                  return (
                    <label key={`loc-${loc.slug}`} className={pageStyles.multiSelectItem}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleLocation(loc.slug)}
                      />
                      <span>{loc.name}</span>
                    </label>
                  );
                })}
                {locations.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#95a5a6", padding: "8px", textAlign: "center" }}>
                    Không có dữ liệu khu vực
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type Selection */}
          <select
            className={pageStyles.filterSelect}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Loại hình</option>
            <option value="1">Khách sạn</option>
            <option value="2">Resort</option>
            <option value="3">Homestay</option>
          </select>

          {/* Ranking Rating Selection */}
          <select
            className={pageStyles.filterSelect}
            value={selectedRanking}
            onChange={(e) => {
              setSelectedRanking(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">⭐ Tất cả xếp hạng</option>
            <option value="5">5 Sao ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Sao ⭐⭐⭐⭐</option>
            <option value="3">3 Sao ⭐⭐⭐</option>
            <option value="2">2 Sao ⭐⭐</option>
            <option value="1">1 Sao ⭐</option>
          </select>

          {/* Clear Button */}
          <button onClick={handleClearFilters} className={pageStyles.clearBtn}>
            Xóa bộ lọc
          </button>
        </div>

        {/* Filter Stats */}
        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#7f8c8d", fontWeight: "600" }}>
          <FiFilter style={{ color: "var(--primary, #e9680c)" }} />
          <span>Danh sách hiển thị kết quả lọc tự động</span>
        </div>

        {/* Hotels Grid */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <div className="spinner"></div>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#ffffff", borderRadius: "20px", border: "1px solid #eef0f5" }}>
            <p style={{ fontSize: "16px", color: "#7f8c8d", fontWeight: "600" }}>Không tìm thấy khách sạn nào phù hợp với bộ lọc hiện tại.</p>
            <button onClick={handleClearFilters} className={pageStyles.clearBtn} style={{ marginTop: "16px" }}>Quay lại danh sách</button>
          </div>
        ) : (
          <>
            <div className={indexStyles.tourGrid}>
              {filteredHotels.map((h) => (
                <div key={h.slug} className={indexStyles.tourCard}>
                  <div className={indexStyles.tourImageWrapper}>
                    <Link href={`/hotels/${h.slug}`}>
                      <img
                        src={getImageUrl(h.thumbnail)}
                        alt={h.name}
                      />
                    </Link>
                    {h.isHot === 1 && <span className={indexStyles.hotTag}>Hot 🔥</span>}
                    <span className={indexStyles.ratingTag}>
                      <FiStar /> {h.ranking || "5.0"}
                    </span>
                  </div>

                  <div className={indexStyles.tourContent}>
                    <div className={indexStyles.tourMeta}>
                      <span className={indexStyles.metaItem}>
                        <FiHome /> {h.type === 1 ? 'Khách sạn' : h.type === 2 ? 'Resort' : h.type === 3 ? 'Homestay' : 'Chỗ nghỉ'}
                      </span>
                      <span className={indexStyles.metaItem} style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        <FiMapPin /> {h.locations || h.address || "Việt Nam"}
                      </span>
                    </div>

                    <h3 className={indexStyles.tourTitle}>
                      <Link href={`/hotels/${h.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {h.name}
                      </Link>
                    </h3>

                    <div className={indexStyles.tourFooter}>
                      <div className={indexStyles.priceBox}>
                        <span className={indexStyles.salePrice}>
                          {h.relativePrice > 0 ? `${h.relativePrice.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                        </span>
                      </div>

                      <Link href={`/hotels/${h.slug}`} className={indexStyles.detailBtn}>
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPage > 1 && (
              <div className={pageStyles.pagination}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={pageStyles.pageBtn}
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`${pageStyles.pageBtn} ${currentPage === p ? pageStyles.active : ""}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPage))}
                  disabled={currentPage === totalPage}
                  className={pageStyles.pageBtn}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

HotelsList.getLayout = function getLayout(page: React.ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};
