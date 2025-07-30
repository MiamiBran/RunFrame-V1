"use client"

import type React from "react"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

interface LandingSceneProps {
  children: React.ReactNode
}

export default function LandingScene({ children }: LandingSceneProps) {
  const x = useMotionValue(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
      mediaQuery.addEventListener("change", handleChange)

      if (!mediaQuery.matches) {
        const handleMouseMove = (e: MouseEvent) => {
          x.set((e.clientX / window.innerWidth - 0.5) * 10)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => {
          window.removeEventListener("mousemove", handleMouseMove)
          mediaQuery.removeEventListener("change", handleChange)
        }
      }

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [x])

  const rotateY = useTransform(x, [-5, 5], [-5, 5])

  if (prefersReducedMotion) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <motion.div style={{ rotateY }}>{children}</motion.div>
    </motion.div>
  )
}
