
import React, { useEffect, useState } from "react";
import "./Contact.css";

// ==========================================
// CONTACT DETAILS
// ==========================================

const CONTACT_PHONE = "919037954502";
const CONTACT_EMAIL = "unlisted@vittafin.com";

const CONTACT_ADDRESS =
  "EBADH TOWER - 1st Floor, Tali-Puthiyapalam Road, Kozhikode - 673002, Kerala";

const GOOGLE_MAP_URL =
  `https://www.google.com/maps?q=${encodeURIComponent(CONTACT_ADDRESS)}&output=embed`;

const GOOGLE_DIRECTIONS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS)}`;

// ==========================================
// CONTACT COMPONENT
// ==========================================

function Contact() {

  // ========================================
  // FORM STATE
  // ========================================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  // ========================================
  // PAGE INITIALIZATION
  // ========================================

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact Us | VittaMoney";
  }, []);

  // ========================================
  // SINGLE INPUT CHANGE HANDLER
  // ========================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // ========================================
  // SEND TO WHATSAPP
  // ========================================

  const sendToWhatsApp = (e) => {
    e.preventDefault();

    const text = `*New Contact Request*

First Name: ${formData.firstName}
Last Name: ${formData.lastName}

Email: ${formData.email}

Phone: ${formData.phone}

