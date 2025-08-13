"use client"

import { useState } from "react"
import { useGesture } from "react-use-gesture"
import { Sidebar } from "@/components/Sidebar"
import { ArrowLeft, Home, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { format, addDays, subDays, isToday, isSameDay } from "date-fns"

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  type: "focus" | "meeting" | "block"
}

export default function AgendaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Neural Interface Sprint",
      start: new Date(new Date().setHours(9, 0)),
      end: new Date(new Date().setHours(10, 30)),
      type: "block",
    },
    {
      id: "2",
      title: "Focus Session - Brand Identity",
      start: new Date(new Date().setHours(14, 0)),
      end: new Date(new Date().setHours(14, 25)),
      type: "focus",
    },
    {
      id: "3",
      title: "Team Sync",
      start: new Date(new Date().setHours(16, 0)),
      end: new Date(new Date().setHours(17, 0)),
      type: "meeting",
    },
  ])

  const todayEvents = events
    .filter((event) => isSameDay(event.start, currentDate))
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const bind = useGesture({
    onDrag: ({ direction: [xDir], distance, cancel }) => {
      if (distance > 100) {
        if (xDir > 0) {
          setCurrentDate((prev) => subDays(prev, 1))
        } else {
          setCurrentDate((prev) => addDays(prev, 1))
        }
        cancel()
      }
    },
  })

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "focus":
        return "bg-signal/20 border-signal text-signal"
      case "meeting":
        return "bg-blue-500/20 border-blue-500 text-blue-400"
      case "block":
        return "bg-purple-500/20 border-purple-500 text-purple-400"
      default:
        return "bg-gray-500/20 border-gray-500 text-gray-400"
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "focus":
        return "🍅"
      case "meeting":
        return "👥"
      case "block":
        return "⏰"
      default:
        return "📅"
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile top padding */}
        <div className="md:hidden h-14" />

        {/* Header with navigation */}
        <div className="p-4 border-b border-signal/20">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Arena</span>
            </Link>

            <div className="h-4 w-px bg-signal/20" />

            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </div>

          <div>
            <h1 className="font-display font-semibold text-3xl text-white mb-2">Agenda</h1>
            <p className="text-gray-400">Your daily execution schedule</p>
          </div>
        </div>

        <div className="p-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate((prev) => subDays(prev, 1))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center">
              <h2 className="font-display font-semibold text-2xl text-white">{format(currentDate, "EEEE, MMMM d")}</h2>
              <p className="text-sm text-gray-400">{isToday(currentDate) ? "Today" : format(currentDate, "yyyy")}</p>
            </div>

            <button
              onClick={() => setCurrentDate((prev) => addDays(prev, 1))}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Swipe hint */}
          <div className="text-center text-xs text-gray-500 mb-6">Swipe left/right to change days</div>

          {/* Events List */}
          <div {...bind()} className="space-y-4 touch-pan-y">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border-l-4 ${getEventTypeColor(event.type)} bg-panel/60`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                      <div>
                        <h3 className="font-medium text-white mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-400">
                          {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{event.type} session</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))}m
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-display font-medium text-white mb-2">No events scheduled</h3>
                <p className="text-gray-400">Your day is free for focused work</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-signal/20 hover:bg-signal/30 border border-signal/30 text-signal font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>🍅</span>
              Start Focus Session
            </button>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>⏰</span>
              Add Time Block
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
