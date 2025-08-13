"use client"

import { useState } from "react"
import { Bug, Eye, EyeOff } from "lucide-react"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showSensitive, setShowSensitive] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/env")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          fetchDebugInfo()
        }}
        className="fixed bottom-20 right-6 w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg z-40 transition-colors"
        title="Debug API Key"
      >
        <Bug className="w-5 h-5 text-white" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-black/90 border border-red-500/30 rounded-lg shadow-xl z-40 p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-red-400 flex items-center gap-2">
          <Bug className="w-4 h-4" />
          API Key Debug
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className="p-1 hover:bg-white/10 rounded"
            title={showSensitive ? "Hide sensitive data" : "Show sensitive data"}
          >
            {showSensitive ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">
            ×
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : debugData ? (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-400">Has API Key:</div>
            <div className={debugData.hasApiKey ? "text-green-400" : "text-red-400"}>
              {debugData.hasApiKey ? "✅ Yes" : "❌ No"}
            </div>

            <div className="text-gray-400">Type:</div>
            <div className="text-white font-mono">{debugData.apiKeyType}</div>

            <div className="text-gray-400">Length:</div>
            <div className="text-white font-mono">{debugData.apiKeyLength}</div>

            <div className="text-gray-400">Starts with sk-:</div>
            <div className={debugData.startsWithSk ? "text-green-400" : "text-red-400"}>
              {debugData.startsWithSk ? "✅ Yes" : "❌ No"}
            </div>

            <div className="text-gray-400">Trimmed Length:</div>
            <div className="text-white font-mono">{debugData.trimmedLength}</div>

            <div className="text-gray-400">Valid String:</div>
            <div className={debugData.isString ? "text-green-400" : "text-red-400"}>
              {debugData.isString ? "✅ Yes" : "❌ No"}
            </div>
          </div>

          {showSensitive && (
            <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
              <div className="text-red-400 text-xs mb-1">⚠️ Sensitive Data:</div>
              <div className="text-gray-300 font-mono text-xs break-all">Prefix: {debugData.apiKeyPrefix}</div>
              <div className="text-gray-300 font-mono text-xs break-all">Suffix: {debugData.apiKeySuffix}</div>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="text-gray-400 text-xs">Environment: {debugData.nodeEnv}</div>
            <div className="text-gray-400 text-xs">Total Env Vars: {debugData.totalEnvVars}</div>
          </div>

          <button
            onClick={fetchDebugInfo}
            className="w-full mt-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
          >
            Refresh Debug Info
          </button>
        </div>
      ) : (
        <div className="text-gray-400 text-center py-4">Click refresh to load debug info</div>
      )}
    </div>
  )
}
