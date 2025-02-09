"use client"

import { useState, useEffect, useRef } from "react"
import {
  initDoom,
  getDoomModule,
  setMoveCallback,
  setLookCallback,
  setShootCallback,
  setKillCallback,
  setItemPickupCallback,
  setSecretFoundCallback,
  setVolume,
} from "../utils/wasmLoader"
import { VirtualJoystick } from "./VirtualJoystick"
import { useAchievements } from "../contexts/AchievementContext"
import { AchievementsMenu } from "./AchievementsMenu"
import { LoadingScreen } from "./LoadingScreen"
import { ErrorMessage } from "./ErrorMessage"
import { WebRTCManager } from "../utils/webrtc"
import { audioManager } from "../utils/audioManager"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { VolumeControl } from "./VolumeControl"

export function DoomGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [kills, setKills] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { unlockAchievement } = useAchievements()
  const [webRTC, setWebRTC] = useState<WebRTCManager | null>(null)
  const [roomId, setRoomId] = useState("")
  const [isMultiplayer, setIsMultiplayer] = useState(false)

  // Achievement tracking
  const hasMoved = useRef(false)
  const hasLooked = useRef(false)
  const hasShot = useRef(false)
  const consecutiveHits = useRef(0)
  const movementTimer = useRef<NodeJS.Timeout>()
  const isMoving = useRef(false)

  useEffect(() => {
    async function startDoom() {
      if (!canvasRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        // Load sounds
        await audioManager.loadSound("shoot", "/sounds/shoot.wav")
        await audioManager.loadSound("hit", "/sounds/hit.wav")
        await audioManager.loadSound("pickup", "/sounds/pickup.wav")
        await audioManager.loadSound("secret", "/sounds/secret.wav")

        const module = await initDoom(canvasRef.current)

        // Set up achievement tracking callbacks
        setMoveCallback(() => {
          if (!hasMoved.current) {
            hasMoved.current = true
            unlockAchievement("first-steps")
          }

          if (!isMoving.current) {
            isMoving.current = true
            let movementDuration = 0

            movementTimer.current = setInterval(() => {
              movementDuration += 1
              if (movementDuration >= 10) {
                unlockAchievement("movement-master")
                clearInterval(movementTimer.current)
              }
            }, 1000)
          }

          if (webRTC) {
            webRTC.sendMessage({ type: "move" })
          }
        })

        setLookCallback(() => {
          if (!hasLooked.current) {
            hasLooked.current = true
            unlockAchievement("look-around")
          }

          if (webRTC) {
            webRTC.sendMessage({ type: "look" })
          }
        })

        setShootCallback((hit: boolean) => {
          audioManager.playSound("shoot")
          if (!hasShot.current) {
            hasShot.current = true
            unlockAchievement("first-shot")
          }

          if (hit) {
            audioManager.playSound("hit")
            consecutiveHits.current += 1
            if (consecutiveHits.current >= 5) {
              unlockAchievement("sharp-shooter")
            }
          } else {
            consecutiveHits.current = 0
          }

          if (webRTC) {
            webRTC.sendMessage({ type: "shoot", hit })
          }
        })

        setKillCallback((newKills: number) => {
          setKills((prev) => {
            if (prev === 0) {
              unlockAchievement("first-kill")
            }
            return newKills
          })

          if (webRTC) {
            webRTC.sendMessage({ type: "kill", kills: newKills })
          }
        })

        setItemPickupCallback(() => {
          audioManager.playSound("pickup")
          unlockAchievement("first-item")

          if (webRTC) {
            webRTC.sendMessage({ type: "itemPickup" })
          }
        })

        setSecretFoundCallback(() => {
          audioManager.playSound("secret")
          unlockAchievement("first-secret")

          if (webRTC) {
            webRTC.sendMessage({ type: "secretFound" })
          }
        })

        // Start the game
        module.ccall("doom_main", "number", ["number", "number"], [0, 0])
        setIsLoading(false)

        // Start background music
        audioManager.playMusic("/music/doom_theme.mp3")
      } catch (error) {
        console.error("Failed to start Doom:", error)
        setIsLoading(false)
        setError(error instanceof Error ? error.message : "Unknown error")
      }
    }

    startDoom()

    // Initialize WebRTC
    const rtc = new WebRTCManager(handleWebRTCMessage)
    setWebRTC(rtc)

    return () => {
      const module = getDoomModule()
      if (module?._stop_game) {
        module._stop_game()
      }
      if (movementTimer.current) {
        clearInterval(movementTimer.current)
      }
      if (webRTC) {
        // Close WebRTC connection
        webRTC.close()
      }
      // Stop background music
      audioManager.stopMusic()
    }
  }, [unlockAchievement, webRTC])

  useEffect(() => {
    if (kills >= 3) {
      const module = getDoomModule()
      if (module?._stop_game) {
        module._stop_game()
      }
      window.location.href = "/game-over"
    }
  }, [kills])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleJoystickMove = (x: number, y: number) => {
    const module = getDoomModule()
    if (module?._move_player) {
      module._move_player(x, y)
    }
  }

  const handleCreateRoom = async () => {
    if (webRTC) {
      const newRoomId = await webRTC.createRoom()
      setRoomId(newRoomId)
      setIsMultiplayer(true)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomId) {
      toast.error("Please enter a room ID")
      return
    }
    if (webRTC) {
      await webRTC.joinRoom(roomId)
      setIsMultiplayer(true)
    }
  }

  const handleWebRTCMessage = (message: any) => {
    const module = getDoomModule()
    switch (message.type) {
      case "move":
        if (module?._remote_move_player) {
          module._remote_move_player(message.x, message.y)
        }
        break
      case "look":
        if (module?._remote_look_player) {
          module._remote_look_player(message.x, message.y)
        }
        break
      case "shoot":
        if (module?._remote_player_shoot) {
          module._remote_player_shoot()
        }
        audioManager.playSound("shoot")
        if (message.hit) {
          audioManager.playSound("hit")
        }
        break
      case "kill":
        setKills(message.kills)
        break
      case "itemPickup":
        if (module?._remote_item_pickup) {
          module._remote_item_pickup()
        }
        audioManager.playSound("pickup")
        break
      case "secretFound":
        if (module?._remote_secret_found) {
          module._remote_secret_found()
        }
        audioManager.playSound("secret")
        break
    }
  }

  const handleVolumeChange = (volume: number) => {
    setVolume(volume)
    audioManager.setVolume(volume)
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {isLoading && <LoadingScreen />}
      <canvas ref={canvasRef} className="w-full h-full" width={320} height={200} />
      <div className="absolute top-4 left-4 text-white text-2xl font-bold">Kills: {kills}</div>
      <AchievementsMenu />
      <Toaster position="top-center" />
      {isMobile && <VirtualJoystick onMove={handleJoystickMove} />}
      {!isMobile && (
        <div className="absolute bottom-4 left-4 text-white text-lg bg-black/50 p-2 rounded">
          Use WASD to move, mouse to look around, and left-click to shoot
        </div>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="absolute top-4 right-4">
            {isMultiplayer ? "Multiplayer Active" : "Start Multiplayer"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Multiplayer</DialogTitle>
          </DialogHeader>
          {!isMultiplayer ? (
            <div className="flex flex-col gap-4">
              <Button onClick={handleCreateRoom}>Create Room</Button>
              <div className="flex gap-2">
                <Input placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                <Button onClick={handleJoinRoom}>Join Room</Button>
              </div>
            </div>
          ) : (
            <div>
              <p>Room ID: {roomId}</p>
              <p>Multiplayer session active</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="absolute bottom-4 right-4">
        <VolumeControl onVolumeChange={handleVolumeChange} />
      </div>
    </div>
  )
}

