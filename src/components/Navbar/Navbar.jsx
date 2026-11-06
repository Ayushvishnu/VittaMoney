
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./Navbar.css";
import { getUnlistedProducts } from "../../Api/unlistApi";

// ==========================================
// NAVIGATION LINKS
// ==========================================

const NAV_LINKS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Unlisted Shares",
    href: "/allshares",
  },
  {
    label: "Testimonials",
    href: "/testimonials",
  },
  {
    label: "Blogs",
    href: "/blogs",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

// ==========================================
// GET LOGIN STATUS
// ==========================================

const checkLoginStatus = () => {
  return Boolean(
    localStorage.getItem("token") ||
    localStorage.getItem("authToken")
  );
};

// ==========================================
// NAVBAR
// ==========================================

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // STATES
  // ==========================================

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("#home");

  // AUTHENTICATION
  const [isLoggedIn, setIsLoggedIn] = useState(
    checkLoginStatus
  );

  // SEARCH
  const searchRef = useRef(null);
  const pendingScrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] =
    useState(false);
  const [searchError, setSearchError] = useState("");

  // ==========================================
  // UPDATE LOGIN STATUS AFTER NAVIGATION
  // ==========================================

  useEffect(() => {
    setIsLoggedIn(checkLoginStatus());
  }, [location.pathname, location.key]);

  // ==========================================
  // LISTEN FOR STORAGE / AUTH CHANGES
  // ==========================================

  useEffect(() => {
    const updateAuth = () => {
      setIsLoggedIn(checkLoginStatus());
    };

    window.addEventListener("storage", updateAuth);
    window.addEventListener("authChanged", updateAuth);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);

  // ==========================================
  // NAVBAR SCROLL EFFECT + ACTIVE SECTION
  // ==========================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (location.pathname !== "/") return;

      const about = document.querySelector("#about");

      if (about) {
        const aboutTop =
          about.getBoundingClientRect().top;

        if (aboutTop <= 160) {
          setActiveSection("#about");
        } else {
          setActiveSection("#home");
        }
      } else {
        setActiveSection("#home");
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  // ==========================================
  // SCROLL TO ABOUT AFTER HOME NAVIGATION
  // ==========================================

  useEffect(() => {
    if (location.pathname !== "/") return;

    const target = pendingScrollRef.current;

    if (!target) return;

    pendingScrollRef.current = null;

    requestAnimationFrame(() => {
      const element = document.querySelector(target);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }, [location.pathname]);

  // ==========================================
  // SEARCH FOCUS
  // ==========================================

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // ==========================================
  // LOAD UNLISTED PRODUCTS
  // ==========================================

  const loadUnlistedProducts = async () => {
    try {
      setLoadingProducts(true);
      setSearchError("");

      const response = await getUnlistedProducts();

      // Support existing direct-array response and
      // wrapped API response formats.

      const productList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response?.data?.products)
              ? response.data.products
              : [];

      setProducts(productList);
    } catch (error) {
      console.error(
        "UNLISTED PRODUCTS ERROR:",
        error
      );

      setSearchError(
        "Unable to load unlisted products."
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // ==========================================
  // SEARCH TOGGLE
  // ==========================================

  const handleSearchToggle = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery("");
      return;
    }

    setSearchOpen(true);
    loadUnlistedProducts();
  };

  // ==========================================
  // OPEN SEARCH
  // ==========================================

  const getUnlistedProductsOpenSearch = () => {
    handleSearchToggle();
  };

  // ==========================================
  // CLOSE SEARCH
  // ==========================================

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // ==========================================
  // SIMPLE NAVIGATION FUNCTION
  // ==========================================

  const handleNavClick = (e, href) => {
    e.preventDefault();

    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");

    // ABOUT SECTION

    if (href === "#about") {
      setActiveSection("#about");

      if (location.pathname === "/") {
        document
          .querySelector("#about")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      } else {
        pendingScrollRef.current = "#about";
        navigate("/");
      }

      return;
    }

    // HOME

    if (href === "/") {
      setActiveSection("#home");

      if (location.pathname === "/") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        navigate("/");
      }

      return;
    }

    // ALL OTHER PAGES

    navigate(href);

    window.scrollTo(0, 0);
  };

  // ==========================================
  // ACTIVE LINK
  // ==========================================

  const isLinkActive = (href) => {
    if (href === "/") {
      return (
        location.pathname === "/" &&
        activeSection === "#home"
      );
    }

    if (href === "/allshares") {
      return (
        location.pathname === "/allshares" ||
        location.pathname.startsWith("/allshares/")
      );
    }

    if (href === "/testimonials") {
      return (
        location.pathname === "/testimonials" ||
        location.pathname.startsWith("/testimonials/")
      );
    }

    if (href === "/portfolio") {
      return location.pathname === "/portfolio";
    }

    return location.pathname === href;
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user_id");

    setIsLoggedIn(false);

    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login", { replace: true });
  };

  // ==========================================
  // SEARCH RESULT NAVIGATION
  // ==========================================

  const handleSearchResultClick = (product) => {
    if (!product?.id) return;

    setSearchOpen(false);
    setSearchQuery("");
    setMenuOpen(false);

    navigate(
      `/allshares/${encodeURIComponent(
        String(product.id)
      )}`
    );

    window.scrollTo(0, 0);
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const filteredSearchProducts = products.filter(
    (product) => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return [
        product?.name,
        product?.category_name,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );
    }
  );

  // ==========================================
  // JSX
  // ==========================================

  return (
    <>
      {/* =====================================
          MAIN NAVBAR
      ===================================== */}

      <header
        className={`navbar ${
          scrolled ? "navbar--scrolled" : ""
        }`}
        role="banner"
      >
        <div className="navbar__inner container">

          {/* LOGO */}

          <a
            href="/"
            className="navbar__logo"
            aria-label="VittaMoney home"
            onClick={(e) =>
              handleNavClick(e, "/")
            }
          >
            <img
              src="/images/VMLogo1.png"
              alt="VittaMoney"
              className="navbar__logo-img"
            />
            <h1 className="vm">Vitta &nbsp;Money</h1>
          </a>

          {/* =====================================
              DESKTOP LINKS
          ===================================== */}

          <nav
            className="navbar__links"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`navbar__link ${
                    active ? "active" : ""
                  }`}
                  onClick={(e) =>
                    handleNavClick(e, link.href)
                  }
                  aria-current={
                    active ? "page" : undefined
                  }
                >
                  {link.label}
                </a>
              );
            })}


            {/* {isLoggedIn && (
              <a
                href="/portfolio"
                className={`navbar__link ${
                  isLinkActive("/portfolio")
                    ? "active"
                    : ""
                }`}
                onClick={(e) =>
                  handleNavClick(e, "/portfolio")
                }
                aria-current={
                  isLinkActive("/portfolio")
                    ? "page"
                    : undefined
                }
              >
                My Portfolio
              </a>
            )} */}
          </nav>

          {/* =====================================
              NAVBAR ACTIONS
          ===================================== */}

          <div className="navbar__actions">

            {/* SEARCH BUTTON */}

            <button
              id="navbar-search-btn"
              type="button"
              className={`navbar__search-btn ${
                searchOpen ? "active" : ""
              }`}
              aria-label={
                searchOpen
                  ? "Close search"
                  : "Open search"
              }
              aria-expanded={searchOpen}
              onClick={
                getUnlistedProductsOpenSearch
              }
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>

            {/* =====================================
                LOGIN / LOGOUT BUTTON
            ===================================== */}
{/* 
            {isLoggedIn ? (
              <button

                id="navbar-explore-cta"
                type="button"
                className="btn btn-primary navbar__cta vm-navbar-logout"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
                Logout
              </button>
            ) : (
              <a
                id="navbar-explore-cta"

                href="/login"
                className="btn btn-primary navbar__cta"
                onClick={(e) =>
                  handleNavClick(e, "/login")
                }
              >
                Login
              </a>
            )} */}



