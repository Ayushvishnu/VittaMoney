
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { getProfile, getTransactions } from "../../Api/profileApi";
import "./Portfolio.css";

// ==========================================
// CONSTANTS
// ==========================================

const API_URL = import.meta.env.VITE_API_URL;
const ACCOUNTS_URL = import.meta.env.VITE_API_PATH_ACCOUNTS;
const SITE_URL = "https://vittamoney.com";

// ==========================================
// HELPERS
// ==========================================

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatAmount = (value) =>
  getNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (image.startsWith("//")) return `https:${image}`;

  return `${SITE_URL}/${image.replace(/^\/+/, "")}`;
};

const getTransactionList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const getVariantName = (transaction) =>
  String(
    transaction?.variant_name ??
      transaction?.product_type ??
      transaction?.product?.variant_name ??
      transaction?.product?.variant?.name ??
      ""
  )
    .trim()
    .toLowerCase();

const getProductName = (transaction) =>
  transaction?.product_name ??
  transaction?.product?.name ??
  "Product";

const getProductImage = (transaction) =>
  getImageUrl(
    transaction?.product_image ??
      transaction?.product?.image ??
      ""
  );

// const getTransactionPL = (transaction) =>
//   (getNumber(transaction?.current_price) -
//     getNumber(transaction?.price_at_request)) *
//   getNumber(transaction?.quantity);



const getTransactionPL = (transaction) => {
  const currentPrice = getNumber(transaction?.current_price);
  const quantity = getNumber(transaction?.quantity);

  return currentPrice * quantity;
};


const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  const message =
    data?.message ??
    data?.detail ??
    data?.error ??
    fallback;

  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");

  return fallback;
};

// ==========================================
// PORTFOLIO COMPONENT
// ==========================================

