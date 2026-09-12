import { apiGet, apiPut } from './apiClient'

export interface SiteSettings {
  // Global / Brand
  siteName: string
  siteDescription: string
  clubName: string
  universityName: string
  contactEmail: string
  // Home
  homeHeroLine1: string
  homeHeroLine2: string
  homeHeroLine3: string
  homeHeroDescription: string
  homeExploreCtaText: string
  homeProjectsCtaText: string
  homeFollowCtaText: string
  // About
  aboutTitle: string
  aboutHeading: string
  aboutDescription: string
  aboutLabel1: string
  aboutLabel2: string
  aboutLabel3: string
  aboutLabel4: string
  // Events
  eventsSectionTitle: string
  eventsIntro: string
  eventsCtaText: string
  // Projects
  projectsSectionTitle: string
  projectsIntro: string
  // Achievements
  achievementsSectionTitle: string
  achievementsIntro: string
  // Team
  teamSectionTitle: string
  teamIntro: string
  // Join Us
  joinUsHeroTitle: string
  joinUsHeroSubtitle: string
  joinUsHeroDescription: string
  joinUsWhyTitle: string
  joinUsWhyDescription: string
  joinUsDomainTitle: string
  joinUsFinalTitle: string
  joinUsFinalDescription: string
  joinUsFinalButtonText: string
  // Footer
  footerTitle: string
  footerTaglineLine1: string
  footerTaglineLine2: string
  footerClub: string
  footerUniversity: string
  footerDescription: string
  footerDesignerLabel: string
  footerDesignerName: string
  footerText: string
  // Social & Links
  instagramUrl: string
  linkedinUrl: string
  githubUrl: string
  email: string
  websiteUrl: string
  youtubeUrl: string
}

async function getPublicSettings(): Promise<SiteSettings | null> {
  const result = await apiGet<{ settings: SiteSettings }>('/api/site-settings')
  return result.success ? result.settings ?? null : null
}

async function getAdminSettings() {
  return apiGet<{ settings: SiteSettings }>('/api/admin/settings')
}

// Deliberately `Partial` — every Settings card on the admin page only ever
// sends the fields it owns, so other sections' data is never touched by a
// save it wasn't part of (the backend applies the same partial-update rule).
async function updateSettings(input: Partial<SiteSettings>) {
  return apiPut<{ settings: SiteSettings }>('/api/admin/settings', input)
}

export const settingsService = { getPublicSettings, getAdminSettings, updateSettings }