{/* =====================================
    LOGIN / PROFILE ICON
===================================== */}

{isLoggedIn ? (
  <button
    id="navbar-profile-btn"
    type="button"
    className={`vm-navbar-profile-btn ${
      isLinkActive("/portfolio") ? "active" : ""
    }`}
    onClick={() => {
      setMenuOpen(false);
      setSearchOpen(false);
      setSearchQuery("");
      navigate("/portfolio");
    }}
    aria-label="My Portfolio"
    title="My Portfolio"
  >
    <i className="fa-regular fa-user" />
  </button>
) : (



<a
  id="navbar-explore-cta"
  href="/login"
  className="vm-navbar-login-premium"
  onClick={(e) => handleNavClick(e, "/login")}
>
  <span className="vm-navbar-login-shine" aria-hidden="true" />

  <span className="vm-navbar-login-text">
    Login
  </span>

  <span className="vm-navbar-login-icon">
<i class="fa-solid fa-fingerprint fa-fade"></i>
 </span>
</a>




)}



            {/* HAMBURGER */}

            <button
              id="navbar-hamburger"
              type="button"
              className={`navbar__hamburger ${
                menuOpen ? "open" : ""
              }`}
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() =>
                setMenuOpen((prev) => !prev)
              }
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================
          SEARCH PANEL
      ===================================== */}

      <div
        className={`search-panel ${
          searchOpen
            ? "search-panel--open"
            : ""
        }`}
        aria-hidden={!searchOpen}
      >
        <div className="container">
          <div className="search-panel__inner">

            <i className="fa-solid fa-magnifying-glass search-panel__icon" />

            <input
              id="navbar-search-input"
              ref={searchRef}
              className="search-panel__input"
              type="search"
              placeholder="Search unlisted shares by company name or sector..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              aria-label="Search shares"
              tabIndex={searchOpen ? 0 : -1}
            />

            <button
              type="button"
              className="search-panel__close"
              onClick={closeSearch}
              aria-label="Close search"
              tabIndex={searchOpen ? 0 : -1}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {/* SEARCH RESULTS */}

          <div>
            {searchOpen && (
              <ul className="search-panel__results">

                {/* LOADING */}

                {loadingProducts && (
                  <li className="search-panel__message">
                    Loading shares...
                  </li>
                )}

                {/* ERROR */}

                {searchError && (
                  <li className="search-panel__message">
                    {searchError}
                  </li>
                )}

                {/* RESULTS */}

                {!loadingProducts &&
                  !searchError &&
                  (
                    filteredSearchProducts.length === 0 ? (
                      <li className="search-panel__message">
                        No matching shares found.
                      </li>
                    ) : (
                      filteredSearchProducts.map(
                        (product) => (
                          <li key={product?.id}>
                            <button
                              type="button"
                              className="search-result-item"
                              onClick={() =>
                                handleSearchResultClick(product)
                              }
                            >
                              {product?.image && (
                                <img
                                  src={product.image}
                                  alt={
                                    product?.name ??
                                    "Unlisted share"
                                  }
                                  className="search-result-item__image"
                                />
                              )}

                              {product?.name ??
                                "Unlisted Share"}
                            </button>
                          </li>
                        )
                      )
                    )
                  )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* =====================================
          MOBILE MENU
      ===================================== */}

      <div
        className={`mobile-menu ${
          menuOpen
            ? "mobile-menu--open"
            : ""
        }`}
        aria-hidden={!menuOpen}
        id="mobile-nav-drawer"
      >
        {/* OVERLAY */}

        <div
          className="mobile-menu__overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />

        {/* MOBILE PANEL */}

        <nav
          className="mobile-menu__panel"
          aria-label="Mobile navigation"
        >
          {/* HEADER */}

          <div className="mobile-menu__header">
            <span className="mobile-menu__title">
              Menu
            </span>

            <button
              type="button"
              className="mobile-menu__close"
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {/* MOBILE NAV LINKS */}

          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link.href);

            return (
              <a
                key={link.href}
                href={link.href}
                className={`mobile-menu__link ${
                  active ? "active" : ""
                }`}
                onClick={(e) =>
                  handleNavClick(e, link.href)
                }
                aria-current={
                  active ? "page" : undefined
                }
              >
                <span>{link.label}</span>

                {active && (
                  <i className="fa-solid fa-arrow-right" />
                )}
              </a>
            );
          })}

          {/* =====================================
              MOBILE PORTFOLIO
          ===================================== */}

          {isLoggedIn && (
            <a
              href="/portfolio"
              className={`mobile-menu__link ${
                isLinkActive("/portfolio")
                  ? "active"
                  : ""
              }`}
              onClick={(e) =>
                handleNavClick(e, "/portfolio")
              }
              aria-current={
                isLinkActive("/portfolio")
                  ? "page"
                  : undefined
              }
            >
              <span>
                <i className="fa-regular fa-user vm-mobile-link-icon" />
                My Portfolio
              </span>

              {isLinkActive("/portfolio") && (
                <i className="fa-solid fa-arrow-right" />
              )}
            </a>
          )}

          {/* =====================================
              MOBILE CTA
          ===================================== */}

          {/* <a
            href="/allshares"
            className="btn btn-primary mobile-menu__cta"
            onClick={(e) =>
              handleNavClick(e, "/allshares")
            }
          >
            Explore Unlisted Shares
            <i className="fa-solid fa-arrow-right" />
          </a> */}

          {/* =====================================
              MOBILE LOGIN / LOGOUT
          ===================================== */}

          {isLoggedIn ? (
            <button
              type="button"
              className="mobile-menu__link vm-mobile-auth-link"
              onClick={handleLogout}
            >
              <span>
                <i className="fa-solid fa-arrow-right-from-bracket vm-mobile-link-icon" />
                Logout
              </span>

              <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <a
              href="/login"
              className={`mobile-menu__link ${
                isLinkActive("/login")
                  ? "active"
                  : ""
              }`}
              onClick={(e) =>
                handleNavClick(e, "/login")
              }
            >
              <span>
                <i className="fa-regular fa-user vm-mobile-link-icon" />
                Login
              </span>

              <i className="fa-solid fa-arrow-right" />
            </a>
          )}
        </nav>
      </div>
    </>
  );
}
