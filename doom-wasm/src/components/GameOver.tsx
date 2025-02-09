"use client"

import { useEffect, useState } from "react"
import { saveHighScore, getHighScore } from "../utils/highScore"
import { DOOM_CONFIG } from "../config/doom"

export function GameOver() {
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    const currentScore = DOOM_CONFIG.KILLS_TO_WIN
    saveHighScore(currentScore)
    setHighScore(getHighScore())
  }, [])

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-red-500">
      <h1 className="text-6xl mb-8 font-bold tracking-wider">GAME OVER</h1>
      <p className="text-2xl mb-4">Kills: {DOOM_CONFIG.KILLS_TO_WIN}</p>
      <p className="text-2xl mb-8">High Score: {highScore}</p>
      <button
        onClick={() => (window.location.href = "/")}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}

