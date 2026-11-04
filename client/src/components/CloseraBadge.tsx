/* ============================================================
   CloseraBadge — "מבית מכללת Closera" with the college logo.

   The logo is raster artwork with a light and a dark version;
   both are rendered and CSS shows the one that matches the theme,
   so the badge never flashes the wrong ink on a theme switch.
   ============================================================ */

import logoOnDark from "@/assets/closera-logo-white.webp";
import logoOnLight from "@/assets/closera-logo.webp";

interface CloseraBadgeProps {
  /** Rendered logo height in px. */
  height?: number;
  className?: string;
}

export default function CloseraBadge({ height = 24, className = "" }: CloseraBadgeProps) {
  return (
    <a
      href="https://closera.co.il"
      target="_blank"
      rel="noopener noreferrer"
      className={`closera-badge ${className}`}
      aria-label="מבית מכללת Closera — לאתר המכללה"
    >
      <span className="closera-badge-label">מבית מכללת</span>
      <img src={logoOnDark} alt="" aria-hidden="true" className="closera-logo-on-dark" style={{ height }} />
      <img src={logoOnLight} alt="" aria-hidden="true" className="closera-logo-on-light" style={{ height }} />
    </a>
  );
}
