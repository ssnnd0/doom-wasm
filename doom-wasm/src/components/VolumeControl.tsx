"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX } from "lucide-react"

interface VolumeControlProps {
  onVolumeChange: (volume: number) => void
}

export function VolumeControl({ onVolumeChange }: VolumeControlProps) {
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0]
    setVolume(volumeValue)
    onVolumeChange(isMuted ? 0 : volumeValue / 100)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    onVolumeChange(isMuted ? volume / 100 : 0)
  }

  return (
    <div className="flex items-center space-x-2">
      <button onClick={toggleMute} className="text-white">
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
      <Slider value={[volume]} min={0} max={100} step={1} onValueChange={handleVolumeChange} className="w-32" />
    </div>
  )
}

