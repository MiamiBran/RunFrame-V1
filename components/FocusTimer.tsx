"use client"

import { useState } from "react"
import { CountdownCircleTimer } from "react-countdown-circle-timer"
import { supabase } from "@/lib/supabaseClient"
import toast from "react-hot-toast"
import { Play, Pause, Square } from "lucide-react"

interface FocusTimerProps {
  moduleId: string
}

export default function FocusTimer({ moduleId }: FocusTimerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [key, setKey] = useState(0)

  const handleComplete = async () => {
    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    toast.success("🎉 Focus Session Complete!")
    setIsPlaying(false)

    // Dispatch focus complete event for notifications
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("focusComplete"))
    }

    // Log activity
    if (supabase) {
      await supabase.from("activity").insert({
        module_id: moduleId,
        content: "25-min focus session completed",
        created_at: new Date().toISOString(),
      })
    }
  }

  const handleStart = () => {
    setIsPlaying(true)
    toast.success("Focus session started!")
  }

  const handlePause = () => {
    setIsPlaying(false)
    toast("Focus session paused")
  }

  const handleReset = () => {
    setIsPlaying(false)
    setKey((prev) => prev + 1)
    toast("Focus session reset")
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <CountdownCircleTimer
          key={key}
          isPlaying={isPlaying}
          duration={1500} // 25 minutes
          colors="#7000FF"
          size={120}
          strokeWidth={8}
          onComplete={() => {
            handleComplete()
            return { shouldRepeat: false }
          }}
        >
          {({ remainingTime }) => {
            const minutes = Math.floor(remainingTime / 60)
            const seconds = remainingTime % 60
            return (
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-400">Focus Time</div>
              </div>
            )
          }}
        </CountdownCircleTimer>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={handleStart}
            className="bg-signal hover:bg-signal/80 text-white p-2 rounded-full transition-colors"
            title="Start focus session"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="bg-yellow-500 hover:bg-yellow-400 text-white p-2 rounded-full transition-colors"
            title="Pause focus session"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleReset}
          className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition-colors"
          title="Reset focus session"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center">
        <div className="text-xs text-gray-400">{isPlaying ? "Focus session active" : "Ready to focus"}</div>
      </div>
    </div>
  )
}
