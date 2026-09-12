import { useEffect, useState } from 'react'
import SettingsCard, { type SettingsFieldDef } from '../../components/admin/SettingsCard'
import { LoadingState, ErrorState } from '../../components/admin/LoadingState'
import { admin, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import { settingsService, type SiteSettings } from '../../services/settingsService'

// Field lists for every section — kept as plain data so the page itself is
// just "fetch once, render one SettingsCard per section." Each array is
// exactly the fields that section's own card owns; nothing here duplicates
// the Team/Projects/Achievements/Events CRUD pages — this is section-level
// copy and links only.
const GLOBAL_FIELDS: SettingsFieldDef[] = [
  { key: 'siteName', label: 'Site Name' },
  { key: 'clubName', label: 'Club Name' },
  { key: 'universityName', label: 'University Name' },
  { key: 'contactEmail', label: 'Contact Email', type: 'email' },
  { key: 'siteDescription', label: 'Site Description', type: 'textarea', fullWidth: true },
]

const HOME_FIELDS: SettingsFieldDef[] = [
  { key: 'homeHeroLine1', label: 'Hero Line 1' },
  { key: 'homeHeroLine2', label: 'Hero Line 2' },
  { key: 'homeHeroLine3', label: 'Hero Line 3' },
  { key: 'homeExploreCtaText', label: 'Explore CTA Text', hint: 'Action stays the Explore Dinobots slideshow.' },
  { key: 'homeProjectsCtaText', label: 'Projects CTA Text', hint: 'Action stays a direct jump to Projects.' },
  { key: 'homeFollowCtaText', label: 'Follow CTA Text', hint: 'Action stays the social links menu.' },
  { key: 'homeHeroDescription', label: 'Hero Description', type: 'textarea', fullWidth: true },
]

const ABOUT_FIELDS: SettingsFieldDef[] = [
  { key: 'aboutTitle', label: 'Section Title' },
  { key: 'aboutLabel1', label: 'Label 01' },
  { key: 'aboutLabel2', label: 'Label 02' },
  { key: 'aboutLabel3', label: 'Label 03' },
  { key: 'aboutLabel4', label: 'Label 04' },
  {
    key: 'aboutHeading',
    label: 'Main Heading',
    type: 'textarea',
    fullWidth: true,
    hint: 'Use a new line to break onto a second line, matching the public site’s two-line heading.',
  },
  { key: 'aboutDescription', label: 'Description', type: 'textarea', fullWidth: true },
]

const EVENTS_FIELDS: SettingsFieldDef[] = [
  { key: 'eventsSectionTitle', label: 'Section Title' },
  { key: 'eventsCtaText', label: 'Default CTA Text', hint: 'Shown on each event notice as "TEXT →".' },
  { key: 'eventsIntro', label: 'Intro / Description', type: 'textarea', fullWidth: true, hint: 'Optional — leave blank to hide.' },
]

const PROJECTS_FIELDS: SettingsFieldDef[] = [
  { key: 'projectsSectionTitle', label: 'Section Title' },
  { key: 'projectsIntro', label: 'Intro / Description', type: 'textarea', fullWidth: true, hint: 'Optional — leave blank to hide.' },
]

const ACHIEVEMENTS_FIELDS: SettingsFieldDef[] = [
  { key: 'achievementsSectionTitle', label: 'Section Title' },
  { key: 'achievementsIntro', label: 'Intro Text', type: 'textarea', fullWidth: true, hint: 'Optional — leave blank to hide.' },
]

const TEAM_FIELDS: SettingsFieldDef[] = [
  { key: 'teamSectionTitle', label: 'Section Title' },
  { key: 'teamIntro', label: 'Intro Text', type: 'textarea', fullWidth: true, hint: 'Optional — leave blank to hide.' },
]

const JOIN_US_FIELDS: SettingsFieldDef[] = [
  { key: 'joinUsHeroTitle', label: 'Hero Title' },
  { key: 'joinUsDomainTitle', label: 'Domain Section Title' },
  { key: 'joinUsWhyTitle', label: 'Why Dinobots Title' },
  { key: 'joinUsFinalTitle', label: 'Final CTA Title' },
  { key: 'joinUsFinalButtonText', label: 'Final CTA Button Text' },
  { key: 'joinUsHeroSubtitle', label: 'Hero Subtitle', type: 'textarea', hint: 'One line per line.' },
  { key: 'joinUsHeroDescription', label: 'Hero Description', type: 'textarea' },
  { key: 'joinUsWhyDescription', label: 'Why Dinobots Description', type: 'textarea', hint: 'Optional — leave blank to hide.' },
  { key: 'joinUsFinalDescription', label: 'Final CTA Description', type: 'textarea', hint: 'Optional — leave blank to hide.' },
]

const FOOTER_FIELDS: SettingsFieldDef[] = [
  { key: 'footerTitle', label: 'Main Title' },
  { key: 'footerTaglineLine1', label: 'Tagline Line 1' },
  { key: 'footerTaglineLine2', label: 'Tagline Line 2' },
  { key: 'footerClub', label: 'Club Identity' },
  { key: 'footerUniversity', label: 'University Name' },
  { key: 'footerDesignerLabel', label: 'Designer Label' },
  { key: 'footerDesignerName', label: 'Designer Name' },
  { key: 'footerText', label: 'Copyright Text' },
  { key: 'footerDescription', label: 'Description', type: 'textarea', fullWidth: true, hint: 'Optional — leave blank to hide.' },
]

const SOCIAL_FIELDS: SettingsFieldDef[] = [
  { key: 'instagramUrl', label: 'Instagram URL' },
  { key: 'linkedinUrl', label: 'LinkedIn URL' },
  { key: 'githubUrl', label: 'GitHub URL' },
  { key: 'email', label: 'Email Address', type: 'email' },
  { key: 'websiteUrl', label: 'Website URL' },
  { key: 'youtubeUrl', label: 'YouTube URL' },
]

const SECTIONS: { title: string; fields: SettingsFieldDef[] }[] = [
  { title: 'GLOBAL / BRAND', fields: GLOBAL_FIELDS },
  { title: 'HOME', fields: HOME_FIELDS },
  { title: 'ABOUT', fields: ABOUT_FIELDS },
  { title: 'EVENTS', fields: EVENTS_FIELDS },
  { title: 'PROJECTS', fields: PROJECTS_FIELDS },
  { title: 'ACHIEVEMENTS', fields: ACHIEVEMENTS_FIELDS },
  { title: 'TEAM', fields: TEAM_FIELDS },
  { title: 'JOIN US', fields: JOIN_US_FIELDS },
  { title: 'FOOTER', fields: FOOTER_FIELDS },
  { title: 'SOCIAL & LINKS', fields: SOCIAL_FIELDS },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    settingsService.getAdminSettings().then((result) => {
      if (result.success && result.settings) {
        setSettings(result.settings)
      } else {
        setError(result.message || 'Failed to load settings.')
      }
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingState label="Loading settings…" />

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold uppercase tracking-tight" style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}>
          SETTINGS
        </h1>
        <p className="mt-1 text-sm" style={{ color: admin.textMuted }}>
          Section-by-section public site content. Each card saves independently — Team, Projects, Achievements, and
          Events records themselves are still managed from their own pages.
        </p>
      </div>

      {error && <ErrorState label={error} />}

      {settings && (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {SECTIONS.map((section) => (
            <SettingsCard key={section.title} title={section.title} fields={section.fields} settings={settings} />
          ))}
        </div>
      )}
    </div>
  )
}
