import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// Validate API key format
function isValidOpenAIKey(key: string | undefined): key is string {
  return !!(key && typeof key === "string" && key.trim().length > 0 && key.startsWith("sk-") && key.length > 20)
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 })
    }

    // Validate API key before proceeding
    const apiKey = process.env.OPENAI_API_KEY
    if (!isValidOpenAIKey(apiKey)) {
      console.log("📦 No valid OpenAI key for command processing, using demo mode")
      return NextResponse.json({
        summary: "Demo mode: Command received and processed locally",
        action: "demo",
      })
    }

    // Only import OpenAI if we have a valid key
    let OpenAI
    try {
      const openaiModule = await import("openai")
      OpenAI = openaiModule.default
    } catch (importError) {
      console.error("❌ Failed to import OpenAI:", importError)
      return NextResponse.json({
        summary: "Command processing failed due to OpenAI import error",
        error: importError instanceof Error ? importError.message : "Unknown error",
      })
    }

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "start_sprint",
          description: "Start a sprint for a module",
          parameters: {
            type: "object",
            properties: {
              module_id: { type: "string", description: "The ID of the module" },
              deliverable: { type: "string", description: "The deliverable for the sprint" },
              length_days: { type: "integer", description: "Length of sprint in days" },
            },
            required: ["module_id", "deliverable", "length_days"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "log_progress",
          description: "Log progress for a module",
          parameters: {
            type: "object",
            properties: {
              module_id: { type: "string", description: "The ID of the module" },
              note: { type: "string", description: "Progress note" },
            },
            required: ["module_id", "note"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "recalibrate",
          description: "Recalibrate a module",
          parameters: {
            type: "object",
            properties: {
              module_id: { type: "string", description: "The ID of the module" },
            },
            required: ["module_id"],
          },
        },
      },
    ]

    // Initialize OpenAI with proper validation
    let openai
    try {
      openai = new OpenAI({
        apiKey: apiKey.trim(), // Ensure no whitespace
        dangerouslyAllowBrowser: true, // Safe in server-side API routes
      })
    } catch (initError) {
      console.error("❌ Failed to initialize OpenAI client for command:", initError)
      return NextResponse.json(
        {
          summary: "Command processing failed due to OpenAI initialization error",
          error: initError instanceof Error ? initError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for RunFrame, a project execution system. Help users manage modules, sprints, and tasks. Be concise and helpful.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      tools,
      tool_choice: "auto",
    })

    const message = completion.choices[0].message
    const toolCall = message.tool_calls?.[0]

    if (toolCall && supabase) {
      const { name, arguments: args } = toolCall.function
      const parsedArgs = JSON.parse(args)

      try {
        if (name === "start_sprint") {
          // Update module
          await supabase
            .from("modules")
            .update({
              state: "sprint",
              sprint_day: 1,
              deliverable: parsedArgs.deliverable,
              length_days: parsedArgs.length_days,
            })
            .eq("id", parsedArgs.module_id)

          // Create sprint record
          const { data: sprintData, error: sprintError } = await supabase
            .from("sprints")
            .insert({
              module_id: parsedArgs.module_id,
              start_date: new Date().toISOString(),
            })
            .select()
            .single()

          if (!sprintError && sprintData) {
            // Generate sprint template
            const sprintTemplate = `# Sprint Plan - ${new Date().toLocaleDateString()}

## Sprint Overview
- **Module**: ${parsedArgs.module_id}
- **Deliverable**: ${parsedArgs.deliverable}
- **Duration**: ${parsedArgs.length_days} days
- **Start Date**: ${new Date().toLocaleDateString()}

## Sprint Goals
- [ ] Complete core deliverable: ${parsedArgs.deliverable}
- [ ] Maintain code quality standards
- [ ] Update documentation
- [ ] Conduct testing and review

## Daily Progress

### Day 1 - ${new Date().toLocaleDateString()}
- Sprint initiated
- Initial planning completed

## Notes
- Track daily progress in this document
- Update task status regularly
- Note any blockers or challenges

---
*Generated by RunFrame AI Assistant*`

            // Upload template to storage
            try {
              const { error: uploadError } = await supabase.storage
                .from("docs")
                .upload(`sprints/${sprintData.id}.md`, new Blob([sprintTemplate], { type: "text/markdown" }), {
                  contentType: "text/markdown",
                })

              if (uploadError) {
                console.error("Failed to upload sprint template:", uploadError)
              }
            } catch (uploadError) {
              console.error("Storage upload failed:", uploadError)
            }
          }
        }

        if (name === "log_progress") {
          await supabase.from("activity").insert({
            module_id: parsedArgs.module_id,
            content: parsedArgs.note,
            created_at: new Date().toISOString(),
          })
        }

        if (name === "recalibrate") {
          await supabase
            .from("modules")
            .update({
              state: "idle",
              sprint_day: 0,
            })
            .eq("id", parsedArgs.module_id)
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError)
      }
    }

    return NextResponse.json({
      summary: message.content || "Command processed successfully",
      tool_used: toolCall?.function.name || null,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to process command",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
