// Single source of truth for the Home Hero's copy. Edit here — nothing in
// Hero.tsx should ever hardcode these values directly.

// The cinematic scene each nav item resolves to — shared by the desktop
// navbar and the mobile dropdown so both always point at the same targets.
export type NavTarget = 'home' | 'about' | 'events' | 'projects' | 'achievements' | 'team'

export const heroContent = {
  brand: 'DINOBOTS',
  nav: [
    { label: 'HOME', href: '#home', target: 'home' as NavTarget },
    { label: 'ABOUT', href: '#about', target: 'about' as NavTarget },
    { label: 'EVENTS', href: '#events', target: 'events' as NavTarget },
    { label: 'PROJECTS', href: '#projects', target: 'projects' as NavTarget },
    { label: 'ACHIEVEMENTS', href: '#achievements', target: 'achievements' as NavTarget },
    { label: 'TEAM', href: '#team', target: 'team' as NavTarget },
  ],
  navCta: 'JOIN US',
  headingLines: ['BUILD.', 'CREATE.', 'COMPETE.'],
  description:
    'Dinobots is the robotics club of KIET Deemed to be University, where students build, experiment, and compete at the edge of robotics and technology.',
  primaryCta: 'EXPLORE DINOBOTS',
  secondaryCta: 'OUR PROJECTS',
  annotations: ['01 / AUTONOMOUS SYSTEM', '02 / MOTION CONTROL', '03 / COMPUTER VISION', '04 / EMBEDDED SYSTEM'],
  scrollLabel: 'SCROLL TO EXPLORE',
} as const
