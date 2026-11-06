import { useState, useEffect, useRef, useId } from "react";
import { useNavigate } from "react-router-dom";

import { fetchHomeData } from "../../Api/categoryApi";
import { fetchBanner } from "../../Api/BannerApi";
import { Helmet } from "react-helmet-async";

import DiwaliEffect from "../DiwaliEffect/DiwaliEffect";
import AnimatedCounter from "../AnimatedCounter/AnimatedCounter";
import "./Hero.css";

// ==========================================
// WHY CHOOSE FEATURES
// ==========================================

const FEATURES = [
  {
    id: "discover",
    icon: <i className="fa-solid fa-file-circle-check" />,
    title: "Paper Share to Demat Conversion",
    body: "Still holding old physical (paper) shares? No worries—we’ll help you convert them into demat form smoothly and legally through our trusted network.",
  },
  {
    id: "info",
    icon: <i className="fa-solid fa-gift" />,
    title: "Reward Points Program",
    body: "Every investment with Vittamoney earns you reward points. You can redeem these points at: Vittafin Securities. Vittafin Academy It’s our way of giving back to our valued investors.",
  },
  {
    id: "simple",
    icon: <i className="fa-solid fa-headset" />,
    title: "Dedicated On-Call Support",
    body: "Got doubts about unlisted shares? Want to sell your holdings or need investment consultation? Our expert team is just a call away to guide and support you anytime.",
  },
  {
    id: "support",
    icon: <i className="fa-solid fa-hand-holding-dollar" />,
    title: "Zero Brokerage & No Hidden Charges",
    body: "Buy unlisted shares from Vittamoney with zero brokerage. Plus, enjoy pre-sale and post-sale support—completely free of cost. We believe in transparent and investor-friendly service.",
  },
];

// ==========================================
// WHAT ARE UNLISTED SHARES
// ==========================================



const POINTS = [
  {
    id: "early-stage",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.5V12l3.7 2.4" />
      </svg>
    ),
    heading: "Early-Stage Access",
    text: "Explore ownership opportunities in companies before they enter the public stock market.",
  },
  {
    id: "diversification",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </svg>
    ),
    heading: "Portfolio Diversification",
    text: "Discover alternative equity opportunities across different industries and business sectors.",
  },
  {
    id: "pre-ipo",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 15c-1.5 1.5-2 4-2 6 2-.2 4.5-.7 6-2" />
        <path d="M14 5c3.5-2 6-2 8-2 0 2 0 4.5-2 8l-6 6-5-5 5-7Z" />
        <circle cx="17" cy="7.5" r="1.5" />
        <path d="m9 12-3 1-3 4 5-1M12 15l-1 3-4 3 1-5" />
      </svg>
    ),
    heading: "Pre-IPO Opportunities",
    text: "Explore companies preparing for a potential transition into the public market.",
  },
  {
    id: "long-term-growth",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 20h18" />
        <rect x="4" y="14" width="3" height="6" rx=".4" />
        <rect x="10" y="10" width="3" height="10" rx=".4" />
        <rect x="16" y="6" width="3" height="14" rx=".4" />
        <path d="m3 11 6-5 4 2 7-6" />
        <path d="M16 2h4v4" />
      </svg>
    ),
    heading: "Long-Term Growth Exposure",
    text: "Participate in the growth journey of selected private businesses as a shareholder.",
  },
  {
    id: "valuations",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 2 2.6 1.4 3 .3 1.3 2.7 2.3 2-.5 3 .5 3-2.3 2-1.3 2.7-3 .3L12 22l-2.6-1.4-3-.3-1.3-2.7-2.3-2 .5-3-.5-3 2.3-2 1.3-2.7 3-.3L12 2Z" />
        <path d="M9 8h6M9 11h6M11 8c3 0 3 4 0 4H9l5 4" />
      </svg>
    ),
    heading: "Private Market Valuations",
    text: "Evaluate company valuations and indicative share prices before making investment decisions.",
  },
  {
    id: "market-discovery",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10.5" cy="10.5" r="7.5" />
        <path d="m16 16 5 5" />
      </svg>
    ),
    heading: "Exclusive Market Discovery",
    text: "Discover investment opportunities that are not commonly available through public exchanges.",
  },
];

// ==========================================
// IMAGE URL
// ==========================================

const getProductImage = (image) => {
  if (!image || typeof image !== "string") return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("//")) {
    return `https:${image}`;
  }

  return `https://vittamoney.com/${image.replace(/^\/+/, "")}`;
};

// ==========================================
// EDUCATION VIDEO DATA
// ==========================================

const educationVideos = [
  {
    id: 1,
    title: "What are Unlisted Shares ?",
    type: "horizontal",
    embed: "https://www.youtube.com/embed/wnIqT7uXDes?si=Bx5ftwJhOAd4nOno",
  },
  {
    id: 2,
    title: "Cochin International Airport (CIAL) Unlisted Shares",
    type: "portrait",
    embed: "https://youtube.com/shorts/UKZd8vDu6XE?is=DvPuTjNUFZJQrKig",
  },
  {
    id: 3,
    title: "Kannur International Airport (KIAL) Unlisted Shares",
    type: "portrait",
    embed: "https://youtube.com/shorts/hgPhQqOx9EY?is=1E91px3899iHGhZ2",
  },
  {
    id: 4,
    title: "Metropolitan Stock Exchange (MSEI) Unlisted Shares",
    type: "portrait",
    embed: "https://youtube.com/shorts/h2OHLH5-Mpo?is=zv1NocLr9WY_wgnm",
  },
  {
    id: 5,
    title: "Lakeshore Hospital Unlisted Shares",
    type: "portrait",
    embed: "https://youtube.com/shorts/hq2184KXgD4?is=Tv6rp17YtE_6xII2",
  },
  {
    id: 6,
    title: "Learn with VittaMoney",
    type: "horizontal",
    embed: "",
  },
];

