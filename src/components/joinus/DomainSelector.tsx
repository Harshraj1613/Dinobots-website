import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { domains } from '../../content/joinUs'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../../styles/brandHeading'
import { useSiteSettings } from '../../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BODY_FONT = "'Inter', sans-serif"
const META_FONT = "'IBM Plex Sans', sans-serif"

const BORDER = 'rgba(255,255,255,0.1)'
const BORDER_ACTIVE = '#E3222E'
const MUTED = 'rgba(215,215,215,0.55)'

export default function DomainSelector() {
  const reduceMotion = useReducedMotion()
  const settings = useSiteSettings()
  const [activeId, setActiveId] = useState(domains[0].id)
  const active = domains.find((d) => d.id === activeId) ?? domains[0]

  const item: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
      }

  const container: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }

  return (
    <section id="domains" className="relative z-10 w-full px-6 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={item}
          className={`text-center text-[clamp(1.75rem,4.5vw,3rem)] ${BRAND_HEADING_CLASSNAME}`}
          style={brandHeadingStyle}
        >
          {settings.joinUsDomainTitle}
        </motion.h2>

        <motion.div
          className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          {domains.map((domain) => {
            const isActive = domain.id === activeId
            return (
              <motion.button
                key={domain.id}
                type="button"
                variants={item}
                onClick={() => setActiveId(domain.id)}
                onMouseEnter={() => setActiveId(domain.id)}
                aria-pressed={isActive}
                className="relative flex items-center justify-center rounded-lg border px-4 py-4 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ease-out sm:text-sm"
                style={{
                  borderColor: isActive ? BORDER_ACTIVE : BORDER,
                  backgroundColor: isActive ? 'rgba(181,18,27,0.1)' : 'rgba(255,255,255,0.02)',
                  color: isActive ? '#F7DCDC' : MUTED,
                  fontFamily: BODY_FONT,
                  boxShadow: isActive ? '0 0 16px rgba(227,34,46,0.22)' : 'none',
                }}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: BORDER_ACTIVE }}
                  />
                )}
                {domain.label}
              </motion.button>
            )
          })}
        </motion.div>

        <div
          className="relative mt-8 w-full max-w-2xl overflow-hidden rounded-xl border px-8 py-7 text-center"
          style={{ borderColor: BORDER, backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.25em]"
                style={{ fontFamily: META_FONT, color: BORDER_ACTIVE }}
              >
                {active.label}
              </span>
              <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: BODY_FONT, color: '#D7D7D7' }}>
                {active.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
