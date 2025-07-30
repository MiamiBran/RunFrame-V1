"use client"

import dayjs from "dayjs"
import { useRunframeStore } from "@/store/useRunframeStore"

export default function HabitChipRow() {
  const { habits, toggleHabit } = useRunframeStore()

  if (!habits.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-3 bg-[#080808] border-b border-white/5 scrollbar-hide">
      {habits.map((h) => {
        const met = h.today || dayjs(h.last_check).isSame(dayjs(), "day")
        return (
          <button
            key={h.id}
            onClick={() => toggleHabit(h.id)}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-[10px] leading-tight font-medium transition-all duration-200 flex-shrink-0 ${
              met
                ? "bg-gradient-to-br from-signal to-violet-600 text-white shadow-lg shadow-signal/20"
                : "bg-white/10 text-gray-300 hover:bg-white/15 hover:scale-105"
            }`}
            title={`${h.name} - ${h.streak}/${h.quota || 1} streak`}
          >
            <span className="truncate w-full text-center px-1">{h.name}</span>
            <span className="text-[8px] opacity-80">
              {h.streak}/{h.quota || 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}
