import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Camera, Code2, Lock, Mail, type LucideIcon } from 'lucide-react'
import { footerContent, type SocialIcon } from '../content/footer'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const HEADING_FONT = "'Unbounded', sans-serif"
const BODY_FONT = "'Inter', sans-serif"
const META_FONT = "'IBM Plex Sans', sans-serif"

// Same black + red signature system as Hero/Navbar — the footer is the
// "system end" scene, so it leans on the identical palette rather than
// introducing a new one.
const RED = '#B5121B'
const SILVER = '#D7D7D7'
const MUTED = 'rgba(215,215,215,0.55)'
const FAINT = 'rgba(215,215,215,0.35)'

// Reuses the exact wordmark treatment from Navbar's brand text, so
// "DINOBOTS" reads as the same identity in both places.
const BRAND_GRADIENT = 'linear-gradient(180deg, #EDEDED 0%, #B8B8B8 45%, #6A6A6A 100%)'
const BRAND_TEXT_SHADOW = '0 1px 0 rgba(255,255,255,0.12), 0 2px 2px rgba(0,0,0,0.6), 0 3px 0 rgba(122,11,18,0.3)'

// lucide-react dropped brand/logo glyphs (Github/Instagram/Linkedin aren't
// exported by the installed version) — these generic stroke icons stand in
// for them, matched by their visible text label instead of a brand mark.
const ICONS: Record<SocialIcon, LucideIcon> = {
  instagram: Camera,
  linkedin: Briefcase,
  github: Code2,
  mail: Mail,
}

// Orchestrates the whole content column's entrance — each child below only
// declares its own `variants`, no separate initial/animate, and picks up
// 'hidden'/'visible' from this ancestor (standard Framer Motion propagation).
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

interface FooterProps {
  /** True as soon as the Team → Footer transition begins (and while resting
   *  on Footer) — drives every internal entrance below. Not scroll-observed:
   *  this scene is reached via the same discrete scene-transition system as
   *  every section before it. */
  active: boolean
}

