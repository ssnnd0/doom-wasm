export function saveHighScore(score: number): void {
  const currentHighScore = getHighScore()
  if (score > currentHighScore) {
    localStorage.setItem("doomHighScore", score.toString())
  }
}

export function getHighScore(): number {
  const highScore = localStorage.getItem("doomHighScore")
  return highScore ? Number.parseInt(highScore, 10) : 0
}

