import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("id")

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 })
    }

    // Demo routines data
    const demoRoutines = [
      {
        id: "r1",
        name: "Morning Routine",
        cadence: "daily",
        quota: 1,
        tasks: [
          { id: "rt1", label: "Meditation 10min", done: false },
          { id: "rt2", label: "Journal 3 pages", done: true },
          { id: "rt3", label: "Review daily goals", done: false },
        ],
        owner_module: moduleId,
      },
      {
        id: "r2",
        name: "Workout Routine",
        cadence: "daily",
        quota: 1,
        tasks: [
          { id: "rt4", label: "Warm up 5min", done: true },
          { id: "rt5", label: "Strength training 45min", done: false },
          { id: "rt6", label: "Cool down stretch", done: false },
        ],
        owner_module: moduleId,
      },
    ]

    // If Supabase is available, try to fetch from database
    if (supabase) {
      try {
        const { data: routines, error } = await supabase.from("routines").select("*").eq("owner_module", moduleId)

        if (!error && routines && routines.length > 0) {
          return NextResponse.json({ routines })
        }
      } catch (dbError) {
        console.log("Database fetch failed, using demo data:", dbError)
      }
    }

    // Return demo data
    return NextResponse.json({ routines: demoRoutines })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 })
  }
}
