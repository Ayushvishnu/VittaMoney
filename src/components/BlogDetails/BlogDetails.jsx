
import React, { useEffect, useMemo, useState } from "react";

import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import DOMPurify from "dompurify";

import {
  getBlogs,
  getBlogDetails,
} from "../../Api/BlogApi";

import "./BlogDetails.css";

// ==========================================
// IMAGE URL HELPER
// ==========================================

const getImageUrl = (url) => {
  if (!url) return "";

  if (
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("http://localhost")
  ) {
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
// DATE FORMAT
// ==========================================

const formatDate = (dateValue) => {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

// ==========================================
// HTML TO TEXT
// ==========================================

const stripHTML = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = DOMPurify.sanitize(html);
  return div.textContent || "";
};

// ==========================================
// EXTRACT USEFUL LINKS
// ==========================================

const extractLinks = (sections = []) => {
  const links = [];
  const seen = new Set();

  sections.forEach((section) => {
    if (
      section.section_type !== "PARAGRAPH" ||
      !section.content
    ) {
      return;
    }

    const parser = new DOMParser();

    const doc = parser.parseFromString(
      DOMPurify.sanitize(section.content),
      "text/html"
    );

    doc.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href");

      if (!href) return;

      try {
        const url = new URL(href);

        if (!["http:", "https:"].includes(url.protocol)) {
          return;
        }

        if (seen.has(url.href)) return;

        seen.add(url.href);

        links.push({
          url: url.href,
          label: anchor.textContent.trim() || url.hostname,
          hostname: url.hostname,
        });
      } catch {
        // Ignore invalid URLs
      }
    });
  });

  return links;
};

// ==========================================
// BLOG SECTION RENDERER
// ==========================================

