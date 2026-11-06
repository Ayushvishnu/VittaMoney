




import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Gallery.css";



const galleryVideos = [
  {
    id: 1,
    title: "Discover More About VittaMoney",
    type: "horizontal",
    // category: "VittaMoney",
    description:
      "Discover more about VittaMoney and explore the world of unlisted shares.",
    embed:
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/UiZ4t7WxTfw" title="VittaMoney" frameborder="0" allowfullscreen></iframe>',
  },

  {
    id: 2,
    title: "Discover the Business Behind CIAL Unlisted Shares",
    type: "portrait",
    // category: "Unlisted Shares",
    description:
      "Explore CIAL unlisted shares and learn about Cochin International Airport’s business, revenue sources and key investment considerations.",
    embed: "https://youtube.com/shorts/UKZd8vDu6XE?si=mxbpjb1lD_CSvySj",
  },
  {
    id: 3,
    title: "Get to Know Kannur Airport Through KIAL Unlisted Shares",
    type: "portrait",
    // category: "Investment",
    description:
      "Take a closer look at KIAL unlisted shares and Kannur International Airport’s operations.",
    embed: "https://youtube.com/shorts/hgPhQqOx9EY?si=XYf065ZA6VmDgPRH",
  },

  {
    id: 4,
    title: "PharmEasy Unlisted Shares and the Business of Digital Healthcare ",
    type: "Portrait",
    category: "Unlisted Shares",
    description:
      "Discover the healthcare business behind the brand with PharmEasy unlisted shares.",
    embed: "https://youtube.com/shorts/C1ztwcCmDdc?si=N8cNyiGEkYn2uxGQ",
  },

  {
    id: 5,
    title: "MSEI Unlisted Shares Open a Window into the Exchange Business",
    type: "portrait",
    category: "IPO",
    description:
      "Explore MSEI unlisted shares and learn about the Metropolitan Stock Exchange’s business.",
    embed: "https://youtube.com/shorts/h2OHLH5-Mpo?si=j4F4BwYVSHykmBjn",
  },

  {
    id: 6,
    title: "Lakeshore Hospital Unlisted Shares Bring Healthcare into Focus",
    type: "portrait",
    category: "Investment",
    description:
      "Discover Lakeshore Hospital unlisted shares and the business behind its healthcare services.",
    embed: "https://youtube.com/shorts/hq2184KXgD4?si=bA-FAnphvw_w0-rY",
  },

  {
    id: 7,
    title: "Inside the Chip Business Behind Polymatech Unlisted Shares",
    type: "portrait",
    category: "VittaMoney",
    description:
      "Explore Polymatech unlisted shares and learn about its semiconductor business.",
    embed: "https://youtube.com/shorts/E940D7OOg_Q?si=hYc-tMqw01Q1UR-e",
  },

  // {
  //   id: 8,
  //   title: "inancial Education Shorts",
  //   type: "portrait",
  //   category: "Education",
  //   description:
  //     "Short educational videos about investments.",
  //   embed: "https://youtube.com/shorts/UKZd8vDu6XE?si=mxbpjb1lD_CSvySj",
  // },

//   {
//     id: 9,
//     title: "Financial Education Shorts",
//     type: "portrait",
//     category: "Education",
//     description:
//       "Short educational videos about investments.",
//     embed: "https://youtube.com/shorts/SgcPJ6PZuVU?si=irzKfF5mhO32DL5J",
//   },
//   {
//     id: 10,
//     title: "Financial Education Shorts",
//     type: "portrait",
//     category: "Education",
//     description:
//       "Short educational videos about investments.",
//     embed: "https://youtube.com/shorts/tdv8qEVKqo0?si=W2eEHE3l0S7iDvzo",
//   },
//  {
//     id: 11,
//     title: "Financial Education Shorts",
//     type: "portrait",
//     category: "Education",
//     description:
//       "Short educational videos about investments.",
//     embed: "https://youtube.com/shorts/ieH7fE8B0_Y?si=4KtZdYQBIhmN7B60",
//   },
//    {
//     id: 12,
//     title: "Financial Education Shorts",
//     type: "portrait",
//     category: "Education",
//     description:
//       "Short educational videos about investments.",
//     embed: "https://youtube.com/shorts/fEsjaeF-Wis?si=nt092IzVwDl6Lefj",
//   },
//  {
//     id: 13,
//     title: "Financial Education Shorts",
//     type: "landscape",
//     category: "Education",
//     description:
//       "Short educational videos about investments.",
//     embed: "https://youtube.com/shorts/TMmIYCVxIv0?si=gI922oYbyvmYZFs9",
//   },

];







