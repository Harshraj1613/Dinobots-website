import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Events from './components/Events'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Team from './components/Team'
import Footer from './components/Footer'
import type { NavTarget } from './content/hero'

type Phase = 'preloading' | 'holding' | 'revealed'
// A discrete state machine, not a continuous scroll mapping — this is what
// guarantees the viewport can only ever rest on one fully-settled scene,
// never a halfway blend. Scroll/swipe only ever TRIGGERS a move between
// scenes; the actual visual change is a fixed-duration animation that
// always runs to completion regardless of what the user does next.
type RestingScene = 'hero' | 'about' | 'events' | 'projects' | 'achievements' | 'team' | 'footer'
type Scene = RestingScene | 'transitioning'

// Brief pause after the preloader's own wordmark settles, before it fades
// away and hands off to the Hero underneath.
const HOLD_BEFORE_HANDOFF_MS = 500

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const TRANSITION_DURATION = 1.1
const WHEEL_TRIGGER_THRESHOLD = 12
const TOUCH_TRIGGER_THRESHOLD = 24
const MAX_HERO_BLUR_PX = 6
const MAX_HERO_OVERLAY_ALPHA = 0.35
const MAX_ABOUT_RECEDE_BLUR_PX = 5
const MIN_ABOUT_RECEDE_BRIGHTNESS = 0.72
const MIN_ABOUT_RECEDE_SCALE = 0.985
const MAX_EVENTS_RECEDE_BLUR_PX = 5
const MIN_EVENTS_RECEDE_BRIGHTNESS = 0.72
const MIN_EVENTS_RECEDE_SCALE = 0.985
const MAX_PROJECTS_RECEDE_BLUR_PX = 5
const MIN_PROJECTS_RECEDE_BRIGHTNESS = 0.72
const MIN_PROJECTS_RECEDE_SCALE = 0.985
const MAX_ACHIEVEMENTS_RECEDE_BLUR_PX = 5
const MIN_ACHIEVEMENTS_RECEDE_BRIGHTNESS = 0.72
const MIN_ACHIEVEMENTS_RECEDE_SCALE = 0.985
const MAX_TEAM_RECEDE_BLUR_PX = 5
const MIN_TEAM_RECEDE_BRIGHTNESS = 0.72
const MIN_TEAM_RECEDE_SCALE = 0.985

// Module-level (not component state) so it survives an App remount without
// surviving an actual browser refresh — a real refresh re-evaluates this
// whole module from scratch, resetting it to false. That's exactly the
// distinction the intro animation needs: navigating home from /join-us (or
// any other route) unmounts and remounts App, but it's still the same page
// load, so the ~4s DINOBOTS animation must NOT play a second time; a genuine
// refresh/new tab is a new page load and should play it once, as normal.
let hasPlayedIntro = false

