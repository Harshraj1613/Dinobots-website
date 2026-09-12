import { motion, type Variants } from 'framer-motion'
import type { ProjectEntry } from '../content/projects'
import { getImageUrl } from '../utils/imageUrl'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const HEADING_FONT = "'Unbounded', sans-serif"
const BODY_FONT = "'IBM Plex Sans', sans-serif"
const LABEL_FONT = "'Inter', sans-serif"

const PRIMARY = '#F1F4F5'
const SILVER = '#BFC7CC'
const ACCENT = '#D52A35'

const card = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 64, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, delay, ease: EASE_OUT } },
})

interface ProjectCardProps {
  project: ProjectEntry
  delay: number
}

export default function ProjectCard({ project, delay }: ProjectCardProps) {
  return (
    <motion.article variants={card(delay)} className="group relative w-full max-w-[420px] lg:max-w-[clamp(240px,55vh,420px)]">
      {/* Subtle red accent glow behind the card, hover-only. */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[26px] opacity-0 blur-2xl transition-opacity duration-[380ms] ease-out group-hover:opacity-30"
        style={{ backgroundColor: ACCENT }}
      />

      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[22px] border shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-[380ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)', borderColor: 'rgba(255,255,255,0.14)' }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '16 / 9', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <img
            src={getImageUrl(project.image)}
            alt={`${project.title} — Dinobots robotics project`}
            className="h-full w-full object-cover transition-transform duration-[420ms] ease-out group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }} />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-5 py-4 lg:gap-2 lg:px-6 lg:py-5">
          <span
            className="text-[10px] font-medium uppercase tracking-[0.2em]"
            style={{ fontFamily: LABEL_FONT, color: 'rgba(157,21,32,0.55)' }}
          >
            {project.label}
          </span>
          <h3
            className="text-lg font-bold uppercase tracking-tight"
            style={{ fontFamily: HEADING_FONT, color: PRIMARY }}
          >
            {project.title}
          </h3>
          <p
            className="text-sm leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden"
            style={{ fontFamily: BODY_FONT, color: SILVER }}
          >
            {project.description}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[22px] border opacity-0 transition-opacity duration-[380ms] ease-out group-hover:opacity-100"
          style={{ borderColor: 'rgba(213,42,53,0.4)' }}
        />
      </div>
    </motion.article>
  )
}
