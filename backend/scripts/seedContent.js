// One-time/idempotent migration of the website's existing hardcoded content
// (src/content/team.ts, projects.ts, achievements.ts, footer.ts) into
// MongoDB. Safe to run multiple times — every record is upserted by a
// natural key (name / title / image path) instead of blindly inserted, so
// re-running this never creates duplicates.
require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('../src/config/db')
const TeamMember = require('../src/models/TeamMember')
const Project = require('../src/models/Project')
const Achievement = require('../src/models/Achievement')
const SiteSettings = require('../src/models/SiteSettings')

const PLACEHOLDER_TEAM_IMAGE = '/dinobots-team-bg.jpeg'

// Exact order + names + posts + descriptions currently live on the public
// site (src/content/team.ts) — preserved verbatim.
const TEAM_MEMBERS = [
  {
    name: 'Quazi Rahman',
    post: 'MANAGEMENT HEAD',
    description:
      'Quazi leads the overall management of Dinobots, coordinating people, projects, and execution while keeping the team focused on building impactful robotics solutions.',
  },
  {
    name: 'Himesh',
    post: 'ELECTRONICS HEAD',
    description:
      'Himesh works on electronics architecture, circuit integration, and hardware development, helping transform robotic concepts into reliable working systems.',
  },
  {
    name: 'Tanu',
    post: 'ROBOTICS HEAD',
    description:
      'Tanu focuses on robotics development, system integration, and practical experimentation to turn mechanical concepts into functional robotic platforms.',
  },
  {
    name: 'Lokendra',
    post: 'MACHINE LEARNING HEAD',
    description:
      'Lokendra explores intelligent systems, machine learning, and perception-based solutions that help robots understand and respond to their surroundings.',
  },
  {
    name: 'Nilesh',
    post: 'SOFTWARE HEAD',
    description:
      'Nilesh works on software development, system logic, and digital infrastructure that connects different parts of the robotics ecosystem.',
  },
  {
    name: 'Pratyaksh',
    post: 'AUTOMATION HEAD',
    description:
      'Pratyaksh focuses on automation workflows, control logic, and building systems that make robotic processes smarter and more efficient.',
  },
  {
    name: 'Mayank',
    post: 'IOT HEAD',
    description:
      "Mayank works with connected devices, sensors, and IoT systems to create communication between robotic platforms and the digital environment.",
  },
  {
    name: 'Kartik',
    post: 'MECHANICAL HEAD',
    description:
      'Kartik focuses on mechanical design, fabrication, and structural development to create robust and practical robotic systems.',
  },
  {
    name: 'Harsh Raj',
    post: 'SOFTWARE / SOCIAL MEDIA HEAD',
    description:
      "Harsh works across software development and the club's digital presence, helping build technical solutions while also showcasing Dinobots' work and activities online.",
  },
  {
    name: 'Rahul',
    post: 'EMBEDDED SYSTEMS HEAD',
    description:
      'Rahul works on embedded systems, microcontrollers, firmware, and hardware-software integration for robotic applications.',
  },
  {
    name: 'Ankit',
    post: 'AI HEAD',
    description:
      'Ankit works on applied AI models and decision-making pipelines that help robotic systems act smarter in real-world scenarios.',
  },
  {
    name: 'Aditya',
    post: 'DESIGN HEAD',
    description:
      "Aditya shapes Dinobots' visual identity, crafting clean and cohesive designs across the club's projects and presentations.",
  },
  {
    name: 'Aryan',
    post: 'CAD HEAD',
    description:
      'Aryan builds detailed CAD models and assemblies, translating design ideas into precise, buildable mechanical parts.',
  },
  {
    name: 'Abhishek',
    post: 'CONTROL SYSTEMS HEAD',
    description:
      'Abhishek designs control logic and feedback systems that keep robotic platforms stable, responsive, and predictable.',
  },
  {
    name: 'Shubham',
    post: 'RESEARCH HEAD',
    description:
      'Shubham drives research into new robotics techniques and technologies, keeping the team informed on emerging approaches.',
  },
  {
    name: 'Yash',
    post: 'FABRICATION HEAD',
    description: 'Yash oversees fabrication and build quality, turning designs into sturdy, competition-ready hardware.',
  },
  {
    name: 'Rohan',
    post: 'VISION HEAD',
    description: 'Rohan works on computer vision pipelines that let robotic systems perceive and interpret their environment.',
  },
  {
    name: 'Vivek',
    post: 'CONTENT HEAD',
    description:
      "Vivek shapes the stories and write-ups behind Dinobots' projects, making technical work easy to follow and share.",
  },
  {
    name: 'Aman',
    post: 'PR HEAD',
    description: 'Aman manages outreach and public relations, building relationships that support the team and its projects.',
  },
  {
    name: 'Kunal',
    post: 'PROJECTS HEAD',
    description: "Kunal coordinates ongoing project timelines, keeping every build on track from first idea to final demo.",
  },
].map((member, i) => ({ ...member, image: PLACEHOLDER_TEAM_IMAGE, order: i + 1 }))

// Exact copy + image paths currently live on the public site
// (src/content/projects.ts) — preserved verbatim.
const PROJECTS = [
  {
    title: 'PROJECT 1',
    description:
      'An experimental autonomous robotics system designed to explore real-time sensing, navigation, and intelligent movement.',
    image: '/projects/project-1.jpeg',
    order: 1,
  },
  {
    title: 'PROJECT 2',
    description:
      'A prototype built around smart control, embedded systems, and precision motion for practical robotic applications.',
    image: '/projects/project-2.jpeg',
    order: 2,
  },
  {
    title: 'PROJECT 3',
    description:
      'An evolving robotics platform combining sensors, automation, and machine intelligence for real-world challenges.',
    image: '/projects/project-3.jpeg',
    order: 3,
  },
]

// Exact image ordering currently live on the public site
// (src/content/achievements.ts) — preserved verbatim.
const ACHIEVEMENTS = [
  '/achivements/achievement-1.jpeg',
  '/achivements/achievement-2.jpeg',
  '/achivements/achievement-3.jpeg',
  '/achivements/achievement-4.jpeg',
  '/achivements/achievement-5.jpeg',
  '/achivements/achievement-6.jpeg',
].map((image, i) => ({ image, title: '', description: '', order: i + 1 }))

async function upsertMany(Model, key, records, label) {
  let created = 0
  let updated = 0
  for (const record of records) {
    const result = await Model.updateOne(
      { [key]: record[key] },
      { $setOnInsert: { isActive: true }, $set: record },
      { upsert: true }
    )
    if (result.upsertedCount > 0) created += 1
    else updated += 1
  }
  console.log(`${label}: ${created} created, ${updated} already present (updated in place)`)
}

async function seedContent() {
  await connectDB()

  await upsertMany(TeamMember, 'name', TEAM_MEMBERS, 'Team members')
  await upsertMany(Project, 'title', PROJECTS, 'Projects')
  await upsertMany(Achievement, 'image', ACHIEVEMENTS, 'Achievements')

  // Ensures the singleton settings document exists with the site's current
  // social links baked in as defaults — never creates a second document.
  await SiteSettings.getSingleton()
  console.log('Site settings: singleton document ensured')

  await mongoose.disconnect()
  process.exit(0)
}

seedContent().catch((err) => {
  console.error('Failed to seed content:', err.message)
  process.exit(1)
})