function BlogSection({ section, blogTitle }) {
  const type = section.section_type;

  if (type === "HEADING") {
    return (
      <h3 className="blog-details-section-heading">
        {section.content}
      </h3>
    );
  }

  if (type === "PARAGRAPH") {
    return (
      <>
        <div
          className="blog-details-rich-content"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              section.content || "",
              {
                FORBID_TAGS: [
                  "script",
                  "iframe",
                  "form",
                  "object",
                  "embed",
                ],
                FORBID_ATTR: ["style", "class"],
              }
            ),
          }}
        />

        {section.image && (
          <img
            src={getImageUrl(section.image)}
            alt={blogTitle}
            className="blog-details-section-image"
            loading="lazy"
          />
        )}
      </>
    );
  }

  if (type === "IMAGE") {
    return section.image ? (
      <figure className="blog-details-image-figure">
        <img
          src={getImageUrl(section.image)}
          alt={blogTitle}
          className="blog-details-section-image"
          loading="lazy"
        />
        {section.content && (
          <figcaption>{section.content}</figcaption>
        )}
      </figure>
    ) : null;
  }

  if (type === "LIST") {
    const items = section.data?.items;

    if (!Array.isArray(items)) return null;

    return (
      <ul className="blog-details-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  if (type === "QUOTE") {
    return (
      <blockquote className="blog-details-quote">
        {section.content}
      </blockquote>
    );
  }

  if (type === "TABLE") {
    const headers = section.data?.headers;
    const rows = section.data?.rows;

    if (
      !Array.isArray(headers) ||
      !Array.isArray(rows)
    ) {
      return null;
    }

    return (
      <div className="blog-details-table-wrapper">
        <table className="blog-details-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((_, columnIndex) => (
                  <td key={columnIndex}>
                    {Array.isArray(row)
                      ? row[columnIndex] ?? "—"
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

// ==========================================
// MAIN BLOG DETAILS COMPONENT
// ==========================================

function BlogDetails() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // ========================================
  // FETCH BLOG DETAILS
  // ========================================

  useEffect(() => {
    let cancelled = false;

    window.scrollTo(0, 0);

    const fetchSelectedBlog = async () => {
      try {
        setLoading(true);
        setError("");
        setBlog(null);

        let selectedBlog = null;

        // Use navigation state when available.
        if (
          location.state?.blog?.slug === slug &&
          location.state.blog.id
        ) {
          selectedBlog = location.state.blog;
        }

        // Direct URL / page refresh support.
        if (!selectedBlog) {
          const blogsResponse = await getBlogs();

          const blogsList = Array.isArray(blogsResponse?.data)
            ? blogsResponse.data
            : [];

          selectedBlog = blogsList.find(
            (item) => item.slug === slug
          );
        }

        if (!selectedBlog?.id) {
          if (!cancelled) {
            setError("Blog not found.");
          }
          return;
        }

        // Backend details endpoint requires UUID.
        const response = await getBlogDetails(selectedBlog.id);

        const blogData = response?.data || null;

        if (!cancelled) {
          if (blogData && !Array.isArray(blogData)) {
            setBlog(blogData);
          } else {
            setError("Blog details not found.");
          }
        }

      } catch (err) {
        console.error("Blog Details Fetch Error:", err);

        if (!cancelled) {
          setBlog(null);
          setError("Unable to load blog details.");
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchSelectedBlog();
    } else {
      setLoading(false);
      setError("Blog not found.");
    }

    return () => {
      cancelled = true;
    };
  }, [slug, location.state]);

  // ========================================
  // PAGE TITLE
  // ========================================

  useEffect(() => {
    if (!blog) return;

    document.title = `${
      blog.meta_title || blog.title
    } | VittaMoney`;

    return () => {
      document.title = "VittaMoney";
    };
  }, [blog]);

  // ========================================
  // ARTICLE SECTIONS
  // ========================================

  const sections = useMemo(() => {
    return [...(blog?.sections || [])].sort(
      (a, b) =>
        (Number(a.order) || 0) -
        (Number(b.order) || 0)
    );
  }, [blog]);

  // ========================================
  // USEFUL RESOURCES
  // ========================================

  const externalLinks = useMemo(() => {
    return extractLinks(sections);
  }, [sections]);

  // ========================================
  // PUBLICATION DATE
  // ========================================

  const publishedDate = formatDate(
    blog?.published_at || blog?.created_at
  );

  // ========================================
  // READING TIME
  // ========================================

  const readTime = useMemo(() => {
    if (!blog) return 1;

    if (Number(blog.reading_time) > 0) {
      return Number(blog.reading_time);
    }

    const content = sections.length
      ? sections
          .map((section) => stripHTML(section.content || ""))
          .join(" ")
      : stripHTML(blog.content || "");

    const words = content.trim().split(/\s+/).filter(Boolean);

    return Math.max(1, Math.ceil(words.length / 200));
  }, [blog, sections]);

  // ========================================
  // SHARE URL
  // ========================================

  const blogUrl = blog?.slug
    ? `${window.location.origin}/blogdetails/${blog.slug}`
    : window.location.href;

  // ========================================
  // COPY LINK
  // ========================================

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error("Copy Link Error:", err);
    }
  };

  // ========================================
  // WHATSAPP SHARE
  // ========================================

  const shareWhatsApp = () => {
    const text = `${blog.title}\n${blogUrl}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ========================================
  // FACEBOOK SHARE
  // ========================================

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ========================================
  // LINKEDIN SHARE
  // ========================================

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ========================================
  // TWITTER / X SHARE
  // ========================================

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(blogUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="blog-details-page">
        <div className="blog-details-loading" role="status">
          <i className="fa-solid fa-spinner fa-spin" />
          <p>Loading article...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!blog) {
    return (
      <main className="blog-details-page">
        <div className="blog-details-empty">
          <i className="fa-regular fa-folder-open" />

          <h2>Blog Not Found</h2>

          <p>
            {error ||
              "The requested article could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/blogs")}
          >
            <i className="fa-solid fa-arrow-left" />
            Back to Blogs
          </button>
        </div>
      </main>
    );
  }

  // ========================================
  // JSX
  // ========================================

  return (
    <main className="blog-details-page">

      {/* =====================================
          HERO SECTION
      ===================================== */}

      <section className="blog-details-hero">

        <div className="blog-details-glow-one" />
        <div className="blog-details-glow-two" />

        <div className="container">

          <div className="blog-details-heading">

            {/* BREADCRUMB */}

            <nav
              className="blog-details-breadcrumb"
              aria-label="Breadcrumb"
            >
              <button
                type="button"
                onClick={() => navigate("/blogs")}
              >
                Blogs
              </button>

              <i className="fa-solid fa-chevron-right" />

              <span>Article Details</span>
            </nav>

            {/* CATEGORY */}

            <span className="blog-details-badge">
              <i className="fa-regular fa-newspaper" />

              {blog.blog_type || "ARTICLE"}
            </span>

            {/* TITLE */}

            <h1>{blog.title}</h1>

            {/* SHORT DESCRIPTION */}

            {blog.short_description && (
              <p className="blog-details-intro">
                {blog.short_description}
              </p>
            )}

            {/* META */}

            <div className="blog-details-meta">

              {/* AUTHOR */}

              <div className="blog-details-author">

                <div className="blog-details-author-avatar">
                  {blog.image ? (
                    <img
                      src={getImageUrl(blog.image)}
                      alt={blog.published || "Author"}
                      className="blog-details-author-img"
                    />
                  ) : (
                    <span>
                      {blog.published?.charAt(0)?.toUpperCase() ||
                        "V"}
                    </span>
                  )}
                </div>

                <div className="blog-details-author-info">
                  <span className="blog-details-author-name">
                    {blog.published || "VittaMoney Team"}
                  </span>

                  <small>Article Author</small>
                </div>

              </div>

              {/* DATE */}

              <div className="blog-details-meta-item">
                <i className="fa-regular fa-calendar" />
                <span>{publishedDate}</span>
              </div>

              {/* READING TIME */}

              <div className="blog-details-meta-item">
                <i className="fa-regular fa-clock" />
                <span>{readTime} min read</span>
              </div>

            </div>

            {/* =================================
                SOCIAL SHARING
            ================================= */}

            <div className="blog-details-top-share">

              <span className="blog-details-share-label">
                Share this article
              </span>

              <div className="blog-details-social-icons">

                <button
                  type="button"
                  className="blog-social-icon whatsapp"
                  onClick={shareWhatsApp}
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp" />
                </button>

                <button
                  type="button"
                  className="blog-social-icon facebook"
                  onClick={shareFacebook}
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                >
                  <i className="fa-brands fa-facebook-f" />
                </button>

                <button
                  type="button"
                  className="blog-social-icon linkedin"
                  onClick={shareLinkedIn}
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in" />
                </button>

                <button
                  type="button"
                  className="blog-social-icon twitter"
                  onClick={shareTwitter}
                  title="Share on X"
                  aria-label="Share on X"
                >
                  <i className="fa-brands fa-x-twitter" />
                </button>

                <button
                  type="button"
                  className="blog-social-icon copy"
                  onClick={copyLink}
                  title={copied ? "Link Copied" : "Copy Link"}
                  aria-label={
                    copied ? "Link copied" : "Copy link"
                  }
                >
                  <i
                    className={
                      copied
                        ? "fa-solid fa-check"
                        : "fa-solid fa-link"
                    }
                  />
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          ARTICLE SECTION
      ===================================== */}

      <section className="blog-details-content-section">

        <div className="container">

          <div className="blog-details-content-layout">

            {/* =================================
                BLOG MAIN COVER IMAGE
            ================================= */}

            {blog.bloger && (
              <div className="blog-details-main-image">

                <img
                  src={getImageUrl(blog.bloger)}
                  alt={blog.title}
                />

              </div>
            )}

            {/* =================================
                ARTICLE CONTENT CARD
            ================================= */}

            <article className="blog-details-article">

              <div className="blog-details-article-header">

                <span className="blog-details-small-label">
                  <i className="fa-solid fa-book-open" />
                  ARTICLE
                </span>

                <h2>{blog.title}</h2>

              </div>

              {/* ARTICLE CONTENT */}

              <div className="blog-details-description">

                {sections.length > 0 ? (

                  sections.map((section, index) => (

                    <React.Fragment
                      key={section.id || index}
                    >

                      <BlogSection
                        section={section}
                        blogTitle={blog.title}
                      />

                    </React.Fragment>

                  ))

                ) : (

                  (blog.content || "")
                    .split(/\r?\n/)
                    .filter((paragraph) => paragraph.trim())
                    .map((paragraph, index) => (

                      <p key={index}>{paragraph}</p>

                    ))

                )}

              </div>

            </article>

            {/* =================================
                USEFUL RESOURCES
            ================================= */}

            {externalLinks.length > 0 && (

              <div className="blog-details-ipo-banner">

                <div className="blog-details-resources-heading">

                  <div className="blog-details-resources-icon">
                    <i className="fa-solid fa-link" />
                  </div>

                  <div>
                    <h3>Useful Resources</h3>

                    <p>
                      Explore additional information
                      mentioned in this article.
                    </p>
                  </div>

                </div>

                <div className="blog-details-external-links">

                  {externalLinks.map((link, index) => (

                    <a
                      key={`${link.url}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="blog-details-external-link"
                    >

                      <span className="blog-resource-link-icon">
                        <i className="fa-solid fa-globe" />
                      </span>

                      <span className="blog-resource-link-content">

                        <strong>{link.label}</strong>

                        <small>{link.hostname}</small>

                      </span>

                      <i className="fa-solid fa-arrow-up-right-from-square" />

                    </a>

                  ))}

                </div>

              </div>

            )}

            {/* =================================
                BACK TO BLOGS
            ================================= */}

            <div className="blog-details-back">

              <button
                type="button"
                onClick={() => navigate("/blogs")}
              >

                <i className="fa-solid fa-arrow-left" />

                Back to All Blogs

              </button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default BlogDetails;
