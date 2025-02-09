"use client"

import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-xl font-semibold text-white">Loading DOOM...</p>
      </div>
    </div>
  )
}

