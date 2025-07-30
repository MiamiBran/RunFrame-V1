import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// Helper function to create consistent JSON response
function createResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  })
}

export async function POST(req: Request) {
  console.log("📝 Add task API called")

  try {
    // Parse request body safely
    let requestBody
    try {
      requestBody = await req.json()
    } catch (bodyError) {
      console.error("❌ Failed to parse request body:", bodyError)
      return createResponse(
        {
          success: false,
          error: "Invalid request format",
        },
        400,
      )
    }

    const { label, module_id, priority = 1 } = requestBody

    // Validate required fields
    if (!label || !module_id) {
      return createResponse(
        {
          success: false,
          error: "Label and module_id are required",
        },
        400,
      )
    }

    if (typeof label !== "string" || label.trim().length === 0) {
      return createResponse(
        {
          success: false,
          error: "Label must be a non-empty string",
        },
        400,
      )
    }

    console.log("📝 Adding task:", { label: label.trim(), module_id, priority })

    // If no Supabase, return success (demo mode)
    if (!supabase) {
      console.log("📦 Demo mode - task would be added locally")
      return createResponse({
        success: true,
        task: {
          id: Date.now().toString(),
          label: label.trim(),
          module_id,
          priority,
          state: "todo",
          done: false,
        },
        message: "Task added successfully (demo mode)",
      })
    }

    // Insert task into database
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          label: label.trim(),
          module_id,
          priority,
          state: "todo",
          done: false,
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Database insert error:", error)
        return createResponse(
          {
            success: false,
            error: `Database error: ${error.message}`,
          },
          500,
        )
      }

      console.log("✅ Task successfully added to database")
      return createResponse({
        success: true,
        task: data,
        message: "Task added successfully",
      })
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError)
      return createResponse(
        {
          success: false,
          error: "Failed to add task to database",
        },
        500,
      )
    }
  } catch (error) {
    console.error("❌ Unexpected API Error:", error)
    return createResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      500,
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return createResponse(
    {
      success: false,
      error: "Method not allowed. Use POST.",
    },
    405,
  )
}
