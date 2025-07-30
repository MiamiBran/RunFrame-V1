import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("id")

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 })
    }

    // Demo data for execution crate documents
    const demoDocuments = [
      {
        name: "Technical Spec",
        url: `https://raw.githubusercontent.com/microsoft/vscode/main/README.md`,
        type: "md",
      },
      {
        name: "Architecture",
        url: `https://raw.githubusercontent.com/vercel/next.js/canary/README.md`,
        type: "md",
      },
      {
        name: "API Docs",
        url: `https://raw.githubusercontent.com/facebook/react/main/README.md`,
        type: "md",
      },
      {
        name: "Design System",
        url: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
        type: "pdf",
      },
      {
        name: "User Research",
        url: `https://www.africau.edu/images/default/sample.pdf`,
        type: "pdf",
      },
      {
        name: "Requirements",
        url: `https://raw.githubusercontent.com/tailwindlabs/tailwindcss/master/README.md`,
        type: "md",
      },
    ]

    // If Supabase is available, try to fetch from storage
    if (supabase) {
      try {
        const { data: files, error } = await supabase.storage.from("docs").list(`modules/${moduleId}`, {
          limit: 100,
        })

        if (!error && files && files.length > 0) {
          const documents = files.map((file) => ({
            name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            url: supabase.storage.from("docs").getPublicUrl(`modules/${moduleId}/${file.name}`).data.publicUrl,
            type: file.name.split(".").pop() || "unknown",
          }))

          return NextResponse.json({ documents })
        }
      } catch (storageError) {
        console.log("Storage fetch failed, using demo data:", storageError)
      }
    }

    // Return demo data
    return NextResponse.json({ documents: demoDocuments })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
