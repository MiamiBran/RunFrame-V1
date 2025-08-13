"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Target, TrendingUp, Maximize2, Minimize2 } from "lucide-react"
import { useRunframeStore } from "@/store/useRunframeStore"
import { useIsMobile } from "@/hooks/useBreakpoint"
import { useDrawerState } from "@/hooks/useDrawerState"
import toast from "react-hot-toast"
import { useState } from "react"

function Progress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-600" />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - value / 100)}`}
            className="text-signal transition-all duration-300"
          />
        </svg>
      </div>
      <span className="text-sm text-gray-300">{Math.round(value)}% complete</span>
    </div>
  )
}

function RoutineStats({ routine }: { routine: any }) {
  const completedTasks = routine.tasks.filter((t: any) => t.done).length
  const totalTasks = routine.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-signal">{completedTasks}</div>
        <div className="text-xs text-gray-400">Completed</div>
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-white">{totalTasks}</div>
        <div className="text-xs text-gray-400">Total Tasks</div>
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-lg font-bold text-purple-400">{routine.quota}</div>
        <div className="text-xs text-gray-400">Daily Quota</div>
      </div>
    </div>
  )
}

export default function RoutineDrawer() {
  const { routines, selectedRoutineId, setSelectedRoutine, toggleRoutineTask, completeRoutine } = useRunframeStore()
  const { isRoutineDrawerOpen } = useDrawerState()
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useIsMobile()

  const routine = routines.find((r) => r.id === selectedRoutineId)

  if (!isRoutineDrawerOpen || !routine) return null

  const progress =
    routine.tasks.length > 0 ? (routine.tasks.filter((t) => t.done).length / routine.tasks.length) * 100 : 0

  const handleTaskToggle = (taskId: string) => {
    toggleRoutineTask(routine.id, taskId)
    toast.success("Task toggled!")
  }

  const handleCompleteRoutine = () => {
    completeRoutine(routine.id)
    toast.success("Routine completed!")
    setSelectedRoutine(null)
  }

  const handleResetRoutine = () => {
    // Reset all tasks to incomplete
    routine.tasks.forEach((task) => {
      if (task.done) {
        toggleRoutineTask(routine.id, task.id)
      }
    })
    toast.success("Routine reset!")
  }

  return (
    <AnimatePresence>
      <motion.aside
        data-routine-drawer
        initial={isMobile ? { y: "100%" } : { x: "100%" }}
        animate={{ x: 0, y: 0 }}
        exit={isMobile ? { y: "100%" } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        drag={isMobile ? "y" : "x"}
        dragConstraints={{ top: 0, left: 0 }}
        dragElastic={0.12}
        onDragEnd={(e, info) => {
          if (
            (isMobile && info.point.y > window.innerHeight * 0.3) ||
            (!isMobile && info.point.x > window.innerWidth * 0.3)
          ) {
            setSelectedRoutine(null)
          }
        }}
        className={
          isMobile
            ? "fixed bottom-0 left-0 w-full h-[70vh] rounded-t-2xl bg-[#121212] border-t border-white/10 shadow-2xl z-50 flex flex-col relative drag-handle"
            : `fixed right-0 top-0 h-full ${
                isExpanded ? "w-[50vw]" : "w-full lg:w-[28vw]"
              } bg-[#121212] border-l border-white/10 shadow-2xl z-50 flex flex-col transition-all duration-300`
        }
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl text-white">{routine.name}</h2>
            <div className="flex items-center gap-2">
              {/* Expand/Collapse Button - Desktop Only */}
              {!isMobile && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title={isExpanded ? "Collapse drawer" : "Expand drawer"}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
              <button
                onClick={() => setSelectedRoutine(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Routine Info Banner */}
          <div className="bg-gradient-to-r from-signal/80 to-signal/40 rounded-lg p-4">
            <div className="text-sm text-white/80 mb-1">Routine Details</div>
            <div className="font-medium text-white">
              {routine.cadence} • quota {routine.quota}/day
            </div>
          </div>
        </div>

        {/* Progress Section - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div className="space-y-4">
            <Progress value={progress} />
            {isExpanded && <RoutineStats routine={routine} />}
          </div>
        </div>

        {/* Task List - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-medium text-white">Tasks</h3>
              <span className="text-xs text-gray-400">
                {routine.tasks.filter((t) => t.done).length} of {routine.tasks.length}
              </span>
            </div>

            <ul className="space-y-3">
              {routine.tasks.map((task, index) => (
                <li key={task.id} className="flex items-center gap-3 min-h-[48px] py-2">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => handleTaskToggle(task.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        task.done
                          ? "bg-signal border-signal text-white"
                          : "border-signal/40 bg-transparent hover:border-signal/60"
                      }`}
                    >
                      {task.done && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-white ${task.done ? "line-through opacity-60" : ""}`}>
                      {task.label}
                    </span>
                  </div>
                  {isExpanded && <div className="text-xs text-gray-500 font-mono">#{index + 1}</div>}
                </li>
              ))}
            </ul>

            {routine.tasks.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No tasks in this routine</p>
                <p className="text-sm text-gray-500 mt-1">Add tasks to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <div className="flex-shrink-0 p-6 border-t border-white/10">
          <div className={`space-y-3 ${isExpanded ? "grid grid-cols-2 gap-3 space-y-0" : ""}`}>
            <button
              className="w-full py-3 bg-gradient-to-r from-signal to-purple-500 hover:from-signal/80 hover:to-purple-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              onClick={handleCompleteRoutine}
            >
              <TrendingUp className="w-4 h-4" />
              Mark Complete
            </button>

            {isExpanded && (
              <button
                className="w-full py-3 border border-gray-500 text-gray-400 hover:bg-gray-500/10 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                onClick={handleResetRoutine}
              >
                <Clock className="w-4 h-4" />
                Reset Routine
              </button>
            )}
          </div>

          {!isExpanded && progress === 100 && (
            <button
              className="w-full mt-3 py-2 border border-gray-500 text-gray-400 hover:bg-gray-500/10 font-medium rounded-lg transition-all duration-200 text-sm"
              onClick={handleResetRoutine}
            >
              Reset for Next Session
            </button>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
