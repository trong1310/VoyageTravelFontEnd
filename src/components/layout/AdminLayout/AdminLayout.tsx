import React, { useState, useEffect } from "react";
import { FiHome, FiCompass, FiBriefcase, FiCalendar, FiMenu, FiBell, FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiTruck } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./AdminLayout.module.scss";
import clsx from "clsx";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/store";
import { logout } from "~/redux/reducer/auth";
import { toast } from "react-toastify";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // Authorization checks
  const { isLogin } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.site);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!isLogin && !loading) {
      router.replace("/admin/login");
    }
  }, [isLogin, loading, router]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logout());
    toast.success("Đăng xuất thành công!");
    router.replace("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: FiHome },
    { label: "Quản lý Tour", path: "/admin/tours", icon: FiCompass },
    { label: "Quản lý Khách Sạn", path: "/admin/hotels", icon: FiBriefcase },
    { label: "Quản lý Xe", path: "/admin/cars", icon: FiTruck },
    { label: "Quản lý Booking", path: "/admin/bookings", icon: FiCalendar },
  ];

  // Helper to determine if link is active
  const isActive = (path: string) => {
    if (path === "/admin") {
      return router.pathname === "/admin";
    }
    return router.pathname.startsWith(path);
  };

  // Extract breadcrumbs from path
  const getBreadcrumbs = () => {
    const paths = router.pathname.split("/").filter(Boolean);
    return ["Admin", ...paths.map(p => p.charAt(0).toUpperCase() + p.slice(1))];
  };

  // Prevent flash of content for guest users
  if (!isLogin || loading) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        color: "#e9680c",
        fontWeight: 600,
        backgroundColor: "#1a1e21",
        fontSize: "15px"
      }}>
        Đang xác thực thông tin Admin VOYAGE...
      </div>
    );
  }

  return (
    <div className={clsx("admin-theme", styles.layoutContainer)}>
      {/* Sidebar */}
      <aside className={clsx(styles.sidebar, { [styles.collapsed]: isCollapsed })}>
        <div className={styles.sidebarHeader}>
          {!isCollapsed ? (
            <div className={styles.logo}>
              <span className={styles.logoOrange}>Voyage</span>
              <span className={styles.logoDark}>Travel</span>
            </div>
          ) : (
            <div className={styles.logoCollapsed}>Voyage</div>
          )}
          <button
            className={styles.toggleCollapseBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path} className={styles.navLinkWrapper}>
                <div className={clsx(styles.navItem, { [styles.active]: active })}>
                  <Icon className={styles.navIcon} />
                  {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {active && !isCollapsed && <span className={styles.activeIndicator} />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="#" onClick={handleLogout} className={styles.logoutWrapper}>
            <div className={styles.logoutBtn}>
              <FiLogOut className={styles.logoutIcon} />
              {!isCollapsed && <span>Đăng xuất</span>}
            </div>
          </a>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumbs}>
              {getBreadcrumbs().map((crumb, idx, arr) => (
                <React.Fragment key={idx}>
                  <span className={clsx(styles.crumb, { [styles.lastCrumb]: idx === arr.length - 1 })}>
                    {crumb === "Index" ? "Dashboard" : crumb}
                  </span>
                  {idx < arr.length - 1 && <span className={styles.separator}>/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Notifications */}
            <div className={styles.notificationCenter}>
              <button className={styles.headerActionBtn} title="Thông báo">
                <FiBell />
                <span className={styles.badge}>3</span>
              </button>
              <div className={styles.notificationDropdown}>
                <div className={styles.dropdownHeader}>Thông báo mới</div>
                <div className={styles.dropdownBody}>
                  <div className={styles.dropdownItem}>
                    <strong>BK-9824</strong> vừa đặt Tour Phú Quốc 3N2Đ.
                    <span>10 phút trước</span>
                  </div>
                  <div className={styles.dropdownItem}>
                    Khách sạn <strong>Mường Thanh</strong> hết phòng Deluxe.
                    <span>1 giờ trước</span>
                  </div>
                  <div className={styles.dropdownItem}>
                    Đã xác nhận thanh toán <strong>BK-9801</strong>.
                    <span>3 giờ trước</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                <FiUser />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.fullname || user?.username || "Administrator"}</span>
                <span className={styles.userRole}>VOYAGE Admin Staff</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  );
}
