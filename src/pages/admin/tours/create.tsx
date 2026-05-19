import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Tours.module.scss";
import { FiArrowLeft, FiImage, FiPlus, FiTrash, FiSave } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { tourService } from "~/services/tourService";
import uploadServices from "~/services/uploadService";
import WordImportEditor from "~/components/common/WordImportEditor";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const apiBase = (process.env.NEXT_PUBLIC_API_MEDIA || "https://localhost:7287").replace(/\/+$/, "");
  return `${apiBase}/${cleanPath}`;
};

export default function CreateTour() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states matching request model exactly
  const [title, setTitle] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [departure, setDeparture] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [locations, setLocations] = useState<{ name: string; slug: string }[]>([]);
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [durationNights, setDurationNights] = useState(2);
  const [salePrices, setSalePrices] = useState(0);
  const [originalPrices, setOriginalPrices] = useState(0);
  const [ranking, setRanking] = useState(5);
  const [isHot, setIsHot] = useState(0); // 0: Thường, 1: Hot

  const [isOpenDestinations, setIsOpenDestinations] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDestinations(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const editSlug = router.query.edit as string;

  useEffect(() => {
    if (!editSlug || locations.length === 0) return;

    const fetchTourDetail = async () => {
      try {
        const res = await tourService.getTourDetail(editSlug);
        if (res && res.error && res.error.code === 0 && res.data) {
          const detail = res.data;
          setTitle(detail.title || "");
          setIntroduce(detail.introduce || "");
          setDeparture(detail.slugDeparture || detail.departure || "");

          if (detail.tourDestinations) {
            setSelectedDestinations(detail.tourDestinations.map((d: any) => d.slug));
          }

          setDescription(detail.description || "");
          setDurationDays(detail.durationDays || 0);
          setDurationNights(detail.durationNights || 0);
          setSalePrices(detail.salePrices || 0);
          setOriginalPrices(detail.originalPrices || 0);
          setRanking(detail.ranking || 5);
          setIsHot(detail.isHot || 0);

          if (detail.images && detail.images.length > 0) {
            setImages(detail.images);
          } else if (detail.thumbnail) {
            setImages([detail.thumbnail]);
          }
        } else {
          toast.error("Không thể tải chi tiết tour để chỉnh sửa!");
        }
      } catch (err) {
        console.error("Error loading tour detail:", err);
        toast.error("Lỗi khi tải chi tiết tour!");
      }
    };

    fetchTourDetail();
  }, [editSlug, locations]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await tourService.getLocations();
        if (res && res.error && res.error.code === 0) {
          const items = res.data.items || [];
          setLocations(items);
          if (items.length > 0) {
            setDeparture(items[0].slug); // default to first location slug
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

  const handleDestinationChange = (slug: string) => {
    if (selectedDestinations.includes(slug)) {
      setSelectedDestinations(selectedDestinations.filter((s) => s !== slug));
    } else {
      setSelectedDestinations([...selectedDestinations, slug]);
    }
  };

  // Gallery & Image Upload
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !departure || selectedDestinations.length === 0 || salePrices <= 0) {
      toast.error("Vui lòng nhập đầy đủ các trường thông tin bắt buộc và chọn ít nhất một điểm đến!");
      setActiveTab("general");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        introduce: introduce || "Chương trình tour chất lượng cao của VOYAGE",
        departure,
        thumbnail: images[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        description: description || "Thông tin lịch trình và dịch vụ bao gồm đang được cập nhật.",
        imagesUrl: images,
        durationDays,
        durationNights,
        salePrices,
        originalPrices: originalPrices || salePrices,
        ranking,
        isHot,
        destinations: selectedDestinations.map((slug, idx) => ({
          slug,
          displayOrder: idx + 1
        }))
      };

      const res = editSlug
        ? await tourService.updateTour({ slug: editSlug, ...payload })
        : await tourService.createTour(payload);

      if (res && res.error && res.error.code === 0) {
        toast.success(editSlug ? "Cập nhật Tour thành công!" : "Tạo mới Tour thành công!");
        setTimeout(() => {
          router.push("/admin/tours");
        }, 1500);
      } else {
        toast.error(res?.error?.message || (editSlug ? "Có lỗi xảy ra khi cập nhật Tour!" : "Có lỗi xảy ra khi tạo Tour!"));
      }
    } catch (err: any) {
      console.error("Error creating tour:", err);
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
            <Link href="/admin/tours" className={styles.backLink}>
              <FiArrowLeft /> Quay lại danh sách Tour
            </Link>
          </div>
          <h1 className={styles.title}>{editSlug ? "Chỉnh Sửa Thông Tin Tour" : "Thêm Tour / Combo Mới"}</h1>
          <p className={styles.subtitle}>{editSlug ? "Chỉnh sửa các trường thông tin bên dưới để cập nhật lại chương trình tour trên hệ thống VOYAGE" : "Điền đầy đủ thông tin bên dưới để thiết lập chương trình tour và gửi lên hệ thống VOYAGE"}</p>
        </div>
      </div>

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
            className={activeTab === "images" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("images")}
          >
            Thư viện ảnh ({images.length})
          </button>
          <button
            type="button"
            className={activeTab === "policies" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("policies")}
          >
            Mô tả & Giới thiệu
          </button>
        </div>

        {/* Tab content 1: General Info */}
        {activeTab === "general" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label>Tên Tour / Combo du lịch *</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Nhập tên tour chi tiết (ví dụ: Combo Phú Quốc 3N2Đ Pullman Beach Resort)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Xếp hạng hiển thị (Ranking) *</label>
              <select
                className={styles.selectField}
                value={ranking}
                onChange={(e) => setRanking(Number(e.target.value))}
              >
                <option value={1}>Hạng 1</option>
                <option value={2}>Hạng 2</option>
                <option value={3}>Hạng 3</option>
                <option value={4}>Hạng 4</option>
                <option value={5}>Hạng 5 (Khuyên dùng)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Số ngày *</label>
              <input
                type="number"
                min={0}
                className={styles.inputField}
                placeholder="Ví dụ: 3"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số đêm *</label>
              <input
                type="number"
                min={0}
                className={styles.inputField}
                placeholder="Ví dụ: 2"
                value={durationNights}
                onChange={(e) => setDurationNights(Number(e.target.value))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Điểm khởi hành *</label>
              <select
                className={styles.selectField}
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                required
              >
                {locations.length === 0 && <option value="">Đang tải địa điểm...</option>}
                {locations.map((loc) => (
                  <option key={loc.slug} value={loc.slug}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Điểm đến * (Chọn nhiều điểm đến)</label>
              <div className={styles.multiSelectContainer} ref={dropdownRef}>
                <div
                  className={styles.selectField}
                  onClick={() => setIsOpenDestinations(!isOpenDestinations)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  <span
                    style={{
                      color: selectedDestinations.length === 0 ? "#95a5a6" : "#2c3e50",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "90%"
                    }}
                  >
                    {selectedDestinations.length === 0
                      ? "Chọn các điểm đến..."
                      : selectedDestinations
                        .map((slug) => locations.find((l) => l.slug === slug)?.name)
                        .filter(Boolean)
                        .join(", ")}
                  </span>
                  <span
                    style={{
                      transition: "transform 0.2s",
                      transform: isOpenDestinations ? "rotate(180deg)" : "none",
                      color: "#95a5a6",
                      fontSize: "12px"
                    }}
                  >
                    ▼
                  </span>
                </div>

                {isOpenDestinations && (
                  <div className={styles.multiSelectDropdown}>
                    {locations.length === 0 && (
                      <p style={{ fontSize: "13px", color: "#95a5a6", padding: "8px" }}>
                        Đang tải danh sách địa điểm...
                      </p>
                    )}
                    {locations.map((loc) => (
                      <label key={loc.slug} className={styles.multiSelectOption} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedDestinations.includes(loc.slug)}
                          onChange={() => handleDestinationChange(loc.slug)}
                        />
                        <span>{loc.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Giá gốc (₫) *</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="Nhập giá gốc (ví dụ: 9990000)"
                value={originalPrices}
                onChange={(e) => setOriginalPrices(Number(e.target.value))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Giá khuyến mãi / Giá bán * (₫)</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="Nhập giá bán thực tế (ví dụ: 7890000)"
                value={salePrices}
                onChange={(e) => setSalePrices(Number(e.target.value))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mức độ bán chạy (Hot) *</label>
              <select
                className={styles.selectField}
                value={isHot}
                onChange={(e) => setIsHot(Number(e.target.value))}
              >
                <option value={0}>Tour thường</option>
                <option value={1}>Tour Nổi Bật </option>
              </select>
            </div>
          </div>
        )}

        {/* Tab content 2: Gallery */}
        {activeTab === "images" && (
          <div className={styles.formGroupFull}>
            <label>Hình ảnh slider đại diện và chi tiết</label>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className={styles.imageSelectorBox} onClick={handleAddImage} style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? "wait" : "pointer" }}>
              <FiImage className={styles.imageIcon} />
              <div>
                <strong>{isUploading ? "Đang tải ảnh lên hệ thống..." : "Bấm vào đây để chọn ảnh từ máy tính"}</strong>
                <p style={{ fontSize: "12px", color: "#95a5a6", marginTop: "4px" }}>Hỗ trợ JPG, PNG, WEBP tỷ lệ đẹp 3:2. Ảnh đầu tiên sẽ làm ảnh đại diện (Thumbnail).</p>
              </div>
            </div>

            <div className={styles.previewGrid}>
              {images.map((img, index) => (
                <div key={index} className={styles.previewImageWrapper}>
                  <img src={getImageUrl(img)} alt={`Preview ${index}`} />
                  <button type="button" className={styles.removeImgBtn} onClick={() => handleRemoveImage(index)}>
                    <FiTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab content 3: Policies */}
        {activeTab === "policies" && (
          <div className={styles.formGrid}>
            <div className={styles.formGroupFull}>
              <label>Mô tả lịch trình & Dịch vụ chi tiết *</label>
              <textarea
                className={styles.textareaField}
                placeholder="Điền thông tin lịch trình qua các ngày hoặc các địa điểm tham quan chi tiết..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroupFull}>
              <WordImportEditor
                label="Giới thiệu tóm tắt / Chính sách tour"
                value={introduce}
                onChange={setIntroduce}
                placeholder="Mô tả tóm tắt ngắn về những điểm nổi bật hoặc chọn tệp Word (.docx) để đọc tự động..."
              />
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className={styles.formActions}>
          <Link href="/admin/tours" className={styles.cancelBtn}>
            Hủy bỏ
          </Link>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <>Đang gửi dữ liệu...</>
            ) : (
              <>
                <FiSave /> {editSlug ? "Cập nhật Tour" : "Lưu thông tin Tour"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

CreateTour.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
