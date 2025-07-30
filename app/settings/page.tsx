"use client"

import { Sidebar } from "@/components/Sidebar"
import { User, Palette, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display font-semibold text-3xl text-white mb-2">Settings</h1>
            <p className="text-gray-400">Configure your RunFrame experience</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-signal" />
                <h2 className="font-display font-medium text-xl text-white">Profile</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    className="w-full bg-panel/60 border border-signal/20 rounded-lg px-4 py-2 text-white glassy focus:border-signal focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-panel/60 border border-signal/20 rounded-lg px-4 py-2 text-white glassy focus:border-signal focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-signal" />
                <h2 className="font-display font-medium text-xl text-white">Theme</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Signal Color</label>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-signal rounded-lg border border-signal/20"></div>
                    <span className="text-gray-400 font-mono">#7000FF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Settings */}
            <div className="bg-panel/60 rounded-2xl p-6 border border-signal/20">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-signal" />
                <h2 className="font-display font-medium text-xl text-white">Database</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Supabase Connection</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Realtime Enabled</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
