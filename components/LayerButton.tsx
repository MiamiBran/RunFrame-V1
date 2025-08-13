"use client"

import { motion } from "framer-motion"

interface LayerButtonProps {
  variant: "z" | "x" | "y"
  isActive?: boolean
  onClick?: () => void
}

export function LayerButton({ variant, isActive = false, onClick }: LayerButtonProps) {
  const labels = {
    z: "Depth Layer",
    x: "Horizontal Layer",
    y: "Vertical Layer",
  }

  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full py-4 px-8 text-left font-display font-medium transition-all duration-300
        ${
          isActive
            ? "bg-signal/20 text-signal border-l-2 border-signal"
            : "text-gray-400 hover:text-white hover:bg-panel/40"
        }
      `}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
          w-2 h-2 rounded-full transition-colors duration-300
          ${isActive ? "bg-signal" : "bg-gray-600"}
        `}
        />
        <span className="text-sm uppercase tracking-wider">{variant} Layer</span>
      </div>
      <div className="text-xs text-gray-500 mt-1 ml-5">{labels[variant]}</div>
    </motion.button>
  )
}
