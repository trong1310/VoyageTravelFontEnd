import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiPhone, FiMail, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "../ClientLayout/ClientLayout.module.scss";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Contact form state in footer
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

  // Handle contact form submit
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

  // Helper to determine if link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(path);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (router.pathname === "/") {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Global Header */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoOrange}>VOYAGE</span>
            <span className={styles.logoDark}>Travel</span>
          </Link>

          <nav className={styles.nav}>
            <Link
              href="/"
              className={`${styles.navLink} ${isActive("/") && !router.asPath.includes("#contact") ? styles.active : ""}`}
            >
              Trang chủ
            </Link>
            <Link
              href="/tours"
              className={`${styles.navLink} ${isActive("/tours") ? styles.active : ""}`}
            >
              Tour du lịch
            </Link>
            <Link
              href="/cars"
              className={`${styles.navLink} ${isActive("/cars") ? styles.active : ""}`}
            >
              Xe du lịch
            </Link>
            <Link
              href="/hotels"
              className={`${styles.navLink} ${isActive("/hotels") ? styles.active : ""}`}
            >
              Khách sạn
            </Link>
            <a
              href="/#contact"
              className={`${styles.navLink} ${router.asPath.includes("#contact") ? styles.active : ""}`}
              onClick={(e) => handleSmoothScroll(e, "contact")}
            >
              Liên hệ
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className={styles.contentWrapper}>
        {children}
      </div>

      {/* Global Footer */}
      <footer className={styles.footerSection} id="contact">
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <Link href="/" className={styles.logo} style={{ marginBottom: "10px" }}>
              <span className={styles.logoOrange}>VOYAGE</span>
              <span className={styles.logoDark} style={{ color: "#ffffff" }}>Travel</span>
            </Link>
            <p>
              VOYAGE Travel tự hào là người đồng hành đáng tin cậy trên vạn dặm hành trình của bạn. Cung cấp dịch vụ lữ hành trọn gói chất lượng cao và xe dịch vụ êm ái hàng đầu.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", marginTop: "10px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><FiPhone /> Hotline: 1900 8198</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><FiMail /> Email: info@vtstravel.com</span>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Liên kết nhanh</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/">Trang chủ</Link></li>
              <li><Link href="/tours">Tour du lịch</Link></li>
              <li><Link href="/cars">Đội xe du lịch</Link></li>
              <li><Link href="/hotels">Khách sạn</Link></li>
              <li><a href="/#contact" onClick={(e) => handleSmoothScroll(e, "contact")}>Liên hệ với chúng tôi</a></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Dịch vụ của chúng tôi</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/tours">Tours nghỉ dưỡng</Link></li>
              <li><Link href="/tours">Combo tiết kiệm</Link></li>
              <li><Link href="/cars">Thuê xe lữ hành</Link></li>
              <li><Link href="/hotels">Đặt phòng khách sạn</Link></li>
              <li><a href="/#contact" onClick={(e) => handleSmoothScroll(e, "contact")}>Hỗ trợ 24/7</a></li>
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
    </div>
  );
}
