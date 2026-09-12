import { useEffect, useState } from 'react'
import { settingsService, type SiteSettings } from '../services/settingsService'
import { heroContent } from '../content/hero'
import { aboutContent } from '../content/about'
import { eventsContent } from '../content/events'
import { projectsContent } from '../content/projects'
import { achievementsContent } from '../content/achievements'
import { teamContent } from '../content/team'
import { joinUsHero, joinUsFinalCta } from '../content/joinUs'
import { footerContent } from '../content/footer'

// Defaults mirror the site's existing hardcoded copy exactly, so every
// consumer renders identically before the fetch resolves and if the
// backend is ever unreachable — only real, fetched values ever replace
// them. Every section's default is pulled from that section's own existing
// content/*.ts file rather than retyped here, so the fallback can never
// silently drift out of sync with what the component actually renders.
const DEFAULT_SETTINGS: SiteSettings = {
  // Global / Brand
  siteName: 'Dinobots',
  siteDescription: 'DINOBOTS — Robotics & Electronics Club at KIET Deemed to be University.',
  clubName: 'Dinobots',
  universityName: 'KIET Deemed to be University',
  contactEmail: 'dinobots.kiet@gmail.com',
  // Home
  homeHeroLine1: heroContent.headingLines[0] ?? 'BUILD.',
  homeHeroLine2: heroContent.headingLines[1] ?? 'CREATE.',
  homeHeroLine3: heroContent.headingLines[2] ?? 'COMPETE.',
  homeHeroDescription: heroContent.description,
  homeExploreCtaText: heroContent.primaryCta,
  homeProjectsCtaText: heroContent.secondaryCta,
  homeFollowCtaText: 'FOLLOW',
  // About
  aboutTitle: aboutContent.eyebrow,
  aboutHeading: aboutContent.headingLines.join('\n'),
  aboutDescription: aboutContent.description,
  aboutLabel1: aboutContent.labels[0] ?? '01 / WHO WE ARE',
  aboutLabel2: aboutContent.labels[1] ?? '02 / BUILD',
  aboutLabel3: aboutContent.labels[2] ?? '03 / INNOVATE',
  aboutLabel4: aboutContent.labels[3] ?? '04 / COMPETE',
  // Events
  eventsSectionTitle: eventsContent.heading,
  eventsIntro: '',
  eventsCtaText: 'JOIN EVENT',
  // Projects
  projectsSectionTitle: projectsContent.heading,
  projectsIntro: '',
  // Achievements
  achievementsSectionTitle: achievementsContent.heading,
  achievementsIntro: '',
  // Team
  teamSectionTitle: teamContent.heading,
  teamIntro: '',
  // Join Us
  joinUsHeroTitle: joinUsHero.heading,
  joinUsHeroSubtitle: joinUsHero.tagline.join('\n'),
  joinUsHeroDescription: joinUsHero.description,
  joinUsWhyTitle: 'WHY DINOBOTS?',
  joinUsWhyDescription: '',
  joinUsDomainTitle: 'EXPLORE YOUR DOMAIN',
  joinUsFinalTitle: joinUsFinalCta.heading,
  joinUsFinalDescription: '',
  joinUsFinalButtonText: joinUsFinalCta.cta.replace(/\s*→\s*$/, ''),
  // Footer
  footerTitle: footerContent.heading,
  footerTaglineLine1: footerContent.tagline[0] ?? 'SYSTEMS BUILT.',
  footerTaglineLine2: footerContent.tagline[1] ?? 'IDEAS MOVING.',
  footerClub: footerContent.identity.club,
  footerUniversity: footerContent.identity.university,
  footerDescription: '',
  footerDesignerLabel: footerContent.credit.label,
  footerDesignerName: footerContent.credit.name,
  footerText: footerContent.copyright,
  // Social & Links
  instagramUrl: footerContent.social.find((s) => s.icon === 'instagram')?.href ?? '',
  linkedinUrl: footerContent.social.find((s) => s.icon === 'linkedin')?.href ?? '',
  githubUrl: footerContent.social.find((s) => s.icon === 'github')?.href ?? '',
  email: 'dinobots.kiet@gmail.com',
  websiteUrl: '',
  youtubeUrl: '',
}

// Fetched once per page load and shared across every consumer via a
// module-level cache — Footer, HeroFollowButton, About, and every other
// section all call this hook, and they should all resolve to the same
// settings without firing a separate request each.
let cachedSettings: SiteSettings | null = null
let inFlight: Promise<SiteSettings | null> | null = null

function fetchSettings(): Promise<SiteSettings | null> {
  if (cachedSettings) return Promise.resolve(cachedSettings)
  if (!inFlight) {
    inFlight = settingsService.getPublicSettings().then((settings) => {
      if (settings) cachedSettings = settings
      inFlight = null
      return settings
    })
  }
  return inFlight
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings ?? DEFAULT_SETTINGS)

  useEffect(() => {
    let cancelled = false
    fetchSettings().then((data) => {
      if (!cancelled && data) setSettings(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
