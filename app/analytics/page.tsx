"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useRunframeStore } from "@/store/useRunframeStore"
import { Sidebar } from "@/components/Sidebar"
import { ArrowLeft, Home, TrendingUp, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

export default function Analytics() {
  const { modules, tasks, habits } = useRunframeStore()

  // Task completion data
  const taskData = useMemo(() => {
    return modules.map((m) => ({
      name: m.name.split(" ")[0], // Shorter names for chart
      done: tasks.filter((t) => t.module_id === m.id && t.done).length,
      total: tasks.filter((t) => t.module_id === m.id).length,
      completion:
        tasks.filter((t) => t.module_id === m.id).length > 0
          ? Math.round(
              (tasks.filter((t) => t.module_id === m.id && t.done).length /
                tasks.filter((t) => t.module_id === m.id).length) *
                100,
            )
          : 0,
    }))
  }, [modules, tasks])

  // Focus minutes heatmap data (simulated)
  const focusData = useMemo(() => {
    const data = []
    const today = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split("T")[0],
        minutes: Math.floor(Math.random() * 120), // Simulated focus minutes
      })
    }
    return data
  }, [])

  // Habit streak data
  const habitData = useMemo(() => {
    return habits.map((h) => ({
      name: h.name,
      streak: h.streak,
    }))
  }, [habits])

  const totalFocusMinutes = focusData.reduce((sum, day) => sum + day.minutes, 0)
  const avgDailyFocus = Math.round(totalFocusMinutes / focusData.length)

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
        <div className="p-6 border-b border-signal/20">
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
            <h1 className="font-display font-semibold text-3xl text-white mb-2">Execution Analytics</h1>
            <p className="text-gray-400">Track your progress and performance metrics</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-signal" />
                <h3 className="font-display font-medium text-white">Focus Time</h3>
              </div>
              <div className="text-2xl font-bold text-white">{totalFocusMinutes}m</div>
              <div className="text-sm text-gray-400">Last 30 days • {avgDailyFocus}m avg/day</div>
            </div>

            <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-signal" />
                <h3 className="font-display font-medium text-white">Tasks Done</h3>
              </div>
              <div className="text-2xl font-bold text-white">{tasks.filter((t) => t.done).length}</div>
              <div className="text-sm text-gray-400">of {tasks.length} total tasks</div>
            </div>

            <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-signal" />
                <h3 className="font-display font-medium text-white">Active Sprints</h3>
              </div>
              <div className="text-2xl font-bold text-white">{modules.filter((m) => m.state === "sprint").length}</div>
              <div className="text-sm text-gray-400">of {modules.length} modules</div>
            </div>
          </div>

          {/* Task Completion Chart */}
          <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
            <h3 className="font-display font-medium text-white mb-4">Task Completion by Module</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={taskData}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid rgba(112, 0, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="done" stroke="#7000FF" fill="#7000FF33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Focus Minutes Heatmap */}
          <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
            <h3 className="font-display font-medium text-white mb-4">Daily Focus Minutes (Last 30 Days)</h3>
            <div className="grid grid-cols-7 gap-1">
              {focusData.map((day, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-sm flex items-center justify-center text-xs font-mono"
                  style={{
                    backgroundColor:
                      day.minutes > 0
                        ? `rgba(112, 0, 255, ${Math.min(day.minutes / 120, 1)})`
                        : "rgba(26, 26, 26, 0.6)",
                    color: day.minutes > 60 ? "#fff" : "#888",
                  }}
                  title={`${day.date}: ${day.minutes}m`}
                >
                  {day.minutes > 0 ? day.minutes : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Habit Streaks */}
          <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
            <h3 className="font-display font-medium text-white mb-4">Habit Streaks</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={habitData}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid rgba(112, 0, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="streak" fill="#7000FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
