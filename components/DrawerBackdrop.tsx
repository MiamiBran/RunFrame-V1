"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useDrawerState } from "@/hooks/useDrawerState"
import { useRunframeStore } from "@/store/useRunframeStore"

/**
 * Backdrop component for drawers - provides click-outside-to-close functionality
 */
export default function DrawerBackdrop() {
  const { isAnyDrawerOpen } = useDrawerState()
  const { setSelectedModule, setSelectedRoutine } = useRunframeStore()

  const handleBackdropClick = () => {
    setSelectedModule(null)
    setSelectedRoutine(null)
  }

  return (
    <AnimatePresence>
      {isAnyDrawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}
    </AnimatePresence>
  )
}
