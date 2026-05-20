import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  FiMapPin, FiCheckCircle, FiSend, FiTruck, FiUsers,
  FiUserCheck, FiCalendar, FiClock, FiShield
} from "react-icons/fi";
import { toast } from "react-toastify";
import ClientLayout from "~/components/layout/ClientLayout";
import { carService } from "~/services/carService";
import styles from "./CarDetail.module.scss";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function CarDetails() {
  const router = useRouter();
  const { slug } = router.query;

  // Data states
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking inquiry states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryDate, setInquiryDate] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [totalCustomer, setTotalCustomer] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch car details
  const fetchDetails = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await carService.getClientCarDetail(slug as string);
      if (res && res.error && res.error.code === 0 && res.data) {
        setCar(res.data);
        // Prefill message
        setInquiryMsg(`Tôi muốn liên hệ thuê xe: ${res.data.name} - Biển số: ${res.data.licensePlate}`);
      } else {
        toast.error("Không thể tải thông tin chi tiết xe!");
      }
    } catch (err) {
      console.error("Error loading car details:", err);
      toast.error("Đã xảy ra lỗi khi tải thông tin xe!");
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
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !inquiryDate) {
      return toast.warn("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Ngày bắt đầu thuê!");
    }
    setIsSubmitting(true);
    try {
      const dateIso = new Date(inquiryDate).toISOString();
      const combinedSpecialRequirements = `Số ngày thuê dự kiến: ${durationDays} ngày. Ghi chú lộ trình: ${inquiryMsg}`;

      const res = await carService.bookCar({
        slug: slug as string,
        startTime: dateIso,
        totalCustomer: totalCustomer,
        fullName: name,
        phoneNumber: phone,
        email: email || "",
        specialRequirements: combinedSpecialRequirements,
      });

      if (res && res.error && res.error.code === 0) {
        toast.success("Yêu cầu thuê xe đã được gửi thành công! VOYAGE Travel sẽ liên hệ lại với quý khách ngay.");
        setName("");
        setPhone("");
        setEmail("");
        setInquiryDate("");
        setDurationDays(1);
        setInquiryMsg("");
        setTotalCustomer(1);
      } else {
        toast.error(res?.error?.message || "Yêu cầu thuê xe không thành công. Vui lòng thử lại!");
      }
    } catch (err: any) {
      console.error("Error booking car:", err);
      toast.error(err?.error?.message || "Có lỗi xảy ra khi gửi yêu cầu thuê xe!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div className="spinner"></div>
        <p style={{ color: "#7f8c8d", fontSize: "14px", fontWeight: "600" }}>Đang tải thông tin chi tiết xe du lịch...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <h2 style={{ color: "#2c3e50", marginBottom: "16px" }}>Không tìm thấy xe du lịch!</h2>
        <p style={{ color: "#7f8c8d", marginBottom: "24px" }}>Thông tin xe có thể không tồn tại hoặc đã được cập nhật khác.</p>
        <Link href="/cars" className={styles.bookBtn} style={{ maxWidth: "200px", margin: "0 auto" }}>
          Quay lại danh sách xe
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{car.name} - VOYAGE Travel</title>
        <meta name="description" content={`Dịch vụ cho thuê xe du lịch cao cấp ${car.name} đời mới, biển số ${car.licensePlate} chất lượng cao.`} />
      </Head>

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/cars">Xe du lịch</Link>
          <span>/</span>
          <span style={{ color: "#2c3e50", fontWeight: "600" }}>{car.name}</span>
        </div>

        {/* Layout Split */}
        <div className={styles.layoutGrid}>
          {/* Left Column Details */}
          <div className={styles.mainDetails}>
            {/* Gallery Image */}
            <div className={styles.galleryWrapper}>
              <img
                src={getImageUrl(car.thumbnail || car.thumbNail || "") || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&h=450&q=80"}
                alt={car.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&h=450&q=80";
                }}
              />
            </div>

            {/* Title Area */}
            <div className={styles.titleArea}>
              <span className={styles.seatsTag}>{car.seatCount} Chỗ Ngồi</span>
              <h1 className={styles.mainTitle}>{car.name}</h1>

              {/* Meta row */}
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <FiTruck /> Hãng xe: <strong>{car.brand || "N/A"}</strong>
                </span>
                <span className={styles.metaItem}>
                  <FiUsers /> Sức chứa: <strong>{car.seatCount} Hành khách</strong>
                </span>
                <span className={styles.metaItem}>
                  <FiUserCheck /> Biển số kiểm soát: <strong>{car.licensePlate}</strong>
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className={styles.infoSection}>
              <h3>Thông Số Kỹ Thuật Đội Xe</h3>
              <div className={styles.contentBlock}>
                <div className={styles.carSpecsGrid}>
                  <div className={styles.specRow}>
                    <span>Màu sắc</span>
                    <strong>{car.color || "N/A"}</strong>
                  </div>
                  <div className={styles.specRow}>
                    <span>Năm sản xuất</span>
                    <strong>{car.manufactureYear || "N/A"}</strong>
                  </div>
                  <div className={styles.specRow}>
                    <span>Động cơ & vận hành</span>
                    <strong>Đời mới, siêu êm ái</strong>
                  </div>
                  <div className={styles.specRow}>
                    <span>Tiêu chuẩn tiện ích</span>
                    <strong>Máy lạnh êm ái, wifi miễn phí</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Routes */}
            {car.routes && car.routes.length > 0 && (
              <div className={styles.infoSection}>
                <h3>Lộ Trình Phục Vụ Phổ Biến</h3>
                <div className={styles.contentBlock}>
                  <div className={styles.routeBadges}>
                    {car.routes.map((r: any, idx: number) => (
                      <span key={idx} className={styles.routeBadge}>
                        <FiMapPin /> {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* General descriptions */}
            {car.description && (
              <div className={styles.infoSection}>
                <h3>Giới Thiệu Tiện Nghi & Quy Định Sử Dụng</h3>
                <div className={styles.contentBlock} style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                  {car.description}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column - Sticky Booking Card */}
          <div className={styles.sidebarInquiry}>
            <div className={styles.stickyBox}>
              <div className={styles.bookingCard}>
                {/* Price Display */}
                <div className={styles.priceWrapper}>
                  <span className={styles.priceLabel}>Giá thuê xe tham khảo</span>
                  <span className={styles.salePrice}>Giá thỏa thuận</span>
                  <span style={{ fontSize: "12px", color: "#7f8c8d", marginTop: "4px" }}>
                    Báo giá linh hoạt theo lịch trình & số km thực tế.
                  </span>
                </div>

                {/* Inquiry Form */}
                <form onSubmit={handleInquirySubmit} className={styles.inquiryForm}>
                  <h4>Yêu Cầu Báo Giá Thuê Xe</h4>
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
                      NGÀY BẮT ĐẦU THUÊ XE *
                    </label>
                    <input
                      type="date"
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      SỐ NGÀY THUÊ DỰ KIẾN
                    </label>
                    <select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))}>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} ngày
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      SỐ LƯỢNG HÀNH KHÁCH
                    </label>
                    <select value={totalCustomer} onChange={(e) => setTotalCustomer(Number(e.target.value))}>
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} người
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                      GHI CHÚ LỘ TRÌNH (ĐIỂM ĐÓN - ĐIỂM ĐẾN)
                    </label>
                    <textarea
                      placeholder="Mô tả lộ trình di chuyển mong muốn của bạn..."
                      rows={3}
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                    />
                  </div>

                  <button type="submit" className={styles.bookBtn} disabled={isSubmitting}>
                    <FiSend /> {isSubmitting ? "Đang gửi..." : "Nhận Báo Giá Thuê Xe"}
                  </button>
                </form>

                {/* Trust Badges */}
                <div className={styles.trustBadges}>
                  <span className={styles.trustItem}>
                    <FiCheckCircle /> Xe sạch sẽ, không mùi, đầy đủ bảo hiểm
                  </span>
                  <span className={styles.trustItem}>
                    <FiShield /> Lái xe an toàn, lịch sự, đúng giờ
                  </span>
                  <span className={styles.trustItem}>
                    <FiClock /> Hỗ trợ báo giá & thay đổi lịch nhanh 24/7
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

CarDetails.getLayout = function getLayout(page: React.ReactElement) {
  return <ClientLayout>{page}</ClientLayout>;
};
