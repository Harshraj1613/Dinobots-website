import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import ProjectCard from './ProjectCard'
import DinobotsSectionHeading from './DinobotsSectionHeading'
import { projectsContent, type ProjectEntry } from '../content/projects'
import { projectService } from '../services/projectService'
import { useSiteSettings } from '../hooks/useSiteSettings'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// Card entrance stagger: heading first, then each card in sequence — see
// content/projects.ts for the copy these delays pace.
const CARD_DELAYS = [0.15, 0.25, 0.35]

const headingReveal: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE_OUT } },
}

interface ProjectsProps {
  /** True as soon as the About → Projects transition begins (and while
   *  resting on Projects) — drives the heading/card entrance stagger. Not
   *  scroll-observed: this scene is reached via the same discrete
   *  scene-transition system as Hero → About, not real page scroll. */
  active: boolean
}

export default function Projects({ active }: ProjectsProps) {
  const animate = active ? 'visible' : 'hidden'
  const settings = useSiteSettings()

  // Starts from the existing hardcoded copy (so the section renders
  // identically before the fetch resolves and if the backend is ever
  // unreachable), then swaps in live data from MongoDB once it arrives.
  const [projects, setProjects] = useState<ProjectEntry[]>(projectsContent.projects)

  useEffect(() => {
    let cancelled = false
    projectService.getPublicProjects().then((data) => {
      if (cancelled || data === null) return
      setProjects(
        data.map((project, i) => ({
          title: project.title,
          description: project.description,
          image: project.image,
          label: `${String(i + 1).padStart(2, '0')} / PROJECT SYSTEM`,
        }))
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden" style={{ backgroundColor: '#070707' }}>
      {/* Full-bleed background photo — subtly blurred so it stays an
          environment, not a competing focal point. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${projectsContent.background}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
        }}
      />
      {/* Cinematic dark treatment: flat wash + vignette, image stays visible. */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: 'rgba(4,4,4,0.58)' }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }}
      />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center gap-[clamp(0.75rem,2.5vh,2rem)] px-6 pb-[clamp(0.75rem,2.5vh,2rem)] pt-[clamp(4.5rem,11.5vh,6rem)] lg:px-12">
        <motion.div
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate={animate}
        >
          <DinobotsSectionHeading variants={headingReveal} className="text-[clamp(2rem,5vw,3.5rem)]">
            {settings.projectsSectionTitle}
          </DinobotsSectionHeading>
          {settings.projectsIntro && (
            <motion.p
              variants={headingReveal}
              className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: 'rgba(230,230,230,0.7)' }}
            >
              {settings.projectsIntro}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="grid w-full max-w-6xl grid-cols-1 place-items-center gap-[clamp(0.75rem,2vh,1.5rem)] sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate={animate}
        >
          {projects.map((project, i) => (
            <ProjectCard key={`${project.title}-${i}`} project={project} delay={CARD_DELAYS[i] ?? 0.35} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