// ==========================================
// YOUTUBE VIDEO ID
// ==========================================

const getYouTubeId = (value) => {
  if (!value) return "";

  const source = String(value).trim();
  const iframeSrc = source.match(/src=["']([^"']+)["']/i);
  const raw = iframeSrc ? iframeSrc[1] : source;

  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "youtu.be",
      "www.youtu.be",
    ];

    if (!allowedHosts.includes(host)) return "";

    const parts = url.pathname.split("/").filter(Boolean);

    const id = host.endsWith("youtu.be")
      ? parts[0]
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : ["embed", "shorts", "live"].includes(parts[0])
          ? parts[1]
          : "";

    return /^[\w-]{11}$/.test(id || "") ? id : "";
  } catch {
    return "";
  }
};

// ==========================================
// ORBIT PARTICLES
// ==========================================

const PARTICLES = [
  {
    id: 1,
    top: "12%",
    left: "8%",
    size: 4,
    duration: "6s",
    delay: "0s",
    opacity: 0.6,
  },
  {
    id: 2,
    top: "22%",
    left: "88%",
    size: 6,
    duration: "7s",
    delay: "1s",
    opacity: 0.8,
  },
  {
    id: 3,
    top: "68%",
    left: "6%",
    size: 5,
    duration: "5s",
    delay: "2s",
    opacity: 0.7,
  },
  {
    id: 4,
    top: "78%",
    left: "92%",
    size: 4,
    duration: "8s",
    delay: "0.5s",
    opacity: 0.5,
  },
  {
    id: 5,
    top: "15%",
    left: "45%",
    size: 3,
    duration: "6.5s",
    delay: "3s",
    opacity: 0.6,
  },
  {
    id: 6,
    top: "85%",
    left: "50%",
    size: 5,
    duration: "7.5s",
    delay: "1.5s",
    opacity: 0.8,
  },
  {
    id: 7,
    top: "38%",
    left: "95%",
    size: 3,
    duration: "5.5s",
    delay: "2.5s",
    opacity: 0.5,
  },
  {
    id: 8,
    top: "50%",
    left: "3%",
    size: 6,
    duration: "6.8s",
    delay: "0.8s",
    opacity: 0.7,
  },
];

// ==========================================
// ORBIT API DATA MAPPING
// ==========================================

// No hardcoded company data.
// Only use products returned by fetchHomeData().
//
// Limit orbit display to 12 items for readability.
// Remaining products are still available in /allshares.

const buildOrbitCompanies = (products = []) => {
  const validProducts = Array.isArray(products)
    ? products.filter((product) => product?.id)
    : [];

  const selectedProducts = validProducts.slice(0, 12);

  const ringNames = ["outer", "middle", "inner"];

  const ringCounts = {
    outer: 0,
    middle: 0,
    inner: 0,
  };

  selectedProducts.forEach((_, index) => {
    const ring = ringNames[index % 3];
    ringCounts[ring] += 1;
  });

  const ringPositions = {
    outer: 0,
    middle: 0,
    inner: 0,
  };

  return selectedProducts.map((product, index) => {
    const orbit = ringNames[index % 3];

    const position = ringPositions[orbit]++;

    const angle =
      (360 / ringCounts[orbit]) * position -
      90 +
      (orbit === "middle" ? 25 : orbit === "inner" ? 45 : 0);

    const category =
      product?.category_name ??
      product?.category?.name ??
      product?.sector ??
      "";

    return {
      id: product?.id,
      name: product?.name ?? "Unlisted Company",
      image: product?.image ?? null,
      sector:
        typeof category === "string" && category.trim()
          ? category.trim()
          : "Unlisted Shares",
      lotSize: product?.quantity ?? null,
      price: product?.price ?? null,
      orbit,
      angle,
    };
  });
};

// ==========================================
// ORBIT NODE
// ==========================================

function OrbitNode({ company, onSelect, onActivate, onDeactivate }) {
  return (
    <div
      className="orbit-node-anchor"
      style={{
        transform: `rotate(${company.angle}deg) translate(var(--orbit-current-radius)) rotate(-${company.angle}deg)`,
      }}
    >
      <button
        type="button"
        className="orbit-node"
        onMouseEnter={() => onActivate(company)}
        onMouseLeave={onDeactivate}
        onFocus={() => onActivate(company)}
        onBlur={onDeactivate}
        onClick={() => onSelect(company?.id)}
        aria-label={`View ${company?.name ?? "company"} details`}
      >
        <span className="orbit-node__bubble">
          {company?.image ? (
            <img
              src={getProductImage(company.image)}
              alt={company?.name ?? "Company"}
              className="orbit-node__img"
              loading="lazy"
            />
          ) : (
            <span className="orbit-node__icon">
              {(company?.name ?? "V").charAt(0).toUpperCase()}
            </span>
          )}
        </span>

        <span className="orbit-node__label">{company?.name ?? "Company"}</span>
      </button>
    </div>
  );
}

// ==========================================
// HERO COMPONENT
// ==========================================