export default function Footer({ active }: FooterProps) {
  const animate = active ? 'visible' : 'hidden'
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const settings = useSiteSettings()

  // Same labels/icons as the existing content module — only the destination
  // URL is swapped for the live value from Site Settings, so there is only
  // ever one place (MongoDB, via the admin Settings page) these links come
  // from instead of being duplicated across components.
  const SETTINGS_HREF: Record<SocialIcon, string> = {
    instagram: settings.instagramUrl,
    linkedin: settings.linkedinUrl,
    github: settings.githubUrl,
    mail: `mailto:${settings.email}`,
  }
  const socialLinks = footerContent.social.map((social) => ({
    ...social,
    href: SETTINGS_HREF[social.icon] || social.href,
  }))

  const item = (distance = 16): Variants =>
    reduceMotion
      ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
      : {
          hidden: { opacity: 0, y: distance, filter: 'blur(5px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_OUT } },
        }

  const lineReveal: Variants = reduceMotion
    ? { hidden: { scaleX: 1 }, visible: { scaleX: 1 } }
    : { hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 1.2, ease: EASE_OUT } } }

  const handleAdminLoginClick = () => {
    navigate('/admin/login')
  }

  return (
    <footer className="relative min-h-[100dvh] w-full overflow-hidden" style={{ backgroundColor: '#060606' }}>
      {/* Faint metallic sheen. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* Extremely faint dark-red technical grid. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(181,18,27,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(181,18,27,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Subtle scanline texture. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {/* Very faint red ambient glow — accent only, never dominant. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 25%, rgba(181,18,27,0.12) 0%, rgba(6,6,6,0) 60%)' }}
      />
      {/* Giant ultra-subtle geometric "D" watermark — outlined, not filled,
          so it reads as a technical emblem rather than a logo repeat. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
      >
        <span
          style={{
            fontFamily: HEADING_FONT,
            fontWeight: 900,
            fontSize: 'clamp(320px, 46vw, 620px)',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1px rgba(181,18,27,0.07)',
          }}
        >
          D
        </span>
      </div>

      <motion.div
        className="relative z-10 flex w-full flex-col items-center"
        variants={container}
        initial="hidden"
        animate={animate}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-10 pt-24 lg:px-12 lg:pt-28">
          {/* Top system line — reveals left → right on entrance. */}
          <motion.div className="flex w-full items-center gap-4" variants={item(0)}>
            <span
              className="shrink-0 text-[10px] tracking-[0.25em]"
              style={{ fontFamily: META_FONT, color: MUTED }}
            >
              {footerContent.systemLine.start}
            </span>
            <div className="relative h-px flex-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left"
                style={{ backgroundColor: RED }}
                variants={lineReveal}
              />
            </div>
            <span
              className="shrink-0 text-[10px] tracking-[0.25em]"
              style={{ fontFamily: META_FONT, color: MUTED }}
            >
              {footerContent.systemLine.end}
            </span>
          </motion.div>

          {/* DINOBOTS — primary visual element, same wordmark treatment as
              the navbar brand. */}
          <motion.h2
            className="mt-14 text-center text-[clamp(2.25rem,6vw,4rem)] font-extrabold uppercase tracking-tight lg:mt-16"
            variants={item(20)}
            style={{
              fontFamily: HEADING_FONT,
              backgroundImage: BRAND_GRADIENT,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              textShadow: BRAND_TEXT_SHADOW,
            }}
          >
            {settings.footerTitle}
          </motion.h2>

          <motion.div className="mt-4 flex flex-col items-center gap-1" variants={item(16)}>
            {[settings.footerTaglineLine1, settings.footerTaglineLine2].map((line) => (
              <span
                key={line}
                className="text-xs font-medium uppercase tracking-[0.25em] sm:text-sm"
                style={{ fontFamily: BODY_FONT, color: SILVER }}
              >
                {line}
              </span>
            ))}
          </motion.div>

          {/* Identity. */}
          <motion.div className="mt-10 flex flex-col items-center gap-2" variants={item(16)}>
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm"
              style={{ fontFamily: BODY_FONT, color: '#EDEDED' }}
            >
              {settings.footerClub}
            </span>
            <span
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ fontFamily: META_FONT, color: MUTED }}
            >
              {settings.footerUniversity}
            </span>
            {settings.footerDescription ? (
              <span
                className="mt-1 max-w-md text-[10px] uppercase tracking-[0.28em]"
                style={{ fontFamily: META_FONT, color: FAINT }}
              >
                {settings.footerDescription}
              </span>
            ) : (
              <span
                className="mt-1 text-[10px] uppercase tracking-[0.28em]"
                style={{ fontFamily: META_FONT, color: FAINT }}
              >
                {footerContent.identity.meta}
              </span>
            )}
          </motion.div>

          {/* Social links. */}
          <motion.div className="mt-12 flex flex-wrap items-center justify-center gap-3" variants={item(16)}>
            {socialLinks.map((social) => {
              const Icon = ICONS[social.icon]
              const isMail = social.icon === 'mail'
              // Instagram/LinkedIn get the stricter noopener+noreferrer;
              // GitHub keeps its existing rel exactly as it was.
              const needsNoopener = social.icon === 'instagram' || social.icon === 'linkedin'
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={isMail ? undefined : '_blank'}
                  rel={isMail ? undefined : needsNoopener ? 'noopener noreferrer' : 'noreferrer'}
                  className="group inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1 hover:border-[#E3222E] hover:text-[#F7DCDC] hover:shadow-[0_0_18px_rgba(227,34,46,0.3)]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    color: MUTED,
                    fontFamily: BODY_FONT,
                  }}
                >
                  <Icon size={13} className="opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                  {social.label}
                </a>
              )
            })}
          </motion.div>

          {/* Admin login — deliberately understated, not a primary CTA. Just
              a visual/UX placeholder for now: no route, no auth wired up. */}
          <motion.button
            type="button"
            onClick={handleAdminLoginClick}
            variants={item(10)}
            aria-label="Admin login"
            className="group mt-7 inline-flex items-center gap-1.5 rounded-sm border border-transparent px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] transition-all duration-300 hover:border-[#E3222E]/40 hover:shadow-[0_0_14px_rgba(227,34,46,0.22)]"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: META_FONT }}
          >
            <Lock size={11} className="opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="transition-colors duration-300 group-hover:text-[#F0B8BC]">
              {footerContent.adminLoginLabel}
            </span>
          </motion.button>

          {/* Designer credit. */}
          <motion.div className="mt-12 flex flex-col items-center gap-1.5 text-center" variants={item(14)}>
            <span
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: META_FONT, color: FAINT }}
            >
              {settings.footerDesignerLabel}
            </span>
            <span
              className="text-sm font-semibold uppercase tracking-[0.12em]"
              style={{ fontFamily: HEADING_FONT, color: SILVER }}
            >
              {settings.footerDesignerName}
            </span>
          </motion.div>
        </div>

        {/* Bottom system bar. */}
        <motion.div
          className="mt-4 w-full border-t px-6 py-6 lg:px-12"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          variants={item(10)}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <span
              className="text-[10px] uppercase tracking-[0.15em]"
              style={{ fontFamily: META_FONT, color: FAINT }}
            >
              {settings.footerText}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.15em]"
              style={{ fontFamily: META_FONT, color: FAINT }}
            >
              {settings.footerUniversity}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
