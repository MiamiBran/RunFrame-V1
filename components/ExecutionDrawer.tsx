"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Target, Activity, ExternalLink, Clock, FileText, Maximize2, Minimize2 } from "lucide-react"
import { useRunframeStore } from "@/store/useRunframeStore"
import { useIsMobile } from "@/hooks/useBreakpoint"
import { useDrawerState } from "@/hooks/useDrawerState"
import { FILE_CODES } from "@/lib/fileCodes"
import FocusTimer from "./FocusTimer"
import DocViewer from "./DocViewer"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { addMinutes } from "date-fns"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabaseClient"
import TasksPanel from "./TasksPanel"

interface Document {
  name: string
  url: string
  type: string
}

export default function ExecutionDrawer() {
  const { modules, selectedModuleId, setSelectedModule } = useRunframeStore()
  const { isModuleDrawerOpen } = useDrawerState()
  const [activeTab, setActiveTab] = useState("overview")
  const [documents, setDocuments] = useState<Document[]>([])
  const [specsContent, setSpecsContent] = useState<string>("")
  const [loadingSpecs, setLoadingSpecs] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [focusSessionActive, setFocusSessionActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const isMobile = useIsMobile()

  const module = modules.find((m) => m.id === selectedModuleId)

  // Get file codes based on module layer
  const fileCodes = module ? FILE_CODES[module.layer] || [] : []

  // Fetch documents when drawer opens
  useEffect(() => {
    if (module) {
      fetchDocuments()
      if (activeTab === "specs") {
        fetchSpecs()
      }
    }
  }, [module, activeTab])

  // Reset tab when module changes
  useEffect(() => {
    if (selectedModuleId) {
      setActiveTab("overview")
      setIsExpanded(false)
    }
  }, [selectedModuleId])

  const fetchDocuments = async () => {
    if (!module) return

    try {
      setLoadingDocs(true)

      // Generate documents based on file codes for the module's layer
      const layerDocuments = fileCodes.slice(0, 6).map((fileCode) => ({
        name: fileCode.label,
        url: `https://raw.githubusercontent.com/microsoft/vscode/main/README.md`, // Demo URL
        type: "md",
      }))

      setDocuments(layerDocuments)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast.error("Failed to load documents")
    } finally {
      setLoadingDocs(false)
    }
  }

  const fetchSpecs = async () => {
    if (!module) return

    try {
      setLoadingSpecs(true)

      // Try to fetch from Supabase storage first
      if (supabase) {
        const { data } = supabase.storage.from("docs").getPublicUrl(`prds/${module.id}.md`)

        if (data?.publicUrl) {
          const response = await fetch(data.publicUrl)
          if (response.ok) {
            const content = await response.text()
            setSpecsContent(content)
            return
          }
        }
      }

      // Fallback to demo content
      const demoSpecs = `# ${module.name} - Technical Specification

## Overview
This document outlines the technical specifications and requirements for the ${module.name} module.

## Deliverable
${module.deliverable}

## Current Status
- **State**: ${module.state.charAt(0).toUpperCase() + module.state.slice(1)}
- **Layer**: ${module.layer.toUpperCase()}
- **Module Code**: #${module.code.toString().padStart(2, "0")}
${module.state === "sprint" ? `- **Sprint Day**: ${module.sprint_day}` : ""}

## Technical Requirements

### Core Features
- Feature implementation with modern architecture
- Scalable and maintainable codebase
- Comprehensive testing coverage
- Performance optimization

### Architecture
- **Frontend**: React/Next.js with TypeScript
- **Backend**: Node.js with API routes
- **Database**: Supabase/PostgreSQL
- **Styling**: Tailwind CSS with custom design system

### Success Criteria
- [ ] All core features implemented
- [ ] Performance benchmarks met
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Testing suite passes

## Implementation Notes
This module is part of the RunFrame execution system and follows our established patterns and conventions.

### Dependencies
- React 18+ with TypeScript
- Next.js 15 with App Router
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management

### Development Workflow
1. **Planning**: Define requirements and acceptance criteria
2. **Design**: Create wireframes and component specifications
3. **Implementation**: Build features with test coverage
4. **Review**: Code review and quality assurance
5. **Deploy**: Production deployment and monitoring

---
*Last updated: ${new Date().toLocaleDateString()}*`

      setSpecsContent(demoSpecs)
    } catch (error) {
      console.error("Failed to fetch specs:", error)
      setSpecsContent("# Specifications\n\nUnable to load specifications for this module.")
    } finally {
      setLoadingSpecs(false)
    }
  }

  if (!isModuleDrawerOpen || !module) return null

  const tabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "tasks", label: "Tasks", icon: Calendar },
    { id: "specs", label: "Specs", icon: FileText },
    { id: "activity", label: "Activity", icon: Activity },
  ]

  const handleTimeBlock = async () => {
    const now = new Date()
    const evt = {
      title: module.name,
      start: now,
      end: addMinutes(now, 90),
      module_id: module.id,
    }

    try {
      // Insert into blocks table
      if (supabase) {
        await supabase.from("blocks").insert({
          title: evt.title,
          start_time: evt.start.toISOString(),
          end_time: evt.end.toISOString(),
          module_id: evt.module_id,
          type: "focus",
        })
      }

      // Also call the calendar API for compatibility
      await fetch("/api/calendar/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evt),
      })

      toast.success("Time-blocked for 90 minutes!")
    } catch (error) {
      toast.error("Failed to create time block")
    }
  }

  const handleStartFocusSession = () => {
    setFocusSessionActive(true)
    toast.success("Focus session started!")
  }

  const handleDocClick = (url: string) => {
    setSelectedDoc(url)
  }

  return (
    <AnimatePresence>
      <motion.aside
        data-execution-drawer
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
            setSelectedModule(null)
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
            <h2 className="font-display font-semibold text-xl text-white">{module.name}</h2>
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
                onClick={() => setSelectedModule(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Deliverable Banner */}
          <div className="bg-gradient-to-r from-signal/80 to-signal/40 rounded-lg p-4">
            <div className="text-sm text-white/80 mb-1">Deliverable</div>
            <div className="font-medium text-white">{module.deliverable}</div>
          </div>
        </div>

        {/* Tabs - Fixed */}
        <div className="flex-shrink-0 flex border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2
                ${
                  activeTab === tab.id
                    ? "text-signal border-b-2 border-signal bg-signal/10"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === "overview" && (
            <div className="p-6 space-y-6">
              {/* Module Status Tags */}
              <div className="flex gap-2 flex-wrap">
                <div className="bg-signal/20 px-3 py-1 rounded-full text-sm font-medium text-signal">
                  {module.state.charAt(0).toUpperCase() + module.state.slice(1)}
                </div>
                {module.state === "sprint" && (
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium text-white">
                    Sprint Day {module.sprint_day}
                  </div>
                )}
                <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium text-white">
                  {module.layer.toUpperCase()} Layer
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium text-white font-mono">
                  #{module.code.toString().padStart(2, "0")}
                </div>
              </div>

              {/* Action Buttons - Responsive Grid */}
              <div className={`grid gap-3 ${isExpanded ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
                <button
                  onClick={handleTimeBlock}
                  className="bg-gradient-to-r from-purple-600 to-signal hover:from-purple-500 hover:to-signal/80 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Time-Block 90m
                </button>

                <button
                  onClick={handleStartFocusSession}
                  className="bg-gradient-to-r from-signal to-purple-500 hover:from-signal/80 hover:to-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  🍅 Focus Session
                </button>

                {isExpanded && (
                  <Link
                    href={`/sprint/setup?module=${module.id}`}
                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Start Sprint
                  </Link>
                )}
              </div>

              {/* Focus Timer - Only show when active */}
              {focusSessionActive && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-display font-medium text-white mb-3">Active Focus Session</h3>
                  <FocusTimer moduleId={module.id} />
                </div>
              )}

              {/* Execution Crate - Responsive Grid */}
              <div>
                <h3 className="font-display font-medium text-white mb-3">
                  Execution Crate ({module.layer.toUpperCase()}-Layer)
                </h3>
                {loadingDocs ? (
                  <div className={`grid gap-2 ${isExpanded ? "grid-cols-4" : "grid-cols-3"}`}>
                    {[...Array(isExpanded ? 8 : 6)].map((_, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 h-20 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-2 ${isExpanded ? "grid-cols-4" : "grid-cols-3"}`}>
                    {documents.slice(0, isExpanded ? 8 : 6).map((doc, index) => {
                      const fileCode = fileCodes[index]
                      return (
                        <button
                          key={index}
                          onClick={() => handleDocClick(doc.url)}
                          className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center border border-white/10 hover:border-signal/30 transition-all duration-200 text-xs flex flex-col items-center justify-center h-20"
                          title={doc.name}
                        >
                          <div className="text-lg mb-1">{doc.type === "pdf" ? "📄" : "📝"}</div>
                          <div className="font-mono text-signal font-bold text-xs mb-1">
                            {fileCode?.code || `${module.layer}${index}`}
                          </div>
                          <div className="text-gray-300 text-[10px] leading-tight truncate w-full">
                            {fileCode?.label || doc.name}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Sprint Actions - Conditional Layout */}
              {!isExpanded && (
                <div className="space-y-3">
                  <Link
                    href={`/sprint/setup?module=${module.id}`}
                    className="w-full bg-signal hover:bg-signal/80 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Start Sprint
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button className="w-full border border-signal text-signal hover:bg-signal/10 font-medium py-3 px-4 rounded-lg transition-colors">
                    Recalibrate Module
                  </button>
                </div>
              )}

              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="border border-signal text-signal hover:bg-signal/10 font-medium py-3 px-4 rounded-lg transition-colors">
                    Recalibrate Module
                  </button>
                  <button className="border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-medium py-3 px-4 rounded-lg transition-colors">
                    Archive Module
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="p-6">
              <TasksPanel moduleId={module.id} />
            </div>
          )}

          {activeTab === "specs" && (
            <div className="p-6">
              {loadingSpecs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-signal border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-signal prose-pre:bg-black/40 prose-pre:border prose-pre:border-signal/20">
                  <ReactMarkdown>{specsContent}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-400">Recent Activity</div>
              <div className="space-y-3">
                {[
                  { time: "2 hours ago", action: "25-min focus session completed", type: "success" },
                  { time: "1 day ago", action: "Module calibrated", type: "info" },
                  { time: "3 days ago", action: "Deliverable updated", type: "warning" },
                  { time: "5 days ago", action: "Sprint started", type: "success" },
                  { time: "1 week ago", action: "Tasks generated from docs", type: "info" },
                  { time: "1 week ago", action: "Module created", type: "info" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.type === "success"
                          ? "bg-green-500"
                          : activity.type === "info"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Document Viewer Modal */}
      {selectedDoc && <DocViewer url={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </AnimatePresence>
  )
}