export default function Hero() {
  const navigate = useNavigate();
  const tooltipId = useId();

  // HOME API

  const [homeData, setHomeData] = useState(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState("");

  // PRODUCT FILTERS

  const [activeFilter, setActiveFilter] = useState("All");

  // BANNER

  const [banner, setBanner] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const bannerAutoCloseTimerRef = useRef(null);

  // WHY CHOOSE

  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURES[activeIndex];

  // VIDEO POPUP

  const [activeEducationVideo, setActiveEducationVideo] = useState(null);

  const videoCloseRef = useRef(null);

  // ORBIT STATES

  const [activeCompany, setActiveCompany] = useState(null);
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);

  // ==========================================
  // GET HOME PRODUCTS API
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const getHomeData = async () => {
      try {
        setHomeLoading(true);
        setHomeError("");

        const response = await fetchHomeData();

        if (isMounted) {
          setHomeData(response);
        }
      } catch (error) {
        console.error("HOME API ERROR:", error);

        if (isMounted) {
          setHomeError("Unable to load unlisted shares.");
        }
      } finally {
        if (isMounted) {
          setHomeLoading(false);
        }
      }
    };

    getHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================
  // FETCH BANNER
  // ==========================================

  useEffect(() => {
    if (homeLoading) return;

    let active = true;

    const loadBanner = async () => {
      try {
        const res = await fetchBanner();

        if (
          !active ||
          res?.statuscode !== 200 ||
          !Array.isArray(res?.data) ||
          res.data.length === 0
        ) {
          return;
        }

        const firstBanner = res?.data?.[0];

        if (!firstBanner?.image) return;

        if (sessionStorage.getItem("bannerShown")) return;

        setBanner(firstBanner);
        setShowBanner(true);

        sessionStorage.setItem("bannerShown", "true");

        clearTimeout(bannerAutoCloseTimerRef.current);

        bannerAutoCloseTimerRef.current = setTimeout(() => {
          if (active) {
            setShowBanner(false);
          }
        }, 10000);
      } catch (error) {
        console.error("Banner API Error:", error);
      }
    };

    loadBanner();

    return () => {
      active = false;
      clearTimeout(bannerAutoCloseTimerRef.current);
    };
  }, [homeLoading]);

  // ==========================================
  // CLOSE BANNER
  // ==========================================

  const closeBanner = () => {
    setShowBanner(false);

    clearTimeout(bannerAutoCloseTimerRef.current);

    bannerAutoCloseTimerRef.current = null;
  };

  // ==========================================
  // API PRODUCTS MAPPING
  // ==========================================

  const unlistedProducts = Array.isArray(homeData?.data?.products)
    ? homeData.data.products.filter((item) => item?.variant_name === "Unlisted")
    : [];

  // ==========================================
  // TRENDING PRODUCTS — is_hot TRUE ONLY
  // ==========================================

  const trendingProducts = unlistedProducts.filter(
    (product) => product?.is_hot === true,
  );

  // ==========================================
  // CATEGORY MAPPING
  // ==========================================

  const getCategory = (product) => {
    const category =
      product?.category_name ??
      product?.category?.name ??
      product?.sector ??
      "";

    return typeof category === "string" ? category.trim() : "";
  };

  const categories = [
    "All",
    ...new Set(unlistedProducts.map(getCategory).filter(Boolean)),
  ];

  // ==========================================
  // FILTERED PRODUCTS
  // ==========================================

  const filteredProducts =
    activeFilter === "All"
      ? unlistedProducts
      : unlistedProducts.filter(
          (product) => getCategory(product) === activeFilter,
        );

  const displayedProducts = filteredProducts.slice(0, 9);

  // ==========================================
  // ORBIT COMPANIES FROM SAME HOME API
  // ==========================================

  const orbitCompanies = buildOrbitCompanies(unlistedProducts);

  const outerCompanies = orbitCompanies.filter(
    (company) => company?.orbit === "outer",
  );

  const middleCompanies = orbitCompanies.filter(
    (company) => company?.orbit === "middle",
  );

  const innerCompanies = orbitCompanies.filter(
    (company) => company?.orbit === "inner",
  );

  // ==========================================
  // NAVIGATION
  // ==========================================

  const scrollTo = (id) => {
    const el = document.querySelector(id);

    el?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleViewAll = () => {
    navigate("/allshares");
  };

  const productDetails = (productId) => {
    if (!productId) return;

    navigate(`/allshares/${encodeURIComponent(String(productId))}`);
  };

  const handleFeatureClick = (index) => {
    setActiveIndex(index);
  };

  // ==========================================
  // ORBIT HANDLERS
  // ==========================================

  const handleOrbitActivate = (company) => {
    setIsOrbitPaused(true);
    setActiveCompany(company);
  };

  const handleOrbitDeactivate = () => {
    setActiveCompany(null);
  };

  const handleOrbitLeave = () => {
    setIsOrbitPaused(false);
    setActiveCompany(null);
  };

  // ==========================================
  // VIDEO HANDLERS
  // ==========================================

  const openEducationVideo = (video) => {
    const videoId = getYouTubeId(video?.embed);

    if (!videoId) return;

    setActiveEducationVideo({
      ...video,
      videoId,
    });
  };

  const closeEducationVideo = () => {
    setActiveEducationVideo(null);
  };

  useEffect(() => {
    if (!activeEducationVideo) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    videoCloseRef.current?.focus();

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveEducationVideo(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeEducationVideo]);

  // ==========================================
  // JSX
  // ==========================================

  return (
    <>
      {/* =====================================
          HERO SECTION
      ===================================== */}

<Helmet>
  <title>VittaMoney | Unlisted Shares & Pre-IPO Opportunities</title>
  <meta
    name="description"
    content="Explore unlisted shares and discover pre-IPO investment opportunities with VittaMoney."
  />
  <link rel="canonical" href="https://vittamoney.com/" />
</Helmet>

      <section id="home" className="hero-section" aria-label="Hero">
        <DiwaliEffect />
        <div className="hero-section__bg" aria-hidden="true">
          <div className="hero-section__glow hero-section__glow--1" />
          <div className="hero-section__glow hero-section__glow--2" />
        </div>

        <div className="container hero-section__container">
          <div className="hero-section__left">
            <span className="eyebrow hero-section__eyebrow">
              Your Gateway to Unlisted Markets
            </span>

            <h1 className="hero-section__headline">
              Discover{" "}
              <span className="hero-section__highlight">Tomorrow&apos;s</span>
              <br />
              Companies <span className="hero-section__highlight">Before</span>
              <br />
              They Hit the Market.
            </h1>

            <p className="hero-section__description">
              Explore unlisted shares, discover emerging companies, and learn
              about opportunities beyond public stock exchanges with{" "}
              <strong>VittaMoney</strong>.
            </p>

            <div className="hero-section__ctas">
              <button
                id="hero-explore-btn"
                type="button"
                className="btn btn-primary"
                onClick={() => scrollTo("#shares")}
              >
                Explore Unlisted Shares
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>

              <button
                id="hero-learn-btn"
                type="button"
                className="btn btn-secondary"
                onClick={() => scrollTo("#education")}
              >
                Discover How It Works
              </button>
            </div>

            <div className="hero-section__trust">
              <div className="hero-section__trust-item">
                <span className="hero-section__trust-number">
                  <AnimatedCounter value={100} suffix="+" />
                </span>

                <span className="hero-section__trust-label">
                  Listed Companies
                </span>
              </div>

              <div className="hero-section__trust-divider" aria-hidden="true" />

              <div className="hero-section__trust-item">
                <span className="hero-section__trust-number">
                  ₹<AnimatedCounter value={50} suffix="Cr+" />
                </span>

                <span className="hero-section__trust-label">
                  Volume Explored
                </span>
              </div>

              <div className="hero-section__trust-divider" aria-hidden="true" />

              <div className="hero-section__trust-item">
                <span className="hero-section__trust-number">
                  <AnimatedCounter value={10} suffix="K+" />
                </span>

                <span className="hero-section__trust-label">
                  Investors Registered
                </span>
              </div>
            </div>
          </div>

          {/* <div className="hero-section__right" aria-hidden="true">
            <div className="hero-decor hero-decor--ring" />
            <div className="hero-decor hero-decor--dot hero-decor--dot-1" />
            <div className="hero-decor hero-decor--dot hero-decor--dot-2" />
          </div> */}


{/* ==========================================
    RIGHT SIDE HERO IMAGE
========================================== */}

<div className="hero-section__right vm-hero-image-side">

  {/* BACKGROUND GLOW */}
  <div className="vm-hero-image-glow" aria-hidden="true" />

  {/* DECORATIVE CIRCLE */}
  <div className="vm-hero-image-ring" aria-hidden="true" />

  {/* MAIN HERO IMAGE */}
  <div className="vm-hero-image-wrapper">

    <img
      src="/images/vmhome1.png"
      alt="Discover investment opportunities with VittaMoney"
      className="vm-hero-main-image"
      fetchPriority="high"
    />

  </div>

  {/* FLOATING DECORATIONS */}
  <div
    className="vm-hero-floating-dot vm-hero-floating-dot-one"
    aria-hidden="true"
  />

  <div
    className="vm-hero-floating-dot vm-hero-floating-dot-two"
    aria-hidden="true"
  />

</div>



        </div>
      </section>

      {/* ================= Trending */}

      {/* ============================================
    PREMIUM TRENDING PRODUCTS SECTION
    ONLY is_hot === true
============================================ */}

      {!homeLoading && !homeError && trendingProducts.length > 0 && (
        <section
          id="trending-products"
          className="vm-trending-section"
          aria-labelledby="vm-trending-heading"
        >
          <div className="vm-trending-glow vm-trending-glow-one" />
          <div className="vm-trending-glow vm-trending-glow-two" />

          {/* HEADER */}

          <div className="container vm-trending-container">
            <div className="vm-trending-header">
              <div className="vm-trending-header-content">
                <span className="vm-trending-eyebrow">
                  <i className="fa-solid fa-fire-flame-curved" />
                  HANDPICKED FROM OUR COLLECTION
                </span>

                <h2 id="vm-trending-heading">
                  Trending <span>Unlisted Shares</span>
                </h2>

                <p>
                  Discover highlighted unlisted companies, explore share prices,
                  and find opportunities from our curated collection.
                </p>
              </div>

              {/* VIEW MORE BUTTON */}

              <button
                type="button"
                className="vm-trending-view-more"
                onClick={() => navigate("/allshares")}
              >
                <span>View More</span>

                <span className="vm-trending-view-more-icon">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </button>
            </div>
          </div>

          {/* ============================================
        INFINITE MOVING CAROUSEL
    ============================================ */}

          {/* <div className="vm-trending-marquee">

      <div className="vm-trending-track">


        {[0, 1].map((copyIndex) => (

          <div
            key={copyIndex}
            className="vm-trending-card-group"
            aria-hidden={copyIndex === 1 ? "true" : undefined}
          >

            {trendingProducts.map((product) => (

              <button
                key={`${copyIndex}-${product.id}`}
                type="button"
                className="vm-trending-card"
                onClick={() => productDetails(product.id)}
                tabIndex={copyIndex === 1 ? -1 : 0}
                aria-label={
                  copyIndex === 0
                    ? `View details of ${product.name}`
                    : undefined
                }
              >


                <div className="vm-trending-card-top">

                  <span className="vm-trending-hot-badge">
                    <i className="fa-solid fa-fire" />
                    HOT
                  </span>

                  <span className="vm-trending-card-arrow">
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                  </span>

                </div>


                <div className="vm-trending-logo">

                  {product?.image ? (
                    <img
                      src={getProductImage(product.image)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span>
                      {product?.name?.charAt(0) || "V"}
                    </span>
                  )}

                </div>


                <span className="vm-trending-category">
                  {product?.category_name || "Unlisted Shares"}
                </span>


                <h3
                  className="vm-trending-card-title"
                  title={product?.name}
                >
                  {product?.name || "Unlisted Company"}
                </h3>

                <div className="vm-trending-card-divider" />


                <div className="vm-trending-card-details">

                  <div>
                    <span className="vm-trending-detail-label">
                      Price per share
                    </span>

                    <strong className="vm-trending-price">
                      ₹{Number(product?.price || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </strong>
                  </div>

                  <div className="vm-trending-lot-block">
                    <span className="vm-trending-detail-label">
                      Min. quantity
                    </span>

                    <strong>
                      {product?.quantity ?? "N/A"}
                    </strong>
                  </div>

                </div>


                <div className="vm-trending-card-bottom">

                  <span>View Share Details</span>

                  <i className="fa-solid fa-arrow-right" />

                </div>

              </button>

            ))}

          </div>

        ))}

      </div>
    </div> */}

          {/* ============================================
    INFINITE TRENDING CAROUSEL
    DESKTOP + TABLET + MOBILE
============================================ */}

          <div className="vm-trending-marquee">
            <div className="vm-trending-track">
              {[0, 1].map((copyIndex) => (
                <div
                  key={copyIndex}
                  className="vm-trending-card-group"
                  aria-hidden={copyIndex === 1 ? "true" : undefined}
                >
                  {/* Repeat products to cover wide desktop screens */}

                  {Array.from({ length: 3 }).flatMap((_, repeatIndex) =>
                    trendingProducts.map((product) => (
                      <button
                        key={`${copyIndex}-${repeatIndex}-${product.id}`}
                        type="button"
                        className="vm-trending-card"
                        onClick={() => productDetails(product.id)}
                        tabIndex={copyIndex === 1 ? -1 : 0}
                        aria-label={
                          copyIndex === 0
                            ? `View details of ${product.name}`
                            : undefined
                        }
                      >
                        {/* HOT BADGE */}

                        <div className="vm-trending-card-top">
                          <span className="vm-trending-hot-badge">
                            <i className="fa-solid fa-fire" />
                            HOT
                          </span>

                          <span className="vm-trending-card-arrow">
                            <i className="fa-solid fa-arrow-up-right-from-square" />
                          </span>
                        </div>

                        {/* LOGO */}

                        <div className="vm-trending-logo">
                          {product?.image ? (
                            <img
                              src={getProductImage(product.image)}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <span>{product?.name?.charAt(0) || "V"}</span>
                          )}
                        </div>

                        {/* CATEGORY */}

                        <span className="vm-trending-category">
                          {product?.category_name || "Unlisted Shares"}
                        </span>

                        {/* NAME */}

                        <h3 className="vm-trending-card-title">
                          {product?.name || "Unlisted Company"}
                        </h3>

                        <div className="vm-trending-card-divider" />

                        {/* PRICE + MINIMUM QUANTITY */}

                        <div className="vm-trending-card-details">
                          <div>
                            <span className="vm-trending-detail-label">
                              Price per share
                            </span>

                            <strong className="vm-trending-price">
                              ₹
                              {Number(product?.price || 0).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </strong>
                          </div>

                          <div className="vm-trending-lot-block">
                            <span className="vm-trending-detail-label">
                              Min. quantity
                            </span>

                            <strong>{product?.quantity ?? "N/A"}</strong>
                          </div>
                        </div>

                        {/* CARD FOOTER */}

                        <div className="vm-trending-card-bottom">
                          <span>View Share Details</span>
                          <i className="fa-solid fa-arrow-right" />
                        </div>
                      </button>
                    )),
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          PREMIUM UNLISTED SHARES SECTION
      ===================================== */}

      <section
        id="shares"
        className="section shares-section"
        aria-labelledby="shares-heading"
      >
        <div className="shares-bg-glow shares-bg-glow--one" />
        <div className="shares-bg-glow shares-bg-glow--two" />

        <div className="container shares-section__container">
          <div className="shares-premium-header">
            <div className="shares-premium-eyebrow">
              <span className="shares-premium-line" />

              <span>
                <i className="fa-solid fa-chart-line" />
                EXPLORE PRIVATE MARKETS
              </span>

              <span className="shares-premium-line" />
            </div>

            <h2 id="shares-heading" className="shares-premium-title">
              Discover the World of
              <span> Unlisted Shares</span>
            </h2>

            <p className="shares-premium-description">
              Explore pre-IPO and unlisted share opportunities with VittaMoney.
              Learn about companies, their shares, pricing, and minimum purchase
              quantities.
            </p>

            <div className="shares-premium-highlights">
              <span>
                <i className="fa-solid fa-building" />
                Explore Companies
              </span>

              <span className="shares-premium-highlight-dot" />

              <span>
                <i className="fa-solid fa-layer-group" />
                Unlisted Products
              </span>

              <span className="shares-premium-highlight-dot" />

              <span>
                <i className="fa-solid fa-circle-info" />
                Product Information
              </span>
            </div>
          </div>

          {/* CATEGORY FILTERS */}

          <div className="shares-premium-toolbar">
            <div className="shares-premium-toolbar-left">
              <span className="shares-premium-filter-label">
                <i className="fa-solid fa-sliders" />
                Explore by Sector
              </span>

              <div
                className="shares-section__filters"
                role="group"
                aria-label="Filter shares by category"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`shares-section__filter-chip ${
                      activeFilter === category ? "active" : ""
                    }`}
                    aria-pressed={activeFilter === category}
                    onClick={() => setActiveFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="shares-premium-count">
              <i className="fa-solid fa-building-columns" />
              <span>{filteredProducts.length} Products</span>
            </div>
          </div>

          {/* LOADING */}

          {homeLoading && (
            <div className="shares-api-state" role="status">
              <i className="fa-solid fa-spinner fa-spin" />
              <p>Loading unlisted shares...</p>
            </div>
          )}

          {/* API ERROR */}

          {!homeLoading && homeError && (
            <div className="shares-api-state" role="alert">
              <i className="fa-solid fa-circle-exclamation" />
              <p>{homeError}</p>
            </div>
          )}

          {/* API PRODUCTS */}

          {!homeLoading && !homeError && displayedProducts.length > 0 && (
            <div className="shares-section__grid">
              {displayedProducts.map((product, index) => (
                <button
                  key={product?.id ?? index}
                  type="button"
                  className="share-list-card share-premium-card vm-api-share-card"
                  onClick={() => productDetails(product?.id)}
                  aria-label={`View details for ${product?.name ?? "company"}`}
                >
                  <div className="share-list-card__logo">
                    {product?.image ? (
                      <img
                        src={getProductImage(product.image)}
                        alt={product?.name ?? "Unlisted share"}
                        loading="lazy"
                      />
                    ) : (
                      <span>{product?.name?.charAt(0) ?? "V"}</span>
                    )}
                  </div>

                  <div className="share-list-card__content">
                    <h3
                      className="share-list-card__name"
                      title={product?.name ?? ""}
                    >
                      {product?.name ?? "Unlisted Company"}
                    </h3>

                    <div className="vm-api-share-info">
                      <span className="vm-api-share-quantity">
                        <i className="fa-solid fa-layer-group" />
                        {product?.quantity ?? "N/A"} Shares Min
                      </span>

                      <span className="vm-api-share-price">
                        ₹ {product?.price ?? "N/A"}
                      </span>
                    </div>
                  </div>

                  <span className="share-list-card__arrow" aria-hidden="true">
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* NO PRODUCTS */}

          {!homeLoading && !homeError && displayedProducts.length === 0 && (
            <div className="shares-section__empty">
              <i className="fa-solid fa-building-circle-exclamation" />
              <h3>No Unlisted Shares Found</h3>
              <p>No products are currently available in this category.</p>
            </div>
          )}

          {/* VIEW ALL */}

          {!homeLoading && !homeError && (
            <div className="shares-premium-footer">
              <div className="shares-premium-footer-text">
                <span className="shares-premium-footer-line" />
                Discover more companies and opportunities
                <span className="shares-premium-footer-line" />
              </div>

              <button
                id="shares-view-all-btn"
                type="button"
                className="shares-premium-view-all"
                onClick={handleViewAll}
              >
                <span>Explore All Unlisted Shares</span>

                <span className="shares-premium-view-all-icon">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================
          WHY CHOOSE VITTAMONEY
      ===================================== */}

      <section
        id="about"
        className="section section-soft why-choose"
        aria-labelledby="why-choose-heading"
      >
        <div className="container">
          <div className="why-choose__header">
            <span className="eyebrow section-eyebrow">Our Advantage</span>

            <h2 id="why-choose-heading">
              Why Choose <span>VittaMoney?</span>
            </h2>

            <p>
              Explore the key features that make our platform simple,
              transparent, and reliable—designed to give you a seamless
              experience in buying and managing unlisted shares.
            </p>
          </div>

          <div className="why-choose__main">
            {/* LEFT ACCORDION */}

            <div className="why-choose__features">
              {FEATURES.map((feature, index) => {
                const isActive = activeIndex === index;

                return (
                  <div
                    key={feature.id}
                    id={`why-choose-${feature.id}`}
                    className={`why-choose__feature ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="why-choose__feature-button"
                      onClick={() => handleFeatureClick(index)}
                      aria-expanded={isActive}
                      aria-controls={`why-choose-panel-${feature.id}`}
                    >
                      <span className="why-choose__number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="why-choose__feature-title">
                        {feature.title}
                      </span>

                      <span className="why-choose__arrow">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    <div
                      id={`why-choose-panel-${feature.id}`}
                      className={`why-choose__description-wrapper ${
                        isActive ? "open" : ""
                      }`}
                      aria-hidden={!isActive}
                    >
                      <div className="why-choose__description-inner">
                        <p className="why-choose__description">
                          {feature.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT VISUAL PANEL */}

            <div className="why-choose__visual">
              <div className="why-choose__visual-circle circle-one" />
              <div className="why-choose__visual-circle circle-two" />

              <div
                className="why-choose__visual-content"
                key={activeFeature.id}
              >
                <div className="why-choose__visual-icon">
                  {activeFeature.icon}
                </div>

                <span className="why-choose__visual-label">VITTA MONEY</span>

                <h3 className="why-choose__visual-title">
                  {activeFeature.title}
                </h3>
              </div>

              <div className="why-choose__visual-counter">
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>

                <span className="why-choose__counter-line" />

                <span>{String(FEATURES.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
    WHAT ARE UNLISTED SHARES SECTION
    PREMIUM ICON GRID DESIGN
========================================== */}

      <section
        id="what-are"
        className="section what-are vm-what-new"
        aria-labelledby="what-are-heading"
      >
        <div className="container vm-what-new-container">
          {/* SECTION HEADER */}

          <div className="vm-what-new-header">
            <span className="vm-what-new-eyebrow">
              <span className="vm-what-new-eyebrow-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="14" width="3" height="7" rx="1" />
                  <rect x="8" y="10" width="3" height="11" rx="1" />
                  <rect x="13" y="6" width="3" height="15" rx="1" />
                  <rect x="18" y="2" width="3" height="19" rx="1" />
                </svg>
              </span>
              UNDERSTAND THE BASICS
            </span>

            <h2 id="what-are-heading" className="vm-what-new-heading">
              What Are <span>Unlisted Shares?</span>
            </h2>

            <span className="vm-what-new-heading-line" />

            <p className="vm-what-new-description">
              Unlisted shares are equity stakes in companies that have not yet
              completed an Initial Public Offering (IPO). Explore the
              opportunities and considerations associated with investing in
              private companies.
            </p>
          </div>

          {/* ==========================================
        SIX FEATURES GRID
    ========================================== */}

          <div className="vm-what-new-grid">
            {POINTS.map((point, index) => (
              <div key={point.id} className="vm-what-new-card">
                {/* CONNECTOR DECORATION */}

                <span className="vm-what-new-connector" aria-hidden="true" />

                {/* CIRCULAR ICON */}

                <div className="vm-what-new-icon-wrap">
                  <div className="vm-what-new-icon-orbit" />

                  <span className="vm-what-new-icon-dot" />

                  <div className="vm-what-new-icon">{point.icon}</div>
                </div>

                {/* CONTENT */}

                <h3 className="vm-what-new-card-title">{point.heading}</h3>

                <span className="vm-what-new-card-line" />

                <p className="vm-what-new-card-text">{point.text}</p>
              </div>
            ))}
          </div>

          {/* ==========================================
        EXPLORE BUTTON
    ========================================== */}

          <div className="vm-what-new-bottom">
            <button
              id="what-are-explore-btn"
              type="button"
              className="vm-what-new-explore-btn"
              onClick={() => scrollTo("#shares")}
            >
              <span>Explore Available Shares</span>

              <span className="vm-what-new-btn-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================
          EDUCATION VIDEO COLLAGE
      ===================================== */}

      <section
        id="education"
        className="section section-soft education-section"
        aria-labelledby="education-heading"
      >
        <div className="container">
          <div className="education-youtube">
            <div className="education-youtube__header">
              <span className="education-youtube__badge">
                <i className="fa-brands fa-youtube" />
                VIDEO GALLERY
              </span>

              <h2 id="education-heading">
                Discover More About <span>VittaMoney</span>
              </h2>

              <p>
                Explore our collection of videos covering unlisted shares,
                investing, market insights, and financial education.
              </p>
            </div>

            {/* VIDEO COLLAGE */}

            <div className="education-video-collage">
              {educationVideos.map((video, index) => {
                const videoId = getYouTubeId(video?.embed);
                const isAvailable = Boolean(videoId);

                return (
                  <button
                    key={video.id}
                    type="button"
                    className={`education-video-tile education-video-tile--${index + 1} education-video-tile--${video.type} ${
                      !isAvailable ? "education-video-tile--empty" : ""
                    }`}
                    onClick={() => openEducationVideo(video)}
                    disabled={!isAvailable}
                    aria-label={
                      isAvailable
                        ? `Play ${video.title}`
                        : `${video.title} - video not added`
                    }
                  >
                    {isAvailable ? (
                      <img
                        className="education-video-tile__image"
                        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className="education-video-tile__placeholder">
                        <i className="fa-brands fa-youtube" />
                        <span>Video coming soon</span>
                      </span>
                    )}

                    <span className="education-video-tile__overlay" />

                    <span className="education-video-tile__type">
                      {video.type === "portrait"
                        ? "SHORT VIDEO"
                        : "FEATURED VIDEO"}
                    </span>

                    {isAvailable && (
                      <span className="education-video-tile__play">
                        <i className="fa-solid fa-play" />
                      </span>
                    )}

                    <span className="education-video-tile__bottom">
                      <span className="education-video-tile__title">
                        {video.title}
                      </span>

                      {isAvailable && (
                        <span className="education-video-tile__watch">
                          Watch Now
                          <i className="fa-solid fa-arrow-up-right-from-square" />
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* GALLERY NAVIGATION */}

            <div className="videobtn">
              <button
                type="button"
                id="education-view-gallery-btn"
                className="btn btn-secondary education-gallery-banner__btn"
                onClick={() => navigate("/gallery")}
              >
                Browse Video Collage
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          NEW API-INTEGRATED ORBIT SECTION
      ===================================== */}

      <section
        id="unlisted-ecosystem"
        className="section unlisted-orbits-section"
        aria-labelledby="orbits-heading"
      >
        {/* BACKGROUND PARTICLES */}

        <div className="orbits-particles" aria-hidden="true">
          {PARTICLES.map((particle) => (
            <span
              key={particle.id}
              className="orbits-particle"
              style={{
                top: particle.top,
                left: particle.left,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: particle.duration,
                animationDelay: particle.delay,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>

        <div className="container unlisted-orbits__container">
          {/* HEADER */}

          <div className="section-header centered unlisted-orbits__header">
            <span className="eyebrow section-eyebrow">
              The Pre-IPO Ecosystem
            </span>

            <h2 id="orbits-heading">
              The Expanding Universe of <span>Unlisted Opportunities</span>
            </h2>

            <p>
              Explore companies available in the Indian unlisted market. Hover
              over a company to view its information, or click to explore its
              share details.
            </p>
          </div>

          {/* API LOADING */}

          {homeLoading && (
            <div className="orbits-api-state">
              <i className="fa-solid fa-spinner fa-spin" />
              <p>Loading company ecosystem...</p>
            </div>
          )}

          {/* API ERROR */}

          {!homeLoading && homeError && (
            <div className="orbits-api-state">
              <i className="fa-solid fa-circle-exclamation" />
              <p>{homeError}</p>
            </div>
          )}

          {/* ORBIT STAGE */}

          {!homeLoading && !homeError && orbitCompanies.length > 0 && (
            <div
              className={`orbits-stage ${isOrbitPaused ? "is-paused" : ""}`}
              onMouseEnter={() => setIsOrbitPaused(true)}
              onMouseLeave={handleOrbitLeave}
              onFocusCapture={() => setIsOrbitPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  handleOrbitLeave();
                }
              }}
            >
              {/* CENTER GLOW */}

              <div className="orbits-glow" aria-hidden="true" />

              {/* OUTER RING */}

              <div
                className="orbit-track orbit-track--outer"
                aria-hidden="true"
              />

              <div className="orbit-spinner orbit-spinner--outer">
                {outerCompanies.map((company) => (
                  <OrbitNode
                    key={company.id}
                    company={company}
                    onActivate={handleOrbitActivate}
                    onDeactivate={handleOrbitDeactivate}
                    onSelect={productDetails}
                  />
                ))}
              </div>

              {/* MIDDLE RING */}

              <div
                className="orbit-track orbit-track--middle"
                aria-hidden="true"
              />

              <div className="orbit-spinner orbit-spinner--middle">
                {middleCompanies.map((company) => (
                  <OrbitNode
                    key={company.id}
                    company={company}
                    onActivate={handleOrbitActivate}
                    onDeactivate={handleOrbitDeactivate}
                    onSelect={productDetails}
                  />
                ))}
              </div>

              {/* INNER RING */}

              <div
                className="orbit-track orbit-track--inner"
                aria-hidden="true"
              />

              <div className="orbit-spinner orbit-spinner--inner">
                {innerCompanies.map((company) => (
                  <OrbitNode
                    key={company.id}
                    company={company}
                    onActivate={handleOrbitActivate}
                    onDeactivate={handleOrbitDeactivate}
                    onSelect={productDetails}
                  />
                ))}
              </div>

              {/* CENTER HUB */}

              <button
                type="button"
                className="orbits-center-hub"
                onClick={() => scrollTo("#shares")}
                aria-label="Explore unlisted shares"
              >
                <span className="orbits-center-hub__logo">
                  {/* <svg
                    width="34"
                    height="34"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect width="28" height="28" rx="8" fill="#8D3A4A" />
                    <path
                      d="M7 8l7 12 7-12"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="14" cy="20" r="2" fill="#C57B89" />
                  </svg> */}
                  <img src="/images/VMLogo.png" alt="VittaMoney Logo" className="vmlogo" />
                </span>
{/* 
                <span className="orbits-center-hub__title">
                  Vitta<span>Money</span>
                </span> */}

                <span className="orbits-center-hub__pill">
                  {unlistedProducts.length} Unlisted Products
                </span>
              </button>

              {/* ACTIVE COMPANY DETAILS */}

              {activeCompany && (
                <div
                  className="orbits-tooltip"
                  role="status"
                  id={`${tooltipId}-tooltip`}
                >
                  <div className="orbits-tooltip__badge">Unlisted Shares</div>

                  <h4 className="orbits-tooltip__name">
                    {activeCompany?.name ?? "Company"}
                  </h4>

                  <span className="orbits-tooltip__sector">
                    {activeCompany?.sector ?? "Unlisted Shares"}
                  </span>

                  <div className="orbits-tooltip__divider" />

                  <div className="orbits-tooltip__footer">
                    <span className="orbits-tooltip__lot">
                      Min. Lot:{" "}
                      <strong>{activeCompany?.lotSize ?? "N/A"}</strong>
                    </span>

                    <span className="orbits-tooltip__action">
                      Click logo to explore
                      <i className="fa-solid fa-arrow-right" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMPTY ORBIT */}

          {!homeLoading && !homeError && orbitCompanies.length === 0 && (
            <div className="orbits-api-state">
              <i className="fa-solid fa-building-circle-exclamation" />
              <p>No unlisted companies are currently available to display.</p>
            </div>
          )}

          {/* ORBIT FOOTER */}

          {/* {!homeLoading && !homeError && orbitCompanies.length > 0 && (
            <div className="orbits-footer-bar">
              <div className="orbits-stat-pill">
                <span className="orbits-stat-dot" />

                <span>
                  <strong>{unlistedProducts.length} Unlisted Products</strong>{" "}
                  available to explore
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary orbits-explore-btn"
                onClick={handleViewAll}
              >
                Explore All Available Shares
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          )} */}
        </div>
      </section>

      {/* =====================================
          VIDEO PLAYER POPUP
      ===================================== */}

      {activeEducationVideo && (
        <div
          className="education-video-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEducationVideo();
            }
          }}
        >
          <div
            className={`education-video-modal__dialog education-video-modal__dialog--${activeEducationVideo.type}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="education-video-modal-title"
          >
            <div className="education-video-modal__header">
              <div className="education-video-modal__heading">
                <span className="education-video-modal__badge">
                  <i className="fa-brands fa-youtube" />
                  NOW PLAYING
                </span>

                <h3 id="education-video-modal-title">
                  {activeEducationVideo.title}
                </h3>
              </div>

              <button
                ref={videoCloseRef}
                type="button"
                className="education-video-modal__close"
                onClick={closeEducationVideo}
                aria-label="Close video"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div
              className={`education-video-modal__player education-video-modal__player--${activeEducationVideo.type}`}
            >
              <iframe
                key={activeEducationVideo.videoId}
                src={`https://www.youtube.com/embed/${activeEducationVideo.videoId}?autoplay=1&rel=0&playsinline=1`}
                title={activeEducationVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          BANNER POPUP
      ===================================== */}

      {showBanner && banner && (
        <div className="vm-banner-overlay">
          <div className="vm-banner-popup">
            <button
              type="button"
              className="vm-banner-close"
              onClick={closeBanner}
              aria-label="Close banner"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <img
              src={getProductImage(banner?.image)}
              alt={banner?.name ?? "VittaMoney Banner"}
              className="vm-banner-image"
            />
          </div>
        </div>
      )}
    </>
  );
}
