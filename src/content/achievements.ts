// Content for Section 4 (Achievements). Kept separate so each section owns
// its own copy — edit here without touching Hero/About/Projects.

export interface AchievementEntry {
  image: string
  alt: string
}

export const achievementsContent = {
  heading: 'OUR ACHIEVEMENTS',
  background: '/dinobots-achivement-bg.jpeg',
  achievements: [
    { image: '/achivements/achievement-1.jpeg', alt: 'Dinobots achievement' },
    { image: '/achivements/achievement-2.jpeg', alt: 'Dinobots achievement' },
    { image: '/achivements/achievement-3.jpeg', alt: 'Dinobots achievement' },
    { image: '/achivements/achievement-4.jpeg', alt: 'Dinobots achievement' },
    { image: '/achivements/achievement-5.jpeg', alt: 'Dinobots achievement' },
    { image: '/achivements/achievement-6.jpeg', alt: 'Dinobots achievement' },
  ] as AchievementEntry[],
} as const
