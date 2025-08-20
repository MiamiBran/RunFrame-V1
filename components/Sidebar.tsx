"use client"

import { useRunframeStore } from "@/store/useRunframeStore"
import { Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
  const { activeLayer, setLayer } = useRunframeStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const layers = [
    { id: "z" as const, label: "Z-Strategy", color: "#7000FF" },
    { id: "x" as const, label: "X-Brands", color: "#FF6B35" },
    { id: "y" as const, label: "Y-Personal", color: "#00D9FF" },
  ]

  // Persist collapse state
  useEffect(() => {
    const stored = localStorage.getItem("runframe-sidebar-collapsed")
    if (stored) {
      setIsCollapsed(JSON.parse(stored))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("runframe-sidebar-collapsed", JSON.stringify(newState))
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 60 : 280,
        }}
        transition={{
          type: "tween",
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="hidden md:flex flex-col h-screen bg-black/90 backdrop-blur-xl border-r border-white/10 relative overflow-hidden"
      >
        {/* Futuristic edge glow */}
        <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-signal/60 to-transparent" />

        {/* Header with RF Logo/Toggle */}
        <div className="flex items-center p-4 border-b border-white/10 bg-gradient-to-r from-black/50 to-transparent">
          {/* RF Logo that acts as toggle */}
          <motion.button onClick={toggleCollapse} className="relative group" whileTap={{ scale: 0.95 }}>
            <div className="relative w-12 h-12 bg-gradient-to-br from-signal/20 via-purple-600/20 to-signal/10 rounded-lg border border-signal/30 hover:border-signal/50 flex items-center justify-center transition-all duration-300 overflow-hidden">
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-signal/30 to-purple-600/30 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              {/* Futuristic RF text */}
              <div className="relative z-10 font-mono font-black text-lg tracking-tighter">
                <motion.span
                  className="inline-block bg-gradient-to-r from-signal via-white to-purple-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: isCollapsed ? "0% 50%" : "100% 50%",
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  RF
                </motion.span>
              </div>

              {/* Subtle scan line effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: isCollapsed ? ["-100%", "100%"] : ["100%", "-100%"],
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
                style={{
                  width: "30%",
                  height: "100%",
                }}
              />

              {/* Corner accent lines */}
              <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-signal/60" />
              <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-signal/60" />
              <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-signal/60" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-signal/60" />
            </div>
          </motion.button>

          {/* Expanded title */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="ml-4"
              >
                <h1 className="font-display font-bold text-lg bg-gradient-to-r from-signal to-purple-400 bg-clip-text text-transparent">
                  RunFrame Arena
                </h1>
                <p className="text-xs text-gray-400 font-mono">EXECUTION OS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded-nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex-1 flex flex-col"
              >
                {/* Navigation Links */}
                <div className="py-4 space-y-1">
                  <Link
                    href="/calendar"
                    className="flex items-center gap-3 px-4 py-2 mx-2 text-gray-400 hover:text-white hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Calendar</span>
                    <div className="ml-auto w-1 h-1 bg-green-400 rounded-full opacity-60" />
                  </Link>
                  <Link
                    href="/analytics"
                    className="flex items-center gap-3 px-4 py-2 mx-2 text-gray-400 hover:text-white hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Analytics</span>
                    <div className="ml-auto w-1 h-1 bg-blue-400 rounded-full opacity-60" />
                  </Link>
                </div>

                {/* Layer Control Section */}
                <div className="flex-1 px-2">
                  <div className="mb-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-signal rounded-full animate-pulse" />
                      <h2 className="text-xs uppercase tracking-wider text-gray-500 font-mono">LAYER MATRIX</h2>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <motion.button
                        key={layer.id}
                        onClick={() => setLayer(layer.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded border transition-all duration-200 relative overflow-hidden
                          ${
                            activeLayer === layer.id
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-transparent border-white/5 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                          }
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Active indicator */}
                        {activeLayer === layer.id && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-signal to-purple-400"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        {/* Layer indicator */}
                        <div
                          className="w-3 h-3 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: activeLayer === layer.id ? layer.color : "rgba(255,255,255,0.2)",
                            backgroundColor: activeLayer === layer.id ? `${layer.color}20` : "transparent",
                          }}
                        >
                          <div
                            className="w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: activeLayer === layer.id ? layer.color : "transparent",
                            }}
                          />
                        </div>

                        <span className="text-sm font-medium font-mono">{layer.label}</span>

                        {/* Status indicator */}
                        <div className="ml-auto flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />
                          <span className="text-xs text-gray-500 font-mono">{layer.id.toUpperCase()}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Status Footer */}
                <div className="p-4 border-t border-white/10 bg-gradient-to-r from-black/50 to-transparent">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-mono">ACTIVE:</span>
                    <span className="text-signal font-mono font-bold">{activeLayer.toUpperCase()}-LAYER</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-gray-600 text-xs font-mono">SYSTEM ONLINE</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Collapsed State */
              <motion.div
                key="collapsed-nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex-1 flex flex-col items-center py-4 gap-4"
              >
                {/* Collapsed Navigation */}
                <Link
                  href="/calendar"
                  title="Calendar"
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-signal/50 rounded flex items-center justify-center transition-all duration-200 group"
                >
                  <Calendar className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </Link>

                <Link
                  href="/analytics"
                  title="Analytics"
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-signal/50 rounded flex items-center justify-center transition-all duration-200 group"
                >
                  <BarChart3 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </Link>

                {/* Separator */}
                <div className="w-6 h-[1px] bg-white/20 my-2" />

                {/* Collapsed Layer Buttons */}
                {layers.map((layer) => (
                  <motion.button
                    key={layer.id}
                    onClick={() => setLayer(layer.id)}
                    title={layer.label}
                    className={`
                      w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 relative
                      ${
                        activeLayer === layer.id
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                      }
                    `}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      borderColor: activeLayer === layer.id ? layer.color : undefined,
                      backgroundColor: activeLayer === layer.id ? `${layer.color}15` : undefined,
                    }}
                  >
                    {activeLayer === layer.id && (
                      <motion.div
                        className="absolute inset-0 rounded border-2"
                        style={{ borderColor: layer.color }}
                        layoutId="activeCollapsedIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{layer.id.toUpperCase()}</span>
                  </motion.button>
                ))}

                {/* Status indicator */}
                <div className="mt-auto mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex flex-row items-center gap-4 h-14 w-full bg-black/90 backdrop-blur-xl z-50 px-4 border-b border-white/10">
        {/* Mobile RF Logo */}
        <div className="w-8 h-8 bg-gradient-to-br from-signal/20 via-purple-600/20 to-signal/10 rounded border border-signal/30 flex items-center justify-center">
          <span className="font-mono font-black text-sm bg-gradient-to-r from-signal to-purple-400 bg-clip-text text-transparent">
            RF
          </span>
        </div>

        <h1 className="font-display font-bold text-lg bg-gradient-to-r from-signal to-purple-400 bg-clip-text text-transparent">
          RunFrame Arena
        </h1>

        <div className="flex gap-2 ml-auto">
          <Link href="/calendar" className="p-2 text-gray-400 hover:text-white transition-colors">
            <Calendar className="w-4 h-4" />
          </Link>
          <Link href="/analytics" className="p-2 text-gray-400 hover:text-white transition-colors">
            <BarChart3 className="w-4 h-4" />
          </Link>
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setLayer(layer.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeLayer === layer.id ? "bg-signal text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {layer.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
