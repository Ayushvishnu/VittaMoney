import { useEffect, useRef, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { createChart, LineSeries } from "lightweight-charts";

import {
  fetchProductDetails,
  fetchProductExtraDetails,
  fetchFundamentals,
  fetchGraphData,
  sendTransactionEnquiry,
} from "../../Api/productsApi";

import "./ShareDetails.css";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

// ============================================

// IMAGE URL

// ============================================

const getProductImage = (image) => {
  if (!image) return "";

  if (/^(https?:)?\/\//i.test(image)) {
    return image.startsWith("//") ? `https:${image}` : image;
  }

  return `https://vittamoney.com/${String(image).replace(/^\/+/, "")}`;
};

// ============================================

// DISPLAY VALUE

// ============================================

const displayValue = (value, prefix = "") => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return `${prefix}${value}`;
};

// ============================================

// FORMAT PRICE

// ============================================

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "N/A";

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  });
};

// ============================================

// SHARE DETAILS

// ============================================

export default function ShareDetails() {
  const { slug: productId } = useParams();

  const navigate = useNavigate();

  // GRAPH REFS

  const chartContainerRef = useRef(null);

  const chartInstanceRef = useRef(null);

  // API STATES

  const [product, setProduct] = useState(null);

  const [extraDetails, setExtraDetails] = useState(null);

  const [fundamentals, setFundamentals] = useState(null);

  const [graphData, setGraphData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [graphLoading, setGraphLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================

  // BUY / SELL ENQUIRY STATES

  // ============================================

  const [quantity, setQuantity] = useState(0);

  const [selectedAction, setSelectedAction] = useState("");

  const [content, setContent] = useState("");

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  // ============================================

  // FETCH ALL PRODUCT DATA

  // ============================================

  useEffect(() => {
    if (!productId) {
      setLoading(false);

      setGraphLoading(false);

      setError("Product ID is missing.");

      return;
    }

    let active = true;

    window.scrollTo(0, 0);

    const loadProductData = async () => {
      setLoading(true);

      setGraphLoading(true);

      setError("");

      setProduct(null);

      setExtraDetails(null);

      setFundamentals(null);

      setGraphData([]);

      const results = await Promise.allSettled([
        fetchProductDetails(productId),

        fetchProductExtraDetails(productId),

        fetchFundamentals(productId),

        fetchGraphData(productId),
      ]);

      if (!active) return;

      const [productResult, extraResult, fundamentalsResult, graphResult] =
        results;

      // ============================================

      // PRODUCT DETAILS

      // ============================================

      if (productResult.status === "fulfilled") {
        setProduct(productResult.value.data?.data ?? productResult.value.data);
      } else {
        console.error(
          "Product Details API Error:",

          productResult.reason,
        );

        setError("Unable to load product details.");
      }

      // ============================================

      // EXTRA DETAILS

      // ============================================

      if (extraResult.status === "fulfilled") {
        setExtraDetails(extraResult.value.data?.data ?? extraResult.value.data);
      } else {
        console.error(
          "Extra Details API Error:",

          extraResult.reason,
        );
      }

      // ============================================

      // FUNDAMENTALS

      // ============================================

      if (fundamentalsResult.status === "fulfilled") {
        setFundamentals(
          fundamentalsResult.value.data?.data ?? fundamentalsResult.value.data,
        );
      } else {
        console.error(
          "Fundamentals API Error:",

          fundamentalsResult.reason,
        );
      }

      // ============================================

      // GRAPH API

      // ============================================

      if (graphResult.status === "fulfilled") {
        const responseData = graphResult.value.data;

        // Supports response.data = [...]

        // OR response.data.data = [...]

        const records = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        console.log("Graph API Data:", records);

        setGraphData(records);
      } else {
        console.error(
          "Graph API Error:",

          graphResult.reason,
        );

        setGraphData([]);
      }

      setGraphLoading(false);

      setLoading(false);
    };

    loadProductData();

    return () => {
      active = false;
    };
  }, [productId]);

  // ============================================

  // CREATE GRAPH

  // ============================================

  useEffect(() => {
    if (loading || graphLoading) return;

    if (!chartContainerRef.current) return;

    if (!Array.isArray(graphData) || !graphData.length) {
      return;
    }

    const container = chartContainerRef.current;

    // ============================================

    // FORMAT API DATA

    // ============================================

    const formattedData = graphData

      .map((item) => ({
        time: item?.date,

        value: Number(item?.price),
      }))

      .filter(
        (item) =>
          typeof item.time === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(item.time) &&
          Number.isFinite(item.value),
      )

      .sort((a, b) => a.time.localeCompare(b.time));

    // ============================================

    // REMOVE DUPLICATE DATES

    // KEEP LAST PRICE

    // ============================================

    const uniqueMap = new Map();

    formattedData.forEach((item) => {
      uniqueMap.set(item.time, item);
    });

    const uniqueGraphData = Array.from(uniqueMap.values());

    if (!uniqueGraphData.length) return;

    // ============================================

    // CREATE LIGHTWEIGHT CHART

    // ============================================

    const chart = createChart(container, {
      width: container.clientWidth,

      height: container.clientHeight || 350,

      layout: {
        background: {
          color: "transparent",
        },

        textColor: "#796B70",

        fontSize: 12,
      },

      grid: {
        vertLines: {
          visible: false,
        },

        horzLines: {
          color: "rgba(141, 58, 74, 0.10)",
        },
      },

      rightPriceScale: {
        visible: true,

        borderVisible: true,

        borderColor: "#ECDADC",

        ticksVisible: true,

        scaleMargins: {
          top: 0.12,

          bottom: 0.12,
        },
      },

      timeScale: {
        visible: true,

        borderVisible: true,

        borderColor: "#ECDADC",

        ticksVisible: true,

        timeVisible: false,

        secondsVisible: false,

        barSpacing: 12,

        minBarSpacing: 5,

        rightOffset: 2,
      },

      crosshair: {
        vertLine: {
          visible: true,

          color: "rgba(141,58,74,0.35)",

          labelVisible: false,
        },

        horzLine: {
          visible: true,

          color: "rgba(141,58,74,0.35)",

          labelVisible: false,
        },
      },

      localization: {
        priceFormatter: (price) => `₹${formatPrice(price)}`,
      },
    });

    chartInstanceRef.current = chart;

    // ============================================

    // ADD LINE SERIES

    // ============================================

    const lineSeries = chart.addSeries(
      LineSeries,

      {
        color: "#8D3A4A",

        lineWidth: 3,

        crosshairMarkerVisible: true,

        crosshairMarkerRadius: 5,

        priceLineVisible: false,

        lastValueVisible: false,
      },
    );

    // ============================================

    // SET GRAPH DATA

    // ============================================

    lineSeries.setData(uniqueGraphData);

    // ============================================

    // SHOW LATEST 90 RECORDS

    // ============================================

    const showLatestRecords = () => {
      const visibleBars = Math.min(
        90,

        uniqueGraphData.length,
      );

      chart.timeScale().setVisibleLogicalRange({
        from: Math.max(
          0,

          uniqueGraphData.length - visibleBars,
        ),

        to: uniqueGraphData.length - 1,
      });
    };

    showLatestRecords();

    // ============================================

    // TOOLTIP

    // ============================================

    container.style.position = "relative";

    const tooltip = document.createElement("div");

    tooltip.className = "share-price-chart-tooltip";

    const tooltipDate = document.createElement("div");

    const tooltipPrice = document.createElement("strong");

    tooltip.appendChild(tooltipDate);

    tooltip.appendChild(tooltipPrice);

    container.appendChild(tooltip);

    // ============================================

    // CROSSHAIR MOVEMENT

    // ============================================

    const handleCrosshairMove = (param) => {
      const pointData = param.seriesData.get(lineSeries);

      if (
        !param.time ||
        !param.point ||
        !pointData ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y > container.clientHeight
      ) {
        tooltip.style.display = "none";

        return;
      }

      const time = param.time;

      const dateString =
        typeof time === "string"
          ? time
          : `${time.year}-${String(time.month).padStart(2, "0")}-${String(
              time.day,
            ).padStart(2, "0")}`;

      const date = new Date(`${dateString}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",

          month: "short",

          year: "numeric",
        },
      );

      tooltipDate.textContent = date;

      tooltipPrice.textContent = `₹ ${formatPrice(pointData.value)}`;

      tooltip.style.display = "block";

      const tooltipWidth = tooltip.offsetWidth;

      const tooltipHeight = tooltip.offsetHeight;

      const left = Math.min(
        Math.max(
          param.point.x - tooltipWidth / 2,

          8,
        ),

        Math.max(
          8,

          container.clientWidth - tooltipWidth - 8,
        ),
      );

      const top = Math.max(
        8,

        param.point.y - tooltipHeight - 22,
      );

      tooltip.style.left = `${left}px`;

      tooltip.style.top = `${top}px`;
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // ============================================

    // RESPONSIVE GRAPH

    // ============================================

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;

      const { width, height } = entries[0].contentRect;

      if (width > 0 && height > 0) {
        chart.applyOptions({
          width,

          height,
        });
      }
    });

    resizeObserver.observe(container);

    // ============================================

    // GRAPH CLEANUP

    // ============================================

    return () => {
      resizeObserver.disconnect();

      chart.unsubscribeCrosshairMove(handleCrosshairMove);

      tooltip.remove();

      chart.remove();

      if (chartInstanceRef.current === chart) {
        chartInstanceRef.current = null;
      }
    };
  }, [graphData, graphLoading, loading]);

  // ============================================

  // PAGE TITLE

  // ============================================

  useEffect(() => {
    const name = extraDetails?.heading || product?.name;

    document.title = name
      ? `${name} | VittaMoney`
      : "Unlisted Share Details | VittaMoney";
  }, [product, extraDetails]);

  // ============================================

  // INITIAL QUANTITY FROM API

  // ============================================

  useEffect(() => {
    if (product?.quantity != null) {
      setQuantity(Math.max(1, Number(product.quantity) || 1));
    }
  }, [product?.id, product?.quantity]);

  // ============================================

  // LOADING PAGE

  // ============================================

  if (loading) {
    return (
      <main className="share-details-page">
        <div className="container share-details-empty">
          <i className="fa-solid fa-spinner fa-spin" />

          <h1>Loading Company Details...</h1>

          <p>Fetching company information.</p>
        </div>
      </main>
    );
  }

  // ============================================

  // ERROR PAGE

  // ============================================

  if (error || !product) {
    return (
      <main className="share-details-page">
        <div className="container share-details-empty">
          <h1>Company Not Found</h1>

          <p>{error || "The requested company could not be found."}</p>

          <Link to="/allshares" className="share-details-primary">
            Back to Unlisted Shares
          </Link>
        </div>
      </main>
    );
  }

  // ============================================

  // API MAPPED FIELDS

  // ============================================

  const companyName =
    extraDetails?.heading || product?.name || "Unlisted Company";

  const companyDescription =
    extraDetails?.short_desc ||
    extraDetails?.description ||
    "Company description is not available.";

  const companyCategory =
    product?.category_name || product?.variant_name || "Unlisted";

  const metrics = [
    {
      label: "Category",

      value: product?.category_name,
    },

    {
      label: "Minimum Quantity",

      value: product?.quantity != null ? `${product.quantity} shares` : null,
    },

    {
      label: "Product Price",

      value: fundamentals?.product_current_price ?? product?.price,

      prefix: "₹",
    },

    {
      label: "Reference Price",

      value: fundamentals?.current_price,

      prefix: "₹",
    },

    {
      label: "Face Value",

      value: fundamentals?.face_value,

      prefix: "₹",
    },

    {
      label: "Market Cap",

      value: fundamentals?.market_cap,
    },

    {
      label: "P/E Ratio",

      value: fundamentals?.pe_ratio,
    },

    {
      label: "P/B Ratio",

      value: fundamentals?.pb_ratio,
    },

    {
      label: "Book Value",

      value: fundamentals?.book_value,

      prefix: "₹",
    },

    {
      label: "EPS",

      value: fundamentals?.eps,

      prefix: "₹",
    },

    {
      label: "Debt to Equity",

      value: fundamentals?.debt_to_equity_ratio,
    },

    {
      label: "ISIN",

      value: fundamentals?.isin,
    },
  ];

  // ============================================

  // JSX

  // ============================================

  // ============================================

  // PRODUCT PRICE AND MINIMUM QUANTITY

  // ============================================

  const unitPrice = Number(
    product?.price ?? fundamentals?.product_current_price ?? 0,
  );

  const minimumQuantity = Math.max(
    1,

    Number(product?.quantity) || 1,
  );

  const currentQuantity = Math.max(
    minimumQuantity,

    Number(quantity) || 0,
  );

  const totalAmount = currentQuantity * unitPrice;

  // ============================================

  // INCREASE QUANTITY

  // ============================================

  const increaseQuantity = () => {
    setQuantity((prev) => Math.max(minimumQuantity, Number(prev) || 0) + 1);
  };

  // ============================================

  // DECREASE QUANTITY

  // ============================================

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(
        minimumQuantity,

        (Number(prev) || minimumQuantity) - 1,
      ),
    );
  };

  // ============================================

  // BUY / SELL CLICK

  // ============================================

  const handleInvestClick = (action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/allshares/${encodeURIComponent(String(productId))}`,
        },
      });

      return;
    }

    setSelectedAction(action);

    setContent("");

    setShowEnquiryModal(true);
  };

  // ============================================

  // WHATSAPP MESSAGE

  // ============================================

  const openWhatsApp = (action, amount, messageText) => {
    const message =
      `I want to ${action.toUpperCase()} ` +
      `${currentQuantity} shares of ${product?.name}. ` +
      `Total amount: ₹${formatPrice(amount)}. ` +
      `Additional Info: ${messageText || "No additional information"}`;

    const phoneNumber = "919037954502";

    const url =
      `https://wa.me/${phoneNumber}?text=` + encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ============================================

  // SEND TRANSACTION ENQUIRY

  // ============================================

  const handleSendEnquiry = async (event) => {
    event.preventDefault();

    if (sendingEnquiry) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setShowEnquiryModal(false);

      navigate("/login", {
        state: {
          from: `/allshares/${encodeURIComponent(String(productId))}`,
        },
      });

      return;
    }

    if (!product?.id) {
      Swal.fire({
        icon: "error",

        title: "Product Not Found",

        text: "Unable to identify the selected product.",

        confirmButtonColor: "#8D3A4A",
      });

      return;
    }

    const transactionData = {
      product: product.id,

      transaction_type: selectedAction,

      quantity: currentQuantity,

      content: content,
    };

    try {
      setSendingEnquiry(true);

      const response = await sendTransactionEnquiry(
        transactionData,

        token,
      );

      if (response?.status === 200 || response?.status === 201) {
        const submittedAction = selectedAction;

        const submittedContent = content;

        const submittedAmount = totalAmount;

        setShowEnquiryModal(false);

        setContent("");

        await Swal.fire({
          icon: "success",

          title: "Enquiry Submitted",

          text: "Your enquiry has been successfully submitted!",

          confirmButtonColor: "#8D3A4A",
        });

        openWhatsApp(
          submittedAction,

          submittedAmount,

          submittedContent,
        );
      }
    } catch (error) {
      console.error("Transaction Enquiry Error:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("token");

        localStorage.removeItem("authToken");

        localStorage.removeItem("user_id");

        window.dispatchEvent(new Event("authChanged"));

        setShowEnquiryModal(false);

        await Swal.fire({
          icon: "warning",

          title: "Session Expired",

          text: "Please login again to continue.",

          confirmButtonColor: "#8D3A4A",
        });

        navigate("/login", {
          state: {
            from: `/allshares/${encodeURIComponent(String(productId))}`,
          },
        });

        return;
      }

      const errorData = error?.response?.data;

      Swal.fire({
        icon: "error",

        title: "Enquiry Failed",

        text:
          errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          "Failed to submit enquiry.",

        confirmButtonColor: "#8D3A4A",
      });
    } finally {
      setSendingEnquiry(false);
    }
  };

  return (
    <main className="share-details-page">
      <div className="container">
        {/* =====================================

            BREADCRUMB

        ===================================== */}

        <nav className="share-details-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>

          <i className="fa-solid fa-chevron-right" />

          <Link to="/allshares">Unlisted Shares</Link>

          <i className="fa-solid fa-chevron-right" />

          <span aria-current="page">{companyName}</span>
        </nav>

        {/* =====================================

            COMPANY HEADER

        ===================================== */}

        <div className="share-details-header">
          <div className="share-details-logo">
            {product?.image ? (
              <img
                src={getProductImage(product.image)}
                alt={`${companyName} logo`}
              />
            ) : (
              <span>{companyName.charAt(0)}</span>
            )}
          </div>

          <div className="share-details-heading">
            <span className="share-details-tag">UNLISTED SHARE PROFILE</span>

            <h1>{companyName}</h1>

            <p>{companyCategory}</p>
          </div>
        </div>

        {/* =====================================

            MAIN CONTENT

        ===================================== */}

        <div className="share-details-layout">
          <div className="share-details-main">
            {/* =================================

                COMPANY OVERVIEW

            ================================= */}

            <article className="share-details-card">
              <h2>About {companyName}</h2>

              <p>{companyDescription}</p>

              {extraDetails?.description &&
                extraDetails.description !== extraDetails.short_desc && (
                  <div className="share-details-full-description">
                    <h3>Company Overview</h3>

                    <p>{extraDetails.description}</p>
                  </div>
                )}
            </article>

            {/* =================================

                PRICE HISTORY GRAPH

            ================================= */}

            <article className="share-details-card share-price-chart-card">
              <div className="share-price-chart-header">
                <div>
                  <span className="share-price-chart-eyebrow">
                    <i className="fa-solid fa-chart-line" />
                    PRICE PERFORMANCE
                  </span>

                  <h2>Price History</h2>

                  <p>Historical price movement of {companyName}</p>
                </div>

                <div className="share-price-chart-current">
                  <span>Product Price</span>

                  <strong>
                    ₹{" "}
                    {formatPrice(
                      product?.price ?? fundamentals?.product_current_price,
                    )}
                  </strong>
                </div>
              </div>

              {/* GRAPH */}

              <div className="share-price-chart-box">
                {graphLoading ? (
                  <div className="share-price-chart-state" role="status">
                    <i className="fa-solid fa-spinner fa-spin" />

                    <p>Loading price history...</p>
                  </div>
                ) : graphData.length > 0 ? (
                  <div
                    ref={chartContainerRef}
                    className="share-price-chart-container"
                    aria-label={`${companyName} historical price chart`}
                  />
                ) : (
                  <div className="share-price-chart-state">
                    <i className="fa-solid fa-chart-line" />

                    <p>Price history is not available.</p>
                  </div>
                )}
              </div>

              <div className="share-price-chart-footer">
                <span>
                  <i className="fa-solid fa-circle-info" />
                  Historical prices are indicative.
                </span>

                <span>
                  <i className="fa-solid fa-arrows-left-right" />
                  Drag chart to explore history
                </span>
              </div>
            </article>

            {/* =================================

                FUNDAMENTALS

            ================================= */}

            <article className="share-details-card">
              <h2>Company Fundamentals</h2>

              <div className="share-details-metrics">
                {metrics.map((metric) => (
                  <div key={metric.label} className="share-details-metric">
                    <span>{metric.label}</span>

                    <strong>
                      {displayValue(
                        metric.value,

                        metric.prefix,
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            </article>

            {/* =================================

                RISK NOTICE

            ================================= */}

          </div>

          {/* =====================================

              SIDEBAR

          ===================================== */}

          {/* <aside className="share-details-sidebar">



            <div className="share-details-card">



              <h3>Interested in this Company?</h3>



              <p>

                Explore the company information and contact

                our team for availability and pricing.

              </p>



              <button

                type="button"

                className="share-details-primary"

                onClick={() =>

                  alert(

                    `Thank you for your interest in ${companyName}. A representative will guide you through current availability and pricing.`

                  )

                }

              >

                Inquire Now



                <i className="fa-solid fa-arrow-right" />

              </button>



              <Link

                to="/allshares"

                className="share-details-back"

              >

                <i className="fa-solid fa-arrow-left" />

                Explore Other Shares

              </Link>



            </div>



          </aside> */}

          {/* ============================================

    BUY / SELL ENQUIRY SIDEBAR

\============================================ */}

          <aside className="share-details-sidebar">
            <div className="share-details-card vm-invest-card">
              {/* COMPANY NAME */}

              <h3 className="vm-invest-company-name">{companyName}</h3>

              {/* PRODUCT INFORMATION */}

              <div className="vm-invest-info-grid">
                <div className="vm-invest-info-box">
                  <span>Price per unit</span>

                  <strong>₹{formatPrice(unitPrice)}</strong>
                </div>

                <div className="vm-invest-info-box">
                  <span>Settlement Period</span>

                  <strong>T + 7 Days</strong>
                </div>

                <div className="vm-invest-info-box">
                  <span>Min Units</span>

                  <strong>{minimumQuantity}</strong>
                </div>
              </div>

              {/* DIVIDER */}

              <div className="vm-invest-divider" />

              {/* QUANTITY SELECTOR */}

              <div className="vm-invest-quantity">
                <button
                  type="button"
                  className="vm-invest-qty-btn vm-invest-minus"
                  onClick={decreaseQuantity}
                  disabled={currentQuantity <= minimumQuantity}
                  aria-label="Decrease quantity"
                >
                  <i className="fa-solid fa-minus" />
                </button>

                <span className="vm-invest-qty-value">{currentQuantity}</span>

                <button
                  type="button"
                  className="vm-invest-qty-btn vm-invest-plus"
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                >
                  <i className="fa-solid fa-plus" />
                </button>
              </div>

              {/* TOTAL AMOUNT */}

              <div className="vm-invest-total">
                <span>Total Amount</span>

                <strong>₹{formatPrice(totalAmount)}</strong>
              </div>

              {/* BUY AND SELL BUTTONS */}

              <div className="vm-invest-action-buttons">
                <button
                  type="button"
                  className="vm-invest-buy-btn"
                  onClick={() => handleInvestClick("buy")}
                >
                  BUY
                </button>

                <button
                  type="button"
                  className="vm-invest-sell-btn"
                  onClick={() => handleInvestClick("sell")}
                >
                  SELL
                </button>
              </div>

              {/* EXPLORE OTHER SHARES */}

              <Link
                to="/allshares"
                className="share-details-back vm-invest-back"
              >
                <i className="fa-solid fa-arrow-left" />
                Explore Other Shares
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ============================================

    BUY / SELL ENQUIRY MODAL

\============================================ */}

      {showEnquiryModal && (
        <div
          className="vm-invest-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !sendingEnquiry) {
              setShowEnquiryModal(false);
            }
          }}
        >
          <div
            className="vm-invest-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vm-invest-modal-title"
          >
            {/* MODAL HEADER */}

            <div className="vm-invest-modal-header">
              <div>
                <span className="vm-invest-modal-badge">
                  VITTAMONEY ENQUIRY
                </span>

                <h3 id="vm-invest-modal-title">
                  {selectedAction === "buy" ? "Buy Enquiry" : "Sell Enquiry"}
                </h3>
              </div>

              <button
                type="button"
                className="vm-invest-modal-close"
                onClick={() => setShowEnquiryModal(false)}
                disabled={sendingEnquiry}
                aria-label="Close enquiry"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* MODAL BODY */}

            <form onSubmit={handleSendEnquiry}>
              <div className="vm-invest-modal-body">
                <div className="vm-invest-modal-row">
                  <span>Product</span>

                  <strong>{companyName}</strong>
                </div>

                <div className="vm-invest-modal-row">
                  <span>Action</span>

                  <strong
                    className={
                      selectedAction === "buy"
                        ? "vm-invest-buy-text"
                        : "vm-invest-sell-text"
                    }
                  >
                    {selectedAction?.toUpperCase()}
                  </strong>
                </div>

                <div className="vm-invest-modal-row">
                  <span>Quantity</span>

                  <strong>{currentQuantity}</strong>
                </div>

                <div className="vm-invest-modal-row">
                  <span>Price Per Unit</span>

                  <strong>₹{formatPrice(unitPrice)}</strong>
                </div>

                <div className="vm-invest-modal-row">
                  <span>Total Amount</span>

                  <strong className="vm-invest-total-text">
                    ₹{formatPrice(totalAmount)}
                  </strong>
                </div>

                {/* MESSAGE */}

                <div className="vm-invest-modal-field">
                  <label htmlFor="vm-invest-content">Additional Message</label>

                  <textarea
                    id="vm-invest-content"
                    rows={4}
                    placeholder="Leave a message here (optional)"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div className="vm-invest-modal-footer">
                <button
                  type="button"
                  className="vm-invest-modal-cancel"
                  onClick={() => setShowEnquiryModal(false)}
                  disabled={sendingEnquiry}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vm-invest-modal-submit"
                  disabled={sendingEnquiry}
                >
                  {sendingEnquiry ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Enquiry
                      <i className="fa-solid fa-arrow-right" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
