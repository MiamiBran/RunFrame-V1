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
      <motion.button
        id="sidebar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 w-14 h-14 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center justify-center transition-all duration-500 group shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        whileTap={{ scale: 0.92 }}
        whileHover={{
          scale: 1.08,
          rotate: 5,
          transition: { type: "spring", stiffness: 400, damping: 10 },
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: "linear-gradient(45deg, #7000FF20, #FF6B3520, #00D9FF20, #7000FF20)",
            backgroundSize: "400% 400%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + i * 8}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10"
            >
              <X className="w-6 h-6 text-white drop-shadow-lg" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10"
            >
              <Menu className="w-6 h-6 text-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-40 overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 20% 50%, rgba(112,0,255,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,217,255,0.1) 100%)",
              backdropFilter: "blur(20px)",
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="absolute w-96 h-96 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #7000FF40 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
              animate={{
                x: [-100, 100, -100],
                y: [-50, 50, -50],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute right-0 bottom-0 w-80 h-80 rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, #00D9FF40 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
              animate={{
                x: [50, -50, 50],
                y: [50, -50, 50],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-sidebar"
            initial={{ x: -400, opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ x: -400, opacity: 0, scale: 0.9, rotateY: -15 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              opacity: { duration: 0.3 },
            }}
            className="fixed left-6 top-24 bottom-6 w-80 rounded-3xl z-50 flex flex-col overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow:
                "0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)",
            }}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-[2px] rounded-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, #7000FF80 20%, #FF6B3580 50%, #00D9FF80 80%, transparent 100%)",
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scaleY: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <div className="relative p-6 border-b border-white/10 overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: "linear-gradient(45deg, #7000FF10, #FF6B3510, #00D9FF10)",
                  backgroundSize: "300% 300%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <div className="relative flex items-center">
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className="relative w-14 h-14 rounded-2xl border border-white/20 flex items-center justify-center transition-all duration-500 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(112,0,255,0.2) 0%, rgba(255,107,53,0.1) 50%, rgba(0,217,255,0.2) 100%)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: "conic-gradient(from 0deg, #7000FF40, #FF6B3540, #00D9FF40, #7000FF40)",
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />

                    <div className="relative z-10 font-mono font-black text-xl tracking-tighter">
                      <span className="inline-block bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
                        RF
                      </span>
                    </div>

                    {[
                      { top: "4px", left: "4px", rotate: 0 },
                      { top: "4px", right: "4px", rotate: 90 },
                      { bottom: "4px", left: "4px", rotate: 270 },
                      { bottom: "4px", right: "4px", rotate: 180 },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 border-l-2 border-t-2 border-white/60"
                        style={{ ...pos, transform: `rotate(${pos.rotate}deg)` }}
                        animate={{
                          opacity: [0.4, 1, 0.4],
                          scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="ml-4">
                  <motion.h1
                    className="font-display font-bold text-xl bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    RunFrame Arena
                  </motion.h1>
                  <p className="text-sm text-gray-300 font-mono tracking-wider">EXECUTION OS</p>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 flex flex-col p-6">
              <div className="space-y-3 mb-8">
                {[
                  { href: "/calendar", icon: Calendar, label: "Calendar", status: "green" },
                  { href: "/analytics", icon: BarChart3, label: "Analytics", status: "blue" },
                ].map((item, index) => (
                  <motion.div key={item.href} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-4 px-5 py-4 text-gray-300 hover:text-white rounded-2xl border border-transparent hover:border-white/20 transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(112,0,255,0.05) 100%)",
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      <item.icon className="w-5 h-5 relative z-10" />
                      <span className="font-medium relative z-10">{item.label}</span>
                      <motion.div
                        className={`ml-auto w-2 h-2 rounded-full relative z-10 ${
                          item.status === "green" ? "bg-green-400" : "bg-blue-400"
                        }`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: index * 0.3,
                        }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Layer Control Section */}
              <div className="flex-1">
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                    <h2 className="text-sm uppercase tracking-wider text-gray-400 font-mono">LAYER MATRIX</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {layers.map((layer, index) => (
                    <motion.button
                      key={layer.id}
                      onClick={() => {
                        setLayer(layer.id)
                        setIsOpen(false)
                      }}
                      className={`
                        w-full flex items-center gap-4 px-5 py-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                        ${
                          activeLayer === layer.id
                            ? "text-white border-white/30"
                            : "text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                        }
                      `}
                      style={{
                        background:
                          activeLayer === layer.id
                            ? "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"
                            : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                        backdropFilter: "blur(20px)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {activeLayer === layer.id && (
                        <motion.div
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                          style={{
                            background: `linear-gradient(to bottom, ${layer.color}80, ${layer.color}40, ${layer.color}80)`,
                          }}
                          layoutId="activeIndicator"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          animate={{
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
                      )}

                      <motion.div
                        className="w-5 h-5 rounded-xl border-2 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                        style={{
                          borderColor: activeLayer === layer.id ? layer.color : "rgba(255,255,255,0.2)",
                          background:
                            activeLayer === layer.id
                              ? `linear-gradient(135deg, ${layer.color}20, ${layer.color}10)`
                              : "transparent",
                        }}
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background:
                              activeLayer === layer.id
                                ? `radial-gradient(circle, ${layer.color}, ${layer.color}80)`
                                : "transparent",
                          }}
                          animate={
                            activeLayer === layer.id
                              ? {
                                  scale: [1, 1.2, 1],
                                  opacity: [0.8, 1, 0.8],
                                }
                              : {}
                          }
                          transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
                      </motion.div>

                      <div className="flex-1 text-left">
                        <span className="font-medium font-mono">{layer.label}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-2 h-2 bg-green-400 rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: index * 0.2,
                          }}
                        />
                        <span className="text-xs text-gray-500 font-mono">{layer.id.toUpperCase()}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                className="mt-8 p-5 border-t border-white/10 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.1) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, #7000FF20 0%, transparent 50%)",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-400 font-mono">ACTIVE:</span>
                    <motion.span
                      className="font-mono font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      {activeLayer.toUpperCase()}-LAYER
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                    <span className="text-gray-500 text-xs font-mono">SYSTEM ONLINE</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
