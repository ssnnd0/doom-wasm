"use client"

import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-destructive text-destructive-foreground p-6 rounded-lg max-w-md">
        <div className="flex items-center mb-4">
          <AlertCircle className="w-6 h-6 mr-2" />
          <h2 className="text-xl font-semibold">Error</h2>
        </div>
        <p>{message}</p>
      </div>
    </div>
  )
}

