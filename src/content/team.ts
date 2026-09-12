// Content for Section 5 (Team). Kept separate so each section owns its own
// copy — edit here without touching Hero/About/Projects/Achievements.

export interface TeamMember {
  name: string
  image: string
  /** Role/title shown in the card-detail info panel. */
  post: string
  /** Short 2-3 line bio shown in the card-detail info panel. */
  description: string
}

const PLACEHOLDER_IMAGE = '/dinobots-team-bg.jpeg'

export const teamContent = {
  heading: 'TEAM DINOBOTS',
  background: '/dinobots-team-bg.jpeg',
  // Exactly 20 members, in order, rendered through one continuous marquee.
  // Replace `image` per member later; order is never reshuffled. `post` and
  // `description` are dummy copy for now — swap freely per member without
  // touching how the card/detail view renders them.
  members: [
    {
      name: 'Quazi Rahman',
      image: PLACEHOLDER_IMAGE,
      post: 'MANAGEMENT HEAD',
      description:
        'Quazi leads the overall management of Dinobots, coordinating people, projects, and execution while keeping the team focused on building impactful robotics solutions.',
    },
    {
      name: 'Himesh',
      image: PLACEHOLDER_IMAGE,
      post: 'ELECTRONICS HEAD',
      description:
        'Himesh works on electronics architecture, circuit integration, and hardware development, helping transform robotic concepts into reliable working systems.',
    },
    {
      name: 'Tanu',
      image: PLACEHOLDER_IMAGE,
      post: 'ROBOTICS HEAD',
      description:
        'Tanu focuses on robotics development, system integration, and practical experimentation to turn mechanical concepts into functional robotic platforms.',
    },
    {
      name: 'Lokendra',
      image: PLACEHOLDER_IMAGE,
      post: 'MACHINE LEARNING HEAD',
      description:
        'Lokendra explores intelligent systems, machine learning, and perception-based solutions that help robots understand and respond to their surroundings.',
    },
    {
      name: 'Nilesh',
      image: PLACEHOLDER_IMAGE,
      post: 'SOFTWARE HEAD',
      description:
        'Nilesh works on software development, system logic, and digital infrastructure that connects different parts of the robotics ecosystem.',
    },
    {
      name: 'Pratyaksh',
      image: PLACEHOLDER_IMAGE,
      post: 'AUTOMATION HEAD',
      description:
        'Pratyaksh focuses on automation workflows, control logic, and building systems that make robotic processes smarter and more efficient.',
    },
    {
      name: 'Mayank',
      image: PLACEHOLDER_IMAGE,
      post: 'IOT HEAD',
      description:
        "Mayank works with connected devices, sensors, and IoT systems to create communication between robotic platforms and the digital environment.",
    },
    {
      name: 'Kartik',
      image: PLACEHOLDER_IMAGE,
      post: 'MECHANICAL HEAD',
      description:
        'Kartik focuses on mechanical design, fabrication, and structural development to create robust and practical robotic systems.',
    },
    {
      name: 'Harsh Raj',
      image: PLACEHOLDER_IMAGE,
      post: 'SOFTWARE / SOCIAL MEDIA HEAD',
      description:
        "Harsh works across software development and the club's digital presence, helping build technical solutions while also showcasing Dinobots' work and activities online.",
    },
    {
      name: 'Rahul',
      image: PLACEHOLDER_IMAGE,
      post: 'EMBEDDED SYSTEMS HEAD',
      description:
        'Rahul works on embedded systems, microcontrollers, firmware, and hardware-software integration for robotic applications.',
    },
    {
      name: 'Ankit',
      image: PLACEHOLDER_IMAGE,
      post: 'AI HEAD',
      description:
        'Ankit works on applied AI models and decision-making pipelines that help robotic systems act smarter in real-world scenarios.',
    },
    {
      name: 'Aditya',
      image: PLACEHOLDER_IMAGE,
      post: 'DESIGN HEAD',
      description:
        "Aditya shapes Dinobots' visual identity, crafting clean and cohesive designs across the club's projects and presentations.",
    },
    {
      name: 'Aryan',
      image: PLACEHOLDER_IMAGE,
      post: 'CAD HEAD',
      description:
        'Aryan builds detailed CAD models and assemblies, translating design ideas into precise, buildable mechanical parts.',
    },
    {
      name: 'Abhishek',
      image: PLACEHOLDER_IMAGE,
      post: 'CONTROL SYSTEMS HEAD',
      description:
        'Abhishek designs control logic and feedback systems that keep robotic platforms stable, responsive, and predictable.',
    },
    {
      name: 'Shubham',
      image: PLACEHOLDER_IMAGE,
      post: 'RESEARCH HEAD',
      description:
        'Shubham drives research into new robotics techniques and technologies, keeping the team informed on emerging approaches.',
    },
    {
      name: 'Yash',
      image: PLACEHOLDER_IMAGE,
      post: 'FABRICATION HEAD',
      description:
        'Yash oversees fabrication and build quality, turning designs into sturdy, competition-ready hardware.',
    },
    {
      name: 'Rohan',
      image: PLACEHOLDER_IMAGE,
      post: 'VISION HEAD',
      description:
        'Rohan works on computer vision pipelines that let robotic systems perceive and interpret their environment.',
    },
    {
      name: 'Vivek',
      image: PLACEHOLDER_IMAGE,
      post: 'CONTENT HEAD',
      description:
        "Vivek shapes the stories and write-ups behind Dinobots' projects, making technical work easy to follow and share.",
    },
    {
      name: 'Aman',
      image: PLACEHOLDER_IMAGE,
      post: 'PR HEAD',
      description:
        'Aman manages outreach and public relations, building relationships that support the team and its projects.',
    },
    {
      name: 'Kunal',
      image: PLACEHOLDER_IMAGE,
      post: 'PROJECTS HEAD',
      description:
        "Kunal coordinates ongoing project timelines, keeping every build on track from first idea to final demo.",
    },
  ] as TeamMember[],
} as const
