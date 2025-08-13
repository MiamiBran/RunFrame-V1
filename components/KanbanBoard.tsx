"use client"

import type React from "react"

import { useState } from "react"
import { Edit2, Check, X, ChevronDown, ArrowRight } from "lucide-react"
import { useRunframeStore } from "@/store/useRunframeStore"
import toast from "react-hot-toast"

interface Task {
  id: string
  label: string
  state: "todo" | "doing" | "done"
  priority: number
  module_id: string
}

interface KanbanBoardProps {
  moduleId: string
}

const columns = [
  { id: "todo", title: "Todo", color: "bg-gray-600", textColor: "text-gray-300" },
  { id: "doing", title: "Doing", color: "bg-signal", textColor: "text-signal" },
  { id: "done", title: "Done", color: "bg-green-600", textColor: "text-green-400" },
]

function TaskCard({
  task,
  onEdit,
  onStateChange,
}: {
  task: Task
  onEdit: (id: string, newLabel: string) => void
  onStateChange: (id: string, newState: "todo" | "doing" | "done") => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(task.label)
  const [showStateMenu, setShowStateMenu] = useState(false)

  const currentColumn = columns.find((col) => col.id === task.state)

  const handleSave = () => {
    if (editLabel.trim() && editLabel !== task.label) {
      onEdit(task.id, editLabel.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditLabel(task.label)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditing(true)
  }

  const handleStateChange = (newState: "todo" | "doing" | "done") => {
    onStateChange(task.id, newState)
    setShowStateMenu(false)
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 mb-2 border border-white/10 group hover:bg-white/10 transition-colors relative">
      {isEditing ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:border-signal focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }}
              className="p-1 hover:bg-green-500/20 rounded text-green-400 transition-colors"
              title="Save changes"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCancel()
              }}
              className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
              title="Cancel editing"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-sm text-white">{task.label}</div>
              <div className="text-xs text-gray-400 mt-1">Priority: {task.priority}</div>
            </div>
            <button
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all flex-shrink-0"
              title="Edit task"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          {/* State Change Controls */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowStateMenu(!showStateMenu)
                }}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  currentColumn?.color || "bg-gray-600"
                } ${currentColumn?.textColor || "text-gray-300"} hover:opacity-80`}
              >
                {currentColumn?.title || "Unknown"}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showStateMenu && (
                <div className="absolute top-full left-0 mt-1 bg-[#1A1A1A] border border-white/20 rounded-lg shadow-xl z-50 min-w-[100px]">
                  {columns.map((column) => (
                    <button
                      key={column.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStateChange(column.id as "todo" | "doing" | "done")
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        column.id === task.state ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                        <span className="text-white">{column.title}</span>
                        {column.id === task.state && <Check className="w-3 h-3 text-signal ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Move Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {task.state === "todo" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStateChange("doing")
                  }}
                  className="p-1 hover:bg-signal/20 rounded text-signal transition-colors"
                  title="Move to Doing"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {task.state === "doing" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStateChange("done")
                  }}
                  className="p-1 hover:bg-green-500/20 rounded text-green-400 transition-colors"
                  title="Mark as Done"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showStateMenu && <div className="fixed inset-0 z-40" onClick={() => setShowStateMenu(false)} />}
    </div>
  )
}

function TaskColumn({
  column,
  tasks,
  onEdit,
  onStateChange,
}: {
  column: any
  tasks: Task[]
  onEdit: (id: string, newLabel: string) => void
  onStateChange: (id: string, newState: "todo" | "doing" | "done") => void
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h3 className="font-medium text-white">{column.title}</h3>
        <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div className="min-h-[200px] bg-white/5 rounded-lg p-3 border border-white/10">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onStateChange={onStateChange} />
        ))}
        {tasks.length === 0 && <div className="text-center text-gray-500 text-sm py-8">No tasks</div>}
      </div>
    </div>
  )
}

export default function KanbanBoard({ moduleId }: KanbanBoardProps) {
  const { tasks, updateTaskState, updateTask } = useRunframeStore()

  const moduleTasks = tasks.filter((t) => t.module_id === moduleId) as Task[]

  const tasksByColumn = {
    todo: moduleTasks.filter((t) => t.state === "todo"),
    doing: moduleTasks.filter((t) => t.state === "doing"),
    done: moduleTasks.filter((t) => t.state === "done"),
  }

  const handleEditTask = async (taskId: string, newLabel: string) => {
    await updateTask(taskId, { label: newLabel })
    toast.success("Task updated!")
  }

  const handleStateChange = async (taskId: string, newState: "todo" | "doing" | "done") => {
    await updateTaskState(taskId, newState)
    toast.success(`Task moved to ${newState}`)
  }

  return (
    <div className="space-y-4">
      {/* Task Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id as keyof typeof tasksByColumn]}
            onEdit={handleEditTask}
            onStateChange={handleStateChange}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center mt-4">
        Click the status badge to change task state, or use the arrow/check buttons on hover
      </div>
    </div>
  )
}