function Portfolio() {
  const navigate = useNavigate();
  const location = useLocation();

// ==========================================
// LOGOUT FUNCTION
// ==========================================

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user_id");

  window.dispatchEvent(new Event("authChanged"));

  navigate("/", { replace: true });
};

  const fileInputRef = useRef(null);

  // ==========================================
  // STATES
  // ==========================================

  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [expandedTransactionId, setExpandedTransactionId] =
    useState(null);

  const [transactionDetails, setTransactionDetails] =
    useState({});

  const [detailsLoading, setDetailsLoading] =
    useState(false);


  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const getUserId = () =>
    localStorage.getItem("user_id");

  const getAuthHeaders = () => ({
    Authorization: `Token ${getToken()}`,
  });

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user_id");

    navigate("/login", {
      replace: true,
      state: { from: location.pathname },
    });
  };

  // ==========================================
  // INITIAL API LOAD
  // ==========================================

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!getToken()) {
      navigate("/login", {
        replace: true,
        state: { from: "/portfolio" },
      });
      return;
    }

    let active = true;

    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setPageError("");

        const userId = getUserId();

        const [profileResult, transactionsResult] =
          await Promise.allSettled([
            userId
              ? getProfile(userId)
              : Promise.resolve(null),
            getTransactions(),
          ]);

        if (!active) return;

        const profileError =
          profileResult.status === "rejected"
            ? profileResult.reason
            : null;

        const transactionError =
          transactionsResult.status === "rejected"
            ? transactionsResult.reason
            : null;

        if (
          profileError?.response?.status === 401 ||
          transactionError?.response?.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (profileResult.status === "fulfilled") {
          const profileResponse = profileResult.value;

          if (profileResponse) {
            const profileData =
              profileResponse?.data?.data ??
              profileResponse?.data ??
              null;

            setProfile(profileData);
            setProfileImage(
              getImageUrl(profileData?.image)
            );
          }
        }

        if (transactionsResult.status === "fulfilled") {
          const transactionData = getTransactionList(
            transactionsResult.value
          );

          // const purchasedTransactions =
          //   transactionData.filter(
          //     (transaction) =>
          //       String(
          //         transaction?.transaction_type ?? ""
          //       ).toLowerCase() === "buy"
          //   );

          // setTransactions(purchasedTransactions);
          
const purchasedTransactions = transactionData.filter(
  (transaction) => {
    const type = String(
      transaction?.transaction_type ?? ""
    ).trim().toLowerCase();

    return type === "buy" || type === "bond";
  }
);

setTransactions(purchasedTransactions);

        } else {
          setPageError(
            getErrorMessage(
              transactionError,
              "Failed to load transactions."
            )
          );
        }

        if (profileError) {
          console.error("Profile API Error:", profileError);
          setPageError((previous) =>
            previous
              ? `${previous} Profile details could not be loaded.`
              : "Profile details could not be loaded."
          );
        }
      } catch (error) {
        console.error("Portfolio Error:", error);

        if (active) {
          setPageError("Unable to load portfolio.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPortfolio();

    return () => {
      active = false;
    };
  }, [navigate, location.pathname]);

  // ==========================================
  // UPDATE PROFILE PHOTO
  // ==========================================

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    const userId = getUserId();

    if (!file || !userId || !getToken()) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Please select an image.",
        confirmButtonColor: "#8D3A4A",
      });
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const previousImage = profileImage;

    setProfileImage(previewUrl);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.patch(
        `${ACCOUNTS_URL}profiles/${userId}/`,
        formData,
        {
          headers: getAuthHeaders(),
        }
      );

      const updatedProfile =
        response?.data?.data ?? response?.data;

      setProfile((previous) => ({
        ...previous,
        ...updatedProfile,
      }));

      setProfileImage(
        getImageUrl(updatedProfile?.image) ||
          previousImage
      );

      Swal.fire({
        icon: "success",
        title: "Profile Photo Updated",
        confirmButtonColor: "#8D3A4A",
      });
    } catch (error) {
      console.error("Photo update error:", error);

      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setProfileImage(previousImage);

      Swal.fire({
        icon: "error",
        title: "Photo Update Failed",
        text: getErrorMessage(
          error,
          "Unable to update profile photo."
        ),
        confirmButtonColor: "#8D3A4A",
      });
    } finally {
      event.target.value = "";
      URL.revokeObjectURL(previewUrl);
    }
  };

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalBalance = transactions.reduce(
    (total, transaction) =>
      total +
      getNumber(transaction?.current_price) *
        getNumber(transaction?.quantity),
    0
  );

  const totalPL = transactions.reduce(
    (total, transaction) =>
      total + getTransactionPL(transaction),
    0
  );

  const unlistedTransactions = transactions.filter(
    (transaction) =>
      getVariantName(transaction) === "unlisted"
  );

  const bondTransactions = transactions.filter(
    (transaction) =>
      getVariantName(transaction) === "bond"
  );

  // ==========================================
  // FETCH TRANSACTION DETAILS
  // ==========================================

  const fetchTransactionDetails = async (id) => {
    try {
      setDetailsLoading(true);

      const response = await axios.get(
        `${API_URL}transactions/${id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

      setTransactionDetails(
        response?.data?.data ?? response?.data ?? {}
      );
    } catch (error) {
      console.error("Transaction Details Error:", error);

      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setExpandedTransactionId(null);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Details",
        text: getErrorMessage(
          error,
          "Failed to load transaction details."
        ),
        confirmButtonColor: "#8D3A4A",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleTransactionClick = (transaction) => {
    if (expandedTransactionId === transaction?.id) {
      setExpandedTransactionId(null);
      setTransactionDetails({});
      return;
    }

    setExpandedTransactionId(transaction?.id);
    setTransactionDetails({});

    fetchTransactionDetails(transaction?.id);
  };




  const renderTransactions = (transactionList) => {
    if (transactionList.length === 0) {
      return (
        <div className="vm-empty-bar">
          <i className="fa-solid fa-inbox" />
          <span>No holdings available</span>
        </div>
      );
    }

    return transactionList.map((transaction) => {
      const isExpanded =
        expandedTransactionId === transaction?.id;

      const profitLoss = getTransactionPL(transaction);
      const productImage = getProductImage(transaction);













      return (
        <div
          key={transaction?.id}
          className="vm-transaction-item"
        >
          {/* TRANSACTION ROW */}

          <button
            type="button"
            className="vm-transaction-row"
            onClick={() =>
              handleTransactionClick(transaction)
            }
            aria-expanded={isExpanded}
          >
            <span className="vm-transaction-company">
              <span className="vm-transaction-logo">
                {productImage ? (
                  <img
                    src={productImage}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <i className="fa-solid fa-building" />
                )}
              </span>

              <span className="vm-transaction-name">
                {getProductName(transaction)}
              </span>
            </span>

            <span className="vm-transaction-right">
              <span
                className={
                  profitLoss >= 0
                    ? "vm-amount-positive"
                    : "vm-amount-negative"
                }
              >
                P/L: ₹{formatAmount(profitLoss)}
              </span>

              <i
                className={`fa-solid ${
                  isExpanded
                    ? "fa-chevron-up"
                    : "fa-chevron-down"
                }`}
              />
            </span>
          </button>

          {/* EXPANDED TRANSACTION DETAILS */}

          {isExpanded && (
            <div className="vm-transaction-details">
              {detailsLoading ? (
                <div className="vm-transaction-loading">
                  <i className="fa-solid fa-spinner fa-spin" />
                  Loading details...
                </div>
              ) : (
                <>
                  <div className="vm-transaction-detail-row">
                    <span>Type</span>
                    <strong>
                      {transactionDetails?.transaction_type ??
                        "N/A"}
                    </strong>
                  </div>

                  <div className="vm-transaction-detail-row">
                    <span>Buying Price</span>
                    <strong>
                      ₹{formatAmount(
                        transactionDetails?.price_at_request
                      )}
                    </strong>
                  </div>

                  <div className="vm-transaction-detail-row">
                    <span>Quantity</span>
                    <strong>
                      {transactionDetails?.quantity ?? 0}
                    </strong>
                  </div>

                  <div className="vm-transaction-detail-row">
                    <span>Current Price</span>
                    <strong>
                      ₹{formatAmount(
                        transactionDetails?.current_price
                      )}
                    </strong>
                  </div>

                  <div className="vm-transaction-detail-row">
                    <span>Total</span>
                    <strong>
                      ₹{formatAmount(
                        getNumber(
                          transactionDetails?.current_price
                        ) *
                          getNumber(
                            transactionDetails?.quantity
                          )
                      )}
                    </strong>
                  </div>

                  <div className="vm-transaction-detail-row">
                    <span>P/L</span>
                    <strong
                      className={
                        getTransactionPL(transactionDetails) >= 0
                          ? "vm-amount-positive"
                          : "vm-amount-negative"
                      }
                    >
                      ₹{formatAmount(
                        getTransactionPL(transactionDetails)
                      )}
                    </strong>
                  </div>

                  {/* <button
                    type="button"
                    className="vm-change-photo-btn vm-sell-btn"
                    onClick={() => openSellModal(transaction)}
                  >
                    <i className="fa-solid fa-arrow-right-arrow-left" />
                    Sell
                  </button> */}
                </>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="vm-portfolio-page">
        <div className="vm-portfolio-loading">
          <i className="fa-solid fa-spinner fa-spin" />
          <p>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="vm-portfolio-page">

      {/* OPTIONAL BACKGROUND DECORATION */}

      <div
        className="vm-portfolio-background"
        aria-hidden="true"
      />

      <div className="container vm-portfolio-container">

        {/* PAGE TITLE */}

        <div className="vm-portfolio-top">
          <span className="vm-portfolio-eyebrow">
            <i className="fa-solid fa-chart-pie" />
            YOUR INVESTMENT OVERVIEW
          </span>

          <h1 className="vm-portfolio-title">
            My Portfolio
          </h1>

          <p>
            View your profile, account summary, and
            investment holdings.
          </p>
        </div>

        {/* API ERROR */}

        {pageError && (
          <div
            className="vm-portfolio-error"
            role="alert"
          >
            <i className="fa-solid fa-circle-exclamation" />
            {pageError}
          </div>
        )}

        <div className="vm-portfolio-grid">

          {/* =====================================
              LEFT PROFILE CARD
          ===================================== */}

          <div className="vm-profile-card">
            <div className="vm-profile-header">
              <h3>My Profile</h3>
            </div>

            <div className="vm-profile-body">
              <div className="vm-profile-image-wrapper">

                <div className="vm-profile-image">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profile?.username || "Profile"}
                    />
                  ) : (
                    <i className="fa-regular fa-user" />
                  )}
                </div>

                <button
                  type="button"
                  className="vm-change-photo-btn"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <i className="fa-solid fa-camera" />
                  Change Photo
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              <h4 className="vm-profile-name">
                {profile?.username || "User"}
              </h4>

              <div className="vm-profile-info">

                {/* PHONE */}

                <div className="vm-info-box">
                  <i className="fa-solid fa-phone" />
                  <span>
                    {profile?.phone_number ||
                      "No phone number"}
                  </span>
                </div>

                {/* EMAIL */}

                <div className="vm-info-box">
                  <i className="fa-solid fa-envelope" />
                  <span>
                    {profile?.email || "No email"}
                  </span>
                </div>

                {/* ADDRESS */}

                {/* {profile?.address && (
                  <div className="vm-info-box">
                    <i className="fa-solid fa-location-dot" />
                    <span>{profile.address}</span>
                  </div>
                )}
              </div>
            </div> */}

{/* ADDRESS */}

{profile?.address && (
  <div className="vm-info-box">
    <i className="fa-solid fa-location-dot" />
    <span>{profile.address}</span>
  </div>
)}

</div>

{/* LOGOUT BUTTON BELOW PROFILE DETAILS */}

<button
  type="button"
  className="vm-profile-logout-btn"
  onClick={handleLogout}
>
  <i className="fa-solid fa-arrow-right-from-bracket" />
  Logout
</button>

</div>


          </div>

          {/* =====================================
              RIGHT CONTENT
          ===================================== */}

          <div className="vm-portfolio-right">

            {/* ACCOUNT SUMMARY */}

            <div className="vm-summary-card">
              <div className="vm-summary-header">
                Account Summary
              </div>

              <div className="vm-summary-body">
                <div className="vm-summary-row">
                  <span>Total Balance</span>

                  <strong className="vm-amount-positive">
                    ₹{formatAmount(totalBalance)}
                  </strong>
                </div>

                <div className="vm-summary-divider" />

                <div className="vm-summary-row">
                  <span>Total P/L</span>

                  <strong
                    className={
                      totalPL >= 0
                        ? "vm-amount-positive"
                        : "vm-amount-negative"
                    }
                  >
                    ₹{formatAmount(totalPL)}
                  </strong>
                </div>
              </div>
            </div>

            {/* UNLISTED */}

            <div className="vm-portfolio-box">
              <div className="vm-portfolio-box-header">
                <h3>Unlisted</h3>

                <span className="vm-portfolio-count">
                  {unlistedTransactions.length} Holdings
                </span>
              </div>

              <div className="vm-portfolio-box-content">
                {renderTransactions(unlistedTransactions)}
              </div>
            </div>

           

           
          </div>
        </div>
      </div>



    </div>
  );
}

export default Portfolio;
