import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { heroContent, type NavTarget } from '../content/hero'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BRAND_FONT = "'Chakra Petch', sans-serif"
const BODY_FONT = "'Inter', sans-serif"
const TITANIUM = '#EAF4F7'

// Navbar brand text: a shallow silver→graphite metallic gradient with a
// whisper of dark red at the base — restrained, not a headline treatment.
const BRAND_GRADIENT = 'linear-gradient(180deg, #EDEDED 0%, #B8B8B8 45%, #6A6A6A 100%)'
const BRAND_TEXT_SHADOW = '0 1px 0 rgba(255,255,255,0.15), 0 2px 2px rgba(0,0,0,0.6), 0 3px 0 rgba(122,11,18,0.35)'

const reveal = (delay: number, duration = 0.7, distance = 14): Variants => ({
  hidden: { opacity: 0, y: distance, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration, delay, ease: EASE_OUT } },
})

interface NavbarProps {
  /** Mirrors Hero's own `revealed` flag so the navbar keeps its original
   *  entrance timing, tied to the same preloader handoff. */
  revealed: boolean
  /** Which scene currently reads as "current" in App's cinematic state
   *  machine — drives the subtle active-item indicator below. */
  activeSection: NavTarget
  /** Routes a nav click through App's cinematic scene navigator instead of
   *  a native anchor jump — same handler for desktop and mobile. */
  onNavigate: (target: NavTarget) => void
}

// Extracted out of Hero so the navbar is a single, persistent layer that
// never gets caught in Hero's own show/hide cycle as later cinematic scenes
// (About, Projects, ...) take over the viewport — same markup and styling
// as before, just no longer nested inside Hero's collapsible wrapper.
export default function Navbar({ revealed, activeSection, onNavigate }: NavbarProps) {
  const animate = revealed ? 'visible' : 'hidden'

  // Responsive nav menu (hamburger below `lg`) — hover-to-open on desktop,
  // tap-to-toggle on touch, Escape/outside-click to close.
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  return (
    <motion.header
      className="fixed inset-x-4 top-4 z-30 md:inset-x-8"
      variants={reveal(1.5, 0.7, 14)}
      initial="hidden"
      animate={animate}
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-5 py-3 backdrop-blur-md lg:px-8"
        style={{ borderColor: '#3a1a1a55', backgroundColor: '#0a0a0acc' }}
      >
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('home')
          }}
          className="select-none text-sm font-semibold uppercase tracking-[0.25em] transition-[filter] duration-300 hover:brightness-125"
          style={{
            fontFamily: BRAND_FONT,
            backgroundImage: BRAND_GRADIENT,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            textShadow: BRAND_TEXT_SHADOW,
          }}
        >
          {heroContent.brand}
        </a>

        <nav className="hidden items-center gap-8 lg:flex" style={{ fontFamily: BODY_FONT }} aria-label="Primary">
          {heroContent.nav.map((item) => {
            const active = item.target === activeSection
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={active ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.target)
                }}
                className={`group relative text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-200 ${
                  active ? 'text-white' : 'text-[#a8a8a8] hover:text-[#e3222e]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-[#e3222e] transition-transform duration-300 ease-out ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/join-us"
            className="rounded-lg border border-[#b5121b55] bg-[#0a0a0a] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e3222e88]"
            style={{ color: TITANIUM }}
          >
            {heroContent.navCta}
          </Link>

          {/* Admin Login — a real route link (not a cinematic scene target),
              desktop-only here; the same link also appears inside the
              mobile dropdown below. Deliberately quieter than the JOIN US
              CTA (no filled background) so it reads as a secondary, "slightly
              distinct" entry rather than a second primary action. */}
          <Link
            to="/admin/login"
            className="hidden select-none rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-[#a8a8a8] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e3222e66] hover:text-[#e3222e] lg:inline-flex"
          >
            Admin Login
          </Link>

          {/* Hamburger + dropdown — replaces the link group below `lg`
              instead of letting the links simply vanish. */}
          {/* This hamburger only ever renders below `lg` — a touch-first
              context — so it opens purely on click/tap (plus Escape and
              outside-click to close below). It deliberately does NOT also
              open on hover: real touchscreens fire a compatibility mouseover
              immediately before their click/tap, so a hover-open here would
              immediately get toggled shut again by that same tap's click,
              making the menu effectively unopenable on touch. */}
          <div ref={menuRef} className="relative lg:hidden">
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="group flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-white/10 transition-colors duration-200 hover:border-[#e3222e55]"
            >
              <span className="h-px w-5 bg-[#c9c9c9] transition-colors duration-200 group-hover:bg-[#e3222e]" />
              <span className="h-px w-5 bg-[#c9c9c9] transition-colors duration-200 group-hover:bg-[#e3222e]" />
              <span className="h-px w-5 bg-[#c9c9c9] transition-colors duration-200 group-hover:bg-[#e3222e]" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className="absolute right-0 top-full mt-2 w-[220px] origin-top-right rounded-xl border p-2 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(5,5,5,0.78)', borderColor: '#7a0b1255', fontFamily: BODY_FONT }}
                >
                  {heroContent.nav.map((item) => {
                    const active = item.target === activeSection
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        aria-current={active ? 'true' : undefined}
                        onClick={(e) => {
                          e.preventDefault()
                          setMenuOpen(false)
                          onNavigate(item.target)
                        }}
                        className={`block rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-200 hover:translate-x-1 hover:text-[#e3222e] ${
                          active ? 'text-white' : 'text-[#c9c9c9]'
                        }`}
                      >
                        {item.label}
                      </a>
                    )
                  })}

                  {/* Admin Login — a real route link, set apart from the
                      section items above by a divider so it reads as a
                      different kind of action, not another cinematic scene. */}
                  <div className="my-1 border-t" style={{ borderColor: '#7a0b1255' }} />
                  <Link
                    to="/admin/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-[#a8a8a8] transition-all duration-200 hover:translate-x-1 hover:text-[#e3222e]"
                  >
                    Admin Login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
