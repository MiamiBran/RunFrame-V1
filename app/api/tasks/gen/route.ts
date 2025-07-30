export const runtime = "nodejs" // Force Node.js runtime, disable edge
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Zod schemas for validation
const TaskSchema = z.object({
  label: z.string().min(1, "Task label cannot be empty."),
  priority: z.number().int().optional(),
})
const TasksArraySchema = z.array(TaskSchema)

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
function isValidOpenAIKey(key: any): key is string {
  return !!(key && typeof key === "string" && key.trim().startsWith("sk-") && key.trim().length > 20)
}

async function insertDemoTasks(moduleId: string) {
  const demoTasks = getDemoTasks(moduleId)
  if (supabase) {
    const { error: deleteError } = await supabase.from("tasks").delete().eq("module_id", moduleId)
    if (deleteError) {
      console.error("❌ Demo task delete error:", deleteError)
      throw new Error("Failed to clear tasks for demo fallback.")
    }
    const tasksToInsert = demoTasks.map((task) => ({
      module_id: moduleId,
      label: task.label,
      priority: task.priority,
      state: "todo",
      done: false,
    }))
    const { error: insertError } = await supabase.from("tasks").insert(tasksToInsert)
    if (insertError) {
      console.error("❌ Demo task insert error:", insertError)
      throw new Error("Failed to insert demo tasks.")
    }
  }
  return demoTasks
}

export async function POST(req: Request) {
  console.log("🚀 Task generation API called")

  let requestBody
  try {
    requestBody = await req.json()
  } catch (bodyError) {
    console.error("❌ Failed to parse request body:", bodyError)
    return createResponse({ success: false, error: "Invalid request format" }, 400)
  }

  const { module_id } = requestBody

  if (!module_id) {
    return createResponse({ success: false, error: "Module ID is required" }, 400)
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!isValidOpenAIKey(apiKey)) {
    console.log("📦 No valid OpenAI key, using demo tasks.")
    const demoTasks = await insertDemoTasks(module_id)
    return createResponse({
      success: true,
      count: demoTasks.length,
      tasks: demoTasks,
      source: "demo",
      message: "Demo tasks generated successfully (no valid API key).",
    })
  }

  // --- Valid API Key Path ---
  try {
    console.log("🤖 Valid API key found. Using Vercel AI SDK...")

    if (!supabase) {
      throw new Error("Supabase client is not available.")
    }

    // 1. Verify module exists before proceeding
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("name, deliverable")
      .eq("id", module_id)
      .single()

    if (moduleError || !moduleData) {
      console.error(`❌ Module with ID ${module_id} not found.`, moduleError)
      throw new Error(`Module with ID ${module_id} not found. Cannot generate tasks.`)
    }

    const moduleContext = `Module: ${moduleData.name}\nDeliverable: ${moduleData.deliverable}`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a task generator. Return ONLY a JSON array of tasks. No other text. Format: [{"label":"task description","priority":1}]. Return 5-7 tasks.`,
      prompt: `Generate tasks for: ${moduleContext}`,
      temperature: 0.1,
      maxTokens: 500,
    })

    if (!text) {
      throw new Error("Empty response from AI")
    }

    // 2. Validate AI response format
    let generatedTasks
    try {
      const parsed = JSON.parse(text)
      const validationResult = TasksArraySchema.safeParse(parsed)
      if (!validationResult.success) {
        console.error("AI response validation failed:", validationResult.error)
        throw new Error("AI returned data in an invalid format.")
      }
      generatedTasks = validationResult.data
    } catch (parseOrValidationError) {
      console.error("Failed to parse or validate AI response:", parseOrValidationError)
      throw new Error("AI returned malformed JSON.")
    }

    // Delete old tasks
    const { error: deleteError } = await supabase.from("tasks").delete().eq("module_id", module_id)
    if (deleteError) {
      console.error("DB delete error:", deleteError)
      throw new Error("Failed to clear existing tasks.")
    }

    // Insert new tasks
    const tasksToInsert = generatedTasks.map((task, index) => ({
      module_id,
      label: task.label,
      priority: typeof task.priority === "number" ? task.priority : index + 1,
      state: "todo",
      done: false,
    }))
    const { error: insertError } = await supabase.from("tasks").insert(tasksToInsert)
    if (insertError) {
      console.error("DB insert error:", insertError)
      throw new Error("Failed to save new tasks.")
    }

    return createResponse({
      success: true,
      count: generatedTasks.length,
      tasks: generatedTasks,
      source: "ai",
      message: `Successfully generated ${generatedTasks.length} AI tasks.`,
    })
  } catch (error: any) {
    console.error("❌ AI generation failed, falling back to demo tasks:", error)
    try {
      const demoTasks = await insertDemoTasks(module_id)
      return createResponse({
        success: true,
        count: demoTasks.length,
        tasks: demoTasks,
        source: "demo_fallback",
        message: `Using demo tasks. AI Error: ${error.message || "Unknown error"}`,
      })
    } catch (fallbackError: any) {
      console.error("❌ Fallback to demo tasks also failed:", fallbackError)
      return createResponse(
        {
          success: false,
          error: `Task generation failed and fallback also failed. Original error: ${error.message}`,
        },
        500,
      )
    }
  }
}
