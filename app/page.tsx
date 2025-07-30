"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { ModuleTile } from "@/components/ModuleTile"
import ExecutionDrawer from "@/components/ExecutionDrawer"
import RoutineDrawer from "@/components/RoutineDrawer"
import DrawerBackdrop from "@/components/DrawerBackdrop"
import CommandOrb from "@/components/CommandOrb"
import HabitBar from "@/components/HabitBar"
import DebugPanel from "@/components/DebugPanel"
import { useRunframeStore } from "@/store/useRunframeStore"
import { useDrawerState } from "@/hooks/useDrawerState"
import LandingScene from "@/components/LandingScene"
import { ChevronDown, ChevronRight } from "lucide-react"

export default function Home() {
  const { modules, activeLayer, fetchInitial, realtime } = useRunframeStore()
  const { isAnyDrawerOpen } = useDrawerState()
  const [isMobile, setIsMobile] = useState(false)
  const [coreCollapsed, setCoreCollapsed] = useState(false)
  const [activeCollapsed, setActiveCollapsed] = useState(false)

  // Filter modules based on active layer
  const visibleModules = modules.filter((m) => m.layer === activeLayer)

  // Derive core and active modules
  const coreModules = visibleModules.filter((m) => m.code < 10)
  const activeModules = visibleModules.filter((m) => m.code >= 10)

  // Apply collapse logic
  const displayedCoreModules = coreCollapsed
    ? coreModules.filter((m) => m.code === 0) // Show only System Core when collapsed
    : coreModules

  const displayedActiveModules = activeCollapsed
    ? activeModules.filter((m) => m.code === 10) // Show only Content Distribution Hub when collapsed
    : activeModules

  useEffect(() => {
    fetchInitial()
    realtime()
  }, [fetchInitial, realtime])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const renderTile = (module: any) => <ModuleTile key={module.id} module={module} />

  const content = (
    <>
      <h1 className="font-display bg-gradient-to-r from-signal via-violet-400 to-fuchsia-500 bg-clip-text mb-6 text-right font-extralight px-2 text-xs text-signal">
        RunFrame Arena
      </h1>

      {/* Habit Bar */}
      <div className="mb-8">
        <HabitBar />
      </div>

      <div className="space-y-8">
        {/* CORE Section */}
        {displayedCoreModules.length > 0 && (
          <div>
            <button
              onClick={() => setCoreCollapsed(!coreCollapsed)}
              className="flex items-center gap-2 mb-4 text-sm opacity-60 text-signal font-medium uppercase tracking-wider hover:opacity-100 transition-opacity"
            >
              {coreCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              CORE
              <span className="text-xs opacity-50">({coreCollapsed ? "1" : coreModules.length})</span>
            </button>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6 md:gap-10">
              {displayedCoreModules.map(renderTile)}
            </div>
          </div>
        )}

        {/* ACTIVE Section */}
        {displayedActiveModules.length > 0 && (
          <div>
            <button
              onClick={() => setActiveCollapsed(!activeCollapsed)}
              className="flex items-center gap-2 mb-4 text-sm opacity-60 text-amber-400 font-medium uppercase tracking-wider hover:opacity-100 transition-opacity"
            >
              {activeCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              ACTIVE
              <span className="text-xs opacity-50">({activeCollapsed ? "1" : activeModules.length})</span>
            </button>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6 md:gap-10">
              {displayedActiveModules.map(renderTile)}
            </div>
          </div>
        )}

        {/* Show message if no modules in current layer */}
        {visibleModules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No modules in {activeLayer.toUpperCase()}-Layer</div>
            <div className="text-sm text-gray-500">Switch layers or add modules to get started</div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-full mx-auto">
          {/* Mobile top padding */}
          <div className="md:hidden h-14" />

          {/* Dim content when drawer is open on mobile */}
          <div className={`transition-opacity duration-300 ${isAnyDrawerOpen && isMobile ? "opacity-50" : ""}`}>
            {isMobile ? content : <LandingScene>{content}</LandingScene>}
          </div>
        </div>
      </div>

      {/* Drawer Backdrop - Mobile Only */}
      <DrawerBackdrop />

      {/* Module Execution Drawer */}
      <ExecutionDrawer />

      {/* Routine Drawer */}
      <RoutineDrawer />

      {/* Command Orb */}
      <CommandOrb />

      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === "development" && <DebugPanel />}
    </div>
  )
}
