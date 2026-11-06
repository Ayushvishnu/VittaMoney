
import React, { useState } from "react";
import Swal from "sweetalert2";
import "./Helpline.css";

function Helpline() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [isOpen, setIsOpen] = useState(false);

  // ==========================================
  // SINGLE HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN / CLOSE MODAL
  // ==========================================

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // ==========================================
  // WHATSAPP SUBMISSION
  // ==========================================

  const handleWhatsApp = (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !phone || !email || !message) {
      Swal.fire({
        icon: "warning",
        text: "Please fill all fields.",
        confirmButtonColor: "#8D3A4A",
      });
      return;
    }

    const whatsappNumber = "919037954502";

    const text = `Hi, I'm ${name}!

You can reach me at:

Phone: ${phone}
Email: ${email}

Message:
${message}

Looking forward to hearing from you!`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      text
    )}`;

    // Open WhatsApp
    window.open(url, "_blank", "noopener,noreferrer");

    // Close modal
    closeModal();

    // Clear form
    setFormData({
      name: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  return (
    <>
      {/* ==========================================
          FLOATING HELPLINE BUTTON
      ========================================== */}

      <button
        type="button"
        className="vm-floating-helpline"
        onClick={openModal}
        aria-label="Talk to an Expert"
        title="Talk to an Expert"
      >
        <span className="vm-floating-helpline-pulse" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
          <path d="M3 14h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z" />
          <path d="M21 14h-3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-4Z" />
          <path d="M19 20a5 5 0 0 1-5 3h-3" />
        </svg>

        <span className="vm-floating-helpline-tooltip">
          Need Help?
        </span>
      </button>

      {/* ==========================================
          HELPLINE MODAL
      ========================================== */}

      {isOpen && (
        <div
          className="vm-helpline-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="vm-helpline-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vm-helpline-title"
          >
            {/* MODAL HEADER */}

            <div className="vm-helpline-header">
              <div className="vm-helpline-header-content">
                <div className="vm-helpline-header-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
                    <rect x="3" y="13" width="5" height="7" rx="2" />
                    <rect x="16" y="13" width="5" height="7" rx="2" />
                  </svg>
                </div>

                <div>
                  <span className="vm-helpline-eyebrow">
                    VITTAMONEY SUPPORT
                  </span>

                  <h3 id="vm-helpline-title">
                    Talk to an Expert
                  </h3>
                </div>
              </div>

              <button
                type="button"
                className="vm-helpline-close"
                onClick={closeModal}
                aria-label="Close Helpline"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="vm-helpline-body">
              <p className="vm-helpline-description">
                Have questions about unlisted shares?
                Share your details and connect with our team
                through WhatsApp.
              </p>

              <form onSubmit={handleWhatsApp}>
                {/* FULL NAME */}

                <div className="vm-helpline-field">
                  <label htmlFor="vm-help-name">
                    Full Name
                  </label>

                  <input
                    id="vm-help-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>

                {/* PHONE */}

                <div className="vm-helpline-field">
                  <label htmlFor="vm-help-phone">
                    Phone Number
                  </label>

                  <input
                    id="vm-help-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </div>

                {/* EMAIL */}

                <div className="vm-helpline-field">
                  <label htmlFor="vm-help-email">
                    Email Address
                  </label>

                  <input
                    id="vm-help-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* MESSAGE */}

                <div className="vm-helpline-field">
                  <label htmlFor="vm-help-message">
                    Your Message
                  </label>

                  <textarea
                    id="vm-help-message"
                    rows={4}
                    name="message"
                    placeholder="Tell us about your requirement..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="vm-helpline-submit"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.49 1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
                    <path d="M12.04 2A9.94 9.94 0 0 0 3.5 17.07L2 22l5.05-1.45A9.99 9.99 0 1 0 12.04 2Zm0 18.19a8.18 8.18 0 0 1-4.17-1.14l-.3-.18-3 .86.89-2.92-.2-.3a8.2 8.2 0 1 1 6.78 3.68Z" />
                  </svg>

                  Speak to an Expert

                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <p className="vm-helpline-footer-text">
                You will be redirected to WhatsApp to send
                your message.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Helpline;
