const SiteSettings = require('../models/SiteSettings')
const { isValidEmail, isValidUrlOrEmpty } = require('../utils/validation')

const GENERIC_ERROR = { success: false, message: 'Something went wrong. Please try again.' }

// Every field here is public-facing site copy or a public link — nothing
// admin-only/sensitive lives on this model, so the admin and public
// endpoints deliberately expose the exact same set (see getPublicSettings /
// getAdminSettings below).
const PUBLIC_FIELDS = [
  // Global / Brand
  'siteName',
  'siteDescription',
  'clubName',
  'universityName',
  'contactEmail',
  // Home
  'homeHeroLine1',
  'homeHeroLine2',
  'homeHeroLine3',
  'homeHeroDescription',
  'homeExploreCtaText',
  'homeProjectsCtaText',
  'homeFollowCtaText',
  // About
  'aboutTitle',
  'aboutHeading',
  'aboutDescription',
  'aboutLabel1',
  'aboutLabel2',
  'aboutLabel3',
  'aboutLabel4',
  // Events
  'eventsSectionTitle',
  'eventsIntro',
  'eventsCtaText',
  // Projects
  'projectsSectionTitle',
  'projectsIntro',
  // Achievements
  'achievementsSectionTitle',
  'achievementsIntro',
  // Team
  'teamSectionTitle',
  'teamIntro',
  // Join Us
  'joinUsHeroTitle',
  'joinUsHeroSubtitle',
  'joinUsHeroDescription',
  'joinUsWhyTitle',
  'joinUsWhyDescription',
  'joinUsDomainTitle',
  'joinUsFinalTitle',
  'joinUsFinalDescription',
  'joinUsFinalButtonText',
  // Footer
  'footerTitle',
  'footerTaglineLine1',
  'footerTaglineLine2',
  'footerClub',
  'footerUniversity',
  'footerDescription',
  'footerDesignerLabel',
  'footerDesignerName',
  'footerText',
  // Social & Links
  'instagramUrl',
  'linkedinUrl',
  'githubUrl',
  'email',
  'websiteUrl',
  'youtubeUrl',
]

// Fields validated as "email or empty".
const EMAIL_FIELDS = ['contactEmail', 'email']
// Fields validated as "http(s) URL or empty" — never javascript:/data:/other
// schemes (see isValidUrlOrEmpty).
const URL_FIELDS = ['instagramUrl', 'linkedinUrl', 'githubUrl', 'websiteUrl', 'youtubeUrl']

function toPublicSettings(doc) {
  const out = {}
  for (const field of PUBLIC_FIELDS) out[field] = doc[field]
  return out
}

async function getPublicSettings(req, res) {
  try {
    const settings = await SiteSettings.getSingleton()
    return res.status(200).json({ success: true, settings: toPublicSettings(settings) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

async function getAdminSettings(req, res) {
  try {
    const settings = await SiteSettings.getSingleton()
    return res.status(200).json({ success: true, settings: toPublicSettings(settings) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

// PUT /api/admin/settings — deliberately partial: only fields present as
// strings in the body are validated/written, everything else on the
// document is left exactly as it was. This is what lets each Settings card
// on the admin page save independently without ever clobbering a section
// it doesn't own.
async function updateSettings(req, res) {
  try {
    const body = req.body || {}
    const errors = {}

    for (const field of EMAIL_FIELDS) {
      if (body[field] !== undefined && body[field] !== '' && !isValidEmail(body[field])) {
        errors[field] = 'Enter a valid email address.'
      }
    }
    for (const field of URL_FIELDS) {
      if (body[field] !== undefined && !isValidUrlOrEmpty(body[field])) {
        errors[field] = 'Enter a valid URL (starting with http:// or https://).'
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid settings data.', errors })
    }

    const settings = await SiteSettings.getSingleton()
    for (const field of PUBLIC_FIELDS) {
      if (typeof body[field] === 'string') {
        settings[field] = body[field].trim()
      }
    }
    await settings.save()

    return res.status(200).json({ success: true, settings: toPublicSettings(settings) })
  } catch {
    return res.status(500).json(GENERIC_ERROR)
  }
}

module.exports = { getPublicSettings, getAdminSettings, updateSettings }
