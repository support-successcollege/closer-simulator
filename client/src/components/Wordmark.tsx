/* ============================================================
   Wordmark — the CLOSER mark, set rather than drawn.

   Setting the mark in the app's own type rather than shipping
   raster artwork means it inherits the current ink, stays crisp
   at any size, and picks up the single accent the rest of the
   system uses — so it needs no plate painted behind it to stay
   visible when the theme changes.
   ============================================================ */

interface WordmarkProps {
  /** Rendered height of the mark, in rem-ish CSS units. */
  size?: "sm" | "md" | "lg";
  /** Force a specific ink — used on the sign-in plate, which is
      always dark regardless of the active theme. */
  tone?: "auto" | "onDark";
  className?: string;
}

const SIZES: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "0.75rem",
  md: "1.0625rem",
  lg: "1.5rem",
};

export default function Wordmark({ size = "md", tone = "auto", className = "" }: WordmarkProps) {
  const onDark = tone === "onDark";
  return (
    <span
      className={`wordmark ${className}`}
      style={{
        fontSize: SIZES[size],
        color: onDark ? "#f2f1ed" : "var(--foreground)",
      }}
      role="img"
      aria-label="CLOSER"
    >
      {/* The accent falls on the closing syllable — the part of the
          word the product is named for. */}
      <span aria-hidden="true">CLOS</span>
      <span aria-hidden="true" style={{ color: onDark ? "#93a6ff" : "var(--accent)" }}>ER</span>
    </span>
  );
}