function App() {
  // prefers-reduced-motion: keeps the same scene-cover transitions (no
  // redesign) but makes them fast enough to read as an instant cut rather
  // than a sustained cinematic move — content itself is never skipped or
  // hidden, only how long the motion between scenes takes.
  const prefersReducedMotion = useReducedMotion()
  const transitionDuration = prefersReducedMotion ? 0.05 : TRANSITION_DURATION
  const reverseTransitionDuration = prefersReducedMotion ? 0.05 : TRANSITION_DURATION * 0.85

  const [phase, setPhase] = useState<Phase>(() => (hasPlayedIntro ? 'revealed' : 'preloading'))
  // Always starts fresh on 'hero' (Home) — every mount of App, whether the
  // very first one or a remount after leaving for /join-us, is meant to
  // land on Home. There is deliberately no mechanism that restores a
  // previously-visited scene here.
  const [scene, setScene] = useState<Scene>('hero')

  // Refs mirroring the latest phase/scene so the single, mount-once
  // wheel/touch listeners below always read current state without needing
  // to re-subscribe (and without going stale inside their closures).
  const phaseRef = useRef(phase)
  const sceneRef = useRef(scene)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    sceneRef.current = scene
  }, [scene])

  // Which pair of scenes the current/last 'transitioning' state belongs to.
  // Mutated synchronously right before each setScene('transitioning') call,
  // so it's already correct by the time that state update re-renders — a
  // plain ref is enough since it never needs to trigger a render on its own.
  const pendingRef = useRef<{ from: RestingScene; to: RestingScene } | null>(null)

  // Bumped by `jumpToScene` (direct navbar/hash navigation) every time it
  // fires. Every play* function below captures the current value when it
  // starts and only commits its own completion (`sceneRef`/`setScene`) if
  // the counter is still unchanged — so a navbar click that lands mid-flight
  // of a wheel/touch-triggered cinematic transition can never have that
  // transition's completion silently override the click a moment later.
  const navGenerationRef = useRef(0)

  // The framer-motion playback controls for whichever play* transition is
  // currently in flight (if any). `jumpToScene` stops these explicitly
  // before snapping its own values — otherwise a wheel/touch transition
  // interrupted mid-flight would keep animating its motion values in the
  // background for the rest of its duration and visibly fight the jump's
  // instant, already-settled values a frame later.
  const activeAnimationsRef = useRef<{ stop: () => void }[]>([])

  // Guards the "EXPLORE DINOBOTS" auto-advancing slideshow: true only while
  // it's actively walking Home → About → ... → Footer. Checked before every
  // step so it can be cancelled cleanly, and set false again by
  // `jumpToScene` (i.e. any navbar click, brand click, or hash navigation)
  // so clicking anywhere else immediately stops it — see `runExplore`.
  const exploringRef = useRef(false)

  // Guards against a single sustained/fast scroll gesture (real trackpad
  // momentum keeps emitting wheel events for a while after the user stops)
  // cascading straight through a second transition the instant the first
  // one settles — e.g. Projects → About → Hero from one continuous flick.
  // Not needed while there was only one pair (Hero ↔ About); matters now
  // that a fast gesture has a second boundary to reach.
  const settledAtRef = useRef(0)
  const SETTLE_COOLDOWN_MS = 350
  const canTrigger = () => performance.now() - settledAtRef.current > SETTLE_COOLDOWN_MS

  useEffect(() => {
    if (phase !== 'holding') return
    const id = window.setTimeout(() => setPhase('revealed'), HOLD_BEFORE_HANDOFF_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  // Marks the intro as played the moment it (or a skip straight to
  // 'revealed', on a remount) actually reaches 'revealed' — see
  // `hasPlayedIntro`'s declaration above.
  useEffect(() => {
    if (phase === 'revealed') hasPlayedIntro = true
  }, [phase])

  // Discrete transition values — driven to completion by imperative
  // `animate()` calls once triggered, never mapped continuously from raw
  // scroll position. Hero's own blur amount AND how much of it the mask
  // reveals both ramp together, so the "blur travels upward" read (spec)
  // and the overall softening (spec) happen as one combined motion.
  const heroBlur = useMotionValue(0)
  const heroOverlayAlpha = useMotionValue(0)
  const maskBoundary = useMotionValue(0) // 0–100, % of Hero height covered
  const aboutY = useMotionValue(100) // 0–100, translateY as a percentage
  const aboutScale = useMotionValue(0.985)
  const aboutOpacity = useMotionValue(0.95)

  const heroFilter = useMotionTemplate`blur(${heroBlur}px)`
  const heroOverlayColor = useMotionTemplate`rgba(3,3,3,${heroOverlayAlpha})`
  const maskStart = useTransform(maskBoundary, (v) => Math.max(0, v - 18))
  const maskEnd = useTransform(maskBoundary, (v) => Math.min(100, v + 2))
  const maskImage = useMotionTemplate`linear-gradient(to top, black 0%, black ${maskStart}%, transparent ${maskEnd}%, transparent 100%)`
  const aboutYPercent = useMotionTemplate`${aboutY}%`

  // About → Events pair — same cinematic language as Hero → About (blur +
  // darken + recede on the outgoing scene, a solid panel rising to cover
  // it), kept as its own set of motion values so the existing Hero ↔ About
  // pair above is never touched.
  const aboutRecedeBlur = useMotionValue(0)
  const aboutRecedeBrightness = useMotionValue(1)
  const aboutRecedeScale = useMotionValue(1)
  const eventsY = useMotionValue(100) // 0–100, translateY as a percentage

  const aboutRecedeFilter = useMotionTemplate`blur(${aboutRecedeBlur}px) brightness(${aboutRecedeBrightness})`
  const eventsYPercent = useMotionTemplate`${eventsY}%`

  // Events → Projects pair — same cinematic language again, its own motion
  // values so the About ↔ Events pair above is never touched.
  const eventsRecedeBlur = useMotionValue(0)
  const eventsRecedeBrightness = useMotionValue(1)
  const eventsRecedeScale = useMotionValue(1)
  const projectsY = useMotionValue(100) // 0–100, translateY as a percentage

  const eventsRecedeFilter = useMotionTemplate`blur(${eventsRecedeBlur}px) brightness(${eventsRecedeBrightness})`
  const projectsYPercent = useMotionTemplate`${projectsY}%`

  // Projects → Achievements pair — same cinematic language again, its own
  // motion values so the Events ↔ Projects pair above is never touched.
  const projectsRecedeBlur = useMotionValue(0)
  const projectsRecedeBrightness = useMotionValue(1)
  const projectsRecedeScale = useMotionValue(1)
  const achievementsY = useMotionValue(100) // 0–100, translateY as a percentage

  const projectsRecedeFilter = useMotionTemplate`blur(${projectsRecedeBlur}px) brightness(${projectsRecedeBrightness})`
  const achievementsYPercent = useMotionTemplate`${achievementsY}%`

  // Achievements → Team pair — same cinematic language again, its own
  // motion values so the Projects ↔ Achievements pair above is never touched.
  const achievementsRecedeBlur = useMotionValue(0)
  const achievementsRecedeBrightness = useMotionValue(1)
  const achievementsRecedeScale = useMotionValue(1)
  const teamY = useMotionValue(100) // 0–100, translateY as a percentage

  const achievementsRecedeFilter = useMotionTemplate`blur(${achievementsRecedeBlur}px) brightness(${achievementsRecedeBrightness})`
  const teamYPercent = useMotionTemplate`${teamY}%`

  // Team → Footer pair — same cinematic language again, its own motion
  // values so the Achievements ↔ Team pair above is never touched.
  const teamRecedeBlur = useMotionValue(0)
  const teamRecedeBrightness = useMotionValue(1)
  const teamRecedeScale = useMotionValue(1)
  const footerY = useMotionValue(100) // 0–100, translateY as a percentage

  const teamRecedeFilter = useMotionTemplate`blur(${teamRecedeBlur}px) brightness(${teamRecedeBrightness})`
  const footerYPercent = useMotionTemplate`${footerY}%`

  // Every play* function below returns the Promise chain that resolves once
  // its transition has fully settled, and updates `sceneRef.current`
  // synchronously in that same `.then()` (not just via the `scene` state,
  // which only reaches the ref on the next effect-flush). Both are what let
  // `navigateToScene` (below) safely chain several of these back-to-back —
  // it awaits one hop's promise, then immediately reads a trustworthy
  // sceneRef to decide the next.
  const playForward = () => {
    if (sceneRef.current !== 'hero' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'hero', to: 'about' }
    setScene('transitioning')
    const opts = { duration: transitionDuration, ease: EASE_OUT }
    const controls = [
      animate(heroBlur, MAX_HERO_BLUR_PX, opts),
      animate(heroOverlayAlpha, MAX_HERO_OVERLAY_ALPHA, opts),
      animate(maskBoundary, 100, opts),
      animate(aboutY, 0, opts),
      animate(aboutScale, 1, opts),
      animate(aboutOpacity, 1, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'about'
      setScene('about')
      settledAtRef.current = performance.now()
    })
  }

  const playReverse = () => {
    if (sceneRef.current !== 'about' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'about', to: 'hero' }
    setScene('transitioning')
    const opts = { duration: reverseTransitionDuration, ease: EASE_OUT }
    const controls = [
      animate(heroBlur, 0, opts),
      animate(heroOverlayAlpha, 0, opts),
      animate(maskBoundary, 0, opts),
      animate(aboutY, 100, opts),
      animate(aboutScale, 0.985, opts),
      animate(aboutOpacity, 0.95, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'hero'
      setScene('hero')
      settledAtRef.current = performance.now()
    })
  }

  const playForwardToEvents = () => {
    if (sceneRef.current !== 'about' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'about', to: 'events' }
    setScene('transitioning')
    const opts = { duration: transitionDuration, ease: EASE_OUT }
    const controls = [
      animate(aboutRecedeBlur, MAX_ABOUT_RECEDE_BLUR_PX, opts),
      animate(aboutRecedeBrightness, MIN_ABOUT_RECEDE_BRIGHTNESS, opts),
      animate(aboutRecedeScale, MIN_ABOUT_RECEDE_SCALE, opts),
      animate(eventsY, 0, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'events'
      setScene('events')
      settledAtRef.current = performance.now()
    })
  }

  const playReverseToAbout = () => {
    if (sceneRef.current !== 'events' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'events', to: 'about' }
    setScene('transitioning')
    const opts = { duration: reverseTransitionDuration, ease: EASE_OUT }
    const controls = [
      animate(aboutRecedeBlur, 0, opts),
      animate(aboutRecedeBrightness, 1, opts),
      animate(aboutRecedeScale, 1, opts),
      animate(eventsY, 100, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'about'
      setScene('about')
      settledAtRef.current = performance.now()
    })
  }

  const playForwardToProjects = () => {
    if (sceneRef.current !== 'events' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'events', to: 'projects' }
    setScene('transitioning')
    const opts = { duration: transitionDuration, ease: EASE_OUT }
    const controls = [
      animate(eventsRecedeBlur, MAX_EVENTS_RECEDE_BLUR_PX, opts),
      animate(eventsRecedeBrightness, MIN_EVENTS_RECEDE_BRIGHTNESS, opts),
      animate(eventsRecedeScale, MIN_EVENTS_RECEDE_SCALE, opts),
      animate(projectsY, 0, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'projects'
      setScene('projects')
      settledAtRef.current = performance.now()
    })
  }

  const playReverseToEvents = () => {
    if (sceneRef.current !== 'projects' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'projects', to: 'events' }
    setScene('transitioning')
    const opts = { duration: reverseTransitionDuration, ease: EASE_OUT }
    const controls = [
      animate(eventsRecedeBlur, 0, opts),
      animate(eventsRecedeBrightness, 1, opts),
      animate(eventsRecedeScale, 1, opts),
      animate(projectsY, 100, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'events'
      setScene('events')
      settledAtRef.current = performance.now()
    })
  }

  const playForwardToAchievements = () => {
    if (sceneRef.current !== 'projects' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'projects', to: 'achievements' }
    setScene('transitioning')
    const opts = { duration: transitionDuration, ease: EASE_OUT }
    const controls = [
      animate(projectsRecedeBlur, MAX_PROJECTS_RECEDE_BLUR_PX, opts),
      animate(projectsRecedeBrightness, MIN_PROJECTS_RECEDE_BRIGHTNESS, opts),
      animate(projectsRecedeScale, MIN_PROJECTS_RECEDE_SCALE, opts),
      animate(achievementsY, 0, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'achievements'
      setScene('achievements')
      settledAtRef.current = performance.now()
    })
  }

  const playReverseToProjects = () => {
    if (sceneRef.current !== 'achievements' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'achievements', to: 'projects' }
    setScene('transitioning')
    const opts = { duration: reverseTransitionDuration, ease: EASE_OUT }
    const controls = [
      animate(projectsRecedeBlur, 0, opts),
      animate(projectsRecedeBrightness, 1, opts),
      animate(projectsRecedeScale, 1, opts),
      animate(achievementsY, 100, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'projects'
      setScene('projects')
      settledAtRef.current = performance.now()
    })
  }

  const playForwardToTeam = () => {
    if (sceneRef.current !== 'achievements' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'achievements', to: 'team' }
    setScene('transitioning')
    const opts = { duration: transitionDuration, ease: EASE_OUT }
    const controls = [
      animate(achievementsRecedeBlur, MAX_ACHIEVEMENTS_RECEDE_BLUR_PX, opts),
      animate(achievementsRecedeBrightness, MIN_ACHIEVEMENTS_RECEDE_BRIGHTNESS, opts),
      animate(achievementsRecedeScale, MIN_ACHIEVEMENTS_RECEDE_SCALE, opts),
      animate(teamY, 0, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'team'
      setScene('team')
      settledAtRef.current = performance.now()
    })
  }

  const playReverseToAchievements = () => {
    if (sceneRef.current !== 'team' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'team', to: 'achievements' }
    setScene('transitioning')
    const opts = { duration: reverseTransitionDuration, ease: EASE_OUT }
    const controls = [
      animate(achievementsRecedeBlur, 0, opts),
      animate(achievementsRecedeBrightness, 1, opts),
      animate(achievementsRecedeScale, 1, opts),
      animate(teamY, 100, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'achievements'
      setScene('achievements')
      settledAtRef.current = performance.now()
    })
  }

  const playForwardToFooter = () => {
    if (sceneRef.current !== 'team' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'team', to: 'footer' }
    setScene('transitioning')
    const opts = { duration: transitionDuration, ease: EASE_OUT }
    const controls = [
      animate(teamRecedeBlur, MAX_TEAM_RECEDE_BLUR_PX, opts),
      animate(teamRecedeBrightness, MIN_TEAM_RECEDE_BRIGHTNESS, opts),
      animate(teamRecedeScale, MIN_TEAM_RECEDE_SCALE, opts),
      animate(footerY, 0, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'footer'
      setScene('footer')
      settledAtRef.current = performance.now()
    })
  }

  const playReverseToTeam = () => {
    if (sceneRef.current !== 'footer' || !canTrigger()) return
    const startGen = navGenerationRef.current
    pendingRef.current = { from: 'footer', to: 'team' }
    setScene('transitioning')
    const opts = { duration: reverseTransitionDuration, ease: EASE_OUT }
    const controls = [
      animate(teamRecedeBlur, 0, opts),
      animate(teamRecedeBrightness, 1, opts),
      animate(teamRecedeScale, 1, opts),
      animate(footerY, 100, opts),
    ]
    activeAnimationsRef.current = controls
    return Promise.all(controls).then(() => {
      if (navGenerationRef.current !== startGen) return
      sceneRef.current = 'team'
      setScene('team')
      settledAtRef.current = performance.now()
    })
  }

  // Ordered list of every resting scene, used to work out hop direction for
  // arbitrary (possibly non-adjacent) navbar navigation below.
  const SCENE_ORDER: RestingScene[] = ['hero', 'about', 'events', 'projects', 'achievements', 'team', 'footer']

  // Direct navbar/hash navigation to ANY scene, including non-adjacent ones
  // (e.g. Hero → Team) — jumps straight there with no animation and no
  // walk through the scenes in between, per the "click a nav item, land
  // exactly there" requirement. Wheel/touch scrolling is untouched and
  // still plays the full one-hop-at-a-time cinematic transition via the
  // play* functions above (each still only reachable from its own adjacent
  // resting scene, so a click can never stack with a scroll-driven hop).
  //
  // Every motion value in the whole chain is snapped (not animated) to
  // whatever its resting value would be if the user had scrolled here
  // hop-by-hop — not just for the target scene, but for every scene along
  // the way. This is required, not cosmetic: a later wheel/touch transition
  // starting from this new resting scene (in either direction) reads its
  // start state from these same motion values, so they must already be
  // internally consistent with "resting on `target`" the instant this runs.
  const jumpToScene = (target: RestingScene) => {
    if (phaseRef.current !== 'revealed') return

    // Any direct navigation (navbar item, brand, hash change) cancels the
    // "Explore Dinobots" auto-advance immediately, per its own spec.
    exploringRef.current = false

    // Invalidates the completion of any play* transition still in flight
    // (from a wheel/touch gesture) — see navGenerationRef's declaration.
    navGenerationRef.current += 1

    // Actually halt that in-flight transition's animation too — otherwise
    // it would keep ticking its own motion values for the rest of its
    // duration and visibly fight the values snapped below a frame later.
    for (const controls of activeAnimationsRef.current) controls.stop()
    activeAnimationsRef.current = []

    const targetIndex = SCENE_ORDER.indexOf(target)
    const isPastOrAt = (scene: RestingScene) => targetIndex >= SCENE_ORDER.indexOf(scene)

    const pastAbout = isPastOrAt('about')
    heroBlur.set(pastAbout ? MAX_HERO_BLUR_PX : 0)
    heroOverlayAlpha.set(pastAbout ? MAX_HERO_OVERLAY_ALPHA : 0)
    maskBoundary.set(pastAbout ? 100 : 0)
    aboutY.set(pastAbout ? 0 : 100)
    aboutScale.set(pastAbout ? 1 : 0.985)
    aboutOpacity.set(pastAbout ? 1 : 0.95)

    const pastEvents = isPastOrAt('events')
    aboutRecedeBlur.set(pastEvents ? MAX_ABOUT_RECEDE_BLUR_PX : 0)
    aboutRecedeBrightness.set(pastEvents ? MIN_ABOUT_RECEDE_BRIGHTNESS : 1)
    aboutRecedeScale.set(pastEvents ? MIN_ABOUT_RECEDE_SCALE : 1)
    eventsY.set(pastEvents ? 0 : 100)

    const pastProjects = isPastOrAt('projects')
    eventsRecedeBlur.set(pastProjects ? MAX_EVENTS_RECEDE_BLUR_PX : 0)
    eventsRecedeBrightness.set(pastProjects ? MIN_EVENTS_RECEDE_BRIGHTNESS : 1)
    eventsRecedeScale.set(pastProjects ? MIN_EVENTS_RECEDE_SCALE : 1)
    projectsY.set(pastProjects ? 0 : 100)

    const pastAchievements = isPastOrAt('achievements')
    projectsRecedeBlur.set(pastAchievements ? MAX_PROJECTS_RECEDE_BLUR_PX : 0)
    projectsRecedeBrightness.set(pastAchievements ? MIN_PROJECTS_RECEDE_BRIGHTNESS : 1)
    projectsRecedeScale.set(pastAchievements ? MIN_PROJECTS_RECEDE_SCALE : 1)
    achievementsY.set(pastAchievements ? 0 : 100)

    const pastTeam = isPastOrAt('team')
    achievementsRecedeBlur.set(pastTeam ? MAX_ACHIEVEMENTS_RECEDE_BLUR_PX : 0)
    achievementsRecedeBrightness.set(pastTeam ? MIN_ACHIEVEMENTS_RECEDE_BRIGHTNESS : 1)
    achievementsRecedeScale.set(pastTeam ? MIN_ACHIEVEMENTS_RECEDE_SCALE : 1)
    teamY.set(pastTeam ? 0 : 100)

    const pastFooter = isPastOrAt('footer')
    teamRecedeBlur.set(pastFooter ? MAX_TEAM_RECEDE_BLUR_PX : 0)
    teamRecedeBrightness.set(pastFooter ? MIN_TEAM_RECEDE_BRIGHTNESS : 1)
    teamRecedeScale.set(pastFooter ? MIN_TEAM_RECEDE_SCALE : 1)
    footerY.set(pastFooter ? 0 : 100)

    pendingRef.current = null
    sceneRef.current = target
    setScene(target)
    settledAtRef.current = performance.now()
  }

  // "EXPLORE DINOBOTS" — an automatic cinematic walk Home → About → Events →
  // Projects → Achievements → Team → Footer, one real scroll-style hop at a
  // time (same play* functions wheel/touch use), pausing briefly on each
  // scene so it reads as a guided tour rather than a fast-forward. Only ever
  // starts from Home (the button only exists on Hero anyway) and stops the
  // instant `exploringRef` is cleared — by `jumpToScene` (any navbar/brand
  // click), by the unmount-cleanup effect below (navigating to /join-us), or
  // by a hop's own guard failing.
  const EXPLORE_DWELL_MS = 1400
  const runExplore = async () => {
    if (exploringRef.current || sceneRef.current !== 'hero') return // no duplicate timers
    exploringRef.current = true

    const steps: Array<() => Promise<void> | void> = [
      playForward,
      playForwardToEvents,
      playForwardToProjects,
      playForwardToAchievements,
      playForwardToTeam,
      playForwardToFooter,
    ]

    for (const step of steps) {
      if (!exploringRef.current) return
      await step()
      if (!exploringRef.current) return
      await new Promise((resolve) => window.setTimeout(resolve, EXPLORE_DWELL_MS))
    }
    exploringRef.current = false
  }

  // Stop the slideshow if the component unmounts mid-flight — e.g. the user
  // clicks JOIN US (a route change, not a `jumpToScene` call) while it's
  // running.
  useEffect(() => {
    return () => {
      exploringRef.current = false
    }
  }, [])

  const NAV_TO_SCENE: Record<NavTarget, RestingScene> = {
    home: 'hero',
    about: 'about',
    events: 'events',
    projects: 'projects',
    achievements: 'achievements',
    team: 'team',
  }
  const SCENE_TO_NAV: Record<RestingScene, NavTarget> = {
    hero: 'home',
    about: 'about',
    events: 'events',
    projects: 'projects',
    achievements: 'achievements',
    team: 'team',
    // Footer has no navbar entry of its own — while resting there, the
    // navbar still reads "TEAM" as current rather than nothing at all.
    footer: 'team',
  }

  const handleNavigate = (target: NavTarget) => {
    jumpToScene(NAV_TO_SCENE[target])
    if (window.location.hash !== `#${target}`) {
      window.history.pushState(null, '', `#${target}`)
    }
  }

  // Back/forward support for the hash updates above — routed through the
  // exact same direct navigator, so history navigation lands exactly on the
  // target scene too (never a half-settled state).
  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash in NAV_TO_SCENE) {
        jumpToScene(NAV_TO_SCENE[hash as NavTarget])
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
    // Intentionally mount-once: jumpToScene only ever reads current state
    // via refs, so this never goes stale.
  }, [])

  // A fresh load/refresh of `/` — or a remount after leaving for /join-us —
  // must ALWAYS settle on Home, even if the address bar still carries a
  // leftover hash (e.g. `#about`) from browsing before a refresh. `scene`
  // already defaults to 'hero' unconditionally (see its declaration above);
  // this just keeps the visible URL in sync with that by normalizing the
  // hash to `#home` once the reveal happens, using `replaceState` (never
  // `pushState`) so it creates no extra history entry. Deliberately does
  // NOT read the hash to decide where to land — that was the actual bug
  // (a lingering `#about` from a previous click made this the initial
  // scene after every refresh instead of Home).
  useEffect(() => {
    if (phase !== 'revealed') return
    if (window.location.hash && window.location.hash !== '#home') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#home`)
    }
  }, [phase])

  // Scroll/swipe is read as an intent trigger, but ONLY at a section's real
  // content boundary — never on every wheel tick. Exactly one scene is ever
  // `position: relative` (in normal document flow) at a time — the current
  // resting one; every other scene is `fixed` or collapsed to height 0 (see
  // the render below). That means `document.documentElement.scrollHeight`
  // at rest is always exactly the CURRENT scene's own real content height,
  // so comparing it against `window.innerHeight` tells us — with an actual
  // measurement, never a hardcoded "About is tall" assumption — whether
  // this specific scene has more content than the viewport.
  //
  // So: while there's more of the current section left to reveal in that
  // direction, its own `preventDefault()` is simply never called, and the
  // browser's native scroll handles it directly — smooth, trackpad-correct,
  // no custom animation loop. Only once the document is genuinely at that
  // edge does a wheel/swipe past the threshold trigger the next cinematic
  // hop. While a transition is running, every wheel/touch event is still
  // swallowed so rapid input can never restart or stack the animation.
  useEffect(() => {
    const BOUNDARY_EPSILON_PX = 1
    const isAtDocumentTop = () => window.scrollY <= 0
    const isAtDocumentBottom = () =>
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - BOUNDARY_EPSILON_PX

    // `forward`/`reverse` are omitted for the first/last scene (Hero has no
    // previous scene, Footer has no next one) — omitting a direction simply
    // leaves native scrolling as the only thing that can happen that way,
    // exactly like today's "left alone as ordinary page scroll" for Footer.
    const HOPS: Partial<Record<RestingScene, { forward?: () => unknown; reverse?: () => unknown }>> = {
      hero: { forward: playForward },
      about: { forward: playForwardToEvents, reverse: playReverse },
      events: { forward: playForwardToProjects, reverse: playReverseToAbout },
      projects: { forward: playForwardToAchievements, reverse: playReverseToEvents },
      achievements: { forward: playForwardToTeam, reverse: playReverseToProjects },
      team: { forward: playForwardToFooter, reverse: playReverseToAchievements },
      footer: { reverse: playReverseToTeam },
    }

    // Applies regardless of delta magnitude — while a transition is in
    // flight there is nothing in normal document flow to scroll anyway
    // (every scene is pinned `fixed` until it settles), but this keeps the
    // original guarantee that a transition can never be restarted or
    // stacked by input arriving mid-flight, no matter how small.
    const handleTransitioningIntent = (e: WheelEvent | TouchEvent) => {
      if (sceneRef.current !== 'transitioning') return false
      e.preventDefault()
      return true
    }

    const handleBoundaryIntent = (current: RestingScene, deltaY: number, e: WheelEvent | TouchEvent) => {
      const hop = HOPS[current]
      if (!hop) return
      if (deltaY > 0 && hop.forward) {
        if (isAtDocumentBottom()) {
          e.preventDefault()
          hop.forward()
        }
        return // not at bottom yet: let native scroll move the section's own content
      }
      if (deltaY < 0 && hop.reverse && isAtDocumentTop()) {
        e.preventDefault()
        hop.reverse()
      }
      // not at top yet: let native scroll move the section's own content
    }

    const onWheel = (e: WheelEvent) => {
      if (phaseRef.current !== 'revealed') return
      if (handleTransitioningIntent(e)) return
      if (Math.abs(e.deltaY) <= WHEEL_TRIGGER_THRESHOLD) return
      handleBoundaryIntent(sceneRef.current as RestingScene, e.deltaY, e)
    }

    let touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (phaseRef.current !== 'revealed') return
      if (handleTransitioningIntent(e)) return
      const y = e.touches[0]?.clientY ?? touchStartY
      const delta = touchStartY - y // positive = swiping up = scroll-down intent
      if (Math.abs(delta) <= TOUCH_TRIGGER_THRESHOLD) return
      handleBoundaryIntent(sceneRef.current as RestingScene, delta, e)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
    // Intentionally mount-once: every play* function is read via
    // sceneRef/phaseRef above so this listener never goes stale.
  }, [])

  // This effect is the sole, unconditional owner of the body-scroll lock
  // for as long as App is mounted: it never captures/restores some
  // "previous" overflow value. That capture/restore pattern raced with
  // Preloader's own lock (children's effects fire before their parent's,
  // so on mount Preloader locks first and this effect would capture THAT
  // as its "previous" value) and could resurrect a stale 'hidden' onto
  // whatever page came next. Cleanup always clears to '', so navigating
  // away from "/" (e.g. to /join-us) is guaranteed to hand off an
  // unlocked body regardless of which scene App was resting on.
  useEffect(() => {
    document.body.style.overflow =
      scene === 'about' ||
      scene === 'events' ||
      scene === 'projects' ||
      scene === 'achievements' ||
      scene === 'team' ||
      scene === 'footer'
        ? ''
        : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [scene])

  // Scopes the scrollbar-hiding rules in index.css (`html.cinematic-page`)
  // to exactly "/" — added to <html> only while App is mounted, removed on
  // unmount, same pattern as `.join-us-page`/`.admin-page`. This only hides
  // the scrollbar's own paint; it never touches `overflow` (that's owned by
  // the body-lock effect above) and never blocks real scrolling — the
  // boundary-aware wheel/touch handling below is what makes a section
  // taller than the viewport still genuinely scrollable.
  useEffect(() => {
    document.documentElement.classList.add('cinematic-page')
    return () => {
      document.documentElement.classList.remove('cinematic-page')
    }
  }, [])

  const pending = pendingRef.current
  const isAbout = scene === 'about'
  const isEvents = scene === 'events'
  const isProjects = scene === 'projects'
  const isAchievements = scene === 'achievements'
  const isTeam = scene === 'team'
  // Hero is only ever part of the hero↔about pair; Team only ever part of
  // the achievements↔team pair. About, Events, Projects, and Achievements
  // each sit between two pairs, so they're "live" (pinned/animating) during
  // every transition touching either of their pairs.
  const heroLive = scene === 'hero' || (scene === 'transitioning' && (pending?.from === 'hero' || pending?.to === 'hero'))
  const eventsLive =
    scene === 'events' || (scene === 'transitioning' && (pending?.from === 'events' || pending?.to === 'events'))
  const projectsLive =
    scene === 'projects' || (scene === 'transitioning' && (pending?.from === 'projects' || pending?.to === 'projects'))
  const achievementsLive =
    scene === 'achievements' ||
    (scene === 'transitioning' && (pending?.from === 'achievements' || pending?.to === 'achievements'))
  const teamLive =
    scene === 'team' || (scene === 'transitioning' && (pending?.from === 'team' || pending?.to === 'team'))
  const aboutLive = isAbout || scene === 'transitioning'
  const eventsActive =
    isEvents || (scene === 'transitioning' && pending?.to === 'events') || (scene === 'transitioning' && pending?.from === 'events')
  const projectsActive = isProjects || (scene === 'transitioning' && pending?.to === 'projects') || (scene === 'transitioning' && pending?.from === 'projects')
  const achievementsActive =
    isAchievements ||
    (scene === 'transitioning' && pending?.to === 'achievements') ||
    (scene === 'transitioning' && pending?.from === 'achievements')
  const teamActive =
    isTeam || (scene === 'transitioning' && pending?.to === 'team') || (scene === 'transitioning' && pending?.from === 'team')
  const isFooter = scene === 'footer'
  const footerLive =
    scene === 'footer' || (scene === 'transitioning' && (pending?.from === 'footer' || pending?.to === 'footer'))
  const footerActive =
    isFooter || (scene === 'transitioning' && pending?.to === 'footer') || (scene === 'transitioning' && pending?.from === 'footer')

  // Which nav item should read as "current" — while mid-transition this
  // favors the incoming scene, so the navbar reacts the instant a scroll or
  // click starts moving rather than waiting for it to fully settle.
  const activeRestingScene: RestingScene =
    scene === 'transitioning' ? pending?.to ?? pending?.from ?? 'hero' : scene
  const activeSection: NavTarget = SCENE_TO_NAV[activeRestingScene]

  return (
    <>
      {/* Persistent navbar — deliberately outside every collapsible scene
          wrapper below so it stays fixed/visible/interactive through every
          transition (Hero ↔ About ↔ Projects ↔ Achievements ↔ Team), never
          tied to any one scene's own show/hide cycle. */}
      <Navbar revealed={phase === 'revealed'} activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Hero layer — always mounted (rotation/animations never reset), just
          collapsed to zero height and hidden whenever Hero isn't involved. */}
      <div
        id="home"
        className="z-0"
        style={
          heroLive
            ? { position: 'fixed', inset: 0, visibility: 'visible', overflow: 'clip' }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <Hero revealed={phase === 'revealed'} onExplore={runExplore} onGoToProjects={() => handleNavigate('projects')} />

        {/* Softens/darkens Hero via backdrop-filter on this plain sibling —
            never a filter/transform on Hero itself. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backdropFilter: heroFilter,
            WebkitBackdropFilter: heroFilter,
            backgroundColor: heroOverlayColor,
            WebkitMaskImage: maskImage,
            maskImage,
          }}
        />
      </div>

      {/* The About scene — rises as a solid panel over Hero, rests as a
          normal in-flow element, then itself recedes (blur/darken/scale)
          as Projects rises over it. Pinning (position/overflow) and
          animating (transform) are deliberately split across elements: a
          `position: fixed` box must never itself carry a live CSS
          transform, or its post-transform box still counts toward the
          document's scrollable area (regardless of its own overflow),
          producing a phantom scrollbar during a reverse transition. The
          outermost box here only ever pins + clips; inner plain children
          carry the animated y/scale/opacity/filter. */}
      <div
        id="about"
        className="z-[15]"
        style={
          aboutLive
            ? { position: isAbout ? 'relative' : 'fixed', inset: isAbout ? undefined : 0, overflow: isAbout ? 'visible' : 'clip' }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <motion.div style={{ y: aboutYPercent, scale: aboutScale, opacity: aboutOpacity }}>
          <motion.div style={{ filter: aboutRecedeFilter, scale: aboutRecedeScale }}>
            <About />
          </motion.div>
        </motion.div>
      </div>

      {/* The Events scene — same rising-panel language as About, entering
          from the bottom and covering About once triggered, then itself
          recedes (blur/darken/scale) as Projects rises over it. */}
      <div
        id="events"
        className="z-[17]"
        style={
          eventsLive
            ? {
                position: isEvents ? 'relative' : 'fixed',
                inset: isEvents ? undefined : 0,
                overflow: isEvents ? 'visible' : 'clip',
              }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <motion.div style={{ y: eventsYPercent }}>
          <motion.div style={{ filter: eventsRecedeFilter, scale: eventsRecedeScale }}>
            <Events active={eventsActive} />
          </motion.div>
        </motion.div>
      </div>

      {/* The Projects scene — same rising-panel language as About, entering
          from the bottom and covering Events once triggered, then itself
          recedes (blur/darken/scale) as Achievements rises over it. */}
      <div
        id="projects"
        className="z-20"
        style={
          projectsLive
            ? {
                position: isProjects ? 'relative' : 'fixed',
                inset: isProjects ? undefined : 0,
                overflow: isProjects ? 'visible' : 'clip',
              }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <motion.div style={{ y: projectsYPercent }}>
          <motion.div style={{ filter: projectsRecedeFilter, scale: projectsRecedeScale }}>
            <Projects active={projectsActive} />
          </motion.div>
        </motion.div>
      </div>

      {/* The Achievements scene — same rising-panel language again, entering
          from the bottom and covering Projects once triggered, then itself
          recedes (blur/darken/scale) as Team rises over it. */}
      <div
        id="achievements"
        className="z-[25]"
        style={
          achievementsLive
            ? {
                position: isAchievements ? 'relative' : 'fixed',
                inset: isAchievements ? undefined : 0,
                overflow: isAchievements ? 'visible' : 'clip',
              }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <motion.div style={{ y: achievementsYPercent }}>
          <motion.div style={{ filter: achievementsRecedeFilter, scale: achievementsRecedeScale }}>
            <Achievements active={achievementsActive} />
          </motion.div>
        </motion.div>
      </div>

      {/* The Team scene — same rising-panel language again, entering from
          the bottom and covering Achievements once triggered, then itself
          recedes (blur/darken/scale) as Footer rises over it. */}
      <div
        id="team"
        className="z-[26]"
        style={
          teamLive
            ? {
                position: isTeam ? 'relative' : 'fixed',
                inset: isTeam ? undefined : 0,
                overflow: isTeam ? 'visible' : 'clip',
              }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <motion.div style={{ y: teamYPercent }}>
          <motion.div style={{ filter: teamRecedeFilter, scale: teamRecedeScale }}>
            <Team active={teamActive} />
          </motion.div>
        </motion.div>
      </div>

      {/* The Footer scene — the final "system end" screen. Same rising-panel
          language again, entering from the bottom and covering Team once
          triggered; nothing recedes further since it's the last scene. */}
      <div
        id="footer"
        className="z-[27]"
        style={
          footerLive
            ? {
                position: isFooter ? 'relative' : 'fixed',
                inset: isFooter ? undefined : 0,
                overflow: isFooter ? 'visible' : 'clip',
              }
            : { position: 'static', height: 0, visibility: 'hidden', overflow: 'clip' }
        }
      >
        <motion.div style={{ y: footerYPercent }}>
          <Footer active={footerActive} />
        </motion.div>
      </div>

      <AnimatePresence>
        {phase !== 'revealed' && <Preloader key="preloader" onComplete={() => setPhase('holding')} />}
      </AnimatePresence>
    </>
  )
}

export default App
