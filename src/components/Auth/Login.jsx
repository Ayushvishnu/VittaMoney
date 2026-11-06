
import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Swal from "sweetalert2";

import { loginUser } from "../../Api/authApi";
import {
  requestOtp,
  resetPassword,
} from "../../Api/forgotPassworApi";

import "./Auth.css";

// ==========================================
// SWEET ALERT THEME
// ==========================================

const showAlert = (options) => {
  return Swal.fire({
    confirmButtonColor: "#8D3A4A",
    ...options,
  });
};

// ==========================================
// BACKEND ERROR HANDLER
// ==========================================

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  const message =
    data?.message ??
    data?.error ??
    data?.detail ??
    data?.non_field_errors;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string") return value;

      if (Array.isArray(value)) {
        return value.join(", ");
      }
    }
  }

  return fallback;
};

// ==========================================
// LOGIN COMPONENT
// ==========================================

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // LOGIN FORM
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // FORGOT PASSWORD
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgetEmail, setForgetEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // RESET PASSWORD
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [resetData, setResetData] = useState({
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // SCROLL TO TOP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // MODAL BODY SCROLL LOCK + ESCAPE KEY
  useEffect(() => {
    if (!showForgotModal && !showResetModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (!otpLoading) setShowForgotModal(false);
        if (!resetLoading) setShowResetModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    showForgotModal,
    showResetModal,
    otpLoading,
    resetLoading,
  ]);

  // ==========================================
  // SINGLE LOGIN ONCHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==========================================
  // LOGIN API
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await loginUser({
        username: formData.username.trim(),
        password: formData.password,
      });

      const responseData = response?.data;

      // Same response mapping as existing Login code
      const token = responseData?.token;
      const userId = responseData?.user_id;

      if (!token) {
        throw new Error(
          responseData?.message ||
            "Login response did not contain a token."
        );
      }

      localStorage.setItem("token", token);

      if (userId !== undefined && userId !== null) {
        localStorage.setItem("user_id", String(userId));
      } else {
        localStorage.removeItem("user_id");
      }

      await showAlert({
        icon: "success",
        title: "Login Successful",
        text: responseData?.message || "Welcome back!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });

      const from = location.state?.from;
      const redirectTo =
        typeof from === "string" &&
        from.startsWith("/") &&
        !from.startsWith("//")
          ? from
          : "/";

      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      await showAlert({
        icon: "error",
        title: "Login Failed",
        text: error?.response
          ? getErrorMessage(
              error,
              "Invalid username or password."
            )
          : error?.message ||
            "Unable to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OPEN FORGOT PASSWORD
  // ==========================================

  const openForgotModal = () => {
    setForgetEmail("");
    setShowForgotModal(true);
  };

  // ==========================================
  // SEND FORGOT PASSWORD OTP
  // ==========================================

  const sendOtp = async (e) => {
    e.preventDefault();

    if (otpLoading) return;

    const email = forgetEmail.trim();

    if (!email) {
      showAlert({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your registered email.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert({
        icon: "warning",
        title: "Invalid Email",
        text: "Enter a valid email address.",
      });
      return;
    }

    setOtpLoading(true);

    try {
      await requestOtp({
        email,
        action: "forgot",
      });

      setForgetEmail(email);

      setResetData({
        otp: "",
        new_password: "",
        confirm_password: "",
      });

      setShowForgotModal(false);
      setShowResetModal(true);

      await showAlert({
        icon: "success",
        title: "OTP Sent",
        text: "Please check your registered email.",
      });
    } catch (error) {
      console.error("FORGOT OTP ERROR:", error);

      showAlert({
        icon: "error",
        title: "Unable to Send OTP",
        text: getErrorMessage(
          error,
          "Unable to send OTP. Please try again."
        ),
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // ==========================================
  // RESET PASSWORD FORM ONCHANGE
  // ==========================================

  const handleResetChange = (e) => {
    const { name, value } = e.target;

    setResetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET PASSWORD API
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetLoading) return;

    if (!resetData.otp.trim()) {
      showAlert({
        icon: "warning",
        title: "OTP Required",
        text: "Please enter the OTP sent to your email.",
      });
      return;
    }

    if (!resetData.new_password) {
      showAlert({
        icon: "warning",
        title: "Password Required",
        text: "Please enter a new password.",
      });
      return;
    }

    if (resetData.new_password.length < 8) {
      showAlert({
        icon: "warning",
        title: "Weak Password",
        text: "Password must contain at least 8 characters.",
      });
      return;
    }

    if (
      resetData.new_password !==
      resetData.confirm_password
    ) {
      showAlert({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match.",
      });
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword({
        email: forgetEmail,
        otp: resetData.otp.trim(),
        new_password: resetData.new_password,
        confirm_password: resetData.confirm_password,
      });

      setShowResetModal(false);

      setResetData({
        otp: "",
        new_password: "",
        confirm_password: "",
      });

      setShowNewPassword(false);
      setShowConfirmPassword(false);

      await showAlert({
        icon: "success",
        title: "Password Changed",
        text: "Your password has been reset successfully. Please login.",
      });
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);

      showAlert({
        icon: "error",
        title: "Password Reset Failed",
        text: getErrorMessage(
          error,
          "Unable to reset password."
        ),
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <section className="vm-auth-page">
      <div className="vm-auth-background vm-auth-background--one" />
      <div className="vm-auth-background vm-auth-background--two" />

      <div className="vm-auth-container">

        {/* =====================================
            LEFT VISUAL PANEL
        ===================================== */}

     
<div className="vm-auth-visual">
  <Link to="/" className="vm-auth-brand">

    <img
      src="/images/VMLogo.png"
      alt="VittaMoney Logo"
      className="vm-auth-brand-logo"
    />

  

  </Link>




          <div className="vm-auth-visual-content">
            <span className="vm-auth-eyebrow">
              YOUR INVESTMENT JOURNEY
            </span>

            <h1>
              Discover Opportunities
              <span> Beyond the Exchange.</span>
            </h1>

            <p>
              Explore unlisted shares, discover growing
              companies, and stay connected with VittaMoney.
            </p>

            <div className="vm-auth-feature-list">
              <div>
                <span className="vm-auth-feature-icon">
                  <i className="fa-solid fa-chart-line" />
                </span>
                Explore Unlisted Shares
              </div>

              <div>
                <span className="vm-auth-feature-icon">
                  <i className="fa-solid fa-shield-halved" />
                </span>
                Simple Account Experience
              </div>

              <div>
                <span className="vm-auth-feature-icon">
                  <i className="fa-solid fa-headset" />
                </span>
                Dedicated Customer Support
              </div>
            </div>
          </div>

        
        </div>

        {/* =====================================
            RIGHT LOGIN FORM
        ===================================== */}

        <div className="vm-auth-form-side">
          <div className="vm-auth-form-wrapper">

            <Link to="/" className="vm-auth-back">
              <i className="fa-solid fa-arrow-left" />
              Back to Home
            </Link>

            <div className="vm-auth-mobile-brand">
              <span className="vm-auth-brand-icon">V</span>
              <span>
                Vitta<span>Money</span>
              </span>
            </div>

            <div className="vm-auth-heading">
              <span className="vm-auth-heading-badge">
                <i className="fa-solid fa-lock" />
                MEMBER LOGIN
              </span>

              <h2>Welcome Back!</h2>

              <p>
                Enter your credentials to access
                your VittaMoney account.
              </p>
            </div>

            <form
              className="vm-auth-form"
              onSubmit={handleLogin}
              noValidate
            >

              {/* USERNAME */}
              <div className="vm-auth-field">
                <label htmlFor="login-username">
                  Username / Email
                </label>

                <div className={`vm-auth-input-box ${
                  errors.username ? "has-error" : ""
                }`}>
                  <i className="fa-regular fa-user vm-auth-input-icon" />

                  <input
                    id="login-username"
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                  />
                </div>

                {errors.username && (
                  <span className="vm-auth-error">
                    {errors.username}
                  </span>
                )}
              </div>

              {/* PASSWORD */}
              <div className="vm-auth-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <div className={`vm-auth-input-box ${
                  errors.password ? "has-error" : ""
                }`}>
                  <i className="fa-solid fa-lock vm-auth-input-icon" />

                  <input
                    id="login-password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                  />

                  <button
                    type="button"
                    className="vm-auth-eye-btn"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    <i
                      className={
                        showPassword
                          ? "fa-regular fa-eye-slash"
                          : "fa-regular fa-eye"
                      }
                    />
                  </button>
                </div>

                {errors.password && (
                  <span className="vm-auth-error">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* FORGOT PASSWORD */}
              <div className="vm-auth-forgot-row">
                <button
                  type="button"
                  className="vm-auth-text-btn"
                  onClick={openForgotModal}
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="vm-auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <i className="fa-solid fa-arrow-right" />
                  </>
                )}
              </button>

              {/* REGISTER LINK */}
              <p className="vm-auth-switch-text">
                Don't have an account?{" "}
                <Link to="/register">
                  Register Now
                </Link>
              </p>
            </form>

            <div className="vm-auth-bottom">
              © {new Date().getFullYear()} VittaMoney.
              All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          FORGOT PASSWORD MODAL
      ===================================== */}

      {showForgotModal && (
        <div
          className="vm-auth-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !otpLoading
            ) {
              setShowForgotModal(false);
            }
          }}
        >
          <div
            className="vm-auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
          >
            <button
              type="button"
              className="vm-auth-modal-close"
              onClick={() => setShowForgotModal(false)}
              disabled={otpLoading}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="vm-auth-modal-icon">
              <i className="fa-solid fa-envelope-open-text" />
            </div>

            <h3 id="forgot-password-title">
              Forgot Password?
            </h3>

            <p className="vm-auth-modal-description">
              Enter your registered email address.
              We'll send you an OTP to reset your password.
            </p>

            <form onSubmit={sendOtp}>
              <div className="vm-auth-field">
                <label htmlFor="forgot-email">
                  Email Address
                </label>

                <div className="vm-auth-input-box">
                  <i className="fa-regular fa-envelope vm-auth-input-icon" />

                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgetEmail}
                    onChange={(e) =>
                      setForgetEmail(e.target.value)
                    }
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="vm-auth-submit-btn"
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP
                    <i className="fa-solid fa-paper-plane" />
                  </>
                )}
              </button>

              <button
                type="button"
                className="vm-auth-modal-cancel"
                onClick={() => setShowForgotModal(false)}
                disabled={otpLoading}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          RESET PASSWORD MODAL
      ===================================== */}

      {showResetModal && (
        <div
          className="vm-auth-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !resetLoading
            ) {
              setShowResetModal(false);
            }
          }}
        >
          <div
            className="vm-auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <button
              type="button"
              className="vm-auth-modal-close"
              onClick={() => setShowResetModal(false)}
              disabled={resetLoading}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="vm-auth-modal-icon">
              <i className="fa-solid fa-key" />
            </div>

            <h3 id="reset-password-title">
              Reset Password
            </h3>

            <p className="vm-auth-modal-description">
              Enter the OTP sent to {forgetEmail}
              and create your new password.
            </p>

            <form onSubmit={handleResetPassword}>

              {/* OTP */}
              <div className="vm-auth-field">
                <label htmlFor="reset-otp">
                  Enter OTP
                </label>

                <div className="vm-auth-input-box">
                  <i className="fa-solid fa-shield-halved vm-auth-input-icon" />

                  <input
                    id="reset-otp"
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={resetData.otp}
                    onChange={handleResetChange}
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="vm-auth-field">
                <label htmlFor="reset-new-password">
                  New Password
                </label>

                <div className="vm-auth-input-box">
                  <i className="fa-solid fa-lock vm-auth-input-icon" />

                  <input
                    id="reset-new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="new_password"
                    placeholder="Enter new password"
                    value={resetData.new_password}
                    onChange={handleResetChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="vm-auth-eye-btn"
                    onClick={() =>
                      setShowNewPassword((prev) => !prev)
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <i
                      className={
                        showNewPassword
                          ? "fa-regular fa-eye-slash"
                          : "fa-regular fa-eye"
                      }
                    />
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="vm-auth-field">
                <label htmlFor="reset-confirm-password">
                  Confirm Password
                </label>

                <div className="vm-auth-input-box">
                  <i className="fa-solid fa-lock vm-auth-input-icon" />

                  <input
                    id="reset-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirm_password"
                    placeholder="Confirm new password"
                    value={resetData.confirm_password}
                    onChange={handleResetChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="vm-auth-eye-btn"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <i
                      className={
                        showConfirmPassword
                          ? "fa-regular fa-eye-slash"
                          : "fa-regular fa-eye"
                      }
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="vm-auth-submit-btn"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Please Wait...
                  </>
                ) : (
                  <>
                    Set Password
                    <i className="fa-solid fa-check-circle" />
                  </>
                )}
              </button>

              <button
                type="button"
                className="vm-auth-modal-cancel"
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