// ==========================================
// GET YOUTUBE VIDEO ID
// ==========================================

// Supports:
// 1. Complete iframe embed code
// 2. YouTube embed URL
// 3. YouTube watch URL
// 4. YouTube Shorts URL
// 5. youtu.be URL
// 6. Plain YouTube video ID

const getYouTubeId = (embedCode) => {
  if (!embedCode) return "";

  const input = String(embedCode).trim();

  // Extract src from iframe code
  const iframeMatch = input.match(
    /src\s*=\s*["']([^"']+)["']/i
  );

  const source = iframeMatch
    ? iframeMatch[1]
    : input;

  // Allow plain video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(source)) {
    return source;
  }

  try {
    const url = new URL(source);

    const hostname = url.hostname.toLowerCase();

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "youtu.be",
      "www.youtu.be",
    ];

    if (!allowedHosts.includes(hostname)) {
      return "";
    }

    let videoId = "";

    if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      videoId = url.pathname.split("/")[1];
    } else if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else {
      const parts = url.pathname
        .split("/")
        .filter(Boolean);

      if (
        ["embed", "shorts", "live"].includes(parts[0])
      ) {
        videoId = parts[1];
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(videoId || "")
      ? videoId
      : "";
  } catch (error) {
    return "";
  }
};

// ==========================================
// GET VIDEO TYPE
// ==========================================

const getVideoType = (video) => {
  const type = String(
    video?.type || "horizontal"
  ).toLowerCase();

  return type === "portrait"
    ? "portrait"
    : "horizontal";
};

// ==========================================
// YOUTUBE THUMBNAIL
// ==========================================

const getYouTubeThumbnail = (id) => {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
};

// ==========================================
// MAIN GALLERY COMPONENT
// ==========================================

