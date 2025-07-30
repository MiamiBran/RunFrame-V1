"use client"
import { useRunframeStore } from "@/store/useRunframeStore"
import { useLongPress } from "@/lib/useLongPress"
import { isSameDay } from "date-fns"
import { useState } from "react"

export default function HabitBar() {
  const { habits, routines, toggleHabit, setSelectedRoutine } = useRunframeStore()
  const [mode, setMode] = useState<"habit" | "routine">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("hbMode") as "habit" | "routine") || "habit"
    }
    return "habit"
  })

  const longPressHandlers = useLongPress(() => {
    // Placeholder for future use
  })

  const items = mode === "habit" ? habits : routines

  const renderChip = (item: any) => {
    const isHabit = mode === "habit"
    const done = isHabit ? item.today || (item.last_check && isSameDay(new Date(item.last_check), new Date())) : false

    const handleClick = () => {
      if (isHabit) {
        toggleHabit(item.id)
      } else {
        // For routines, directly open the routine drawer
        setSelectedRoutine(item.id)
      }
    }

    return (
      <div key={item.id} {...(!isHabit ? longPressHandlers : {})} className="relative flex flex-col items-center">
        <button onClick={handleClick} className="relative flex flex-col items-center w-20 shrink-0 group">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              done
                ? "bg-gradient-to-br from-signal to-purple-600 shadow-lg shadow-signal/30 scale-110"
                : "bg-panel border border-signal/20 group-hover:border-signal/40 group-hover:scale-105"
            }`}
          >
            {done && <span className="text-white text-lg">✓</span>}
          </div>
          <span className="text-xs mt-1 text-gray-300 font-medium">{item.name}</span>
          <span className="absolute -top-2 -right-1 text-[10px] bg-signal/80 text-white px-1.5 py-0.5 rounded-full font-bold">
            {isHabit ? item.streak : item.quota}
          </span>
        </button>
      </div>
    )
  }

  if (!items.length) return null

  return (
    <div className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide">
      {items.map(renderChip)}
      <button
        onClick={() => {
          const newMode = mode === "habit" ? "routine" : "habit"
          setMode(newMode)
          localStorage.setItem("hbMode", newMode)
        }}
        className="ml-auto text-xs opacity-60 hover:opacity-100 transition-opacity px-2 py-1 rounded"
      >
        {mode === "habit" ? "→ Routines" : "→ Habits"}
      </button>
    </div>
  )
}
