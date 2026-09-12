// Content for the closing Footer scene. Kept separate so the footer's own
// copy/links can be edited without touching Footer.tsx — same pattern as
// every other section's content/*.ts file.

export type SocialIcon = 'instagram' | 'linkedin' | 'github' | 'mail'

export interface SocialLink {
  label: string
  /** Placeholder destinations — swap for the club's real handles/links
   *  whenever they're finalized; nothing else needs to change. */
  href: string
  icon: SocialIcon
}

export const footerContent = {
  systemLine: { start: '01', end: '100' },
  heading: 'DINOBOTS',
  tagline: ['SYSTEMS BUILT.', 'IDEAS MOVING.'],
  identity: {
    club: 'KIET • ROBOTICS CLUB',
    university: 'KIET DEEMED TO BE UNIVERSITY',
    meta: 'ENGINEERING • ROBOTICS • INNOVATION',
  },
  social: [
    { label: 'INSTAGRAM', href: 'https://www.instagram.com/dinobots_kiet/', icon: 'instagram' },
    {
      label: 'LINKEDIN',
      href: 'https://www.linkedin.com/company/dinobots-kiet/posts/?feedView=all',
      icon: 'linkedin',
    },
    { label: 'GITHUB', href: 'https://github.com/dinobots-kiet', icon: 'github' },
    { label: 'EMAIL', href: 'mailto:dinobots.kiet@gmail.com', icon: 'mail' },
  ] as SocialLink[],
  adminLoginLabel: 'ADMIN LOGIN',
  credit: {
    label: 'WEBSITE DESIGNED & DEVELOPED BY',
    name: 'HARSH RAJ MISHRA',
  },
  copyright: '© 2026 DINOBOTS. ALL RIGHTS RESERVED.',
  university: 'KIET DEEMED TO BE UNIVERSITY',
} as const
