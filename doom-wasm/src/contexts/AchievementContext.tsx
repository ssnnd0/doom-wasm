"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type Achievement, ACHIEVEMENTS } from "../config/achievements"
import { toast } from "sonner"
import { Trophy } from "lucide-react"

type AchievementContextType = {
  achievements: Achievement[]
  unlockAchievement: (id: string) => void
  getPoints: () => number
  isUnlocked: (id: string) => boolean
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("achievements")
      return saved ? JSON.parse(saved) : ACHIEVEMENTS
    }
    return ACHIEVEMENTS
  })

  useEffect(() => {
    localStorage.setItem("achievements", JSON.stringify(achievements))
  }, [achievements])

  const unlockAchievement = (id: string) => {
    setAchievements((current) => {
      const achievement = current.find((a) => a.id === id)
      if (achievement && !achievement.unlocked) {
        toast.success("Achievement Unlocked!", {
          description: achievement.title,
          icon: <Trophy className="h-5 w-5" />,
          duration: 5000,
        })

        return current.map((a) => (a.id === id ? { ...a, unlocked: true, unlockedAt: new Date() } : a))
      }
      return current
    })
  }

  const getPoints = () => {
    return achievements.reduce((total, achievement) => {
      return total + (achievement.unlocked ? achievement.points : 0)
    }, 0)
  }

  const isUnlocked = (id: string) => {
    return achievements.find((a) => a.id === id)?.unlocked || false
  }

  return (
    <AchievementContext.Provider value={{ achievements, unlockAchievement, getPoints, isUnlocked }}>
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error("useAchievements must be used within an AchievementProvider")
  }
  return context
}

