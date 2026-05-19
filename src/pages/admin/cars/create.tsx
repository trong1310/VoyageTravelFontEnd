import React, { useState, useEffect } from "react";
import AdminLayout from "~/components/layout/AdminLayout/AdminLayout";
import styles from "./Cars.module.scss";
import { FiArrowLeft, FiUploadCloud, FiTrash2, FiSave, FiMapPin, FiTruck } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import { carService } from "~/services/carService";
import uploadServices from "~/services/uploadService";
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

export default function CreateOrEditCar() {
  const router = useRouter();
  const { edit } = router.query;
  const isEditMode = !!edit;

  // Form states
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [seatCount, setSeatCount] = useState(4);
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [manufactureYear, setManufactureYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  // Location routes state
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<{ [slug: string]: { checked: boolean; order: number } }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await carService.getLocations();
        if (res && res.error && res.error.code === 0) {
          setLocations(res.data.items || []);
        }
      } catch (err) {
        console.error("Error loading locations:", err);
        toast.error("Không thể tải danh sách địa điểm hành trình!");
      }
    };
    fetchLocations();
  }, []);

  // Load car for editing
  useEffect(() => {
    if (!edit) return;

    const fetchCarDetail = async () => {
      setIsLoading(true);
      try {
        const res = await carService.getCarDetail(edit as string);
        if (res && res.error && res.error.code === 0 && res.data) {
          const car = res.data;
          setName(car.name || "");
          setLicensePlate(car.licensePlate || "");
          setSeatCount(car.seatCount || 4);
          setBrand(car.brand || "");
          setColor(car.color || "");
          setManufactureYear(car.manufactureYear || new Date().getFullYear());
          setDescription(car.description || "");
          setThumbnail(car.thumbNail || car.thumbnail || "");

          // Populate routes
          if (car.routes && car.routes.length > 0) {
            const routesMap: { [slug: string]: { checked: boolean; order: number } } = {};
            car.routes.forEach((r: any) => {
              routesMap[r.slug] = { checked: true, order: r.displayOrder || 1 };
            });
            setSelectedRoutes(routesMap);
          }
        } else {
          toast.error("Không thể tải dữ liệu xe cần sửa!");
          router.push("/admin/cars");
        }
      } catch (err) {
        console.error("Error loading car detail:", err);
        toast.error("Lỗi khi kết nối Backend!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetail();
  }, [edit, router]);

  // Image upload
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const toastId = toast.loading("Đang tải ảnh lên máy chủ...");

    try {
      const res: any = await uploadServices.upload([file]);
      if (res && res.error && res.error.code === 0 && res.data?.items?.length > 0) {
        setThumbnail(res.data.items[0]);
        toast.update(toastId, {
          render: "Tải ảnh lên thành công!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: res?.error?.message || "Tải ảnh thất bại!",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.update(toastId, {
        render: "Lỗi đường truyền tải ảnh!",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const handleCheckboxChange = (slug: string) => {
    setSelectedRoutes((prev) => {
      const exist = prev[slug];
      if (exist && exist.checked) {
        // Uncheck
        const next = { ...prev };
        delete next[slug];
        return next;
      } else {
        // Check
        const maxOrder = Object.values(prev)
          .filter((v) => v.checked)
          .reduce((max, curr) => (curr.order > max ? curr.order : max), 0);
        return {
          ...prev,
          [slug]: { checked: true, order: maxOrder + 1 },
        };
      }
    });
  };

  const handleOrderChange = (slug: string, val: number) => {
    setSelectedRoutes((prev) => ({
      ...prev,
      [slug]: { checked: true, order: val },
    }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.warn("Vui lòng điền tên xe dịch vụ!");
    if (!licensePlate.trim()) return toast.warn("Vui lòng nhập biển số xe!");
    if (!thumbnail) return toast.warn("Vui lòng tải lên ảnh đại diện xe!");

    setIsSubmitting(true);

    // Format routes payload
    const routesPayload = Object.keys(selectedRoutes)
      .filter((slug) => selectedRoutes[slug].checked)
      .map((slug) => ({
        slug,
        displayOrder: selectedRoutes[slug].order || 1,
      }));

    const payload = {
      name,
      licensePlate: licensePlate.trim(),
      seatCount: Number(seatCount),
      brand,
      color,
      manufactureYear: Number(manufactureYear),
      description,
      thumbNail: thumbnail,
      routes: routesPayload,
    };

    try {
      let res;
      if (isEditMode) {
        res = await carService.updateCar({
          ...payload,
          slug: edit as string,
        });
      } else {
        res = await carService.createCar(payload);
      }

      if (res && res.error && res.error.code === 0) {
        toast.success(isEditMode ? "Cập nhật thông tin xe thành công!" : "Thêm xe dịch vụ mới thành công!");
        router.push("/admin/cars");
      } else {
        toast.error(res?.error?.message || "Thao tác thất bại! Vui lòng kiểm tra lại dữ liệu.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Có lỗi xảy ra khi gửi dữ liệu lên Backend!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
        <div className="spinner"></div>
        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Đang tải dữ liệu đội xe...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backWrapper}>
        <Link href="/admin/cars" className={styles.backLink}>
          <FiArrowLeft /> Quay lại danh sách xe
        </Link>
      </div>

      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>{isEditMode ? "Chỉnh Sửa Xe Dịch Vụ" : "Thêm Xe Dịch Vụ Mới"}</h1>
          <p className={styles.subtitle}>{isEditMode ? `Cập nhật thông số và tuyến đường cho xe ${licensePlate}` : "Thiết lập cấu hình xe mới phục vụ khách du lịch"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formGrid}>
          {/* Tên xe */}
          <div className={styles.formGroup}>
            <label>Tên xe dịch vụ *</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ví dụ: Xe Hyundai Universe 45 Chỗ VIP, Ford Transit Premium..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Biển số xe */}
          <div className={styles.formGroup}>
            <label>Biển kiểm soát xe (License Plate) *</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ví dụ: 29B-123.45, 30G-999.99..."
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
            />
          </div>

          {/* Số ghế */}
          <div className={styles.formGroup}>
            <label>Số ghế ngồi *</label>
            <select
              className={styles.selectField}
              value={seatCount}
              onChange={(e) => setSeatCount(Number(e.target.value))}
            >
              <option value="4">4 chỗ</option>
              <option value="7">7 chỗ</option>
              <option value="16">16 chỗ</option>
              <option value="29">29 chỗ</option>
              <option value="35">35 chỗ</option>
              <option value="45">45 chỗ</option>
            </select>
          </div>

          {/* Hãng xe */}
          <div className={styles.formGroup}>
            <label>Hãng sản xuất / Thương hiệu</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ví dụ: Hyundai, Ford, Thaco, Toyota..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          {/* Màu sắc */}
          <div className={styles.formGroup}>
            <label>Màu sắc xe</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ví dụ: Trắng, Đen, Xám bạc, Đỏ..."
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          {/* Năm sản xuất */}
          <div className={styles.formGroup}>
            <label>Năm sản xuất</label>
            <input
              type="number"
              className={styles.inputField}
              placeholder="Ví dụ: 2022, 2023, 2024..."
              value={manufactureYear}
              onChange={(e) => setManufactureYear(Number(e.target.value))}
            />
          </div>

          {/* Ảnh đại diện xe */}
          <div className={styles.formGroupFull}>
            <label>Ảnh đại diện xe (Thumbnail) *</label>
            <div style={{ display: 'grid', gridTemplateColumns: thumbnail ? '1fr 3fr' : '1fr', gap: '20px', alignItems: 'center' }}>
              {thumbnail && (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eef0f5' }}>
                  <img
                    src={getImageUrl(thumbnail)}
                    alt="Preview car image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(231,76,60,0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Xóa ảnh"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}

              <label className={styles.imageSelectorBox}>
                <FiUploadCloud className={styles.imageIcon} />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Tải ảnh xe lên</span> hoặc kéo thả file
                  <p style={{ fontSize: '11px', color: '#7f8c8d', marginTop: '4px' }}>Hỗ trợ tệp PNG, JPG, JPEG kích thước tốt nhất 4:3</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {/* Tuyến đường đi qua */}
          <div className={styles.formGroupFull}>
            <label>Lộ trình tuyến đường phục vụ (Chọn địa điểm và nhập thứ tự di chuyển)</label>
            <div className={styles.routesSelectGrid}>
              {locations.map((loc) => {
                const routeState = selectedRoutes[loc.slug] || { checked: false, order: 1 };
                return (
                  <div
                    key={loc.slug}
                    className={`${styles.routeSelectCard} ${routeState.checked ? styles.active : ""}`}
                  >
                    <label className={styles.routeHeader}>
                      <input
                        type="checkbox"
                        checked={routeState.checked}
                        onChange={() => handleCheckboxChange(loc.slug)}
                      />
                      <span>{loc.name}</span>
                    </label>
                    {routeState.checked && (
                      <div className={styles.orderInputWrapper}>
                        <span>Thứ tự đi qua:</span>
                        <input
                          type="number"
                          min="1"
                          value={routeState.order}
                          onChange={(e) => handleOrderChange(loc.slug, Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ghi chú */}
          <div className={styles.formGroupFull}>
            <label>Mô tả tình trạng & Ghi chú xe</label>
            <textarea
              className={styles.textareaField}
              rows={4}
              placeholder="Nhập thông tin mô tả chi tiết trạng thái xe, tiện nghi tích hợp (Wifi, Tủ lạnh, Ghế massage), ghi chú cho lái xe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <Link href="/admin/cars" className={styles.cancelBtn}>
            Hủy bỏ
          </Link>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            <FiSave /> {isSubmitting ? "Đang xử lý..." : isEditMode ? "Lưu thay đổi" : "Tạo xe mới"}
          </button>
        </div>
      </form>
    </div>
  );
}

CreateOrEditCar.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
