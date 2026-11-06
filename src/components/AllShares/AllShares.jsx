
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getUnlistedProducts } from "../../Api/unlistApi";

import "./AllShares.css";

export default function AllShares() {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // ==========================================
  // GET UNLISTED PRODUCTS API
  // ==========================================

  useEffect(() => {
    let active = true;

    const loadUnlistedProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUnlistedProducts();

        if (active) {
          setProducts(response);
        }

      } catch (err) {
        console.error("UNLISTED PRODUCTS ERROR:", err);

        if (active) {
          setError("Unable to load unlisted products.");
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUnlistedProducts();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // SCROLL + TITLE
  // ==========================================

  useEffect(() => {
    window.scrollTo(0, 0);

    document.title =
      "Explore Unlisted Shares | VittaMoney";
  }, []);

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getProductImage = (image) => {
    if (!image) return "";

    if (/^(https?:)?\/\//i.test(image)) {
      return image.startsWith("//")
        ? `https:${image}`
        : image;
    }

    return `https://vittamoney.com/${String(image).replace(/^\/+/, "")}`;
  };

  // ==========================================
  // DYNAMIC CATEGORY LIST
  // ==========================================

  const categories = useMemo(() => {
    const categoryNames = products
      .map((product) => product?.category_name)
      .filter(Boolean);

    return [
      "All",
      ...new Set(categoryNames),
    ];
  }, [products]);

  // ==========================================
  // SEARCH + FILTER + SORT
  // ==========================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.name,
          product.category_name,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
        );

      const matchesCategory =
        activeCategory === "All" ||
        product.category_name === activeCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "az") {
      result = [...result].sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      );
    }

    if (sortBy === "za") {
      result = [...result].sort((a, b) =>
        String(b.name || "").localeCompare(
          String(a.name || "")
        )
      );
    }

    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) =>
          Number(a.price) - Number(b.price)
      );
    }

    if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) =>
          Number(b.price) - Number(a.price)
      );
    }

    return result;
  }, [products, search, activeCategory, sortBy]);

  // ==========================================
  // NAVIGATE TO PRODUCT DETAILS
  // ==========================================

  const handleProductDetails = (product) => {
    if (!product?.id) return;

    navigate(
      `/allshares/${encodeURIComponent(
        String(product.id)
      )}`
    );
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setSortBy("default");
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="allshares-page">

      {/* ======================================
          PAGE HERO
      ====================================== */}

      <section className="allshares-hero">
        <div className="container">

          <nav
            className="allshares-breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">Home</Link>

            <i className="fa-solid fa-chevron-right" />

            <span aria-current="page">
              Unlisted Shares
            </span>
          </nav>

          <div className="allshares-hero-content">

            <span className="allshares-eyebrow">
              <i className="fa-solid fa-chart-line" />
              DISCOVER PRIVATE MARKETS
            </span>

            <h1>
              Explore <span>Unlisted Shares</span>
            </h1>

            <p>
              Discover pre-IPO and unlisted share
              opportunities with VittaMoney.
              Explore company information, minimum
              purchase quantities, and indicative pricing.
            </p>

            {/* PAGE STATS */}

            {/* <div className="allshares-hero-stats">

              <div className="allshares-stat">

                <div className="allshares-stat-icon">
                  <i className="fa-solid fa-building" />
                </div>

                <div>
                  <strong>{products.length}</strong>
                  <span>Unlisted Products</span>
                </div>

              </div>

              <div className="allshares-stat">

                <div className="allshares-stat-icon">
                  <i className="fa-solid fa-layer-group" />
                </div>

                <div>
                  <strong>
                    {categories.length - 1}
                  </strong>

                  <span>Categories</span>
                </div>

              </div>

            </div> */}

          </div>
        </div>
      </section>

      {/* ======================================
          PRODUCT LISTING
      ====================================== */}

      <section className="allshares-listing">

        <div className="container">

          {/* SECTION HEADING */}

          <div className="allshares-section-heading">

            <div>
              <span className="allshares-small-label">
                EXPLORE COMPANIES
              </span>

              <h2>
                Discover Unlisted Products
              </h2>

              <p>
                Browse unlisted shares across different
                categories and explore product details.
              </p>
            </div>

            <div className="allshares-total-count">
              <i className="fa-solid fa-building-columns" />

              {filteredProducts.length} Products
            </div>

          </div>

          {/* ======================================
              SEARCH AND SORT
          ====================================== */}

          <div className="allshares-toolbar">

            {/* SEARCH */}

            <div className="allshares-search">

              <i className="fa-solid fa-magnifying-glass" />

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search unlisted products..."
                aria-label="Search unlisted products"
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

            {/* SORT */}

            <div className="allshares-sort">

              <i className="fa-solid fa-arrow-down-a-z" />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                aria-label="Sort products"
              >
                <option value="default">
                  Default Order
                </option>

                <option value="az">
                  Name: A to Z
                </option>

                <option value="za">
                  Name: Z to A
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

            </div>
          </div>

          {/* ======================================
              DYNAMIC CATEGORY FILTERS
          ====================================== */}

          <div
            className="allshares-categories"
            role="group"
            aria-label="Filter products by category"
          >
            {categories.map((category) => (

              <button
                key={category}
                type="button"
                className={`allshares-category ${
                  activeCategory === category
                    ? "active"
                    : ""
                }`}
                aria-pressed={
                  activeCategory === category
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>

            ))}
          </div>

          {/* RESULT BAR */}

          <div className="allshares-result-bar">

            <p>
              Showing{" "}
              <strong>
                {filteredProducts.length}
              </strong>{" "}
              products
            </p>

            {(search ||
              activeCategory !== "All" ||
              sortBy !== "default") && (

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
                <i className="fa-solid fa-xmark" />
              </button>

            )}

          </div>

          {/* ======================================
              LOADING STATE
          ====================================== */}

          {loading && (
            <div
              className="allshares-empty"
              role="status"
            >
              <i className="fa-solid fa-spinner fa-spin" />

              <h3>Loading Unlisted Products...</h3>

              <p>
                Fetching products from VittaMoney.
              </p>
            </div>
          )}

          {/* ======================================
              ERROR STATE
          ====================================== */}

          {!loading && error && (
            <div
              className="allshares-empty"
              role="alert"
            >
              <i className="fa-solid fa-circle-exclamation" />

              <h3>Unable to Load Products</h3>

              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Retry
              </button>
            </div>
          )}

          {/* ======================================
              PRODUCT GRID
          ====================================== */}

          {!loading &&
            !error &&
            filteredProducts.length > 0 && (

            <div className="allshares-grid">

              {filteredProducts.map((product, index) => (

                <button
                  key={product.id ?? index}
                  type="button"
                  className="allshares-card"
                  onClick={() =>
                    handleProductDetails(product)
                  }
                  aria-label={`View details for ${product.name}`}
                >

                  {/* HOT BADGE */}

                  {product.is_hot && (
                    <span className="allshares-card-badge">
                      <i className="fa-solid fa-fire" />
                      {" "}Trending
                    </span>
                  )}

                  {/* PRODUCT IMAGE */}

                  <div className="allshares-card-top">

                    <div className="allshares-card-logo">

                      {product.image ? (
                        <img
                          src={getProductImage(product.image)}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <span>
                          {product.name?.charAt(0) || "V"}
                        </span>
                      )}

                    </div>

                    <div className="allshares-card-arrow">
                      <i className="fa-solid fa-arrow-up-right-from-square" />
                    </div>

                  </div>

                  {/* PRODUCT NAME */}

                  <div className="allshares-card-content">

                    <h3 title={product.name}>
                      {product.name}
                    </h3>

                    <span className="allshares-card-sector">
                      {product.category_name || "Unlisted"}
                    </span>

                    <p className="allshares-card-description">
                      Explore pricing and minimum share
                      quantity for this unlisted product.
                    </p>

                  </div>

                  {/* PRICE AND QUANTITY */}

                  <div className="allshares-card-bottom">

                    <span className="allshares-card-profile">
                      {product.quantity ?? "N/A"} Shares Min
                    </span>

                    <span className="allshares-card-view">
                      ₹ {product.price ?? "N/A"}
                    </span>

                  </div>

                </button>

              ))}

            </div>
          )}

          {/* ======================================
              EMPTY STATE
          ====================================== */}

          {!loading &&
            !error &&
            filteredProducts.length === 0 && (

            <div className="allshares-empty">

              <i className="fa-solid fa-building-circle-exclamation" />

              <h3>No Unlisted Products Found</h3>

              <p>
                Try searching for another product
                or changing the selected category.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>
          )}

          {/* DISCLAIMER */}

        

        </div>
      </section>

    </div>
  );
}
