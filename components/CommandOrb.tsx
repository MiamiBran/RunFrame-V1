"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Bot, Mic } from "lucide-react"
import toast from "react-hot-toast"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function CommandOrb() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const Speech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const startVoice = () => {
    if (!Speech) {
      toast.error("Speech recognition not supported")
      return
    }

    const rec = new Speech()
    rec.lang = "en-US"
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => {
      setIsListening(true)
      toast.success("Listening...")
    }

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setText(transcript)
      setOpen(true)
      setIsListening(false)
      toast.success("Voice captured!")
    }

    rec.onerror = () => {
      setIsListening(false)
      toast.error("Voice recognition failed")
    }

    rec.onend = () => {
      setIsListening(false)
    }

    rec.start()
  }

  const send = async () => {
    if (!text.trim()) return

    const loadingToast = toast.loading("Processing command...")

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      })

      const msg = await res.json()
      toast.dismiss(loadingToast)
      toast.success(msg.summary || "Command executed!")

      setText("")
      setOpen(false)

      // Trigger confetti
      if (canvasRef.current) {
        const { default: confetti } = await import("canvas-confetti")
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8, x: 0.9 },
          colors: ["#7000FF", "#8B5CF6", "#A855F7"],
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Command failed")
      console.error("Command error:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      send()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Input Field */}
      {open && (
        <div className="animate-in slide-in-from-bottom-2 duration-200">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command..."
            className="px-4 py-3 w-80 rounded-full bg-panel/90 backdrop-blur-xl border border-signal/20 text-white placeholder-gray-400 focus:outline-none focus:border-signal transition-colors"
            autoFocus
          />
        </div>
      )}

      {/* Command Orb */}
      <button
        onClick={() => (open ? send() : setOpen(true))}
        onContextMenu={(e) => {
          e.preventDefault()
          startVoice()
        }}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300
          ${
            isListening
              ? "bg-red-500 animate-pulse scale-110"
              : open
                ? "bg-green-500 hover:bg-green-400"
                : "bg-signal hover:bg-signal/80 hover:scale-110"
          }
        `}
        title={open ? "Send command" : "Open command (right-click for voice)"}
      >
        {isListening ? <Mic size={28} className="text-white" /> : <Bot size={28} className="text-white" />}
      </button>

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />
    </div>
  )
}
