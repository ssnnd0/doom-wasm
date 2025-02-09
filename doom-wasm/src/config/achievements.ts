export type Achievement = {
  id: string
  title: string
  description: string
  icon: string // Lucide icon name
  points: number
  unlocked: boolean
  unlockedAt?: Date
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "Baby Steps",
    description: "Move for the first time",
    icon: "Footprints",
    points: 10,
    unlocked: false,
  },
  {
    id: "look-around",
    title: "Curious Mind",
    description: "Look around for the first time",
    icon: "Eye",
    points: 10,
    unlocked: false,
  },
  {
    id: "first-shot",
    title: "Trigger Happy",
    description: "Fire your weapon for the first time",
    icon: "Target",
    points: 20,
    unlocked: false,
  },
  {
    id: "first-kill",
    title: "First Blood",
    description: "Defeat your first enemy",
    icon: "Skull",
    points: 30,
    unlocked: false,
  },
  {
    id: "first-item",
    title: "Collector",
    description: "Pick up your first item",
    icon: "Package",
    points: 15,
    unlocked: false,
  },
  {
    id: "first-secret",
    title: "Secret Agent",
    description: "Find your first secret area",
    icon: "Search",
    points: 50,
    unlocked: false,
  },
  {
    id: "movement-master",
    title: "Movement Master",
    description: "Move continuously for 10 seconds",
    icon: "Activity",
    points: 25,
    unlocked: false,
  },
  {
    id: "sharp-shooter",
    title: "Sharp Shooter",
    description: "Hit 5 enemies in a row without missing",
    icon: "Crosshair",
    points: 40,
    unlocked: false,
  },
]