export default function Gallery() {
  const navigate = useNavigate();

  // ========================================
  // STATES
  // ========================================

  const [selectedCategory, setSelectedCategory] =
    useState("All Videos");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeVideo, setActiveVideo] =
    useState(null);

  const [thumbnailErrors, setThumbnailErrors] =
    useState({});

  const closeButtonRef = useRef(null);

  // ========================================
  // SCROLL TO TOP
  // ========================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  // ========================================
  // VALID VIDEOS
  // ========================================

  const availableVideos = useMemo(() => {
    return galleryVideos
      .map((video) => ({
        ...video,
        videoId: getYouTubeId(video.embed),
        orientation: getVideoType(video),
      }))
      .filter((video) => Boolean(video.videoId));
  }, []);

  // ========================================
  // CATEGORIES
  // ========================================

  const categories = useMemo(() => {
    return [
      "All Videos",
      ...new Set(
        availableVideos
          .map((video) => video.category)
          .filter(Boolean)
      ),
    ];
  }, [availableVideos]);

  // ========================================
  // SEARCH + CATEGORY FILTER
  // ========================================

  const filteredVideos = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return availableVideos.filter((video) => {
      const matchesCategory =
        selectedCategory === "All Videos" ||
        video.category === selectedCategory;

      const searchText = [
        video.title,
        video.description,
        video.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    availableVideos,
    selectedCategory,
    searchQuery,
  ]);

  // ========================================
  // OPEN VIDEO
  // ========================================

  const handlePlayVideo = (video) => {
    if (!video?.videoId) return;

    setActiveVideo(video);
  };

  // ========================================
  // CLOSE VIDEO
  // ========================================

  const handleCloseModal = () => {
    setActiveVideo(null);
  };

  // ========================================
  // ESCAPE KEY + SCROLL LOCK
  // ========================================

  useEffect(() => {
    if (!activeVideo) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [activeVideo]);

  // ========================================
  // RESET FILTERS
  // ========================================

  const resetFilters = () => {
    setSelectedCategory("All Videos");
    setSearchQuery("");
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="gallery-page" id="video-gallery">

      {/* =====================================
          HEADER
      ===================================== */}

      {/* <header className="gallery-header">

        <div className="container gallery-header__inner">


          <button
            type="button"
            className="gallery-back-btn"
            onClick={() => navigate("/")}
          >
            <i className="fa-solid fa-arrow-left" />
            Back to Home
          </button>


          <div className="gallery-brand">

            <span className="gallery-brand__logo">
              Vitta<span>Money</span>
            </span>

            <span className="gallery-brand__divider">
              /
            </span>

            <span className="gallery-brand__section">
              Video Gallery
            </span>

          </div>


          <div className="gallery-header__stats">

            <span className="gallery-header__pill">
              <i className="fa-solid fa-play" />
              {availableVideos.length} Videos
            </span>

          </div>

        </div>

      </header> */}

      {/* =====================================
          HERO
      ===================================== */}

      <section className="gallery-hero">

        <div className="container">

          <div className="gallery-hero__content">

            {/* BADGE */}

            <span className="gallery-hero__eyebrow">

              <i className="fa-brands fa-youtube" />

              VITTAMONEY VIDEO ACADEMY

            </span>

            {/* TITLE */}

            <h1 className="gallery-hero__title">

              Explore Our{" "}

              <span>Video Gallery</span>

            </h1>

            {/* DESCRIPTION */}

            <p className="gallery-hero__subtitle">
              Discover educational videos about
              unlisted shares, IPOs, investments,
              and financial markets.
            </p>

            {/* =================================
                SEARCH
            ================================= */}

            {/* <div className="gallery-search">

              <i className="fa-solid fa-magnifying-glass" />

              <input
                type="search"
                className="gallery-search__input"
                placeholder="Search videos, topics, or categories..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                aria-label="Search gallery videos"
              />

              {searchQuery && (

                <button
                  type="button"
                  className="gallery-search__clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark" />
                </button>

              )}

            </div> */}

          </div>

        </div>

      </section>

      {/* =====================================
          VIDEO COLLAGE SECTION
      ===================================== */}

      <section className="gallery-content">

        <div className="container">

          {/* =================================
              CATEGORY FILTERS
          ================================= */}

          {/* <div className="gallery-toolbar">

            <div className="gallery-categories">

              {categories.map((category) => (

                <button
                  key={category}
                  type="button"
                  className={`gallery-category-btn ${
                    selectedCategory === category
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  aria-pressed={
                    selectedCategory === category
                  }
                >
                  {category}
                </button>

              ))}

            </div>

            <span className="gallery-results-count">

              {filteredVideos.length} Videos

            </span>

          </div> */}

          {/* =================================
              EMPTY STATE
          ================================= */}

          {filteredVideos.length === 0 ? (

            <div className="gallery-empty">

              <div className="gallery-empty__icon">
                <i className="fa-solid fa-video-slash" />
              </div>

              <h3>No Videos Found</h3>

              <p>
                {availableVideos.length === 0
                  ? "No YouTube videos have been added yet."
                  : "No videos match your search or category."}
              </p>

              <button
                type="button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>

            </div>

          ) : (

            /* =================================
                RESPONSIVE VIDEO COLLAGE
            ================================= */

            // <div className="gallery-collage">

            //   {filteredVideos.map((video) => (

            //     <button
            //       key={video.id}
            //       type="button"
            //       className={`gallery-tile gallery-tile--${video.orientation}`}
            //       onClick={() => handlePlayVideo(video)}
            //       aria-label={`Play ${video.title}`}
            //     >


            //       {!thumbnailErrors[video.id] ? (

            //         <img
            //           className="gallery-tile__image"
            //           src={getYouTubeThumbnail(video.videoId)}
            //           alt=""
            //           loading="lazy"
            //           onError={() =>
            //             setThumbnailErrors((prev) => ({
            //               ...prev,
            //               [video.id]: true,
            //             }))
            //           }
            //         />

            //       ) : (

            //         <span className="gallery-tile__fallback">
            //           <i className="fa-brands fa-youtube" />
            //         </span>

            //       )}


            //       <span className="gallery-tile__overlay" />


            //       <span className="gallery-tile__top">

            //         <span className="gallery-tile__badge">
            //           {video.orientation === "portrait"
            //             ? "SHORT VIDEO"
            //             : "FULL VIDEO"}
            //         </span>

            //         {video.category && (
            //           <span className="gallery-tile__category">
            //             {video.category}
            //           </span>
            //         )}

            //       </span>


            //       <span className="gallery-tile__play">

            //         <i className="fa-solid fa-play" />

            //       </span>


            //       <span className="gallery-tile__bottom">

            //         <span className="gallery-tile__title">
            //           {video.title}
            //         </span>

            //         <span className="gallery-tile__watch">
            //           Watch Video

            //           <i className="fa-solid fa-arrow-right" />
            //         </span>

            //       </span>

            //     </button>

            //   ))}

            // </div>

<div className="gallery-collage">
  {filteredVideos.map((video) => (
    <button
      key={video.id}
      type="button"
      className={`gallery-tile gallery-tile--${video.orientation}`}
      onClick={() => handlePlayVideo(video)}
    >
      <img
        className="gallery-tile__image"
        src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
        alt={video.title}
        loading="lazy"
      />

      <span className="gallery-tile__overlay" />

      <span className="gallery-tile__play">
        <i className="fa-solid fa-play" />
      </span>

      <span className="gallery-tile__bottom">
        <span className="gallery-tile__title">
          {video.title}
        </span>

        <span className="gallery-tile__watch">
          Watch Video
          <i className="fa-solid fa-arrow-right" />
        </span>
      </span>
    </button>
  ))}
</div>



          )}

        </div>

      </section>

      {/* =====================================
          VIDEO PLAYER POPUP
      ===================================== */}

      {activeVideo && (

        <div
          className="gallery-video-modal"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >

          <div
            className={`gallery-video-modal__dialog gallery-video-modal__dialog--${activeVideo.orientation}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-video-modal-title"
          >

 

            <div className="gallery-video-modal__header">

              <div className="gallery-video-modal__heading">

                <span className="gallery-video-modal__badge">
                  <i className="fa-brands fa-youtube" />
                  NOW PLAYING
                </span>

                <h3 id="gallery-video-modal-title">
                  {activeVideo.title}
                </h3>

              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="gallery-video-modal__close"
                onClick={handleCloseModal}
                aria-label="Close video"
              >
                <i className="fa-solid fa-xmark" />
              </button>

            </div>

      

            <div
              className={`gallery-video-modal__player gallery-video-modal__player--${activeVideo.orientation}`}
            >

              <iframe
                key={activeVideo.videoId}
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&playsinline=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />

            </div>

         

            {activeVideo.description && (

              <div className="gallery-video-modal__info">

                <span>
                  <i className="fa-solid fa-circle-info" />
                  {activeVideo.category}
                </span>

                <p>{activeVideo.description}</p>

              </div>

            )}

          </div>

        </div>

      )}













    </div>
  );
}
