import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import OpenAI from "openai"

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
    try {
      await supabase.from("tasks").delete().eq("module_id", moduleId)
      const tasksToInsert = demoTasks.map((task) => ({
        module_id: moduleId,
        label: task.label,
        priority: task.priority,
        state: "todo",
        done: false,
      }))
      await supabase.from("tasks").insert(tasksToInsert)
    } catch (dbError) {
      console.error("❌ Database operation failed for demo tasks:", dbError)
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
    console.log("🤖 Valid API key found. Initializing OpenAI client...")
    const openai = new OpenAI({ apiKey })

    let moduleContext = `Module ID: ${module_id}`
    if (supabase) {
      const { data: moduleData } = await supabase
        .from("modules")
        .select("name, deliverable")
        .eq("id", module_id)
        .single()
      if (moduleData) {
        moduleContext = `Module: ${moduleData.name}\nDeliverable: ${moduleData.deliverable}`
      }
    }

    console.log("🤖 Attempting OpenAI generation...")
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a task generator. Return ONLY a JSON array of tasks. No other text. Format: [{"label":"task description","priority":1}]. Return 5-7 tasks.`,
        },
        { role: "user", content: `Generate tasks for: ${moduleContext}` },
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("Empty response from OpenAI")
    }

    const generatedTasks = JSON.parse(content)
    if (!Array.isArray(generatedTasks) || generatedTasks.length === 0) {
      throw new Error("AI did not return a valid task array")
    }

    if (supabase) {
      await supabase.from("tasks").delete().eq("module_id", module_id)
      const tasksToInsert = generatedTasks.map((task: any, index: number) => ({
        module_id,
        label: task.label,
        priority: typeof task.priority === "number" ? task.priority : index + 1,
        state: "todo",
        done: false,
      }))
      await supabase.from("tasks").insert(tasksToInsert)
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
    const demoTasks = await insertDemoTasks(module_id)
    return createResponse({
      success: true,
      count: demoTasks.length,
      tasks: demoTasks,
      source: "demo_fallback",
      message: `Using demo tasks. AI Error: ${error.message || "Unknown error"}`,
    })
  }
}
