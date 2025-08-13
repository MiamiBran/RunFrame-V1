"use client"

import { useRunframeStore } from "@/store/useRunframeStore"
import { Calendar, BarChart3, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Sidebar() {
  const { activeLayer, setLayer } = useRunframeStore()
  const [isOpen, setIsOpen] = useState(false)

  const layers = [
    { id: "z" as const, label: "Z-Strategy", color: "#7000FF" },
    { id: "x" as const, label: "X-Brands", color: "#FF6B35" },
    { id: "y" as const, label: "Y-Personal", color: "#00D9FF" },
  ]

  // Close sidebar when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("floating-sidebar")
      const trigger = document.getElementById("sidebar-trigger")
      if (sidebar && !sidebar.contains(e.target as Node) && !trigger?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        id="sidebar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center hover:bg-black/90 hover:border-signal/50 transition-all duration-300 group shadow-lg"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-white group-hover:text-signal transition-colors" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-white group-hover:text-signal transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-sidebar"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.2 },
            }}
            className="fixed left-6 top-24 bottom-6 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Futuristic edge glow */}
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-signal/60 to-transparent" />

            {/* Header with RF Logo */}
            <div className="flex items-center p-6 border-b border-white/10 bg-gradient-to-r from-black/50 to-transparent">
              <div className="relative group">
                <div className="relative w-12 h-12 bg-gradient-to-br from-signal/20 via-purple-600/20 to-signal/10 rounded-lg border border-signal/30 hover:border-signal/50 flex items-center justify-center transition-all duration-300 overflow-hidden">
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-signal/30 to-purple-600/30 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />

                  {/* Futuristic RF text */}
                  <div className="relative z-10 font-mono font-black text-lg tracking-tighter">
                    <span className="inline-block bg-gradient-to-r from-signal via-white to-purple-400 bg-clip-text text-transparent">
                      RF
                    </span>
                  </div>

                  {/* Corner accent lines */}
                  <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-signal/60" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-signal/60" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-signal/60" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-signal/60" />
                </div>
              </div>

              <div className="ml-4">
                <h1 className="font-display font-bold text-lg bg-gradient-to-r from-signal to-purple-400 bg-clip-text text-transparent">
                  RunFrame Arena
                </h1>
                <p className="text-xs text-gray-400 font-mono">EXECUTION OS</p>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 flex flex-col p-4">
              {/* Navigation Links */}
              <div className="space-y-2 mb-6">
                <Link
                  href="/calendar"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all duration-200"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Calendar</span>
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full opacity-60" />
                </Link>
                <Link
                  href="/analytics"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full opacity-60" />
                </Link>
              </div>

              {/* Layer Control Section */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-signal rounded-full animate-pulse" />
                    <h2 className="text-xs uppercase tracking-wider text-gray-500 font-mono">LAYER MATRIX</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {layers.map((layer) => (
                    <motion.button
                      key={layer.id}
                      onClick={() => {
                        setLayer(layer.id)
                        setIsOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-4 px-4 py-4 rounded-lg border transition-all duration-200 relative overflow-hidden
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
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-signal to-purple-400 rounded-r"
                          layoutId="activeIndicator"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      {/* Layer indicator */}
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: activeLayer === layer.id ? layer.color : "rgba(255,255,255,0.2)",
                          backgroundColor: activeLayer === layer.id ? `${layer.color}20` : "transparent",
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: activeLayer === layer.id ? layer.color : "transparent",
                          }}
                        />
                      </div>

                      <div className="flex-1 text-left">
                        <span className="font-medium font-mono">{layer.label}</span>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                        <span className="text-xs text-gray-500 font-mono">{layer.id.toUpperCase()}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-6 p-4 border-t border-white/10 bg-gradient-to-r from-black/50 to-transparent rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-mono">ACTIVE:</span>
                  <span className="text-signal font-mono font-bold">{activeLayer.toUpperCase()}-LAYER</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-600 text-xs font-mono">SYSTEM ONLINE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
