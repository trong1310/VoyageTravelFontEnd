import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  FiMapPin, FiStar, FiCalendar, FiCompass,
  FiAward, FiShield, FiCheckCircle, FiSend, FiFileText
} from "react-icons/fi";
import { toast } from "react-toastify";
import ClientLayout from "~/components/layout/ClientLayout";
import { hotelService, HotelDetailItem } from "~/services/hotelService";
import styles from "./HotelDetail.module.scss";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function HotelDetails() {
  const router = useRouter();
  const { slug } = router.query;

  // Data states
  const [hotel, setHotel] = useState<HotelDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Fetch hotel details
  const fetchDetails = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await hotelService.getClientHotelDetail(slug as string);
      if (res && res.error && res.error.code === 0 && res.data) {
        setHotel(res.data);
      } else {
        toast.error("Không thể tải chi tiết khách sạn!");
      }
    } catch (err) {
      console.error("Error loading hotel detail:", err);
      toast.error("Đã xảy ra lỗi khi tải khách sạn!");
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
    if (!name.trim() || !phone.trim() || !bookingDate || !checkoutDate) {
      return toast.warn("Vui lòng điền đầy đủ Họ tên, Số điện thoại, Ngày nhận phòng và Ngày trả phòng!");
    }
    
    const start = new Date(bookingDate);
    const end = new Date(checkoutDate);
    if (end <= start) {
      return toast.warn("Ngày trả phòng phải sau ngày nhận phòng!");
    }

    setIsSubmitting(true);
    try {
      const dateIso = start.toISOString();
      const endDateIso = end.toISOString();

      const res = await hotelService.bookHotel({
        slug: slug as string,
        startTime: dateIso,
        endTime: endDateIso,
        totalCustomer: peopleCount,
        fullName: name,
        phoneNumber: phone,
        email: email || "",
        specialRequirements: specialRequirements || "",
      });

      if (res && res.error && res.error.code === 0) {
        toast.success("Đặt phòng thành công! VOYAGE Travel sẽ liên hệ lại với quý khách trong ít phút.");
        setName("");
        setPhone("");
        setEmail("");
        setBookingDate("");
        setCheckoutDate("");
        setPeopleCount(1);
        setSpecialRequirements("");
      } else {
        toast.error(res?.error?.message || "Đặt phòng không thành công. Vui lòng thử lại!");
      }
    } catch (err: any) {
      console.error("Error booking hotel:", err);
      toast.error(err?.error?.message || "Có lỗi xảy ra khi gửi yêu cầu đặt phòng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHotelType = (type: number) => {
    switch (type) {
      case 1: return "Khách sạn";
      case 2: return "Resort";
      case 3: return "Homestay";
      case 4: return "Villa";
      default: return "Chỗ nghỉ";
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div className="spinner"></div>
        <p style={{ color: "#7f8c8d", fontSize: "14px", fontWeight: "600" }}>Đang tải thông tin chi tiết khách sạn...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <h2 style={{ color: "#2c3e50", marginBottom: "16px" }}>Không tìm thấy khách sạn!</h2>
        <p style={{ color: "#7f8c8d", marginBottom: "24px" }}>Khách sạn này có thể không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link href="/hotels" className={styles.bookBtn} style={{ maxWidth: "200px", margin: "0 auto" }}>
          Quay lại danh sách khách sạn
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{hotel.name} - VOYAGE Travel</title>
        <meta name="description" content={hotel.introduce ? hotel.introduce.replace(/<[^>]+>/g, '').substring(0, 160) : hotel.name} />
      </Head>

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/hotels">Khách sạn</Link>
          <span>/</span>
          <span style={{ color: "#2c3e50", fontWeight: "600" }}>{hotel.name}</span>
        </div>

        {/* Layout Split */}
        <div className={styles.layoutGrid}>
          {/* Left Main column */}
          <div className={styles.mainDetails}>
            {/* Premium Custom Image Slider */}
            {(() => {
              const hotelImages = [
                hotel.thumbnail,
                ...(hotel.images || [])
              ].filter(Boolean);

              return (
                <div className={styles.sliderContainer}>
                  <div className={styles.galleryWrapper}>
                    {hotelImages.length > 0 && (
                      <img
                        src={getImageUrl(hotelImages[activeImageIndex])}
                        alt={`${hotel.name} - Slide ${activeImageIndex + 1}`}
                      />
                    )}

                    {hotelImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          className={styles.slideArrowLeft}
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? hotelImages.length - 1 : prev - 1))}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className={styles.slideArrowRight}
                          onClick={() => setActiveImageIndex((prev) => (prev === hotelImages.length - 1 ? 0 : prev + 1))}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Track */}
                  {hotelImages.length > 1 && (
                    <div className={styles.thumbnailTrack}>
                      {hotelImages.map((img, idx) => (
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
              {hotel.isHot === 1 && <span className={styles.hotBadge}>Hot 🔥</span>}
              <h1 className={styles.mainTitle}>{hotel.name}</h1>

              {/* Meta information row */}
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <FiAward /> Loại hình: <strong>{getHotelType(hotel.type)}</strong>
                </span>
                {hotel.address && (
                  <span className={styles.metaItem}>
                    <FiMapPin /> Địa chỉ: <strong>{hotel.address}</strong>
                  </span>
                )}
                {hotel.ranking && (
                  <span className={styles.metaItem}>
                    <FiStar /> Xếp hạng: <strong>{hotel.ranking} Sao</strong>
                  </span>
                )}
              </div>

              {/* Locations Tags */}
              {hotel.locations && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
                  <span style={{ background: "rgba(233, 104, 12, 0.08)", color: "var(--primary, #e9680c)", padding: "6px 14px", borderRadius: "30px", fontSize: "13px", fontWeight: "600" }}>
                    📍 {hotel.locations}
                  </span>
                </div>
              )}
            </div>

            {/* Introduction */}
            {hotel.introduce && (
              <div className={styles.infoSection}>
                <h3><FiFileText style={{ marginRight: '8px', color: '#e9680c' }}/> Giới Thiệu Chỗ Nghỉ</h3>
                <div
                  className={`${styles.contentBlock} ${styles.richText}`}
                  dangerouslySetInnerHTML={{ __html: hotel.introduce }}
                />
              </div>
            )}
            
            {/* Regulations */}
            {hotel.regulations && (
              <div className={styles.infoSection}>
                <h3><FiCheckCircle style={{ marginRight: '8px', color: '#e9680c' }}/> Quy Định & Chính Sách</h3>
                <div
                  className={`${styles.contentBlock} ${styles.richText}`}
                  dangerouslySetInnerHTML={{ __html: hotel.regulations }}
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
                  <span className={styles.priceLabel}>Giá tham khảo</span>
                  <span className={styles.salePrice}>
                    {hotel.relativePrice > 0 ? `${hotel.relativePrice.toLocaleString("vi-VN")} ₫ / Đêm` : "Liên hệ"}
                  </span>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className={styles.inquiryForm}>
                  <h4>Đăng Ký Tư Vấn & Đặt Phòng</h4>
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
                      NGÀY NHẬN PHÒNG *
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
                      NGÀY TRẢ PHÒNG *
                    </label>
                    <input
                      type="date"
                      value={checkoutDate}
                      onChange={(e) => setCheckoutDate(e.target.value)}
                      min={bookingDate ? new Date(new Date(bookingDate).getTime() + 86400000).toISOString().split('T')[0] : undefined}
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
                      placeholder="Nhập các yêu cầu đặc biệt của bạn về loại giường, phòng hút thuốc, đưa đón..."
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      rows={3}
                      style={{ resize: "none" }}
                    />
                  </div>

                  <button type="submit" className={styles.bookBtn} disabled={isSubmitting}>
                    <FiSend /> {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu Đặt Phòng"}
                  </button>
                </form>

                {/* Trust symbols */}
                <div className={styles.trustBadges}>
                  <span className={styles.trustItem}>
                    <FiCheckCircle /> Đảm bảo giá tốt nhất
                  </span>
                  <span className={styles.trustItem}>
                    <FiShield /> Xác nhận phòng ngay
                  </span>
                  <span className={styles.trustItem}>
                    <FiAward /> Hỗ trợ khách hàng 24/7
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

HotelDetails.getLayout = function getLayout(page: React.ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};
