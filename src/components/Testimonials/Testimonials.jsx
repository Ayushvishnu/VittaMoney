import React, { useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { fetchTestimonials } from "../../Api/TestimonialsApi";
import { fetchHomeData } from "../../Api/categoryApi";

import "./Testimonials.css";

// ==========================================
// IMAGE URL HELPER
// ==========================================

const getTestimonialImage = (image) => {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("//")) {
    return `https:${image}`;
  }

  return `https://vittamoney.com/${String(image).replace(/^\/+/, "")}`;
};

// ==========================================
// TESTIMONIAL COMPONENT
// ==========================================

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FAQ STATES
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(0);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState("");

  // ==========================================
  // FETCH TESTIMONIAL API
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const loadTestimonials = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchTestimonials();

        const testimonialData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.testimonials)
              ? response.data.testimonials
              : [];

        if (isMounted) {
          setTestimonials(testimonialData);
        }
      } catch (err) {
        console.error("Testimonials API Error:", err);

        if (isMounted) {
          setError("Unable to load testimonials.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ==========================================
   FETCH FAQ DATA
========================================== */

  useEffect(() => {
    let isMounted = true;

    const loadFaqs = async () => {
      try {
        setFaqLoading(true);
        setFaqError("");

        const response = await fetchHomeData();

        console.log("FAQ API RESPONSE:", response);

        const faqData = Array.isArray(response?.faqs)
          ? response.faqs
          : Array.isArray(response?.data?.faqs)
            ? response.data.faqs
            : [];

        if (isMounted) {
          setFaqs(faqData);
        }
      } catch (err) {
        console.error("FAQ API Error:", err);

        if (isMounted) {
          setFaqError("Unable to load FAQs.");
        }
      } finally {
        if (isMounted) {
          setFaqLoading(false);
        }
      }
    };

    loadFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <section
        id="testimonials"
        className="section section-soft testimonials-section"
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          {/* SECTION HEADER */}

          <div className="section-header centered">
            <span className="eyebrow section-eyebrow">User Stories</span>

            <h2 id="testimonials-heading">What Our Users Say</h2>

            <p>
              Discover experiences shared by our VittaMoney users and investors.
            </p>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="testimonials-api-state" role="status">
              <i className="fa-solid fa-spinner fa-spin" />
              <p>Loading testimonials...</p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="testimonials-api-state" role="alert">
              <i className="fa-solid fa-circle-exclamation" />
              <p>{error}</p>
            </div>
          )}

          {/* TESTIMONIAL CAROUSEL */}

          {!loading && !error && testimonials.length > 0 && (
            <div className="testimonials-carousel-wrapper">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={1}
                spaceBetween={20}
                loop={testimonials.length > 3}
                speed={700}
                autoplay={
                  testimonials.length > 1
                    ? {
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                    : false
                }
                navigation={
                  testimonials.length > 1
                    ? {
                        nextEl: ".testimonials-next",
                        prevEl: ".testimonials-prev",
                      }
                    : false
                }
                pagination={{
                  clickable: true,
                  el: ".testimonials-pagination",
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },

                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                }}
                className="testimonials-swiper"
              >
                {testimonials.map((testimonial, index) => (
                  <SwiperSlide key={testimonial?.id ?? index}>
                    <figure
                      className="testimonial-card card"
                      id={`testimonial-${testimonial?.id ?? index}`}
                    >
                      {/* QUOTE ICON */}

                      <div
                        className="testimonial-card__quote-mark"
                        aria-hidden="true"
                      >
                        "
                      </div>

                      {/* FEEDBACK */}

                      <blockquote className="testimonial-card__text">
                        {testimonial?.feedback || "No feedback available."}
                      </blockquote>

                      {/* USER INFORMATION */}

                      <figcaption className="testimonial-card__footer">
                        {/* USER IMAGE */}

                        <div className="testimonial-card__avatar">
                          {testimonial?.image ? (
                            <img
                              src={getTestimonialImage(testimonial.image)}
                              alt={testimonial?.name || "Investor"}
                              className="testimonial-card__avatar-img"
                              loading="lazy"
                            />
                          ) : (
                            <span>
                              {testimonial?.name?.charAt(0)?.toUpperCase() ||
                                "V"}
                            </span>
                          )}
                        </div>

                        {/* NAME AND ROLE */}

                        <div>
                          <div className="testimonial-card__name">
                            {testimonial?.name || "VittaMoney User"}
                          </div>

                          <div className="testimonial-card__role">
                            {testimonial?.role || "VittaMoney Investor"}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* CAROUSEL CONTROLS */}

              {testimonials.length > 1 && (
                <div className="testimonials-controls">
                  <div className="testimonials-pagination" />

                  <div className="testimonials-arrows">
                    <button
                      type="button"
                      className="testimonials-prev"
                      aria-label="Previous testimonial"
                    >
                      <i class="fa-solid fa-angle-left"></i>{" "}
                    </button>

                    <button
                      type="button"
                      className="testimonials-next"
                      aria-label="Next testimonial"
                    >
                      <i class="fa-solid fa-angle-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && !error && testimonials.length === 0 && (
            <div className="testimonials-api-state">
              <i className="fa-regular fa-comment-dots" />
              <p>No testimonials are available right now.</p>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
    FAQ SECTION
========================================== */}

{/* ==========================================
    FAQ SECTION - BELOW TESTIMONIALS
========================================== */}

<section
  id="faq"
  className="news-faq-wrapper"
  aria-labelledby="faq-heading"
>
  {/* BACKGROUND EFFECTS */}

  <div className="nf-green-glow" />
  <div className="faq-blue-glow" />

  <div className="faq-section">

    <div className="container">

      <div className="row align-items-start g-5">

        {/* =====================================
            LEFT SIDE - HEADING
        ===================================== */}

        <div className="col-lg-5">

          <div className="faq-left-content">

            {/* FAQ BADGE */}

            <span className="faq-tag">
              FAQ
            </span>

            {/* MAIN TITLE */}

            <h2
              id="faq-heading"
              className="faq-title"
            >
              Frequently
              <br />
              <span>Asked Questions</span>
            </h2>

            {/* DESCRIPTION */}

            <p className="faq-subtitle">
              Find answers to common questions about
              investing in unlisted shares, our process,
              and how we ensure a smooth and
              transparent experience.
            </p>

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE - FAQ ACCORDION
        ===================================== */}

        <div className="col-lg-7">

          <div
            className="accordion faq-accordion"
            id="faqAccordion"
          >

            {/* LOADING */}

            {faqLoading && (

              <div className="faq-api-state" role="status">

                <i className="fa-solid fa-spinner fa-spin" />

                <p>Loading frequently asked questions...</p>

              </div>

            )}

            {/* ERROR */}

            {!faqLoading && faqError && (

              <div className="faq-api-state" role="alert">

                <i className="fa-solid fa-circle-exclamation" />

                <p>{faqError}</p>

              </div>

            )}

            {/* =====================================
                FAQ ITEMS - API MAPPING
            ===================================== */}

            {!faqLoading &&
              !faqError &&
              faqs.map((item, index) => (

                <div
                  key={item?.id ?? index}
                  className={`accordion-item faq-item ${
                    activeFaq === index
                      ? "faq-item-active"
                      : ""
                  }`}
                >

                  {/* QUESTION */}

                  <h3 className="accordion-header">

                    <button
                      type="button"
                      id={`faq-question-${index}`}
                      className={`accordion-button faq-button ${
                        activeFaq === index
                          ? ""
                          : "collapsed"
                      }`}
                      aria-expanded={activeFaq === index}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() =>
                        setActiveFaq(
                          activeFaq === index ? -1 : index
                        )
                      }
                    >

                      <span className="faq-question-text">
                        {item.question}
                      </span>

                      <span
                        className="faq-arrow"
                        aria-hidden="true"
                      >
                        <i className="fa-solid fa-arrow-up-right" />
                      </span>

                    </button>

                  </h3>

                  {/* ANSWER */}

                  {activeFaq === index && (

                    <div
                      id={`faq-answer-${index}`}
                      className="accordion-collapse"
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                    >

                      <div className="accordion-body faq-body">

                        {item.answer}

                      </div>

                    </div>

                  )}

                </div>

              ))}

            {/* EMPTY STATE */}

            {!faqLoading &&
              !faqError &&
              faqs.length === 0 && (

                <div className="faq-api-state">

                  <i className="fa-regular fa-circle-question" />

                  <p>
                    No frequently asked questions available.
                  </p>

                </div>

              )}

          </div>

        </div>

      </div>

    </div>

  </div>

</section>

    </>
  );
}
