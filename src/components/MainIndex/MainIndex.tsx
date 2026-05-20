import React, { useState, useEffect, useCallback, memo } from "react";
import styles from "./MainIndex.module.scss";
import { PropsMainIndex } from "./interfaces";
import {
  FiSearch, FiMapPin, FiStar, FiClock, FiCompass
} from "react-icons/fi";
import Link from "next/link";
import { tourService } from "~/services/tourService";
import { carService } from "~/services/carService";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

function MainIndex({ }: PropsMainIndex) {
  // Data states
  const [tours, setTours] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Search filter
  const [searchKeyword, setSearchKeyword] = useState("");

  // Loading states
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(false);

  // Fetch client home page data
  const fetchData = useCallback(async () => {
    setIsLoadingTours(true);
    setIsLoadingCars(true);
    try {
      // 1. Fetch Tours
      const tourRes = await tourService.getClientTours({
        limit: 6,
        page: 1,
        isHot: 1,
        ranking: null,
      });
      if (tourRes && tourRes.error && tourRes.error.code === 0) {
        setTours(tourRes.data.items || []);
      }

      // 2. Fetch Cars
      const carRes = await carService.getClientCars({
        limit: 6,
        page: 0,
        isHot: 1,
        ranking: null,
      });
      if (carRes && carRes.error && carRes.error.code === 0) {
        setCars(carRes.data.items || []);
      }

      // 3. Fetch Locations
      const locRes = await tourService.getLocations();
      if (locRes && locRes.error && locRes.error.code === 0) {
        setLocations((locRes.data.items || []).slice(0, 4));
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setIsLoadingTours(false);
      setIsLoadingCars(false);
    }
  }, [searchKeyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to tours page with search query
    window.location.href = `/tours?search=${encodeURIComponent(searchKeyword)}`;
  };

  return (
    <div className={styles.mainContainer} id="home">
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Hành trình đáng nhớ</span>
          <h1 className={styles.heroTitle}>Khám Phá Việt Nam Cùng VOYAGE Travel</h1>
          <p className={styles.heroSubtitle}>
            Đơn vị lữ hành và vận tải du lịch hàng đầu. Trải nghiệm dịch vụ tour du lịch cao cấp và dịch vụ đưa đón bằng xe đời mới cực kỳ êm ái.
          </p>

          <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Bạn muốn đi đâu du lịch hôm nay? Nhập tên điểm đến, tour..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.searchBtn}>
              Tìm kiếm nhanh
            </button>
          </form>
        </div>
      </section>

      {/* Tours Section */}
      <section className={styles.section} id="tours">
        <div className={styles.sectionHeader}>
          <span className={styles.badge} style={{ backgroundColor: 'rgba(52, 152, 219, 0.08)', color: '#3498db', borderColor: 'rgba(52, 152, 219, 0.2)' }}>
            Khám phá thế giới
          </span>
          <h2 className={styles.sectionTitle}>Tour Du Lịch Trọn Gói Nổi Bật</h2>
          <p className={styles.sectionSubtitle}>Danh sách tour du lịch phong phú, được thiết kế chuyên nghiệp mang lại trải nghiệm nghỉ dưỡng hoàn hảo nhất.</p>
        </div>

        {isLoadingTours ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : tours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            <p>Hiện tại chưa có tour du lịch nào được cập nhật.</p>
          </div>
        ) : (
          <div className={styles.tourGrid}>
            {tours.map((t) => (
              <div key={t.slug} className={styles.tourCard}>
                <div className={styles.tourImageWrapper}>
                  <Link href={`/tours/${t.slug}`}>
                    <img
                      src={getImageUrl(t.thumbnail)}
                      alt={t.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  </Link>
                  {t.isHot === 1 && <span className={styles.hotTag}>Hot 🔥</span>}
                  <span className={styles.ratingTag}>
                    <FiStar /> {t.ranking || "5.0"}
                  </span>
                </div>

                <div className={styles.tourContent}>
                  <div className={styles.tourMeta}>
                    <span className={styles.metaItem}>
                      <FiClock /> {t.durations || (t.durationDays ? `${t.durationDays}N${t.durationNights}Đ` : "3N2Đ")}
                    </span>
                    <span className={styles.metaItem}>
                      <FiMapPin /> Khởi hành từ {t.departure || "Hà Nội"}
                    </span>
                  </div>

                  <h3 className={styles.tourTitle}>
                    <Link href={`/tours/${t.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {t.title}
                    </Link>
                  </h3>

                  <div className={styles.tourFooter}>
                    <div className={styles.priceBox}>
                      {t.originalPrices > 0 && (
                        <span className={styles.originalPrice}>
                          {t.originalPrices.toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                      <span className={styles.salePrice}>
                        {t.salePrices > 0 ? `${t.salePrices.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                      </span>
                    </div>

                    <Link href={`/tours/${t.slug}`} className={styles.detailBtn}>
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cars Section */}
      <section className={`${styles.section} ${styles.carSectionBg}`} id="cars">
        <div className={styles.sectionHeader}>
          <span className={styles.badge} style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.2)' }}>
            Vận chuyển cao cấp
          </span>
          <h2 className={styles.sectionTitle}>Đội Xe Du Lịch Phổ Biến</h2>
          <p className={styles.sectionSubtitle}>Đưa đón quý khách bằng dàn xe đời mới 4-45 chỗ, lái xe chuyên nghiệp và an toàn tuyệt đối trên mọi hành trình.</p>
        </div>

        {isLoadingCars ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : cars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            <p>Danh sách xe đang được cập nhật thêm.</p>
          </div>
        ) : (
          <div className={styles.carGrid}>
            {cars.map((c) => (
              <div key={c.slug} className={styles.carCard}>
                <div className={styles.carImageWrapper}>
                  <Link href={`/cars/${c.slug}`}>
                    <img
                      src={getImageUrl(c.thumbnail || c.thumbNail || "") || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"}
                      alt={c.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                  </Link>
                  <span className={styles.seatsTag}>{c.seatCount} chỗ ngồi</span>
                </div>

                <div className={styles.carContent}>
                  <div className={styles.carTitleGroup}>
                    <h3 className={styles.carTitle}>
                      <Link href={`/cars/${c.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {c.name}
                      </Link>
                    </h3>
                    <span className={styles.licensePlate}>{c.licensePlate}</span>
                  </div>

                  <div className={styles.carSpecsList}>
                    <span className={styles.carSpecItem}>Hãng: {c.brand || "N/A"}</span>
                    <span className={styles.carSpecItem}>Màu: {c.color || "N/A"}</span>
                    <span className={styles.carSpecItem}>Năm SX: {c.manufactureYear || "N/A"}</span>
                  </div>

                  {c.routes && c.routes.length > 0 && (
                    <div className={styles.routeTrack}>
                      <span className={styles.routeTitle}>Lộ trình phục vụ:</span>
                      <div className={styles.routeBadges}>
                        {c.routes.map((r: any, idx: number) => (
                          <span key={idx} className={styles.routeBadge}>
                            <FiMapPin style={{ fontSize: "10px" }} /> {r.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <Link href={`/cars/${c.slug}`} className={styles.detailBtn} style={{ flex: 1, textAlign: 'center' }}>
                      Chi tiết
                    </Link>
                    <Link href={`/cars/${c.slug}`} className={styles.contactBtn} style={{ flex: 1, margin: 0, padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Đặt xe ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Destinations Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.badge} style={{ backgroundColor: 'rgba(155, 89, 182, 0.08)', color: '#9b59b6', borderColor: 'rgba(155, 89, 182, 0.2)' }}>
            Điểm đến hấp dẫn
          </span>
          <h2 className={styles.sectionTitle}>Các Điểm Đến Du Lịch Hàng Đầu</h2>
          <p className={styles.sectionSubtitle}>Khám phá những vùng đất thơ mộng, danh lam thắng cảnh làm say lòng hàng triệu du khách muôn phương.</p>
        </div>

        <div className={styles.destGrid}>
          {locations.length === 0 ? (
            // Fallback display destinations
            <>
              <div className={styles.destCard}>
                <img src="https://images.unsplash.com/photo-1598890790688-842426307a50?auto=format&fit=crop&w=300&h=300&q=80" alt="Hạ Long" />
                <div className={styles.destOverlay}>
                  <span className={styles.destName}>Vịnh Hạ Long</span>
                  <span className={styles.destToursCount}>Khám phá Kỳ quan</span>
                </div>
              </div>
              <div className={styles.destCard}>
                <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&h=300&q=80" alt="Đà Nẵng" />
                <div className={styles.destOverlay}>
                  <span className={styles.destName}>Đà Nẵng</span>
                  <span className={styles.destToursCount}>Thành phố đáng sống</span>
                </div>
              </div>
              <div className={styles.destCard}>
                <img src="https://images.unsplash.com/photo-1540979388789-6eca28045949?auto=format&fit=crop&w=300&h=300&q=80" alt="Phú Quốc" />
                <div className={styles.destOverlay}>
                  <span className={styles.destName}>Phú Quốc</span>
                  <span className={styles.destToursCount}>Thiên đường Đảo ngọc</span>
                </div>
              </div>
              <div className={styles.destCard}>
                <img src="https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=300&h=300&q=80" alt="Sa Pa" />
                <div className={styles.destOverlay}>
                  <span className={styles.destName}>Sa Pa</span>
                  <span className={styles.destToursCount}>Thị trấn trong sương</span>
                </div>
              </div>
            </>
          ) : (
            locations.map((loc, idx) => {
              const fallbackImages = [
                "https://images.unsplash.com/photo-1598890790688-842426307a50?auto=format&fit=crop&w=300&h=300&q=80",
                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&h=300&q=80",
                "https://images.unsplash.com/photo-1540979388789-6eca28045949?auto=format&fit=crop&w=300&h=300&q=80",
                "https://images.unsplash.com/photo-1509060464153-4466739f78ad?auto=format&fit=crop&w=300&h=300&q=80"
              ];
              return (
                <div key={loc.slug} className={styles.destCard}>
                  <img
                    src={fallbackImages[idx % fallbackImages.length]}
                    alt={loc.name}
                  />
                  <div className={styles.destOverlay}>
                    <span className={styles.destName}>{loc.name}</span>
                    <span className={styles.destToursCount}>Điểm đến hấp dẫn</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default memo(MainIndex);
