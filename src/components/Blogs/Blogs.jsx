
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { getBlogs } from "../../Api/BlogApi";

import "./Blogs.css";

// ==========================================
// IMAGE URL HELPER
// ==========================================

const getImageUrl = (url) => {
  if (!url) return "/images/blog-placeholder.jpg";

  if (url.startsWith("http://127.0.0.1") ||
      url.startsWith("http://localhost")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  if (url.startsWith("/")) {
    return `https://vittamoney.com${url}`;
  }

  return url;
};

// ==========================================
// BLOG COMPONENT
// ==========================================

function Blog() {

  const navigate = useNavigate();
  const swiperRef = useRef(null);

  // ========================================
  // STATES
  // ========================================

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ========================================
  // FETCH BLOG API
  // ========================================

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Blogs & Insights | VittaMoney";

    let cancelled = false;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getBlogs();

        console.log("Blogs API Response:", res);

        const blogData = Array.isArray(res?.data)
          ? res.data
          : [];

        // Show published blogs only
        const publishedBlogs = blogData.filter(
          (blog) => blog.is_published !== false
        );

        if (!cancelled) {
          setBlogs(publishedBlogs);
        }

      } catch (err) {
        console.error("Blogs Fetch Error:", err);

        if (!cancelled) {
          setBlogs([]);
          setError("Unable to load blogs.");
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      cancelled = true;
    };

  }, []);

  // ========================================
  // SEARCH BLOGS
  // ========================================

  const filteredBlogs = blogs.filter((blog) => {

    const query = search.toLowerCase().trim();

    return (
      (blog.title || "").toLowerCase().includes(query) ||
      (blog.category || "").toLowerCase().includes(query) ||
      (blog.short_description || "")
        .toLowerCase()
        .includes(query)
    );
  });

  // ========================================
  // SWIPER HOVER PAUSE
  // ========================================

  const handleMouseEnter = () => {
    swiperRef.current?.autoplay?.stop();
  };

  const handleMouseLeave = () => {
    const swiper = swiperRef.current;

    if (swiper && !swiper.destroyed && swiper.autoplay) {
      swiper.autoplay.start();
    }
  };

  // ========================================
  // BLOG DETAILS NAVIGATION
  // ========================================

  const handleViewMore = (blog) => {

    navigate(`/blogdetails/${blog.slug}`, {
      state: { blog },
    });

  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (dateValue) => {

    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ========================================
  // JSX
  // ========================================

  return (

    <main className="vm-blog-page">

      {/* =====================================
          BLOG SECTION
      ===================================== */}

      <section className="vm-blog-section">

        {/* BACKGROUND EFFECT */}

        <div className="vm-blog-glow vm-blog-glow-one" />
        <div className="vm-blog-glow vm-blog-glow-two" />

        <div className="container">

          {/* =================================
              BLOG HEADER
          ================================= */}

          <div className="vm-blog-header">

            <span className="vm-blog-tag">

              <i className="fa-regular fa-newspaper" />

              VITTAMONEY INSIGHTS

            </span>

            <h1 className="vm-blog-title">

              Explore Our <span>Latest Articles</span>

            </h1>

            <p className="vm-blog-subtitle">

              Discover the latest news, market insights,
              and educational articles about unlisted shares,
              pre-IPO investments, and private markets.

            </p>

          </div>

          {/* =================================
              BLOG TOOLBAR
          ================================= */}

          {!loading && !error && blogs.length > 0 && (

            <div className="vm-blog-toolbar">

              <div className="vm-blog-toolbar-left">

                <span className="vm-blog-toolbar-label">

                  <i className="fa-solid fa-layer-group" />

                  Explore Articles

                </span>

                <div className="vm-blog-count">

                  <i className="fa-regular fa-newspaper" />

                  {filteredBlogs.length} Articles

                </div>

              </div>

              <div className="vm-blog-search">

                <i className="fa-solid fa-magnifying-glass" />

                <input
                  type="search"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search blog articles"
                />

                {search && (

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>

                )}

              </div>

            </div>

          )}

          {/* =================================
              LOADING
          ================================= */}

          {loading && (

            <div className="vm-blog-api-state" role="status">

              <i className="fa-solid fa-spinner fa-spin" />

              <p>Loading latest articles...</p>

            </div>

          )}

          {/* =================================
              ERROR
          ================================= */}

          {!loading && error && (

            <div className="vm-blog-api-state" role="alert">

              <i className="fa-solid fa-circle-exclamation" />

              <p>{error}</p>

            </div>

          )}

          {/* =================================
              BLOG CAROUSEL
          ================================= */}

          {!loading &&
            !error &&
            filteredBlogs.length > 0 && (

            <div className="vm-blog-carousel-wrapper">

              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >

                <Swiper
                  key={search}
                  modules={[
                    Autoplay,
                    Navigation,
                    Pagination,
                  ]}

                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}

                  slidesPerView={1}
                  spaceBetween={20}

                  loop={filteredBlogs.length > 3}

                  speed={650}

                  autoplay={
                    filteredBlogs.length > 1
                      ? {
                          delay: 3000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }
                      : false
                  }

                  navigation={{
                    prevEl: ".vm-blog-prev",
                    nextEl: ".vm-blog-next",
                  }}

                  pagination={{
                    el: ".vm-blog-pagination",
                    clickable: true,
                  }}

                  breakpoints={{

                    0: {
                      slidesPerView: 1,
                      spaceBetween: 15,
                    },

                    768: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },

                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 25,
                    },

                  }}

                  observer={true}
                  observeParents={true}

                  className="vm-blog-swiper"
                >

                  {filteredBlogs.map((blog) => (

                    <SwiperSlide key={blog.id}>

                      <article className="vm-blog-card">

                        {/* =========================
                            BLOG COVER IMAGE
                        ========================= */}

                        <div
                          className="vm-blog-card-image"
                          onClick={() => handleViewMore(blog)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" ||
                              e.key === " "
                            ) {
                              e.preventDefault();
                              handleViewMore(blog);
                            }
                          }}
                        >

                          <img
                            src={getImageUrl(blog.bloger)}
                            alt={blog.title}
                            loading="lazy"
                          />

                          {/* ARTICLE BADGE */}

                          <span className="vm-blog-image-badge">

                            {blog.blog_type || "ARTICLE"}

                          </span>

                          {/* FEATURED BADGE */}

                          {blog.is_featured && (

                            <span className="vm-blog-featured-badge">

                              <i className="fa-solid fa-star" />

                              Featured

                            </span>

                          )}

                        </div>

                        {/* =========================
                            BLOG CONTENT
                        ========================= */}

                        <div className="vm-blog-card-content">

                          {/* CATEGORY */}

                          <div className="vm-blog-card-category">

                            <i className="fa-solid fa-book-open" />

                            {blog.category || "Unlisted Shares"}

                          </div>

                          {/* TITLE */}

                          <h3
                            className="vm-blog-card-title"
                            onClick={() => handleViewMore(blog)}
                          >

                            {blog.title}

                          </h3>

                          {/* DESCRIPTION */}

                          <p className="vm-blog-card-description">

                            {blog.short_description ||
                              blog.content ||
                              "Explore more insights on unlisted shares and private markets."}

                          </p>

                          {/* BLOG META */}

                          <div className="vm-blog-card-meta">

                            {formatDate(
                              blog.published_at || blog.created_at
                            ) && (

                              <span>

                                <i className="fa-regular fa-calendar" />

                                {formatDate(
                                  blog.published_at || blog.created_at
                                )}

                              </span>

                            )}

                            <span>

                              <i className="fa-regular fa-clock" />

                              {blog.reading_time || 1} min read

                            </span>

                          </div>

                          {/* =========================
                              AUTHOR + BUTTON
                          ========================= */}

                          <div className="vm-blog-card-footer">

                            <div className="vm-blog-author">

                              <img
                                src={getImageUrl(blog.image)}
                                alt={blog.published || "Author"}
                                className="vm-blog-author-img"
                                loading="lazy"
                              />

                              <div className="vm-blog-author-info">

                                <span>Written By</span>

                                <strong>
                                  {blog.published || "VittaMoney Team"}
                                </strong>

                              </div>

                            </div>

                            <button
                              type="button"
                              className="vm-blog-view-more"
                              onClick={() => handleViewMore(blog)}
                              aria-label={`Read ${blog.title}`}
                            >

                              <i className="fa-solid fa-arrow-up-right" />

                            </button>

                          </div>

                        </div>

                      </article>

                    </SwiperSlide>

                  ))}

                </Swiper>

              </div>

              {/* =================================
                  CAROUSEL CONTROLS
              ================================= */}

              {filteredBlogs.length > 1 && (

                <div className="vm-blog-controls">

                  <div className="vm-blog-pagination" />

                  <div className="vm-blog-arrows">

                    <button
                      type="button"
                      className="vm-blog-prev"
                      aria-label="Previous blog"
                    >

                      <i className="fa-solid fa-arrow-left" />

                    </button>

                    <button
                      type="button"
                      className="vm-blog-next"
                      aria-label="Next blog"
                    >

                      <i className="fa-solid fa-arrow-right" />

                    </button>

                  </div>

                </div>

              )}

            </div>

          )}

          {/* =================================
              EMPTY STATE
          ================================= */}

          {!loading &&
            !error &&
            filteredBlogs.length === 0 && (

            <div className="vm-blog-api-state">

              <i className="fa-regular fa-folder-open" />

              <h3>No Articles Found</h3>

              <p>
                Try another search or check back later.
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default Blog;
