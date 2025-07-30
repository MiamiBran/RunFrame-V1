import { supabase } from "../lib/supabaseClient"

const Z_LAYER_MODULES = [
  { id: "00000000-0000-4000-8000-0000000000z0", layer: "z", code: 0, name: "System Core", state: "locked" },
  { id: "00000000-0000-4000-8000-0000000000z1", layer: "z", code: 1, name: "Identity Engine", state: "locked" },
  { id: "00000000-0000-4000-8000-0000000000z2", layer: "z", code: 2, name: "Command Center", state: "wip" },
  { id: "00000000-0000-4000-8000-0000000000z3", layer: "z", code: 3, name: "Relationship Engine (CRM)", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000z4", layer: "z", code: 4, name: "Execution Logic", state: "built" },
  { id: "00000000-0000-4000-8000-0000000000z5", layer: "z", code: 5, name: "Rhythm + System Sync", state: "partial" },
  { id: "00000000-0000-4000-8000-0000000000z6", layer: "z", code: 6, name: "General Consequence 🪖", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000z7", layer: "z", code: 7, name: "Context & Memory Engine", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000z8", layer: "z", code: 8, name: "Template Repository", state: "locked" },
  { id: "00000000-0000-4000-8000-0000000000z9", layer: "z", code: 9, name: "Buffer", state: "spare" },
  { id: "00000000-0000-4000-8000-000000000z10", layer: "z", code: 10, name: "Content Distribution Hub", state: "stub" },
]

const X_LAYER_MODULES = [
  { id: "00000000-0000-4000-8000-0000000000x0", layer: "x", code: 0, name: "POS Core System", state: "draft" },
  { id: "00000000-0000-4000-8000-0000000000x1", layer: "x", code: 1, name: "POS Dashboard", state: "built" },
  { id: "00000000-0000-4000-8000-0000000000x2", layer: "x", code: 2, name: "Scaling Vault", state: "wip" },
  { id: "00000000-0000-4000-8000-0000000000x3", layer: "x", code: 3, name: "PRD Index", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000x4", layer: "x", code: 4, name: "Roadmap Index", state: "draft" },
  { id: "00000000-0000-4000-8000-0000000000x5", layer: "x", code: 5, name: "Execution Vault", state: "queued" },
  { id: "00000000-0000-4000-8000-0000000000x6", layer: "x", code: 6, name: "Task Vault", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000x7", layer: "x", code: 7, name: "Review Index", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000x8", layer: "x", code: 8, name: "Knowledge Hub", state: "active" },
  { id: "00000000-0000-4000-8000-0000000000x9", layer: "x", code: 9, name: "Automation Logic", state: "planned" },
  { id: "00000000-0000-4000-8000-000000000x10", layer: "x", code: 10, name: "SSIG", state: "live" },
  { id: "00000000-0000-4000-8000-000000000x11", layer: "x", code: 11, name: "PapaBare", state: "live" },
  { id: "00000000-0000-4000-8000-000000000x12", layer: "x", code: 12, name: "RustRaptor", state: "bootstrap" },
  {
    id: "00000000-0000-4000-8000-000000000x13",
    layer: "x",
    code: 13,
    name: "The Repaired Republic",
    state: "bootstrap",
  },
  { id: "00000000-0000-4000-8000-000000000x14", layer: "x", code: 14, name: "The Art of Progress", state: "live" },
  { id: "00000000-0000-4000-8000-000000000x15", layer: "x", code: 15, name: "Brand Identity", state: "drift" },
  { id: "00000000-0000-4000-8000-000000000x16", layer: "x", code: 16, name: "Marketing Site", state: "locked" },
  { id: "00000000-0000-4000-8000-000000000x17", layer: "x", code: 17, name: "Content Strategy", state: "drift" },
  {
    id: "00000000-0000-4000-8000-000000000x18",
    layer: "x",
    code: 18,
    name: "Crypto Arbitrage Engine",
    state: "placeholder",
  },
]

const Y_LAYER_MODULES = [
  { id: "00000000-0000-4000-8000-0000000000y0", layer: "y", code: 0, name: "HoS Life Core", state: "draft" },
  { id: "00000000-0000-4000-8000-0000000000y1", layer: "y", code: 1, name: "HoS Dashboard", state: "built" },
  { id: "00000000-0000-4000-8000-0000000000y2", layer: "y", code: 2, name: "HoS Scaling Vault", state: "wip" },
  { id: "00000000-0000-4000-8000-0000000000y3", layer: "y", code: 3, name: "HoS PRD Index", state: "stub" },
  { id: "00000000-0000-4000-8000-0000000000y4", layer: "y", code: 4, name: "HoS Roadmap Index", state: "draft" },
  { id: "00000000-0000-4000-8000-0000000000y5", layer: "y", code: 5, name: "HoS Execution Vault", state: "restore" },
  { id: "00000000-0000-4000-8000-0000000000y6", layer: "y", code: 6, name: "HoS Task Vault", state: "skeleton" },
  { id: "00000000-0000-4000-8000-0000000000y7", layer: "y", code: 7, name: "HoS Review Index", state: "empty" },
  { id: "00000000-0000-4000-8000-0000000000y8", layer: "y", code: 8, name: "HoS Asset Bank", state: "live" },
  { id: "00000000-0000-4000-8000-0000000000y9", layer: "y", code: 9, name: "HoS Automation Logic", state: "blank" },
  { id: "00000000-0000-4000-8000-000000000y10", layer: "y", code: 10, name: "Career Launchpad", state: "live" },
  { id: "00000000-0000-4000-8000-000000000y11", layer: "y", code: 11, name: "Fitness", state: "live" },
  { id: "00000000-0000-4000-8000-000000000y12", layer: "y", code: 12, name: "Finance", state: "live" },
  { id: "00000000-0000-4000-8000-000000000y13", layer: "y", code: 13, name: "Mental Clarity", state: "wip" },
  { id: "00000000-0000-4000-8000-000000000y14", layer: "y", code: 14, name: "Sleep", state: "draft" },
  { id: "00000000-0000-4000-8000-000000000y15", layer: "y", code: 15, name: "Nutrition Mastery", state: "live" },
  { id: "00000000-0000-4000-8000-000000000y16", layer: "y", code: 16, name: "Style", state: "active" },
  { id: "00000000-0000-4000-8000-000000000y17", layer: "y", code: 17, name: "Creative Output", state: "active" },
  { id: "00000000-0000-4000-8000-000000000y18", layer: "y", code: 18, name: "Time Management", state: "wip" },
  { id: "00000000-0000-4000-8000-000000000y90", layer: "y", code: 90, name: "Tone & Voice Archive", state: "archive" },
]

async function seedModules() {
  if (!supabase) {
    console.error("❌ Supabase client not available")
    process.exit(1)
  }

  try {
    console.log("🌱 Starting module seeding...")

    // Clear existing modules
    const { error: deleteError } = await supabase
      .from("modules")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (deleteError) {
      console.error("❌ Error clearing modules:", deleteError)
      process.exit(1)
    }

    console.log("🗑️  Cleared existing modules")

    // Combine all modules
    const allModules = [...Z_LAYER_MODULES, ...X_LAYER_MODULES, ...Y_LAYER_MODULES].map((module) => ({
      ...module,
      deliverable: getDeliverableForModule(module.name),
      sprint_day: module.state === "sprint" ? 1 : 0,
      length_days: module.state === "sprint" ? 14 : null,
    }))

    // Insert new modules using upsert
    const { data, error } = await supabase.from("modules").upsert(allModules).select()

    if (error) {
      console.error("❌ Error inserting modules:", error)
      process.exit(1)
    }

    console.log(`✅ Successfully seeded ${data?.length} modules`)

    // Log summary by layer
    const summary = allModules.reduce(
      (acc, module) => {
        acc[module.layer] = (acc[module.layer] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log("📊 Module summary:")
    Object.entries(summary).forEach(([layer, count]) => {
      console.log(`   ${layer.toUpperCase()}-Layer: ${count} modules`)
    })

    console.log("\n🎉 Seeding complete! Run `pnpm dev` to see the updated modules.")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

function getDeliverableForModule(name: string): string {
  const deliverables: Record<string, string> = {
    // Z-Layer deliverables
    "System Core": "Core system architecture and foundation",
    "Identity Engine": "User authentication and identity management",
    "Command Center": "Central command interface and controls",
    "Relationship Engine (CRM)": "Customer relationship management system",
    "Execution Logic": "Task execution and workflow engine",
    "Rhythm + System Sync": "Synchronization and rhythm management",
    "General Consequence 🪖": "Consequence management system",
    "Context & Memory Engine": "Context awareness and memory storage",
    "Template Repository": "Template management and storage",
    Buffer: "System buffer and overflow handling",
    "Content Distribution Hub": "Content distribution and delivery system",

    // X-Layer deliverables
    "POS Core System": "Point of sale core system implementation",
    "POS Dashboard": "Administrative dashboard for POS management",
    "Scaling Vault": "Scalable architecture documentation and templates",
    "PRD Index": "Product requirements document repository",
    "Roadmap Index": "Strategic roadmap planning and tracking",
    "Execution Vault": "Project execution templates and workflows",
    "Task Vault": "Task management and tracking system",
    "Review Index": "Code and project review documentation",
    "Knowledge Hub": "Centralized knowledge management system",
    "Automation Logic": "Business process automation framework",
    SSIG: "SSIG brand and platform development",
    PapaBare: "PapaBare project implementation",
    RustRaptor: "RustRaptor development framework",
    "The Repaired Republic": "The Repaired Republic platform",
    "The Art of Progress": "The Art of Progress content platform",
    "Brand Identity": "Complete brand guidelines and assets",
    "Marketing Site": "Landing page redesign and optimization",
    "Content Strategy": "Q1 content calendar and strategy",
    "Crypto Arbitrage Engine": "Cryptocurrency arbitrage trading system",

    // Y-Layer deliverables
    "HoS Life Core": "House of Self life management core system",
    "HoS Dashboard": "Personal life management dashboard",
    "HoS Scaling Vault": "Personal growth and scaling templates",
    "HoS PRD Index": "Personal development requirements documentation",
    "HoS Roadmap Index": "Personal development roadmap and goals",
    "HoS Execution Vault": "Personal execution templates and workflows",
    "HoS Task Vault": "Personal task management system",
    "HoS Review Index": "Personal review and reflection documentation",
    "HoS Asset Bank": "Personal asset and resource management",
    "HoS Automation Logic": "Personal life automation framework",
    "Career Launchpad": "Professional career development and networking",
    Fitness: "Physical fitness and health optimization",
    Finance: "Personal finance management and investment strategy",
    "Mental Clarity": "Mental health and cognitive optimization",
    Sleep: "Sleep optimization and recovery protocols",
    "Nutrition Mastery": "Nutritional planning and dietary optimization",
    Style: "Personal style and appearance management",
    "Creative Output": "Creative projects and artistic expression",
    "Time Management": "Personal productivity and time optimization",
    "Tone & Voice Archive": "Personal brand voice and communication archive",
  }

  return deliverables[name] || `${name} implementation and delivery`
}

// Run the seeding function
seedModules()
