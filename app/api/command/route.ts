export const runtime = "nodejs" // Force Node.js runtime, disable edge

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Validate API key format
function isValidOpenAIKey(key: any): key is string {
  return !!(key && typeof key === "string" && key.trim().startsWith("sk-") && key.trim().length > 20)
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!isValidOpenAIKey(apiKey)) {
      console.log("📦 No valid OpenAI key for command processing, using demo mode.")
      return NextResponse.json({
        summary: "Demo mode: Command received. AI functions disabled.",
        action: "demo",
      })
    }

    // --- Valid API Key Path ---
    const { text, toolCalls, finishReason } = await generateText({
      model: openai("gpt-4o-mini"),
      system: "You are an AI assistant for RunFrame. Be concise.",
      prompt,
      tools: {
        start_sprint: {
          description: "Start a sprint for a module",
          parameters: z.object({
            module_id: z.string().describe("The ID of the module"),
            deliverable: z.string().describe("The deliverable for the sprint"),
            length_days: z.number().int().describe("Length of sprint in days"),
          }),
        },
        log_progress: {
          description: "Log progress for a module",
          parameters: z.object({
            module_id: z.string().describe("The ID of the module"),
            note: z.string().describe("Progress note"),
          }),
        },
        recalibrate: {
          description: "Recalibrate a module",
          parameters: z.object({
            module_id: z.string().describe("The ID of the module"),
          }),
        },
      },
    })

    if (finishReason === "tool-calls" && toolCalls && supabase) {
      for (const toolCall of toolCalls) {
        const { toolName, args } = toolCall
        console.log(`Executing tool: ${toolName}`, args)

        try {
          if (toolName === "start_sprint") {
            await supabase
              .from("modules")
              .update({
                state: "sprint",
                sprint_day: 1,
                deliverable: args.deliverable,
                length_days: args.length_days,
              })
              .eq("id", args.module_id)
          }

          if (toolName === "log_progress") {
            await supabase.from("activity").insert({
              module_id: args.module_id,
              content: args.note,
              created_at: new Date().toISOString(),
            })
          }

          if (toolName === "recalibrate") {
            await supabase
              .from("modules")
              .update({
                state: "idle",
                sprint_day: 0,
              })
              .eq("id", args.module_id)
          }
        } catch (dbError) {
          console.error("Database operation failed:", dbError)
        }
      }
    }

    return NextResponse.json({
      summary: text || "Command processed successfully",
      tool_used: toolCalls?.[0]?.toolName || null,
    })
  } catch (error: any) {
    console.error("❌ Command API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to process command",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