Message:
${formData.message}`;

    const url =
      `https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(text)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <main className="vm-contact-page">

      {/* =====================================
          CONTACT SECTION
      ===================================== */}

      <section className="vm-contact-section">

        {/* BACKGROUND IMAGE FROM OLD DESIGN */}

        <img
          src="/images/nav.png"
          alt=""
          className="vm-contact-nav-img"
          aria-hidden="true"
        />

        {/* BACKGROUND GLOW */}

        <div className="vm-contact-glow vm-contact-glow-one" />
        <div className="vm-contact-glow vm-contact-glow-two" />

        <div className="container">

          {/* =================================
              SECTION HEADER
          ================================= */}

          <div className="vm-contact-heading">

            <span className="vm-contact-tag">

              <i className="fa-regular fa-envelope" />

              CONTACT US

            </span>

            <h1>
              Chat With <span>Our Team</span>
            </h1>

            <p>
              Have questions about unlisted shares,
              pre-IPO opportunities, or our services?
              Reach out to our team. We're happy to help.
            </p>

          </div>

          {/* =================================
              CONTACT GRID
          ================================= */}

          <div className="vm-contact-grid">

            {/* =================================
                LEFT SIDE - CONTACT DETAILS
            ================================= */}

            <div className="vm-contact-info">

              <div className="vm-contact-info-top">

                <span className="vm-contact-small-title">
                  WE'RE HERE TO HELP
                </span>

                <h2>Let's Start a Conversation</h2>

                <p>
                  Whether you're exploring unlisted shares
                  or need assistance, connect with us through
                  any of the following options.
                </p>

              </div>

              {/* GIVE US A CALL */}

              <a
                href={`tel:+${CONTACT_PHONE}`}
                className="vm-contact-info-item"
              >

                <div className="vm-contact-info-icon">
                  <i className="fa-solid fa-phone-volume" />
                </div>

                <div className="vm-contact-info-content">

                  <h3>Give us a Call</h3>

                  <p>+91 9037954502</p>

                </div>

                

              </a>

              {/* CONNECT WITH US */}

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="vm-contact-info-item"
              >

                <div className="vm-contact-info-icon">
                  <i className="fa-regular fa-envelope" />
                </div>

                <div className="vm-contact-info-content">

                  <h3>Connect with Us</h3>

                  <p>{CONTACT_EMAIL}</p>

                </div>

                

              </a>

              {/* LET'S MEET */}

              <a
                href={GOOGLE_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="vm-contact-info-item"
              >

                <div className="vm-contact-info-icon">
                  <i className="fa-solid fa-location-dot" />
                </div>

                <div className="vm-contact-info-content">

                  <h3>Let's Meet</h3>

                  <p>
                    EBADH TOWER - 1st Floor
                    <br />
                    Tali-Puthiyapalam Road,
                    <br />
                    Kozhikode - 673002, Kerala
                  </p>

                </div>

                

              </a>

              {/* SUPPORT NOTE */}

              <div className="vm-contact-support-note">

                <div className="vm-contact-support-icon">
                  <i className="fa-solid fa-headset" />
                </div>

                <div>

                  <strong>Need Assistance?</strong>

                  <p>
                    Our team is ready to guide you
                    through your enquiries.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================
                RIGHT SIDE - CONTACT FORM
            ================================= */}

            <div className="vm-contact-form-card">

              {/* FORM HEADING */}

              <div className="vm-contact-form-header">

                <div className="vm-contact-form-heading-row">

                  <div>

                    <span className="vm-contact-form-eyebrow">
                      SEND AN ENQUIRY
                    </span>

                    <h2>Get In Touch!</h2>

                  </div>

                 

                </div>

                <p>
                  Fill in your details and send your
                  enquiry directly through WhatsApp.
                </p>

              </div>

              {/* =================================
                  FORM
              ================================= */}

              <form onSubmit={sendToWhatsApp}>

                {/* FIRST NAME + LAST NAME */}

                <div className="vm-contact-form-row">

                  <div className="vm-contact-field">

                    <label htmlFor="contactFirstName">
                      First Name <span>*</span>
                    </label>

                    <input
                      id="contactFirstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      autoComplete="given-name"
                      required
                    />

                  </div>

                  <div className="vm-contact-field">

                    <label htmlFor="contactLastName">
                      Last Name
                    </label>

                    <input
                      id="contactLastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      autoComplete="family-name"
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="vm-contact-field">

                  <label htmlFor="contactEmail">
                    Email Address <span>*</span>
                  </label>

                  <div className="vm-contact-input-wrap">

                    <i className="fa-regular fa-envelope" />

                    <input
                      id="contactEmail"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />

                  </div>

                </div>

                {/* PHONE NUMBER */}

                <div className="vm-contact-field">

                  <label htmlFor="contactPhone">
                    Phone Number <span>*</span>
                  </label>

                  <div className="vm-contact-input-wrap">

                    <i className="fa-solid fa-phone" />

                    <input
                      id="contactPhone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      autoComplete="tel"
                      required
                    />

                  </div>

                </div>

                {/* MESSAGE */}

                <div className="vm-contact-field">

                  <label htmlFor="contactMessage">
                    Your Message <span>*</span>
                  </label>

                  <textarea
                    id="contactMessage"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    rows="5"
                    required
                  />

                </div>

                {/* SEND MESSAGE */}

                <button
                  type="submit"
                  className="vm-contact-submit"
                >

                  <i className="fa-brands fa-whatsapp" />

                  <span>Send Message</span>

                  <i className="fa-solid fa-arrow-right" />

                </button>

                <p className="vm-contact-form-note">

                  <i className="fa-solid fa-lock" />

                  Your details are used to prepare your
                  WhatsApp enquiry.

                </p>

              </form>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          GOOGLE MAP SECTION
      ===================================== */}

      <section className="vm-contact-location">

        <div className="container">

          {/* MAP HEADING */}

          <div className="vm-contact-location-heading">

            <div>

              <span className="vm-contact-location-tag">

                <i className="fa-solid fa-location-dot" />

                OUR LOCATION

              </span>

              <h2>
                Find Us <span>On The Map</span>
              </h2>

              <p>
                Visit our office in Kozhikode, Kerala.
              </p>

            </div>

            <a
              href={GOOGLE_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="vm-contact-map-link"
            >

              Get Directions

              <i className="fa-solid fa-arrow-up-right-from-square" />

            </a>

          </div>

          {/* GOOGLE MAP */}

          <div className="vm-contact-map-box">

            <iframe
              title="VittaMoney Office Location"
              src={GOOGLE_MAP_URL}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* MAP INFO CARD */}

            <div className="vm-contact-map-address">

              <div className="vm-contact-map-pin">
                <i className="fa-solid fa-location-dot" />
              </div>

              <div>

                <strong>VittaMoney Office</strong>

                <p>
                  EBADH Tower, Kozhikode, Kerala
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Contact;
