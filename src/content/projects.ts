// Content for Section 3 (Projects). Kept separate so each section owns its
// own copy — edit here without touching Hero/About.

export interface ProjectEntry {
  title: string
  description: string
  image: string
  label: string
}

export const projectsContent = {
  heading: 'WHERE IDEAS BECOME MACHINES.',
  background: '/dinobots-projects-bg.jpeg',
  projects: [
    {
      title: 'PROJECT 1',
      description:
        'An experimental autonomous robotics system designed to explore real-time sensing, navigation, and intelligent movement.',
      image: '/projects/project-1.jpeg',
      label: '01 / PROJECT SYSTEM',
    },
    {
      title: 'PROJECT 2',
      description:
        'A prototype built around smart control, embedded systems, and precision motion for practical robotic applications.',
      image: '/projects/project-2.jpeg',
      label: '02 / PROJECT SYSTEM',
    },
    {
      title: 'PROJECT 3',
      description:
        'An evolving robotics platform combining sensors, automation, and machine intelligence for real-world challenges.',
      image: '/projects/project-3.jpeg',
      label: '03 / PROJECT SYSTEM',
    },
  ] as ProjectEntry[],
} as const
