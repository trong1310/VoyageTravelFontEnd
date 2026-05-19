import React, { useState, useEffect, useCallback, memo } from "react";
import styles from "./MainIndex.module.scss";
import { PropsMainIndex } from "./interfaces";
import {
  FiSearch, FiCompass, FiTruck, FiMapPin, FiStar,
  FiClock, FiPhone, FiMail, FiSend, FiEye, FiUser, FiCalendar
} from "react-icons/fi";
import Link from "next/link";
import { tourService, TourItem } from "~/services/tourService";
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

function MainIndex({ }: PropsMainIndex) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  // Data states
  const [tours, setTours] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Search filter
  const [searchKeyword, setSearchKeyword] = useState("");

  // Loading states
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(false);

  // Detailed modal states
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isLoadingTourDetail, setIsLoadingTourDetail] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Monitor scroll for styling header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch client home page data
  const fetchData = useCallback(async () => {
    setIsLoadingTours(true);
    setIsLoadingCars(true);
    try {
      // 1. Fetch Tours
      const tourRes = await tourService.getClientTours({
        limit: 6,
        page: 0,
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
    fetchData();
    // Scroll to tours section if searched
    const toursSection = document.getElementById("tours");
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // View Tour detail modal
  const handleViewTour = async (slug: string) => {
    setIsTourModalOpen(true);
    setIsLoadingTourDetail(true);
    setSelectedTour(null);
    try {
      const res = await tourService.getTourDetail(slug);
      if (res && res.error && res.error.code === 0 && res.data) {
        setSelectedTour(res.data);
      } else {
        toast.error("Không thể tải thông tin chi tiết tour!");
        setIsTourModalOpen(false);
      }
    } catch (err) {
      console.error("Error fetching tour detail:", err);
      toast.error("Lỗi khi tải thông tin tour!");
      setIsTourModalOpen(false);
    } finally {
      setIsLoadingTourDetail(false);
    }
  };

  // Handle Contact Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      return toast.warn("Vui lòng nhập tên và số điện thoại liên hệ!");
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      toast.success("Gửi yêu cầu liên hệ thành công! VOYAGE Travel sẽ sớm phản hồi.");
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setContactMsg("");
      setIsSubmittingContact(false);
    }, 1200);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={styles.mainContainer} id="home">
      {/* Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerInner}>
          <a href="#home" className={styles.logo} onClick={(e) => handleSmoothScroll(e, "home")}>
            <span className={styles.logoOrange}>VOYAGE</span>
            <span className={styles.logoDark}>Travel</span>
          </a>

          <nav className={styles.nav}>
            <a
              href="#home"
              className={`${styles.navLink} ${activeTab === "home" ? styles.active : ""}`}
              onClick={(e) => handleSmoothScroll(e, "home")}
            >
              Trang chủ
            </a>
            <a
              href="#tours"
              className={`${styles.navLink} ${activeTab === "tours" ? styles.active : ""}`}
              onClick={(e) => handleSmoothScroll(e, "tours")}
            >
              Tour du lịch
            </a>
            <a
              href="#cars"
              className={`${styles.navLink} ${activeTab === "cars" ? styles.active : ""}`}
              onClick={(e) => handleSmoothScroll(e, "cars")}
            >
              Xe du lịch
            </a>
            <a
              href="#contact"
              className={`${styles.navLink} ${activeTab === "contact" ? styles.active : ""}`}
              onClick={(e) => handleSmoothScroll(e, "contact")}
            >
              Liên hệ
            </a>
          </nav>

          <Link href="/admin/login" className={styles.adminBtn}>
            Quản trị VOYAGE
          </Link>
        </div>
      </header>

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
                  <img
                    src={getImageUrl(t.thumbnail)}
                    alt={t.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
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

                  <h3 className={styles.tourTitle}>{t.title}</h3>

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

                    <button onClick={() => handleViewTour(t.slug)} className={styles.detailBtn}>
                      Xem chi tiết
                    </button>
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
                  <img
                    src={getImageUrl(c.thumbnail || c.thumbNail || "") || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"}
                    alt={c.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                  <span className={styles.seatsTag}>{c.seatCount} chỗ ngồi</span>
                </div>

                <div className={styles.carContent}>
                  <div className={styles.carTitleGroup}>
                    <h3 className={styles.carTitle}>{c.name}</h3>
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

                  <a
                    href="#contact"
                    className={styles.contactBtn}
                    onClick={(e) => {
                      handleSmoothScroll(e, "contact");
                      setContactMsg(`Tôi muốn liên hệ thuê xe dịch vụ: ${c.name} - BKS: ${c.licensePlate}`);
                    }}
                  >
                    Liên hệ đặt xe ngay
                  </a>
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
                <img src="https://images.unsplash.com/photo-1598890790688-842426307a50?auto=format&fit=crop&w=300&h=300&q=80" alt="Hà Long" />
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

      {/* Footer and Contact */}
      <footer className={styles.footerSection} id="contact">
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <a href="#home" className={styles.logo} onClick={(e) => handleSmoothScroll(e, "home")} style={{ marginBottom: '10px' }}>
              <span className={styles.logoOrange}>VOYAGE</span>
              <span className={styles.logoDark} style={{ color: '#ffffff' }}>Travel</span>
            </a>
            <p>
              VOYAGE Travel tự hào là người đồng hành đáng tin cậy trên vạn dặm hành trình của bạn. Cung cấp dịch vụ lữ hành trọn gói chất lượng cao và xe dịch vụ êm ái hàng đầu.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPhone /> Hotline: 1900 8198</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail /> Email: info@vtstravel.com</span>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Liên kết nhanh</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#home" onClick={(e) => handleSmoothScroll(e, "home")}>Trang chủ</a></li>
              <li><a href="#tours" onClick={(e) => handleSmoothScroll(e, "tours")}>Tour du lịch</a></li>
              <li><a href="#cars" onClick={(e) => handleSmoothScroll(e, "cars")}>Đội xe du lịch</a></li>
              <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, "contact")}>Liên hệ với chúng tôi</a></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Dịch vụ của chúng tôi</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#tours" onClick={(e) => handleSmoothScroll(e, "tours")}>Tours nghỉ dưỡng</a></li>
              <li><a href="#tours" onClick={(e) => handleSmoothScroll(e, "tours")}>Combo tiết kiệm</a></li>
              <li><a href="#cars" onClick={(e) => handleSmoothScroll(e, "cars")}>Thuê xe lữ hành</a></li>
              <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, "contact")}>Hỗ trợ 24/7</a></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Gửi yêu cầu tư vấn</h4>
            <form onSubmit={handleContactSubmit} className={styles.contactForm}>
              <input
                type="text"
                placeholder="Tên của bạn *"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Số điện thoại của bạn *"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email liên hệ (nếu có)"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <textarea
                placeholder="Nội dung cần tư vấn..."
                rows={3}
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
              />
              <button type="submit" className={styles.formSubmitBtn} disabled={isSubmittingContact}>
                <FiSend /> {isSubmittingContact ? "Đang gửi..." : "Gửi yêu cầu ngay"}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          <p>© {new Date().getFullYear()} VOYAGE Travel. Bảo lưu mọi quyền. Designed for luxury tourism experiences.</p>
        </div>
      </footer>

      {/* Tour Detail Modal Client-Side */}
      {isTourModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsTourModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Chi Tiết Tour Du Lịch</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsTourModalOpen(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              {isLoadingTourDetail || !selectedTour ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                  <div className="spinner"></div>
                  <p style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: '500' }}>Đang tải thông tin tour...</p>
                </div>
              ) : (
                <>
                  <div className={styles.modalSection}>
                    <h4>Hình ảnh tour</h4>
                    <div style={{ width: "100%", height: "260px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                      <img
                        src={getImageUrl(selectedTour.thumbnail)}
                        alt={selectedTour.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=300&q=80";
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.modalSection}>
                    <h4>Thông tin cơ bản hành trình</h4>
                    <div className={styles.modalGrid}>
                      <div className={styles.modalSection} style={{ gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Tên Tour lữ hành</span>
                        <span style={{ fontSize: '15px', color: '#2c3e50', fontWeight: 600 }}>{selectedTour.title}</span>
                      </div>
                      <div className={styles.modalSection} style={{ gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Thời lượng hành trình</span>
                        <span style={{ fontSize: '15px', color: '#2c3e50', fontWeight: 600 }}>{selectedTour.durationDays} ngày {selectedTour.durationNights} đêm</span>
                      </div>
                      <div className={styles.modalSection} style={{ gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Điểm khởi hành</span>
                        <span style={{ fontSize: '15px', color: '#2c3e50', fontWeight: 600 }}>{selectedTour.departure || "Hà Nội"}</span>
                      </div>
                      <div className={styles.modalSection} style={{ gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Giá tour trọn gói</span>
                        <span style={{ fontSize: '16px', color: 'var(--primary, #e9680c)', fontWeight: 800 }}>
                          {selectedTour.salePrices > 0 ? `${selectedTour.salePrices.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedTour.introduce && (
                    <div className={styles.modalSection}>
                      <h4>Giới thiệu ngắn & Lịch trình</h4>
                      <div
                        style={{ background: '#f8f9fb', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6', border: '1px solid #eef0f5' }}
                        dangerouslySetInnerHTML={{ __html: selectedTour.introduce }}
                      />
                    </div>
                  )}

                  {selectedTour.description && (
                    <div className={styles.modalSection}>
                      <h4>Chính sách & Quy định Tour</h4>
                      <div style={{ background: '#f8f9fb', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6', border: '1px solid #eef0f5', whiteSpace: 'pre-wrap' }}>
                        {selectedTour.description}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        setIsTourModalOpen(false);
                        const contactSection = document.getElementById("contact");
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: "smooth" });
                        }
                        setContactMsg(`Tôi muốn nhận tư vấn đặt Tour: ${selectedTour.title}`);
                      }}
                      className={styles.contactBtn}
                      style={{ flex: 1 }}
                    >
                      Liên hệ đăng ký nhận tư vấn ngay
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MainIndex);
