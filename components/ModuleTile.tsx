"use client"

import { motion } from "framer-motion"
import { useRunframeStore } from "@/store/useRunframeStore"

interface Module {
  id: string
  name: string
  state: string
  sprint_day?: number
  deliverable?: string
  code: number
  layer: string
}

interface ModuleTileProps {
  module: Module
}

const stateColorMap: Record<string, string> = {
  idle: "bg-gray-600",
  sprint: "bg-signal",
  drift: "bg-drift",
  drifted: "bg-drift", // Legacy support
  locked: "bg-locked",
  wip: "bg-wip",
  built: "bg-built",
  partial: "bg-purple-600",
  stub: "bg-stub",
  spare: "bg-gray-700",
  // New states
  draft: "bg-draft",
  queued: "bg-queued",
  active: "bg-active",
  planned: "bg-planned",
  live: "bg-live",
  bootstrap: "bg-bootstrap",
  concept: "bg-concept",
  placeholder: "bg-placeholder",
  restore: "bg-restore",
  skeleton: "bg-skeleton",
  empty: "bg-empty",
  blank: "bg-blank",
  archive: "bg-archive",
}

const stateLabels: Record<string, string> = {
  idle: "Idle",
  sprint: "Sprint",
  drift: "Drifted",
  drifted: "Drifted", // Legacy support
  locked: "Locked",
  wip: "WIP",
  built: "Built",
  partial: "Partial",
  stub: "Stub",
  spare: "Spare",
  // New states
  draft: "Draft",
  queued: "Queued",
  active: "Active",
  planned: "Planned",
  live: "Live",
  bootstrap: "Bootstrap",
  concept: "Concept",
  placeholder: "Placeholder",
  restore: "Restore",
  skeleton: "Skeleton",
  empty: "Empty",
  blank: "Blank",
  archive: "Archive",
}

export function ModuleTile({ module }: ModuleTileProps) {
  const setSelectedModule = useRunframeStore((state) => state.setSelectedModule)

  const handleClick = () => {
    setSelectedModule(module.id)
  }

  const stateColor = stateColorMap[module.state] || "bg-gray-600"
  const stateLabel = stateLabels[module.state] || module.state

  return (
    <motion.div
      className={`relative p-6 rounded-2xl shadow-lg cursor-pointer overflow-hidden transition-transform ${stateColor}`}
      whileHover={{
        scale: 1.05,
        rotateX: 2,
        rotateY: -2,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      onClick={handleClick}
    >
      {module.state === "sprint" && (
        <span className="absolute inset-0 bg-signal/40 blur-3xl animate-pulse opacity-30" />
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`
                inline-block px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                ${module.state === "sprint" ? "bg-white/20 text-white" : "bg-black/20 text-gray-300"}
              `}
            >
              {stateLabel}
            </div>
            <div className="bg-black/20 px-2 py-1 rounded-full text-xs font-medium text-gray-300 font-mono">
              #{module.code.toString().padStart(2, "0")}
            </div>
          </div>
          {module.state === "sprint" && module.sprint_day && (
            <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium text-white">
              Day {module.sprint_day}
            </div>
          )}
        </div>

        <h3 className="font-display font-semibold text-lg text-white mb-2">{module.name}</h3>

        {module.deliverable && <p className="text-sm text-gray-300 line-clamp-2">{module.deliverable}</p>}
      </div>
    </motion.div>
  )
}
