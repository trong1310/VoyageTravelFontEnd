import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiSearch, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ClientLayout from "~/components/layout/ClientLayout";
import { carService } from "~/services/carService";
import pageStyles from "./CarsPage.module.scss";
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

export default function CarsList() {
  // Search & filter states
  const [keyword, setKeyword] = useState("");
  const [seats, setSeats] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  // Data states
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch client cars
  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await carService.getClientCars({
        limit: 9,
        page: currentPage - 1,
        isHot: null,
        ranking: null,
      });

      if (res && res.error && res.error.code === 0) {
        let items = res.data.items || [];
        // Support search keyword filtering
        if (keyword.trim() !== "") {
          const kw = keyword.toLowerCase();
          items = items.filter((c: any) =>
            c.name.toLowerCase().includes(kw) ||
            (c.brand && c.brand.toLowerCase().includes(kw))
          );
        }
        // Support seat count filtering
        if (seats !== "all") {
          const seatCount = Number(seats);
          items = items.filter((c: any) => c.seatCount === seatCount);
        }
        setCars(items);
        setTotalPage(res.data.pagination?.totalPage || 1);
      }
    } catch (err) {
      console.error("Error fetching client cars:", err);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, seats, currentPage]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleClearFilters = () => {
    setKeyword("");
    setSeats("all");
    setCurrentPage(1);
  };

  return (
    <>
      <Head>
        <title>Đội Xe Du Lịch Đời Mới - VOYAGE Travel</title>
        <meta name="description" content="Danh sách đội xe lữ hành đời mới phục vụ đưa đón cao cấp của VOYAGE Travel." />
      </Head>

      <div className={pageStyles.container}>
        <div className={pageStyles.heroHeader}>
          <h1 className={pageStyles.title}>Đội Xe Du Lịch Phục Vụ</h1>
          <p className={pageStyles.subtitle}>
            Thuê xe du lịch 4-45 chỗ đời mới cực kỳ êm ái. Tài xế giàu kinh nghiệm, chu đáo, phục vụ chuyên nghiệp trên mọi hành trình.
          </p>
        </div>

        {/* Filter Widget */}
        <div className={pageStyles.filterPanel}>
          <div className={pageStyles.searchBox}>
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm kiếm xe theo tên hoặc hãng xe..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className={pageStyles.filterSelect}
            value={seats}
            onChange={(e) => {
              setSeats(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Mọi loại chỗ ngồi</option>
            <option value="4">Xe 4 chỗ</option>
            <option value="7">Xe 7 chỗ</option>
            <option value="16">Xe 16 chỗ</option>
            <option value="29">Xe 29 chỗ</option>
            <option value="45">Xe 45 chỗ</option>
          </select>

          <button onClick={handleClearFilters} className={pageStyles.clearBtn}>
            Xóa bộ lọc
          </button>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
            <div className="spinner"></div>
          </div>
        ) : cars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#ffffff", borderRadius: "20px", border: "1px solid #eef0f5" }}>
            <p style={{ fontSize: "16px", color: "#7f8c8d", fontWeight: "600" }}>Không tìm thấy xe du lịch nào phù hợp với bộ lọc hiện tại.</p>
            <button onClick={handleClearFilters} className={pageStyles.clearBtn} style={{ marginTop: "16px" }}>Quay lại danh sách</button>
          </div>
        ) : (
          <>
            <div className={indexStyles.carGrid}>
              {cars.map((c) => (
                <div key={c.slug} className={indexStyles.carCard}>
                  <div className={indexStyles.carImageWrapper}>
                    <Link href={`/cars/${c.slug}`}>
                      {(c.thumbnail || c.thumbNail) && (
                        <img
                          src={getImageUrl(c.thumbnail || c.thumbNail || "")}
                          alt={c.name}
                        />
                      )}
                    </Link>
                    <span className={indexStyles.seatsTag}>{c.seatCount} chỗ ngồi</span>
                  </div>

                  <div className={indexStyles.carContent}>
                    <div className={indexStyles.carTitleGroup}>
                      <h3 className={indexStyles.carTitle}>
                        <Link href={`/cars/${c.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {c.name}
                        </Link>
                      </h3>
                      <span className={indexStyles.licensePlate}>{c.licensePlate}</span>
                    </div>

                    <div className={indexStyles.carSpecsList}>
                      <span className={indexStyles.carSpecItem}>Hãng: {c.brand || "N/A"}</span>
                      <span className={indexStyles.carSpecItem}>Màu: {c.color || "N/A"}</span>
                      <span className={indexStyles.carSpecItem}>Năm SX: {c.manufactureYear || "N/A"}</span>
                    </div>

                    {c.routes && c.routes.length > 0 && (
                      <div className={indexStyles.routeTrack}>
                        <span className={indexStyles.routeTitle}>Lộ trình phục vụ:</span>
                        <div className={indexStyles.routeBadges}>
                          {c.routes.map((r: any, idx: number) => (
                            <span key={idx} className={indexStyles.routeBadge}>
                              <FiMapPin style={{ fontSize: "10px" }} /> {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                      <Link href={`/cars/${c.slug}`} className={indexStyles.detailBtn} style={{ flex: 1, textAlign: "center" }}>
                        Chi tiết
                      </Link>
                      <Link href={`/cars/${c.slug}`} className={indexStyles.contactBtn} style={{ flex: 1, margin: 0, padding: "8px 12px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        Đặt xe ngay
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

CarsList.getLayout = function getLayout(page: React.ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};
