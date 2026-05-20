import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  FiClock, FiMapPin, FiStar, FiCalendar, FiCompass,
  FiAward, FiShield, FiCheckCircle, FiSend
} from "react-icons/fi";
import { toast } from "react-toastify";
import ClientLayout from "~/components/layout/ClientLayout";
import { tourService } from "~/services/tourService";
import styles from "./TourDetail.module.scss";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function TourDetails() {
  const router = useRouter();
  const { slug } = router.query;

  // Data states
  const [tour, setTour] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Fetch tour details
  const fetchDetails = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await tourService.getClientTourDetail(slug as string);
      if (res && res.error && res.error.code === 0 && res.data) {
        setTour(res.data);
      } else {
        toast.error("Không thể tải chi tiết tour!");
      }
    } catch (err) {
      console.error("Error loading tour detail:", err);
      toast.error("Đã xảy ra lỗi khi tải tour!");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchDetails();
    }
  }, [slug, fetchDetails]);

  // Handle booking inquiry submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !bookingDate) {
      return toast.warn("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Ngày khởi hành mong muốn!");
    }
    setIsSubmitting(true);
    try {
      const dateIso = new Date(bookingDate).toISOString();

      const res = await tourService.bookTour({
        slug: slug as string,
        startTime: dateIso,
        totalCustomer: peopleCount,
        fullName: name,
        phoneNumber: phone,
        email: email || "",
        specialRequirements: specialRequirements || "",
      });

      if (res && res.error && res.error.code === 0) {
        toast.success("Đặt tour thành công! VOYAGE Travel sẽ liên hệ lại với quý khách trong ít phút.");
        setName("");
        setPhone("");
        setEmail("");
        setBookingDate("");
        setPeopleCount(1);
        setSpecialRequirements("");
      } else {
        toast.error(res?.error?.message || "Đặt tour không thành công. Vui lòng thử lại!");
      }
    } catch (err: any) {
      console.error("Error booking tour:", err);
      toast.error(err?.error?.message || "Có lỗi xảy ra khi gửi yêu cầu đặt tour!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div className="spinner"></div>
        <p style={{ color: "#7f8c8d", fontSize: "14px", fontWeight: "600" }}>Đang tải thông tin chi tiết hành trình...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <h2 style={{ color: "#2c3e50", marginBottom: "16px" }}>Không tìm thấy tour du lịch!</h2>
        <p style={{ color: "#7f8c8d", marginBottom: "24px" }}>Tour này có thể không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link href="/tours" className={styles.bookBtn} style={{ maxWidth: "200px", margin: "0 auto" }}>
          Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{tour.title} - VOYAGE Travel</title>
        <meta name="description" content={tour.introduce || tour.title} />
      </Head>

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/tours">Tour du lịch</Link>
          <span>/</span>
          <span style={{ color: "#2c3e50", fontWeight: "600" }}>{tour.title}</span>
        </div>

        {/* Layout Split */}
        <div className={styles.layoutGrid}>
          {/* Left Main column */}
          <div className={styles.mainDetails}>
            {/* Premium Custom Image Slider */}
            {(() => {
              const tourImages = [
                tour.thumbnail,
                ...(tour.images || [])
              ].filter(Boolean);

              return (
                <div className={styles.sliderContainer}>
                  <div className={styles.galleryWrapper}>
                    {tourImages.length > 0 ? (
                      <img
                        src={getImageUrl(tourImages[activeImageIndex])}
                        alt={`${tour.title} - Slide ${activeImageIndex + 1}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=450&q=80";
                        }}
                      />
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=450&q=80"
                        alt={tour.title}
                      />
                    )}

                    {tourImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          className={styles.slideArrowLeft}
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? tourImages.length - 1 : prev - 1))}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className={styles.slideArrowRight}
                          onClick={() => setActiveImageIndex((prev) => (prev === tourImages.length - 1 ? 0 : prev + 1))}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Track */}
                  {tourImages.length > 1 && (
                    <div className={styles.thumbnailTrack}>
                      {tourImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`${styles.thumbnailItem} ${idx === activeImageIndex ? styles.thumbnailActive : ""}`}
                          onClick={() => setActiveImageIndex(idx)}
                        >
                          <img src={getImageUrl(img)} alt={`Thumb ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Title Block */}
            <div className={styles.titleArea}>
              {tour.isHot === 1 && <span className={styles.hotBadge}>Hot 🔥</span>}
              <h1 className={styles.mainTitle}>{tour.title}</h1>

              {/* Meta information row */}
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <FiClock /> Thời lượng: <strong>{tour.durationDays} Ngày {tour.durationNights} Đêm</strong>
                </span>
                {tour.departure && (
                  <span className={styles.metaItem}>
                    <FiMapPin /> Khởi hành từ: <strong>{tour.departure}</strong>
                  </span>
                )}
                {tour.ranking && (
                  <span className={styles.metaItem}>
                    <FiStar /> Xếp hạng: <strong>{tour.ranking}</strong>
                  </span>
                )}
              </div>

              {/* Destinations Tags */}
              {tour.destinations && tour.destinations.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
                  {tour.destinations.map((d: string) => (
                    <span key={d} style={{ background: "rgba(233, 104, 12, 0.08)", color: "var(--primary, #e9680c)", padding: "6px 14px", borderRadius: "30px", fontSize: "13px", fontWeight: "600" }}>
                      📍 {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Introduction and Itinerary */}
            {tour.introduce && (
              <div className={styles.infoSection}>
                <h3>Giới Thiệu Hành Trình Chi Tiết</h3>
                <div
                  className={`${styles.contentBlock} ${styles.richText}`}
                  dangerouslySetInnerHTML={{ __html: tour.introduce }}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar Column - Sticky Booking Card */}
          <div className={styles.sidebarInquiry}>
            <div className={styles.stickyBox}>
              <div className={styles.bookingCard}>
                {/* Price Display */}
                <div className={styles.priceWrapper}>
                  <span className={styles.priceLabel}>Giá tour trọn gói</span>
                  {tour.originalPrices > 0 && (
                    <span className={styles.originalPrice}>
                      {tour.originalPrices.toLocaleString("vi-VN")} ₫
                    </span>
                  )}
                  <span className={styles.salePrice}>
                    {tour.salePrices > 0 ? `${tour.salePrices.toLocaleString("vi-VN")} ₫` : "Liên hệ"}
                  </span>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className={styles.inquiryForm}>
                  <h4>Đăng Ký Tư Vấn & Đặt Chỗ</h4>
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Số điện thoại liên hệ *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email liên hệ (nếu có)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div>
                    <label style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      NGÀY KHỞI HÀNH MONG MUỐN *
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      SỐ LƯỢNG KHÁCH (NGƯỜI)
                    </label>
                    <select value={peopleCount} onChange={(e) => setPeopleCount(Number(e.target.value))}>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} khách
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      YÊU CẦU ĐẶC BIỆT KHÁC (NẾU CÓ)
                    </label>
                    <textarea
                      placeholder="Nhập các yêu cầu đặc biệt của bạn về khách sạn, suất ăn, đưa đón..."
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      rows={3}
                      style={{ resize: "none" }}
                    />
                  </div>

                  <button type="submit" className={styles.bookBtn} disabled={isSubmitting}>
                    <FiSend /> {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu Đặt Chỗ"}
                  </button>
                </form>

                {/* Trust symbols */}
                <div className={styles.trustBadges}>
                  <span className={styles.trustItem}>
                    <FiCheckCircle /> Xe đưa đón đời mới chất lượng cao
                  </span>
                  <span className={styles.trustItem}>
                    <FiShield /> Hỗ trợ khẩn cấp 24/7 suốt tuyến đi
                  </span>
                  <span className={styles.trustItem}>
                    <FiAward /> Cam kết dịch vụ đúng như quảng cáo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

TourDetails.getLayout = function getLayout(page: React.ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};
