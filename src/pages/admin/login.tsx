import React, { useState } from "react";
import styles from "./AdminLogin.module.scss";
import { FiUser, FiLock, FiEye, FiEyeOff, FiCompass } from "react-icons/fi";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Head from "next/head";
import { useDispatch } from "react-redux";
import { login } from "~/redux/reducer/auth";
import { setUser } from "~/redux/reducer/user";
import { authService } from "~/services/authService";
import CryptoJS from "crypto-js";

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng điền đầy đủ tài khoản và mật khẩu!");
      return;
    }

    setIsLoading(true);

    try {
      // Băm mật khẩu bằng MD5 trước khi gửi lên API
      const hashedPassword = CryptoJS.MD5(password).toString();

      const res = await authService.login({
        userName: username,
        password: hashedPassword,
      });

      if (res && res.error && res.error.code === 0) {
        const { accessToken, userName, fullName } = res.data;

        // Save to Redux store
        dispatch(login({ token: accessToken }));
        dispatch(setUser({
          username: userName,
          fullname: fullName
        }));

        toast.success("Đăng nhập VOYAGE Admin thành công!");
        router.push("/admin");
      } else {
        toast.error(res?.error?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại tài khoản!");
      }
    } catch (err: any) {
      console.error("Login error", err);
      toast.error(err?.error?.message || err?.message || "Có lỗi hệ thống xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Đăng nhập hệ thống VOYAGE Admin - Vietnam Tourism Supply</title>
        <meta name="description" content="Hệ thống quản trị chương trình du lịch, combo, khách sạn của VOYAGE" />
      </Head>

      <div className={styles.loginOverlay} />

      <div className={styles.loginCard}>
        {/* Logo VOYAGE */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <FiCompass />
          </div>
          <span className={styles.logoText}>TRAVEL</span>
          <span className={styles.logoTagline}>ADMIN PORTAL</span>
        </div>

        <div className={styles.headerText}>
          <h2>Đăng nhập hệ thống</h2>
          <p>Dành cho Quản trị viên & Điều hành du lịch Vietnam Tourism Supply</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          {/* Input Tài khoản */}
          <div className={styles.inputGroup}>
            <label htmlFor="username">Tên đăng nhập / Email</label>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                id="username"
                type="text"
                placeholder="Nhập tài khoản admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Input Mật khẩu */}
          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password">Mật khẩu</label>
              <a href="#" onClick={(e) => { e.preventDefault(); toast.info("Tính năng đang được thiết lập. Vui lòng liên hệ IT VOYAGE!"); }} className={styles.forgotLink}>
                Quên mật khẩu?
              </a>
            </div>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className={styles.rememberRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              <span>Ghi nhớ phiên làm việc</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              "Đăng nhập hệ thống"
            )}
          </button>
        </form>

        <div className={styles.footerText}>
          <span>© 2026 Vietnam Tourism Supply Co., Ltd. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
