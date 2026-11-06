import "./Footer.css";

const FOOTER_LINKS = [
  { label: "Unlisted", href: "/allshares" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Blog", href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
];

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    href: "https://www.instagram.com/vittamoney._/",
  },
  {
    name: "Facebook",
    icon: "fa-brands fa-facebook-f",
    href: "https://www.facebook.com/profile.php?id=61576865396867",
  },
  {
    name: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    href: "https://www.linkedin.com/in/vitta-money-631956422/",
  },
  {
    name: "YouTube",
    icon: "fa-brands fa-youtube",
    href: "https://www.youtube.com/@vittamoney",
  },
];

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">

      {/* TOP HEADER */}
      <div className="footer__header">

        <a
          href="https://vittamoney.com/"
          className="footer__logo"
          aria-label="VittaMoney Home"
        >
          <img
            src="/images/VMLogo.png"
            alt="VittaMoney"
            className="footer__logo-img"
          />

       
        </a>

        <div className="footer__header-actions">
        </div>
      </div>

      {/* DIVIDER */}
      <div className="footer__divider" />

      {/* MAIN CONTENT */}
      <div className="footer__content">

        {/* COMPANY DETAILS */}
        <div className="footer__about">

          <p className="footer__description">
            Vittamoney is a dedicated investment platform for
            unlisted shares, operated by Vittafin Securities Pvt Ltd
            and fully owned by Greekslabs Technologies Ltd.
          </p>

          <div className="footer__office">

            <div className="footer__office-icon">
              <i className="fa-solid fa-location-dot" />
            </div>

            <div className="footer__office-details">
              <h4>REGISTERED OFFICE</h4>

              <p>
                Vittafin Securities Pvt Ltd, Ebdah Tower,
                1st Floor, Tali - Puthiyapalam Road,
                Tali, Kozhikode-673002, Kerala
              </p>
            </div>

          </div>

        </div>

        {/* QUICK LINKS */}
        <div className="footer__column">

          <h3 className="footer__heading">
            <span />
            QUICK LINKS
          </h3>

          <ul className="footer__links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

        </div>

        {/* CONTACT */}
        <div className="footer__column">

          <h3 className="footer__heading">
            <span />
            CONTACT
          </h3>

          <div className="footer__contact-list">

            <a href="mailto:unlisted@vittafin.com">
              <span className="footer__contact-icon">
                <i className="fa-regular fa-envelope" />
              </span>
              <span>unlisted@vittafin.com</span>
            </a>

            <a href="tel:+919037954502">
              <span className="footer__contact-icon">
                <i className="fa-solid fa-phone" />
              </span>
              <span>+91 9037954502</span>
            </a>

          </div>

        </div>

        {/* SOCIAL MEDIA */}
        <div className="footer__column">

          <h3 className="footer__heading">
            <span />
            FOLLOW US
          </h3>

          <div className="footer__socials">

            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="footer__social-link"
                aria-label={social.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={social.icon} />
              </a>
            ))}

          </div>

        </div>

      </div>

      {/* BOTTOM DIVIDER */}
      <div className="footer__divider" />

      {/* COPYRIGHT */}
      <div className="footer__bottom">

        <p>
          © {new Date().getFullYear()} GreeksLabs Technologies Ltd.
          All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}