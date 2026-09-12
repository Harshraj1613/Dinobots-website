const mongoose = require('mongoose')

// Singleton document — every read/write goes through the fixed id below so
// the collection can never accumulate more than one settings document.
const SINGLETON_ID = 'site-settings'

// A flat schema (not nested sub-documents) — deliberately kept consistent
// with how this model already worked before this section-by-section CMS
// pass, and it's what lets Mongoose's per-path `default` apply cleanly to
// the one existing stored document the moment any new field is read (no
// migration needed): every default below mirrors the current hardcoded
// site copy exactly, so an admin who has never touched Settings sees no
// change at all, on any section.
const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: SINGLETON_ID },

    // ---- Global / Brand ----
    siteName: { type: String, default: 'Dinobots' },
    siteDescription: {
      type: String,
      default: 'DINOBOTS — Robotics & Electronics Club at KIET Deemed to be University.',
    },
    clubName: { type: String, default: 'Dinobots' },
    universityName: { type: String, default: 'KIET Deemed to be University' },
    contactEmail: { type: String, default: 'dinobots.kiet@gmail.com' },

    // ---- Home ----
    homeHeroLine1: { type: String, default: 'BUILD.' },
    homeHeroLine2: { type: String, default: 'CREATE.' },
    homeHeroLine3: { type: String, default: 'COMPETE.' },
    homeHeroDescription: {
      type: String,
      default:
        'Dinobots is the robotics club of KIET Deemed to be University, where students build, experiment, and compete at the edge of robotics and technology.',
    },
    homeExploreCtaText: { type: String, default: 'EXPLORE DINOBOTS' },
    homeProjectsCtaText: { type: String, default: 'OUR PROJECTS' },
    homeFollowCtaText: { type: String, default: 'FOLLOW' },

    // ---- About ----
    aboutTitle: { type: String, default: 'ABOUT DINOBOTS' },
    aboutHeading: { type: String, default: 'WE BUILD\nWHAT MOVES.' },
    aboutDescription: {
      type: String,
      default:
        'Dinobots is the robotics club of KIET Deemed to be University, where students build, experiment, and compete at the edge of robotics and technology.',
    },
    aboutLabel1: { type: String, default: '01 / WHO WE ARE' },
    aboutLabel2: { type: String, default: '02 / BUILD' },
    aboutLabel3: { type: String, default: '03 / INNOVATE' },
    aboutLabel4: { type: String, default: '04 / COMPETE' },

    // ---- Events ----
    eventsSectionTitle: { type: String, default: 'UPCOMING EVENTS' },
    eventsIntro: { type: String, default: '' },
    eventsCtaText: { type: String, default: 'JOIN EVENT' },

    // ---- Projects ----
    projectsSectionTitle: { type: String, default: 'WHERE IDEAS BECOME MACHINES.' },
    projectsIntro: { type: String, default: '' },

    // ---- Achievements ----
    achievementsSectionTitle: { type: String, default: 'OUR ACHIEVEMENTS' },
    achievementsIntro: { type: String, default: '' },

    // ---- Team ----
    teamSectionTitle: { type: String, default: 'TEAM DINOBOTS' },
    teamIntro: { type: String, default: '' },

    // ---- Join Us ----
    joinUsHeroTitle: { type: String, default: 'JOIN DINOBOTS' },
    joinUsHeroSubtitle: { type: String, default: 'BUILD THE FUTURE.\nBUILD IT WITH US.' },
    joinUsHeroDescription: {
      type: String,
      default: "Become a part of KIET's robotics community and work on real projects, competitions, research, and emerging technologies.",
    },
    joinUsWhyTitle: { type: String, default: 'WHY DINOBOTS?' },
    joinUsWhyDescription: { type: String, default: '' },
    joinUsDomainTitle: { type: String, default: 'EXPLORE YOUR DOMAIN' },
    joinUsFinalTitle: { type: String, default: 'YOUR NEXT BUILD STARTS HERE.' },
    joinUsFinalDescription: { type: String, default: '' },
    joinUsFinalButtonText: { type: String, default: 'JOIN DINOBOTS' },

    // ---- Footer ----
    footerTitle: { type: String, default: 'DINOBOTS' },
    footerTaglineLine1: { type: String, default: 'SYSTEMS BUILT.' },
    footerTaglineLine2: { type: String, default: 'IDEAS MOVING.' },
    footerClub: { type: String, default: 'KIET • ROBOTICS CLUB' },
    footerUniversity: { type: String, default: 'KIET DEEMED TO BE UNIVERSITY' },
    footerDescription: { type: String, default: '' },
    footerDesignerLabel: { type: String, default: 'WEBSITE DESIGNED & DEVELOPED BY' },
    footerDesignerName: { type: String, default: 'HARSH RAJ MISHRA' },
    footerText: { type: String, default: '© 2026 DINOBOTS. ALL RIGHTS RESERVED.' },

    // ---- Social & Links ----
    instagramUrl: { type: String, default: 'https://www.instagram.com/dinobots_kiet/' },
    linkedinUrl: {
      type: String,
      default: 'https://www.linkedin.com/company/dinobots-kiet/posts/?feedView=all',
    },
    githubUrl: { type: String, default: 'https://github.com/dinobots-kiet' },
    email: { type: String, default: 'dinobots.kiet@gmail.com' },
    websiteUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

// Always returns the one settings document, creating it with defaults the
// first time anything asks for it — callers never need to think about
// whether it already exists.
siteSettingsSchema.statics.getSingleton = async function getSingleton() {
  const existing = await this.findById(SINGLETON_ID)
  if (existing) return existing
  return this.create({ _id: SINGLETON_ID })
}

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)
