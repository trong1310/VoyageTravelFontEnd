import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiStar, FiClock, FiMapPin, FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import ClientLayout from "~/components/layout/ClientLayout";
import { tourService } from "~/services/tourService";
import pageStyles from "./ToursPage.module.scss";
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

export default function ToursList() {
  // Raw metadata states
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & filter states
  const [selectedDepartures, setSelectedDepartures] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedRanking, setSelectedRanking] = useState<string>("all");

  // Dropdown open states
  const [isDepartureOpen, setIsDepartureOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);

  // Pagination & fetched list states
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTours, setFilteredTours] = useState<any[]>([]);
  const [totalPage, setTotalPage] = useState(1);

  // 1. Fetch initial metadata (Locations) to populate both Departures and Destinations dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await tourService.getLocations();
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
      setIsDepartureOpen(false);
      setIsDestinationOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // 3. Fetch tours dynamically from API whenever filters or pagination change
  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = {
        limit: 9,
        page: currentPage - 1,
        isHot: null,
        ranking: selectedRanking === "all" ? null : Number(selectedRanking),
        departures: selectedDepartures,
        destinations: selectedDestinations,
      };

      const res = await tourService.getClientTours(payload);
      if (res && res.error && res.error.code === 0) {
        setFilteredTours(res.data.items || []);
        setTotalPage(res.data.pagination?.totalPage || 1);
      }
    } catch (err) {
      console.error("Error fetching client tours:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedDepartures, selectedDestinations, selectedRanking]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleToggleDeparture = (dept: string) => {
    setSelectedDepartures((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
    setCurrentPage(1);
  };

  const handleToggleDestination = (destName: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(destName) ? prev.filter((d) => d !== destName) : [...prev, destName]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedDepartures([]);
    setSelectedDestinations([]);
    setSelectedRanking("all");
    setCurrentPage(1);
  };

  return (
    <>
      <Head>
        <title>Tour Du Lịch Trọn Gói - VOYAGE Travel</title>
        <meta name="description" content="Danh sách các tour du lịch nghỉ dưỡng trọn gói cao cấp và hấp dẫn nhất của VOYAGE Travel." />
      </Head>

      <div className={pageStyles.container}>
        <div className={pageStyles.heroHeader}>
          <h1 className={pageStyles.title}>Hành Trình Du Lịch Lữ Hành</h1>
          <p className={pageStyles.subtitle}>
            Tìm kiếm tour nghỉ dưỡng mơ ước của bạn. Chúng tôi mang đến những chuyến đi thiết kế chuẩn mực, trọn gói cao cấp và phục vụ chu đáo nhất.
          </p>
        </div>

        {/* Filter Widget Panel */}
        <div className={pageStyles.filterPanel}>

          {/* Multi-Select Departure */}
          <div className={pageStyles.multiSelectWrapper} onClick={(e) => e.stopPropagation()}>
            <div
              className={`${pageStyles.multiSelectHeader} ${isDepartureOpen ? pageStyles.active : ""}`}
              onClick={() => {
                setIsDepartureOpen(!isDepartureOpen);
                setIsDestinationOpen(false);
              }}
            >
              {selectedDepartures.length === 0
                ? "📍 Tất cả điểm đi"
                : `📍 Điểm đi (${selectedDepartures.length})`}
            </div>

            {isDepartureOpen && (
              <div className={pageStyles.multiSelectDropdown}>
                {locations.map((loc) => {
                  const isChecked = selectedDepartures.includes(loc.slug);
                  return (
                    <label key={`dept-${loc.slug}`} className={pageStyles.multiSelectItem}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDeparture(loc.slug)}
                      />
                      <span>Đi từ {loc.name}</span>
                    </label>
                  );
                })}
                {locations.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#95a5a6", padding: "8px", textAlign: "center" }}>
                    Không có dữ liệu điểm đi
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multi-Select Destination */}
          <div className={pageStyles.multiSelectWrapper} onClick={(e) => e.stopPropagation()}>
            <div
              className={`${pageStyles.multiSelectHeader} ${isDestinationOpen ? pageStyles.active : ""}`}
              onClick={() => {
                setIsDestinationOpen(!isDestinationOpen);
                setIsDepartureOpen(false);
              }}
            >
              {selectedDestinations.length === 0
                ? "🗺️ Tất cả điểm đến"
                : `🗺️ Điểm đến (${selectedDestinations.length})`}
            </div>

            {isDestinationOpen && (
              <div className={pageStyles.multiSelectDropdown}>
                {locations.map((loc) => {
                  const isChecked = selectedDestinations.includes(loc.slug);
                  return (
                    <label key={`dest-${loc.slug}`} className={pageStyles.multiSelectItem}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDestination(loc.slug)}
                      />
                      <span>Đến {loc.name}</span>
                    </label>
                  );
                })}
                {locations.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#95a5a6", padding: "8px", textAlign: "center" }}>
                    Không có dữ liệu điểm đến
                  </div>
                )}
              </div>
            )}
          </div>

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

        {/* Tours Grid */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <div className="spinner"></div>
          </div>
        ) : filteredTours.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#ffffff", borderRadius: "20px", border: "1px solid #eef0f5" }}>
            <p style={{ fontSize: "16px", color: "#7f8c8d", fontWeight: "600" }}>Không tìm thấy tour du lịch nào phù hợp với bộ lọc hiện tại.</p>
            <button onClick={handleClearFilters} className={pageStyles.clearBtn} style={{ marginTop: "16px" }}>Quay lại danh sách</button>
          </div>
        ) : (
          <>
            <div className={indexStyles.tourGrid}>
              {filteredTours.map((t) => (
                <div key={t.slug} className={indexStyles.tourCard}>
                  <div className={indexStyles.tourImageWrapper}>
                    <Link href={`/tours/${t.slug}`}>
                      <img
                        src={getImageUrl(t.thumbnail)}
                        alt={t.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                    </Link>
                    {t.isHot === 1 && <span className={indexStyles.hotTag}>Hot 🔥</span>}
                    <span className={indexStyles.ratingTag}>
                      <FiStar /> {t.ranking || "5.0"}
                    </span>
                  </div>

                  <div className={indexStyles.tourContent}>
                    <div className={indexStyles.tourMeta}>
                      <span className={indexStyles.metaItem}>
                        <FiClock /> {t.durations || (t.durationDays ? `${t.durationDays}N${t.durationNights}Đ` : "3N2Đ")}
                      </span>
                      <span className={indexStyles.metaItem}>
                        <FiMapPin /> Khởi hành từ {t.departure || "Hà Nội"}
                      </span>
                    </div>

                    <h3 className={indexStyles.tourTitle}>
                      <Link href={`/tours/${t.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {t.title}
                      </Link>
                    </h3>

                    <div className={indexStyles.tourFooter}>
                      <div className={indexStyles.priceBox}>
                        {t.originalPrices > 0 && (
                          <span className={indexStyles.originalPrice}>
                            {t.originalPrices.toLocaleString("vi-VN")} ₫
                          </span>
                        )}
                        <span className={indexStyles.salePrice}>
                          {t.salePrices > 0 ? `${t.salePrices.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                        </span>
                      </div>

                      <Link href={`/tours/${t.slug}`} className={indexStyles.detailBtn}>
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

ToursList.getLayout = function getLayout(page: React.ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};
