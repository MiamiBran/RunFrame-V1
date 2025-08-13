import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null

// Types for database
export interface DatabaseModule {
  id: string
  name: string
  state: "idle" | "sprint" | "drifted" | "locked"
  sprint_day: number
  deliverable: string
  created_at: string
  updated_at: string
}
