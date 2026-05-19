import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Hotels.module.scss";
import { FiArrowLeft, FiImage, FiPlus, FiTrash, FiSave, FiInfo } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { hotelService } from "~/services/hotelService";
import uploadServices from "~/services/uploadService";
import WordImportEditor from "~/components/common/WordImportEditor";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_MEDIA || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function CreateOrEditHotel() {
  const router = useRouter();
  const editSlug = router.query.edit as string;

  // Active Tab state
  const [activeTab, setActiveTab] = useState<"general" | "details" | "images">("general");

  // Form states
  const [name, setName] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [type, setType] = useState(1); // 1: Khách sạn, 2: Resort, 3: Homestay, 4: Villa/Biệt thự
  const [isHot, setIsHot] = useState(0); // 0: Thường, 1: Hot
  const [ranking, setRanking] = useState(5); // 1-5 stars
  const [relativePrice, setRelativePrice] = useState(0);
  const [regulations, setRegulations] = useState("");
  const [slugLocations, setSlugLocations] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // Locations dropdown list
  const [locations, setLocations] = useState<{ name: string; slug: string }[]>([]);

  // State flags
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await hotelService.getLocations();
        if (res && res.error && res.error.code === 0) {
          const items = res.data.items || [];
          setLocations(items);
          if (items.length > 0 && !slugLocations) {
            setSlugLocations(items[0].slug); // default select first location slug
          }
        } else {
          toast.error("Không thể tải danh sách địa điểm!");
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // Fetch hotel details for editing
  useEffect(() => {
    if (!editSlug || locations.length === 0) return;

    const fetchHotelDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const res = await hotelService.getHotelDetail(editSlug);
        if (res && res.error && res.error.code === 0 && res.data) {
          const detail = res.data;
          setName(detail.name || "");
          setIntroduce(detail.introduce || "");
          setType(detail.type || 1);
          setIsHot(detail.isHot || 0);
          setRanking(detail.ranking || 5);
          setRelativePrice(detail.relativePrice || 0);
          setRegulations(detail.regulations || "");
          setSlugLocations(detail.slugLocations || "");
          setDescription(detail.description || "");
          setAddress(detail.address || "");

          if (detail.images && detail.images.length > 0) {
            setImages(detail.images);
          } else if (detail.thumbnail) {
            setImages([detail.thumbnail]);
          }
        } else {
          toast.error("Không thể tải chi tiết khách sạn để chỉnh sửa!");
        }
      } catch (err) {
        console.error("Error loading hotel detail:", err);
        toast.error("Lỗi khi tải chi tiết khách sạn!");
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchHotelDetail();
  }, [editSlug, locations]);

  // Image Upload
  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const res: any = await uploadServices.upload(selectedFiles);
      if (res && res.error && res.error.code === 0) {
        if (res.data && res.data.items && res.data.items.length > 0) {
          setImages((prev) => [...prev, ...res.data.items]);
          toast.success(`Đã tải lên thành công ${res.data.items.length} ảnh!`);
        } else {
          toast.warn("Không nhận được dữ liệu ảnh trả về!");
        }
      } else {
        toast.error(res?.error?.message || "Lỗi khi tải ảnh lên hệ thống!");
      }
    } catch (err: any) {
      console.error("Error uploading images:", err);
      toast.error("Không thể kết nối đến máy chủ tải ảnh!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên khách sạn / resort!");
      setActiveTab("general");
      return;
    }

    if (!slugLocations) {
      toast.error("Vui lòng chọn khu vực địa điểm!");
      setActiveTab("general");
      return;
    }

    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ chi tiết!");
      setActiveTab("general");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        introduce: introduce.trim() || "Chương trình nghỉ dưỡng chất lượng cao của đại lý VOYAGE",
        type,
        isHot,
        ranking,
        relativePrice,
        thumbnail: images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        regulations: regulations.trim() || "Chính sách nhận/trả phòng và phụ thu theo quy định của resort.",
        slugLocations,
        description: description.trim() || "Thông tin phòng nghỉ và tiện ích hồ bơi, gym đang được cập nhật.",
        address: address.trim(),
        imagesUrl: images,
      };

      const res = editSlug
        ? await hotelService.updateHotel({ slug: editSlug, ...payload })
        : await hotelService.createHotel(payload);

      if (res && res.error && res.error.code === 0) {
        toast.success(editSlug ? "Cập nhật khách sạn thành công!" : "Tạo mới khách sạn thành công!");
        setTimeout(() => {
          router.push("/admin/hotels");
        }, 1500);
      } else {
        toast.error(res?.error?.message || (editSlug ? "Lỗi khi cập nhật khách sạn!" : "Lỗi khi tạo mới khách sạn!"));
      }
    } catch (err: any) {
      console.error("Error saving hotel:", err);
      toast.error("Không thể kết nối tới Backend!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <div>
          <div className={styles.backWrapper}>
            <Link href="/admin/hotels" className={styles.backLink}>
              <FiArrowLeft /> Quay lại danh sách Khách Sạn
            </Link>
          </div>
          <h1 className={styles.title}>{editSlug ? "Chỉnh Sửa Khách Sạn / Resort" : "Thêm Khách Sạn / Resort Mới"}</h1>
          <p className={styles.subtitle}>
            {editSlug ? "Cập nhật thông tin phòng nghỉ, tiện ích và giá cả cho cơ sở lưu trú" : "Thiết lập thông tin lưu trú, resort sang trọng và chính sách nhận phòng"}
          </p>
        </div>
      </div>

      {isLoadingDetail ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Đang tải chi tiết khách sạn...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          {/* Navigation Tabs */}
          <div className={styles.formTabs}>
            <button
              type="button"
              className={activeTab === "general" ? styles.activeTabBtn : styles.tabBtn}
              onClick={() => setActiveTab("general")}
            >
              Thông tin chung
            </button>
            <button
              type="button"
              className={activeTab === "details" ? styles.activeTabBtn : styles.tabBtn}
              onClick={() => setActiveTab("details")}
            >
              Mô tả & Quy định
            </button>
            <button
              type="button"
              className={activeTab === "images" ? styles.activeTabBtn : styles.tabBtn}
              onClick={() => setActiveTab("images")}
            >
              Thư viện ảnh ({images.length})
            </button>
          </div>

          {/* Tab 1: General Info */}
          {activeTab === "general" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label>Tên Khách Sạn / Resort *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Nhập tên khách sạn (ví dụ: Pullman Beach Resort Phú Quốc)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Loại hình lưu trú *</label>
                <select
                  className={styles.selectField}
                  value={type}
                  onChange={(e) => setType(Number(e.target.value))}
                >
                  <option value={1}>Khách sạn</option>
                  <option value={2}>Resort</option>
                  <option value={3}>Homestay</option>
                  <option value={4}>Villa/Biệt thự</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Khu vực địa điểm (Tỉnh/Thành) *</label>
                <select
                  className={styles.selectField}
                  value={slugLocations}
                  onChange={(e) => setSlugLocations(e.target.value)}
                  required
                >
                  {locations.map((loc) => (
                    <option key={loc.slug} value={loc.slug}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroupFull}>
                <label>Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Nhập số nhà, tên đường, khu vực..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Hạng sao du lịch (Star Rating)</label>
                <select
                  className={styles.selectField}
                  value={ranking}
                  onChange={(e) => setRanking(Number(e.target.value))}
                >
                  <option value={5}>5 Sao ⭐⭐⭐⭐⭐</option>
                  <option value={4}>4 Sao ⭐⭐⭐⭐</option>
                  <option value={3}>3 Sao ⭐⭐⭐</option>
                  <option value={2}>2 Sao ⭐⭐</option>
                  <option value={1}>1 Sao ⭐</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Giá tham khảo từ (₫) *</label>
                <input
                  type="number"
                  className={styles.inputField}
                  placeholder="Ví dụ: 1500000"
                  value={relativePrice}
                  onChange={(e) => setRelativePrice(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Độ nổi bật / Ưu tiên</label>
                <select
                  className={styles.selectField}
                  value={isHot}
                  onChange={(e) => setIsHot(Number(e.target.value))}
                >
                  <option value={0}>Thường</option>
                  <option value={1}>Hot / Nổi bật 🔥</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 2: Descriptions & Regulations */}
          {activeTab === "details" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <WordImportEditor
                  label="Giới thiệu khách sạn (Introduce)"
                  value={introduce}
                  onChange={setIntroduce}
                  placeholder="Mô tả ngắn gọn đặc trưng, vị trí địa lý đắc địa và điểm ấn tượng hoặc nhập từ file Word (.docx)..."
                />
              </div>

              <div className={styles.formGroupFull}>
                <label>Mô tả ngắn</label>
                <textarea
                  className={styles.textareaField}
                  rows={4}
                  placeholder="Mô tả chi tiết các loại phòng nghỉ, hồ bơi, buffet sáng, gym, spa, xe đưa đón và các tiện ích giải trí khác..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label>Quy định & Chính sách nhận trả phòng</label>
                <textarea
                  className={styles.textareaField}
                  rows={6}
                  placeholder="Quy định giờ nhận trả phòng (Check-in 14:00, Check-out 12:00), chính sách hủy đặt phòng, phụ thu trẻ em, mang theo thú cưng..."
                  value={regulations}
                  onChange={(e) => setRegulations(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Image Gallery */}
          {activeTab === "images" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label>Tải ảnh lên thư viện ảnh khách sạn / resort</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <div
                  className={styles.imageSelectorBox}
                  onClick={handleAddImage}
                  style={{ cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.7 : 1 }}
                >
                  <FiImage className={styles.imageIcon} />
                  <div>
                    {isUploading ? (
                      <strong>Đang tải ảnh lên máy chủ, vui lòng đợi...</strong>
                    ) : (
                      <>
                        <strong>Bấm vào đây để chọn nhiều ảnh từ thiết bị</strong>
                        <p style={{ fontSize: "12px", color: "#95a5a6", marginTop: "4px" }}>
                          Ảnh đầu tiên sẽ tự động làm ảnh đại diện (Thumbnail). Hỗ trợ JPG, PNG, WEBP.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {images.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiInfo style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: '500' }}>
                      Kéo thả hoặc sắp xếp để đổi ảnh đại diện (ảnh ở vị trí số 1).
                    </span>
                  </div>
                )}

                <div className={styles.previewGrid}>
                  {images.map((img, index) => (
                    <div key={index} className={styles.previewImageWrapper}>
                      <img src={getImageUrl(img)} alt={`Hotel image ${index}`} />
                      <div style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "4px",
                        backgroundColor: index === 0 ? "var(--primary)" : "rgba(0,0,0,0.6)",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase"
                      }}>
                        {index === 0 ? "Ảnh đại diện" : `Ảnh ${index + 1}`}
                      </div>
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <FiTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className={styles.formActions}>
            <Link href="/admin/hotels" className={styles.cancelBtn}>
              Hủy bỏ
            </Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
              style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? (
                <>Đang lưu...</>
              ) : (
                <>
                  <FiSave /> {editSlug ? "Cập nhật Khách Sạn" : "Lưu Khách Sạn mới"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

CreateOrEditHotel.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
