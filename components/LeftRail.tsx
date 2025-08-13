"use client"

import { Calendar, BarChart2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface LeftRailProps {
  activeLayer: "z" | "x" | "y"
  setLayer: (layer: "z" | "x" | "y") => void
}

export default function LeftRail({ activeLayer, setLayer }: LeftRailProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Persist collapse state
  useEffect(() => {
    const stored = localStorage.getItem("runframe-left-rail-collapsed")
    if (stored) {
      setIsCollapsed(JSON.parse(stored))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("runframe-left-rail-collapsed", JSON.stringify(newState))
  }

  return (
    <aside
      className={`${
        isCollapsed ? "w-[48px]" : "w-[72px]"
      } bg-[#121212] text-white flex flex-col items-center py-4 gap-6 border-r border-white/10 transition-all duration-300 relative`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-10"
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation Icons */}
      <Link
        href="/calendar"
        title="Calendar"
        className="hover:text-signal transition-colors p-2 rounded-lg hover:bg-white/5"
      >
        <Calendar size={isCollapsed ? 18 : 22} />
      </Link>
      <Link
        href="/analytics"
        title="Analytics"
        className="hover:text-signal transition-colors p-2 rounded-lg hover:bg-white/5"
      >
        <BarChart2 size={isCollapsed ? 18 : 22} />
      </Link>

      <div className={`${isCollapsed ? "w-6" : "w-8"} h-[1px] bg-white/20 transition-all duration-300`} />

      {/* Layer Buttons */}
      {(["z", "x", "y"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLayer(l)}
          title={`${l.toUpperCase()}-Layer`}
          className={`${
            isCollapsed ? "w-6 h-6" : "w-8 h-8"
          } rounded-full flex items-center justify-center text-xs uppercase font-medium transition-all duration-300 ${
            activeLayer === l
              ? "bg-signal text-white shadow-lg shadow-signal/30"
              : "bg-white/10 hover:bg-white/20 text-gray-300"
          }`}
        >
          {l}
        </button>
      ))}
    </aside>
  )
}
