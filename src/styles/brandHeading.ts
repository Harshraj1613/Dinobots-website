// Single source of truth for the "brand wordmark" heading treatment — lifted
// verbatim from the Footer's large "DINOBOTS" heading (itself matching the
// Navbar brand text). About/Projects/Achievements/Team all reuse this exact
// font/weight/case/tracking/color treatment via DinobotsSectionHeading (or,
// where a section's heading isn't a single element — see About's two-line
// h2 — by spreading `brandHeadingStyle` directly) so every major heading on
// the site reads as one consistent identity. Only font-size/margin utilities
// are expected to vary per section; never the treatment itself.
import type { CSSProperties } from 'react'

export const BRAND_HEADING_FONT = "'Unbounded', sans-serif"

// Silver → graphite metallic gradient, used as a text-fill.
const BRAND_HEADING_GRADIENT = 'linear-gradient(180deg, #EDEDED 0%, #B8B8B8 45%, #6A6A6A 100%)'
// Bright top hairline + soft dark drop shadow + a whisper of brand red at
// the very base — the same embossed/industrial treatment as Footer/Navbar.
const BRAND_HEADING_TEXT_SHADOW =
  '0 1px 0 rgba(255,255,255,0.12), 0 2px 2px rgba(0,0,0,0.6), 0 3px 0 rgba(122,11,18,0.3)'

// Weight/case/tracking only — font-size, leading, and margins stay
// section-owned since they're tuned per layout.
export const BRAND_HEADING_CLASSNAME = 'font-extrabold uppercase tracking-tight'

export const brandHeadingStyle: CSSProperties = {
  fontFamily: BRAND_HEADING_FONT,
  backgroundImage: BRAND_HEADING_GRADIENT,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  textShadow: BRAND_HEADING_TEXT_SHADOW,
}
