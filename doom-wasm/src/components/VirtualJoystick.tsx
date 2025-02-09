"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void
}

export function VirtualJoystick({ onMove }: VirtualJoystickProps) {
  const [touching, setTouching] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleStart = useCallback((e: React.TouchEvent) => {
    setTouching(true)
    const touch = e.touches[0]
    setPosition({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touching) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - position.x
      const deltaY = touch.clientY - position.y
      onMove(deltaX / 50, -deltaY / 50) // Adjust sensitivity as needed
    },
    [touching, position, onMove],
  )

  const handleEnd = useCallback(() => {
    setTouching(false)
    onMove(0, 0)
  }, [onMove])

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault()
    document.addEventListener("touchmove", preventDefault, { passive: false })
    return () => {
      document.removeEventListener("touchmove", preventDefault)
    }
  }, [])

  return (
    <div
      className="fixed bottom-4 left-4 w-32 h-32 bg-gray-800 bg-opacity-50 rounded-full"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-600 rounded-full" />
      </div>
    </div>
  )
}

