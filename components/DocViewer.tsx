"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, File } from "lucide-react"
import ReactMarkdown from "react-markdown"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues
const Worker = dynamic(() => import("@react-pdf-viewer/core").then((mod) => ({ default: mod.Worker })), {
  ssr: false,
})

interface DocViewerProps {
  url: string
  onClose: () => void
}

export default function DocViewer({ url, onClose }: DocViewerProps) {
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const isMarkdown = url.endsWith(".md")
  const isPdf = url.endsWith(".pdf")

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  useEffect(() => {
    if (isMarkdown) {
      fetchMarkdown()
    } else if (isPdf) {
      setLoading(false)
    }
  }, [url, isMarkdown, isPdf])

  const fetchMarkdown = async () => {
    try {
      setLoading(true)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch document")
      }
      const text = await response.text()
      setContent(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-panel rounded-2xl border border-signal/20 max-w-6xl max-h-[90vh] w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-signal/20">
            <div className="flex items-center gap-3">
              {isMarkdown ? <FileText className="w-5 h-5 text-signal" /> : <File className="w-5 h-5 text-signal" />}
              <h3 className="font-display font-medium text-white">{url.split("/").pop() || "Document"}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-hidden" style={{ height: "calc(90vh - 80px)" }}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-2 border-signal border-t-transparent rounded-full"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-400 mb-2">⚠️ Error</div>
                  <div className="text-gray-400">{error}</div>
                </div>
              </div>
            )}

            {!loading && !error && isMarkdown && (
              <div className="h-full overflow-auto p-6">
                <ReactMarkdown className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-signal prose-pre:bg-black/40 prose-pre:border prose-pre:border-signal/20">
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {!loading && !error && isPdf && Worker && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <iframe src={url} className="w-full h-full border-0" title="PDF Document" />
              </Worker>
            )}

            {!loading && !error && isPdf && !Worker && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <File className="w-16 h-16 text-signal mx-auto mb-4" />
                  <h3 className="font-display font-medium text-white mb-2">PDF Document</h3>
                  <p className="text-gray-400 mb-4">Loading PDF viewer...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
