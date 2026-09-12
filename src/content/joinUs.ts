// Content for the standalone /join-us page. Kept separate so copy/data can
// be edited without touching JoinUs.tsx or its child components — same
// pattern as every other page/section's content/*.ts file.

export const joinUsHero = {
  heading: 'JOIN DINOBOTS',
  tagline: ['BUILD THE FUTURE.', 'BUILD IT WITH US.'],
  description:
    "Become a part of KIET's robotics community and work on real projects, competitions, research, and emerging technologies.",
  primaryCta: 'APPLY NOW',
  secondaryCta: 'EXPLORE DOMAINS',
} as const

export interface WhyDinobotsBlock {
  number: string
  title: string
  description: string
}

export const whyDinobotsBlocks: WhyDinobotsBlock[] = [
  {
    number: '01',
    title: 'BUILD',
    description: 'Work on real robotic systems, prototypes, and hardware.',
  },
  {
    number: '02',
    title: 'COMPETE',
    description: 'Represent Dinobots at robotics competitions and challenges.',
  },
  {
    number: '03',
    title: 'LEARN',
    description:
      'Develop practical skills across robotics, electronics, software, AI, automation and embedded systems.',
  },
  {
    number: '04',
    title: 'CREATE',
    description: 'Turn your own ideas into working machines and experiments.',
  },
]

export interface DomainEntry {
  id: string
  label: string
  description: string
}

// Dummy descriptions for now — structured so they can be edited freely
// without touching DomainSelector.tsx.
export const domains: DomainEntry[] = [
  {
    id: 'robotics',
    label: 'ROBOTICS',
    description: 'Design, integrate and test complete robotic systems from concept to working prototype.',
  },
  {
    id: 'electronics',
    label: 'ELECTRONICS',
    description: 'Build circuits, power systems, and hardware interfaces that bring every project to life.',
  },
  {
    id: 'software',
    label: 'SOFTWARE',
    description: 'Write the logic, tools, and infrastructure that connect every robotic subsystem together.',
  },
  {
    id: 'ai-ml',
    label: 'AI / ML',
    description: 'Train and deploy models that give robotic systems perception, prediction, and decision-making.',
  },
  {
    id: 'iot',
    label: 'IOT',
    description: 'Connect sensors and devices into networks that let machines talk to each other and to the cloud.',
  },
  {
    id: 'automation',
    label: 'AUTOMATION',
    description: 'Design control workflows that make repetitive robotic processes reliable and efficient.',
  },
  {
    id: 'mechanical',
    label: 'MECHANICAL',
    description: 'Model, fabricate, and refine the physical structures that every build stands on.',
  },
  {
    id: 'embedded',
    label: 'EMBEDDED',
    description: 'Program microcontrollers and firmware that bridge hardware and software in real time.',
  },
  {
    id: 'computer-vision',
    label: 'COMPUTER VISION',
    description: 'Build vision pipelines that let robots see, recognize, and react to their environment.',
  },
]

export const applicationFormOptions = {
  years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
  branches: [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Information Technology',
    'Other',
  ],
} as const

export const joinUsFinalCta = {
  heading: 'YOUR NEXT BUILD STARTS HERE.',
  cta: 'JOIN DINOBOTS →',
  line1: 'KIET DEEMED TO BE UNIVERSITY',
  line2: 'ROBOTICS CLUB',
} as const
