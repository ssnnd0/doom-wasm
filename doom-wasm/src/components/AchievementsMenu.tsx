"use client"

import { useState } from "react"
import { useAchievements } from "../contexts/AchievementContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

export function AchievementsMenu() {
  const [open, setOpen] = useState(false)
  const { achievements, getPoints } = useAchievements()
  const totalPoints = getPoints()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed top-4 right-4 flex items-center gap-2">
          <Icons.Trophy className="h-4 w-4" />
          <span>{totalPoints} pts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Achievements</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const Icon = Icons[achievement.icon as keyof typeof Icons]
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    achievement.unlocked ? "bg-primary/10 border-primary" : "bg-muted/50 border-muted",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-sm font-medium">{achievement.points} pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

