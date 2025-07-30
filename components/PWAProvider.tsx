"use client"

import type React from "react"

import { useEffect } from "react"

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission)
        })
      }
    }

    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration)
        })
        .catch((error) => {
          console.log("SW registration failed:", error)
        })
    }

    // Listen for focus completion events
    const handleFocusComplete = () => {
      if (Notification.permission === "granted") {
        new Notification("🎉 Focus Session Complete!", {
          body: "Great work! Take a short break before your next session.",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        })
      }
    }

    window.addEventListener("focusComplete", handleFocusComplete)
    return () => window.removeEventListener("focusComplete", handleFocusComplete)
  }, [])

  return <>{children}</>
}
