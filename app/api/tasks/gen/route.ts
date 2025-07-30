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

// Fallback demo tasks that always work
const getDemoTasks = (moduleId: string) => [
  { label: "Set up project foundation and dependencies", priority: 1 },
  { label: "Design and implement core architecture", priority: 2 },
  { label: "Create user interface components", priority: 3 },
  { label: "Implement business logic and features", priority: 4 },
  { label: "Add comprehensive testing suite", priority: 5 },
  { label: "Optimize performance and accessibility", priority: 6 },
  { label: "Deploy to production environment", priority: 7 },
]

// Validate API key format
function isValidOpenAIKey(key: string | undefined): key is string {
  return !!(key && typeof key === "string" && key.trim().length > 0 && key.startsWith("sk-") && key.length > 20)
}

export async function POST(req: Request) {
  console.log("🚀 Task generation API called")

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
          count: 0,
          tasks: [],
          source: "error",
        },
        400,
      )
    }

    const { module_id } = requestBody

    if (!module_id) {
      return createResponse(
        {
          success: false,
          error: "Module ID is required",
          count: 0,
          tasks: [],
          source: "error",
        },
        400,
      )
    }

    console.log("🎯 Generating tasks for module:", module_id)

    // Get demo tasks as fallback
    const demoTasks = getDemoTasks(module_id)

    // Validate API key with comprehensive checks
    const apiKey = process.env.OPENAI_API_KEY
    const hasValidApiKey = isValidOpenAIKey(apiKey)

    console.log("🔑 API Key validation:", {
      present: !!apiKey,
      type: typeof apiKey,
      length: apiKey?.length || 0,
      startsWithSk: apiKey?.startsWith?.("sk-") || false,
      isValid: hasValidApiKey,
      environment: typeof window === "undefined" ? "server" : "browser",
    })

    // If no valid OpenAI key, return demo tasks immediately WITHOUT initializing OpenAI
    if (!hasValidApiKey) {
      console.log("📦 No valid OpenAI key, using demo tasks")

      const reason = !apiKey
        ? "No API key provided"
        : typeof apiKey !== "string"
          ? "API key is not a string"
          : !apiKey.startsWith("sk-")
            ? "API key doesn't start with 'sk-'"
            : "API key is too short"

      // Try to insert into database if available
      if (supabase) {
        try {
          // Clear existing tasks first
          await supabase.from("tasks").delete().eq("module_id", module_id)

          const tasksToInsert = demoTasks.map((task) => ({
            module_id,
            label: task.label,
            priority: task.priority,
            state: "todo",
            done: false,
          }))

          const { error: insertError } = await supabase.from("tasks").insert(tasksToInsert)

          if (insertError) {
            console.error("❌ Database insert error:", insertError)
          } else {
            console.log("✅ Demo tasks inserted into database")
          }
        } catch (dbError) {
          console.error("❌ Database operation failed:", dbError)
        }
      }

      return createResponse({
        success: true,
        count: demoTasks.length,
        tasks: demoTasks,
        source: "demo",
        message: `Demo tasks generated successfully (${reason})`,
      })
    }

    // Only import and initialize OpenAI if we have a valid key
    console.log("🤖 Valid API key found, importing OpenAI...")

    let OpenAI
    try {
      // Dynamic import to avoid loading OpenAI when not needed
      const openaiModule = await import("openai")
      OpenAI = openaiModule.default
    } catch (importError) {
      console.error("❌ Failed to import OpenAI:", importError)

      // Return demo tasks if we can't import OpenAI
      if (supabase) {
        try {
          await supabase.from("tasks").delete().eq("module_id", module_id)
          const tasksToInsert = demoTasks.map((task) => ({
            module_id,
            label: task.label,
            priority: task.priority,
            state: "todo",
            done: false,
          }))
          await supabase.from("tasks").insert(tasksToInsert)
        } catch (dbError) {
          console.error("❌ Database operation failed:", dbError)
        }
      }

      return createResponse({
        success: true,
        count: demoTasks.length,
        tasks: demoTasks,
        source: "demo",
        message: "Using demo tasks due to OpenAI import error",
        error: importError instanceof Error ? importError.message : "Failed to import OpenAI",
      })
    }

    // Initialize OpenAI client with comprehensive error handling
    let openai
    try {
      console.log("🤖 Initializing OpenAI client...")

      openai = new OpenAI({
        apiKey: apiKey.trim(), // Ensure no whitespace
        timeout: 15000, // 15 second timeout
        dangerouslyAllowBrowser: true, // Safe in server-side API routes
      })

      console.log("✅ OpenAI client initialized successfully")
    } catch (initError) {
      console.error("❌ Failed to initialize OpenAI client:", initError)

      // Return demo tasks with error info
      if (supabase) {
        try {
          await supabase.from("tasks").delete().eq("module_id", module_id)
          const tasksToInsert = demoTasks.map((task) => ({
            module_id,
            label: task.label,
            priority: task.priority,
            state: "todo",
            done: false,
          }))
          await supabase.from("tasks").insert(tasksToInsert)
        } catch (dbError) {
          console.error("❌ Database operation failed:", dbError)
        }
      }

      return createResponse({
        success: true, // Still successful, just using demo tasks
        count: demoTasks.length,
        tasks: demoTasks,
        source: "demo",
        message: "Using demo tasks due to OpenAI initialization error",
        error: initError instanceof Error ? initError.message : "OpenAI client initialization failed",
      })
    }

    // Try to get module context
    let moduleContext = `Module ID: ${module_id}`
    if (supabase) {
      try {
        const { data: moduleData } = await supabase
          .from("modules")
          .select("name, deliverable, layer, state")
          .eq("id", module_id)
          .single()

        if (moduleData) {
          moduleContext = `Module: ${moduleData.name}\nDeliverable: ${moduleData.deliverable}\nLayer: ${moduleData.layer}\nState: ${moduleData.state}`
        }
      } catch (moduleError) {
        console.log("⚠️ Could not fetch module context:", moduleError)
      }
    }

    // Try OpenAI generation with comprehensive error handling
    let generatedTasks = []
    let aiError = null

    try {
      console.log("🤖 Attempting OpenAI generation with context:", moduleContext.substring(0, 100))

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a task generator. Return ONLY a JSON array of tasks. No other text.

Format: [{"label":"task description","priority":1}]

Rules:
- Return exactly 5-7 tasks
- Each task needs "label" and "priority" fields
- Priority 1-7 (1=highest)
- Tasks should be actionable development work
- NO markdown, NO explanations, ONLY the JSON array`,
          },
          {
            role: "user",
            content: `Generate tasks for: ${moduleContext}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      })

      const content = completion.choices[0]?.message?.content
      console.log("🤖 OpenAI response received, length:", content?.length || 0)

      if (content) {
        try {
          generatedTasks = JSON.parse(content)
          console.log("✅ Successfully parsed OpenAI response, tasks:", generatedTasks.length)
        } catch (parseError) {
          console.error("❌ Failed to parse OpenAI response as JSON:", parseError)
          console.log("Raw content preview:", content.substring(0, 200))

          // Try to extract JSON from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            try {
              generatedTasks = JSON.parse(jsonMatch[0])
              console.log("✅ Successfully extracted JSON from OpenAI response")
            } catch (extractError) {
              console.error("❌ Failed to extract JSON from OpenAI response:", extractError)
              aiError = "Failed to parse AI response as JSON"
            }
          } else {
            aiError = "No valid JSON array found in AI response"
          }
        }
      } else {
        aiError = "Empty response from OpenAI"
      }
    } catch (openaiError: any) {
      console.error("❌ OpenAI generation failed:", openaiError)
      console.error("Error details:", {
        message: openaiError?.message,
        status: openaiError?.status,
        code: openaiError?.code,
        type: openaiError?.type,
      })

      // Check for specific API key errors
      if (openaiError?.status === 401) {
        aiError = "Invalid OpenAI API key - authentication failed"
      } else if (openaiError?.status === 429) {
        aiError = "OpenAI rate limit exceeded - please try again later"
      } else if (openaiError?.status === 403) {
        aiError = "OpenAI API access forbidden - check your billing status"
      } else if (openaiError?.code === "insufficient_quota") {
        aiError = "OpenAI quota exceeded - check your billing"
      } else if (openaiError?.message?.includes("timeout")) {
        aiError = "OpenAI request timed out - please try again"
      } else {
        aiError = `OpenAI API error: ${openaiError?.message || "Unknown error"}`
      }
    }

    // Validate and clean the generated tasks
    let finalTasks = demoTasks // Default fallback
    let source = "demo"

    if (Array.isArray(generatedTasks) && generatedTasks.length > 0) {
      const validTasks = generatedTasks
        .filter((task: any) => {
          return task && typeof task === "object" && typeof task.label === "string" && task.label.trim().length > 5
        })
        .slice(0, 7)
        .map((task: any, index: number) => ({
          label: task.label.trim(),
          priority:
            typeof task.priority === "number" && task.priority >= 1 && task.priority <= 7 ? task.priority : index + 1,
        }))

      if (validTasks.length >= 3) {
        finalTasks = validTasks
        source = "ai"
        console.log(`✅ Using ${validTasks.length} AI-generated tasks`)
      } else {
        console.log(`⚠️ Only ${validTasks.length} valid AI tasks, using demo tasks instead`)
      }
    }

    // Insert tasks into database
    if (supabase) {
      try {
        // Clear existing tasks for this module first
        const { error: deleteError } = await supabase.from("tasks").delete().eq("module_id", module_id)

        if (deleteError) {
          console.error("❌ Failed to clear existing tasks:", deleteError)
        }

        const tasksToInsert = finalTasks.map((task) => ({
          module_id,
          label: task.label,
          priority: task.priority,
          state: "todo",
          done: false,
        }))

        const { error: insertError } = await supabase.from("tasks").insert(tasksToInsert)

        if (insertError) {
          console.error("❌ Database insert failed:", insertError)
        } else {
          console.log("✅ Tasks successfully inserted into database")
        }
      } catch (dbError) {
        console.error("❌ Database operation failed:", dbError)
      }
    }

    const response = {
      success: true,
      count: finalTasks.length,
      tasks: finalTasks,
      source,
      message: aiError
        ? `Using demo tasks due to AI error: ${aiError}`
        : `Successfully generated ${finalTasks.length} ${source === "ai" ? "AI" : "demo"} tasks`,
    }

    console.log("✅ Returning successful response:", { source, count: finalTasks.length })
    return createResponse(response)
  } catch (error) {
    // Final safety net - ensure we ALWAYS return JSON
    console.error("❌ Unexpected API Error:", error)

    // Still try to provide demo tasks even in error case
    const demoTasks = getDemoTasks("fallback")

    const errorResponse = {
      success: true, // Still provide tasks even on error
      count: demoTasks.length,
      tasks: demoTasks,
      source: "error_fallback",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Provided fallback demo tasks due to unexpected error",
    }

    return createResponse(errorResponse)
  }
}

// Handle other HTTP methods
export async function GET() {
  return createResponse(
    {
      success: false,
      error: "Method not allowed. Use POST.",
      count: 0,
      tasks: [],
      source: "error",
    },
    405,
  )
}
