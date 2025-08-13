"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Sparkles, RefreshCw } from "lucide-react"
import { useRunframeStore } from "@/store/useRunframeStore"
import toast from "react-hot-toast"
import KanbanBoard from "./KanbanBoard"

interface TasksPanelProps {
  moduleId: string
}

interface GenerationResult {
  success: boolean
  count: number
  tasks: any[]
  source: string
  message?: string
  error?: string
}

export default function TasksPanel({ moduleId }: TasksPanelProps) {
  const { tasks, addTask, fetchInitial } = useRunframeStore()
  const [newTaskLabel, setNewTaskLabel] = useState("")
  const [addingTask, setAddingTask] = useState(false)
  const [generatingTasks, setGeneratingTasks] = useState(false)
  const [lastGenerationResult, setLastGenerationResult] = useState<GenerationResult | null>(null)

  // Safe localStorage handling with mobile-first default
  const [view, setView] = useState<"kanban" | "check">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tasksView")
      if (stored === "kanban" || stored === "check") {
        return stored as "kanban" | "check"
      }
      // Mobile-first: default to checklist on mobile, kanban on desktop
      return window.innerWidth < 768 ? "check" : "kanban"
    }
    return "check" // SSR fallback
  })

  const moduleTasks = tasks.filter((t) => t.module_id === moduleId)

  const handleViewChange = (newView: "kanban" | "check") => {
    setView(newView)
    if (typeof window !== "undefined") {
      localStorage.setItem("tasksView", newView)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskLabel.trim() || addingTask) return

    setAddingTask(true)

    try {
      console.log("📝 Adding task:", newTaskLabel.trim())

      // Use the store method which handles both demo and database modes
      await addTask(newTaskLabel.trim(), moduleId)

      setNewTaskLabel("")
      toast.success("Task added!")
    } catch (error) {
      console.error("Failed to add task:", error)
      toast.error("Failed to add task. Please try again.")
    } finally {
      setAddingTask(false)
    }
  }

  const handleGenerateTasks = async () => {
    if (generatingTasks) return

    setGeneratingTasks(true)
    setLastGenerationResult(null)

    try {
      console.log("🚀 Starting task generation for module:", moduleId)

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/tasks/gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ module_id: moduleId }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("📡 API Response status:", response.status)
      console.log("📡 Content-Type:", response.headers.get("content-type"))

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON, content-type:", contentType)

        // Try to get the response as text to see what we actually got
        const responseText = await response.text()
        console.error("❌ Response body preview:", responseText.substring(0, 500))

        throw new Error(`Server returned ${contentType} instead of JSON. Please check your deployment.`)
      }

      // Parse JSON response
      let data: GenerationResult
      try {
        const responseText = await response.text()
        console.log("📦 Response length:", responseText.length)

        data = JSON.parse(responseText)
        console.log("📦 Parsed response:", { success: data.success, count: data.count, source: data.source })
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON response:", jsonError)
        throw new Error("Server returned malformed JSON response")
      }

      // Validate the response structure
      if (!data || typeof data !== "object") {
        throw new Error("Server returned invalid response structure")
      }

      // Store the result for display
      setLastGenerationResult(data)

      // Handle different response scenarios
      if (data.success) {
        await fetchInitial() // Refresh the tasks in the store

        // Show success toast
        if (data.source === "ai") {
          toast.success(`🤖 Generated ${data.count} AI tasks!`)
        } else if (data.source === "demo") {
          toast.success(`📋 Added ${data.count} demo tasks!`)
        } else {
          toast.success(`✅ Added ${data.count} tasks!`)
        }
      } else {
        // Server returned an error but might have fallback tasks
        toast.error(data.message || data.error || "Task generation failed")
      }
    } catch (error) {
      console.error("❌ Task generation failed:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      setLastGenerationResult({
        success: false,
        count: 0,
        tasks: [],
        source: "client_error",
        error: errorMessage,
      })

      // Show user-friendly error message based on error type
      if (errorMessage.includes("aborted")) {
        toast.error("Request timed out. Please try again.", { duration: 5000 })
      } else if (errorMessage.includes("JSON")) {
        toast.error("Server response error. Please try refreshing the page.", { duration: 8000 })
      } else if (errorMessage.includes("content-type")) {
        toast.error("Server configuration issue. Please check your deployment.", { duration: 8000 })
      } else {
        toast.error("Task generation failed. Please try again.", { duration: 5000 })
      }
    } finally {
      setGeneratingTasks(false)
    }
  }

  const getResultIcon = (result: GenerationResult) => {
    if (result.success) {
      return result.source === "ai" ? "🤖" : result.source === "demo" ? "📋" : "✅"
    }
    return "❌"
  }

  const getResultColor = (result: GenerationResult) => {
    if (result.success) {
      return result.source === "ai" ? "text-green-400" : "text-blue-400"
    }
    return "text-red-400"
  }

  return (
    <div className="space-y-4">
      {/* View Toggle Header */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleViewChange("kanban")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            view === "kanban"
              ? "bg-[#7000FF]/30 text-signal border border-signal/30"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          🗂 Kanban
        </button>
        <button
          onClick={() => handleViewChange("check")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            view === "check"
              ? "bg-[#7000FF]/30 text-signal border border-signal/30"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          ✔ Checklist
        </button>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskLabel}
          onChange={(e) => setNewTaskLabel(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-signal focus:outline-none"
          disabled={addingTask}
        />
        <button
          type="submit"
          className="bg-signal hover:bg-signal/80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex items-center justify-center min-w-[40px]"
          disabled={!newTaskLabel.trim() || addingTask}
        >
          {addingTask ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {/* Generate Tasks Button */}
      <button
        onClick={handleGenerateTasks}
        disabled={generatingTasks}
        className="w-full bg-gradient-to-r from-purple-600 to-signal hover:from-purple-500 hover:to-signal/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {generatingTasks ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate AI Tasks
          </>
        )}
      </button>

      {/* Generation Result Display */}
      {lastGenerationResult && (
        <div
          className={`rounded-lg p-3 flex items-start gap-2 ${
            lastGenerationResult.success
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          <div className="text-lg mt-0.5 flex-shrink-0">{getResultIcon(lastGenerationResult)}</div>
          <div className="text-sm flex-1">
            <div className={`font-medium ${getResultColor(lastGenerationResult)}`}>
              {lastGenerationResult.success ? "Generation Successful" : "Generation Failed"}
            </div>
            <div className="text-gray-300 text-xs mt-1">
              {lastGenerationResult.message ||
                (lastGenerationResult.success
                  ? `Added ${lastGenerationResult.count} tasks from ${lastGenerationResult.source}`
                  : lastGenerationResult.error || "Unknown error occurred")}
            </div>
            <button
              onClick={() => setLastGenerationResult(null)}
              className="text-gray-400 hover:text-gray-300 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* View Content */}
      {view === "check" ? (
        <div className="space-y-2">
          {moduleTasks.length > 0 ? (
            <ul className="space-y-3">
              {moduleTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 min-h-[48px] py-2">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {
                      // Handle task toggle through the store
                      useRunframeStore.getState().toggleTask(task.id, task.done)
                    }}
                    className="w-6 h-6 min-w-[24px] accent-signal cursor-pointer"
                    style={{
                      transform: "scale(1.33)", // Make checkbox larger for touch
                      margin: "4px", // Add margin for easier tapping
                    }}
                  />
                  <span
                    className={`flex-1 text-white text-sm leading-relaxed ${
                      task.done ? "line-through opacity-60" : ""
                    }`}
                  >
                    {task.label}
                  </span>
                  {task.priority && <span className="text-xs text-gray-500 font-mono">P{task.priority}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No tasks yet</div>
              <div className="text-sm text-gray-500">Add a task or generate from docs to get started</div>
            </div>
          )}
        </div>
      ) : (
        <KanbanBoard moduleId={moduleId} />
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center mt-4">
        {view === "check"
          ? "Tap checkboxes to mark tasks complete"
          : "Drag tasks between columns or use the status dropdown"}
      </div>
    </div>
  )
}
