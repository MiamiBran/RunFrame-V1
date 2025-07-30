"use client"

import { useEffect } from "react"
import { useRunframeStore } from "@/store/useRunframeStore"

/**
 * Custom hook to manage drawer state and keyboard shortcuts
 */
export function useDrawerState() {
  const { selectedModuleId, selectedRoutineId, setSelectedModule, setSelectedRoutine } = useRunframeStore()

  // Keyboard shortcuts for closing drawers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key closes any open drawer
      if (event.key === "Escape") {
        if (selectedModuleId) {
          setSelectedModule(null)
        } else if (selectedRoutineId) {
          setSelectedRoutine(null)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedModuleId, selectedRoutineId, setSelectedModule, setSelectedRoutine])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    const isDrawerOpen = selectedModuleId || selectedRoutineId

    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [selectedModuleId, selectedRoutineId])

  return {
    isModuleDrawerOpen: !!selectedModuleId,
    isRoutineDrawerOpen: !!selectedRoutineId,
    isAnyDrawerOpen: !!(selectedModuleId || selectedRoutineId),
  }
}
