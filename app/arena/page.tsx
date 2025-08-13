"use client"

import { Sidebar } from "@/components/Sidebar"
import { CuboidIcon as Cube, Zap } from "lucide-react"

export default function ArenaPage() {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <Cube className="w-24 h-24 text-signal mx-auto mb-4" />
            <h1 className="font-display font-bold text-4xl text-white mb-2">3D Arena</h1>
            <p className="text-gray-400 text-lg">Future R3F implementation</p>
          </div>

          <div className="bg-panel/60 rounded-2xl p-8 border border-signal/20 max-w-md">
            <Zap className="w-12 h-12 text-signal mx-auto mb-4" />
            <h2 className="font-display font-semibold text-xl text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400">3D execution environment powered by React Three Fiber</p>
          </div>
        </div>
      </div>
    </div>
  )
}
