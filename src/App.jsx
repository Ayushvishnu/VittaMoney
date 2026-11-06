



import { useEffect } from "react";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";

import Testimonials from "./components/Testimonials/Testimonials";
import Gallery from "./components/Gallery/Gallery";
import Footer from "./components/Footer/Footer";

import AllShares from "./components/AllShares/AllShares";
import ShareDetails from "./components/ShareDetails/ShareDetails";
import Contact from "./components/Contact/Contact";
import Blog from "./components/Blogs/Blogs";
import BlogDetails from "./components/BlogDetails/BlogDetails";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Portfolio from "./components/Portfolio/Portfolio";
import DiwaliEffect from "./components/DiwaliEffect/DiwaliEffect";

import "./App.css";

// =========================================
// HOME PAGE
// =========================================

function HomePage({ onNavigateToGallery }) {
  return (
    <>
      <Hero />
   
    </>
  );
}

// =========================================
// MAIN APP
// =========================================

function App() {
  const navigate = useNavigate();
  const location = useLocation();

// HIDE NAVBAR AND FOOTER ON AUTH PAGES

const isAuthPage = ["/login", "/register"].includes(
  location.pathname.replace(/\/+$/, "") || "/"
);


  const currentPage =
    location.pathname === "/gallery"
      ? "gallery"
      : "home";

  // =========================================
  // SCROLL ON ROUTE CHANGE
  // =========================================

  useEffect(() => {
    if (location.hash && location.pathname === "/") {
      const targetId = location.hash;

      const timeout = setTimeout(() => {
        const element = document.getElementById(
          targetId.substring(1)
        );

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      return () => clearTimeout(timeout);
    }

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [location.pathname, location.hash]);

  // =========================================
  // NAVIGATION FUNCTION
  // =========================================

  const handleNavigate = (
    page,
    targetId = null,
    videoId = null
  ) => {

    // VIDEO GALLERY

    if (page === "gallery") {
      navigate("/gallery", {
        state: {
          videoId: videoId || null,
        },
      });

      return;
    }

    // ALL SHARES PAGE

    if (page === "shares") {
      navigate("/allshares");
      return;
    }

    // HOME SECTIONS

    if (targetId && targetId !== "#home") {
      navigate(`/${targetId}`);

      // Same URL already active aanelum scroll cheyyanam
      if (
        location.pathname === "/" &&
        location.hash === targetId
      ) {
        const element = document.getElementById(
          targetId.substring(1)
        );

        element?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    // HOME

    navigate("/");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>

      {/* NAVBAR */}

      {/* <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      /> */}

      {!isAuthPage && (
  <Navbar
    currentPage={currentPage}
    onNavigate={handleNavigate}
  />
)}

      {/* ROUTES */}

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <main>
              <HomePage
                onNavigateToGallery={(videoId) =>
                  handleNavigate(
                    "gallery",
                    null,
                    videoId
                  )
                }
              />
            </main>
          }
        />

        {/* ALL UNLISTED SHARES */}

        <Route
          path="/allshares"
          element={
            <main>
              <AllShares />
            </main>
          }
        />

        {/* INDIVIDUAL SHARE DETAILS */}

        <Route
          // path="/unlisted-shares/:slug"
                    path="/allshares/:slug"

          element={
            <main>
              <ShareDetails />
            </main>
          }
        />




<Route path="/contact" element={<Contact />} />

<Route path="/testimonials" element={<Testimonials />} />
<Route path="/blogs" element={<Blog />} />
<Route path="/gallery" element={<Gallery />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

<Route path="/portfolio" element={<Portfolio />} />
<Route path="/diwali" element={<DiwaliEffect />} />


<Route
  path="/blogdetails/:slug"
  element={<BlogDetails />}
/>




        {/* VIDEO GALLERY */}

        <Route
          path="/gallery"
          element={
            <main>
              <Gallery
                onBackToHome={() =>
                  handleNavigate("home")
                }
                initialVideoId={
                  location.state?.videoId || null
                }
              />
            </main>
          }
        />

        {/* INVALID ROUTES */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Routes>

      {/* FOOTER */}

      {/* <Footer
        currentPage={currentPage}
        onNavigate={handleNavigate}
      /> */}

{!isAuthPage && (
  <Footer
    currentPage={currentPage}
    onNavigate={handleNavigate}
  />
)}


    </>
  );
}

export default App;

