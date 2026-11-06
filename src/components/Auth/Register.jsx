
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import { registerUser } from "../../Api/authApi";
import { verifyOtp } from "../../Api/forgotPassworApi";

import "./Auth.css";

// ==========================================
// SWEET ALERT
// ==========================================

const showAlert = (options) => {
  return Swal.fire({
    confirmButtonColor: "#8D3A4A",
    ...options,
  });
};

// ==========================================
// ERROR HANDLER
// ==========================================

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  const message =
    data?.error ??
    data?.message ??
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
// REGISTER COMPONENT
// ==========================================

export default function Register() {
  const navigate = useNavigate();

  // REGISTRATION FORM
  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    email: "",
    password: "",
    confirm_password: "",
    role: 2,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // PASSWORD VISIBILITY
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ==========================================
  // OTP MODAL ESCAPE + SCROLL LOCK
  // ==========================================

  useEffect(() => {
    if (!showOtpModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && !otpLoading) {
        setShowOtpModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showOtpModal, otpLoading]);

  // ==========================================
  // SINGLE HANDLE CHANGE
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
      ...(name === "password"
        ? { confirm_password: "" }
        : {}),
    }));
  };

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  const validateRegister = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Full name is required";
    } else if (formData.username.trim().length < 2) {
      newErrors.username =
        "Name must contain at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    const phone = formData.phone_number.trim();

    if (!phone) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone_number =
        "Enter a valid 10-digit Indian mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password =
        "Confirm password is required";
    } else if (
      formData.password !== formData.confirm_password
    ) {
      newErrors.confirm_password =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // REGISTER API
  // ==========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateRegister()) return;

    setLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: 2,
      };

      const response = await registerUser(payload);

      console.log("REGISTER RESPONSE:", response?.data);

      setOtp("");
      setShowOtpModal(true);

      await showAlert({
        icon: "success",
        title: "Registration Successful",
        text:
          response?.data?.message ||
          "OTP has been sent to your registered email.",
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      showAlert({
        icon: "error",
        title: "Registration Failed",
        text: getErrorMessage(
          error,
          "Something went wrong. Please try again."
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY REGISTRATION OTP
  // ==========================================

  const verifyRegisterOtp = async (e) => {
    e.preventDefault();

    if (otpLoading) return;

    if (!otp.trim()) {
      showAlert({
        icon: "warning",
        title: "OTP Required",
        text: "Please enter the OTP sent to your email.",
      });
      return;
    }

    setOtpLoading(true);

    try {
      // SAME PAYLOAD AS EXISTING OTP API
      await verifyOtp({
        otp: otp.trim(),
      });

      setShowOtpModal(false);
      setOtp("");

      await showAlert({
        icon: "success",
        title: "Account Verified",
        text: "Please login to continue.",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("OTP VERIFY ERROR:", error);

      showAlert({
        icon: "error",
        title: "Verification Failed",
        text: getErrorMessage(
          error,
          "Invalid or expired OTP."
        ),
      });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
<section className="vm-auth-page vm-auth-register-page">      <div className="vm-auth-background vm-auth-background--one" />
      <div className="vm-auth-background vm-auth-background--two" />

      <div className="vm-auth-container">

        {/* =====================================
            LEFT VISUAL PANEL
        ===================================== */}

        <div className="vm-auth-visual">
        
{/* ==========================================
    REGISTER PAGE BRAND LOGO
========================================== */}

<Link to="/" className="vm-register-brand-link">
  <img
    src="/images/VMLogo.png"
    alt="VittaMoney Logo"
    className="vm-register-brand-logo"
  />
</Link>

<div className="left">
          <div className="vm-auth-visual-content">
            <span className="vm-auth-eyebrow">
              JOIN VITTAMONEY
            </span>

            <h1>
              Your Gateway to
              <span> Unlisted Opportunities.</span>
            </h1>

            <p>
              Create your account and start exploring
              unlisted shares, investment education,
              and company opportunities.
            </p>

            <div className="vm-auth-feature-list">
              <div>
                <span className="vm-auth-feature-icon">
                  <i className="fa-solid fa-building-columns" />
                </span>
                Explore Private Companies
              </div>

              <div>
                <span className="vm-auth-feature-icon">
                  <i className="fa-solid fa-chart-simple" />
                </span>
                Discover Unlisted Opportunities
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

          {/* <div className="vm-auth-visual-footer">
            <i className="fa-solid fa-circle-info" />
            Investments are subject to market risks.
          </div> */}
        </div>

        {/* =====================================
            RIGHT REGISTER FORM
        ===================================== */}

        <div className="vm-auth-form-side">
          <div className="vm-auth-form-wrapper vm-auth-register-wrapper">

            <Link to="/" className="vm-auth-back">
              <i className="fa-solid fa-arrow-left" />
              Back to Home
            </Link>

            <div className="vm-auth-mobile-brand">
              <span className="vm-auth-brand-icon">
                V
              </span>

              <span>
                Vitta<span>Money</span>
              </span>
            </div>

            <div className="vm-auth-heading">
              <span className="vm-auth-heading-badge">
                <i className="fa-solid fa-user-plus" />
                CREATE ACCOUNT
              </span>

              <h2>Get Started!</h2>

              <p>
                Fill in your details to register
                with VittaMoney.
              </p>
            </div>

            <form
              className="vm-auth-form"
              onSubmit={handleRegister}
              noValidate
            >

              {/* =====================================
                  FULL NAME
              ===================================== */}

              <div className="vm-auth-field">
                <label htmlFor="register-username">
                  Full Name
                </label>

                <div className={`vm-auth-input-box ${
                  errors.username ? "has-error" : ""
                }`}>
                  <i className="fa-regular fa-user vm-auth-input-icon" />

                  <input
                    id="register-username"
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-invalid={!!errors.username}
                  />
                </div>

                {errors.username && (
                  <span className="vm-auth-error">
                    {errors.username}
                  </span>
                )}
              </div>

              {/* =====================================
                  EMAIL
              ===================================== */}

              <div className="vm-auth-field">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <div className={`vm-auth-input-box ${
                  errors.email ? "has-error" : ""
                }`}>
                  <i className="fa-regular fa-envelope vm-auth-input-icon" />

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                </div>

                {errors.email && (
                  <span className="vm-auth-error">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* =====================================
                  PHONE NUMBER
              ===================================== */}

              <div className="vm-auth-field">
                <label htmlFor="register-phone">
                  Phone Number
                </label>

                <div className={`vm-auth-input-box ${
                  errors.phone_number ? "has-error" : ""
                }`}>
                  <i className="fa-solid fa-phone vm-auth-input-icon" />

                  <input
                    id="register-phone"
                    type="tel"
                    name="phone_number"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={10}
                    aria-invalid={!!errors.phone_number}
                  />
                </div>

                {errors.phone_number && (
                  <span className="vm-auth-error">
                    {errors.phone_number}
                  </span>
                )}
              </div>

              {/* =====================================
                  PASSWORD
              ===================================== */}

              <div className="vm-auth-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className={`vm-auth-input-box ${
                  errors.password ? "has-error" : ""
                }`}>
                  <i className="fa-solid fa-lock vm-auth-input-icon" />

                  <input
                    id="register-password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

                <span className="vm-auth-hint">
                  Use at least 8 characters.
                </span>
              </div>

              {/* =====================================
                  CONFIRM PASSWORD
              ===================================== */}

              <div className="vm-auth-field">
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>

                <div className={`vm-auth-input-box ${
                  errors.confirm_password ? "has-error" : ""
                }`}>
                  <i className="fa-solid fa-shield-halved vm-auth-input-icon" />

                  <input
                    id="register-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirm_password"
                    placeholder="Re-enter your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirm_password}
                  />

                  <button
                    type="button"
                    className="vm-auth-eye-btn"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
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

                {errors.confirm_password && (
                  <span className="vm-auth-error">
                    {errors.confirm_password}
                  </span>
                )}
              </div>

              {/* =====================================
                  REGISTER BUTTON
              ===================================== */}

              <button
                type="submit"
                className="vm-auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Please Wait...
                  </>
                ) : (
                  <>
                    Register
                    <i className="fa-solid fa-user-plus" />
                  </>
                )}
              </button>

              {/* LOGIN LINK */}
              <p className="vm-auth-switch-text">
                Already have an account?{" "}
                <Link to="/login">
                  Login
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
          REGISTRATION OTP MODAL
      ===================================== */}

      {showOtpModal && (
        <div
          className="vm-auth-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !otpLoading
            ) {
              setShowOtpModal(false);
            }
          }}
        >
          <div
            className="vm-auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-otp-title"
          >
            <button
              type="button"
              className="vm-auth-modal-close"
              onClick={() => setShowOtpModal(false)}
              disabled={otpLoading}
              aria-label="Close OTP modal"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="vm-auth-modal-icon">
              <i className="fa-solid fa-envelope-circle-check" />
            </div>

            <h3 id="register-otp-title">
              Email Verification
            </h3>

            <p className="vm-auth-modal-description">
              Enter the OTP sent to{" "}
              <strong>{formData.email}</strong>{" "}
              to verify your account.
            </p>

            <form onSubmit={verifyRegisterOtp}>
              <div className="vm-auth-field">
                <label htmlFor="register-otp">
                  Enter OTP
                </label>

                <div className="vm-auth-input-box">
                  <i className="fa-solid fa-shield-halved vm-auth-input-icon" />

                  <input
                    id="register-otp"
                    type="text"
                    placeholder="Enter your OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                    autoComplete="one-time-code"
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
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <i className="fa-solid fa-circle-check" />
                  </>
                )}
              </button>

              <button
                type="button"
                className="vm-auth-modal-cancel"
                onClick={() => setShowOtpModal(false)}
                disabled={otpLoading}
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
