import { create } from "zustand"
import { supabase } from "@/lib/supabaseClient"
import dayjs from "dayjs"

type Module = {
  id: string
  name: string
  state: string
  sprint_day: number
  deliverable: string
  layer: "z" | "x" | "y"
  code: number
  length_days?: number
}

type Task = {
  id: string
  module_id: string
  label: string
  done: boolean
  priority: number
  state: "todo" | "doing" | "done"
}

type Habit = {
  id: string
  name: string
  cadence: string
  streak: number
  quota: number
  today: boolean
  last_check: string | null
  module_id: string
}

type Routine = {
  id: string
  name: string
  cadence: string
  quota: number
  tasks: { id: string; label: string; done: boolean }[]
  owner_module: string
}

// Comprehensive demo modules - ALL CORE + 4 ACTIVE per layer
const DEMO_MODULES: Module[] = [
  // Z-Layer (Strategy/Core) - ALL CORE MODULES (0-9) + 4 ACTIVE (10+)
  {
    id: "z0",
    name: "System Core",
    state: "locked",
    sprint_day: 0,
    deliverable: "Core system architecture and foundation",
    layer: "z",
    code: 0,
  },
  {
    id: "z1",
    name: "Identity Engine",
    state: "locked",
    sprint_day: 0,
    deliverable: "User authentication and identity management",
    layer: "z",
    code: 1,
  },
  {
    id: "z2",
    name: "Command Center",
    state: "wip",
    sprint_day: 0,
    deliverable: "Central command interface and controls",
    layer: "z",
    code: 2,
  },
  {
    id: "z3",
    name: "Relationship Engine (CRM)",
    state: "stub",
    sprint_day: 0,
    deliverable: "Customer relationship management system",
    layer: "z",
    code: 3,
  },
  {
    id: "z4",
    name: "Execution Logic",
    state: "built",
    sprint_day: 0,
    deliverable: "Task execution and workflow engine",
    layer: "z",
    code: 4,
  },
  {
    id: "z5",
    name: "Rhythm + System Sync",
    state: "partial",
    sprint_day: 0,
    deliverable: "Synchronization and rhythm management",
    layer: "z",
    code: 5,
  },
  {
    id: "z6",
    name: "General Consequence 🪖",
    state: "stub",
    sprint_day: 0,
    deliverable: "Consequence management system",
    layer: "z",
    code: 6,
  },
  {
    id: "z7",
    name: "Context & Memory Engine",
    state: "stub",
    sprint_day: 0,
    deliverable: "Context awareness and memory storage",
    layer: "z",
    code: 7,
  },
  {
    id: "z8",
    name: "Template Repository",
    state: "locked",
    sprint_day: 0,
    deliverable: "Template management and storage",
    layer: "z",
    code: 8,
  },
  {
    id: "z9",
    name: "Buffer",
    state: "spare",
    sprint_day: 0,
    deliverable: "System buffer and overflow handling",
    layer: "z",
    code: 9,
  },
  // Z-Layer ACTIVE modules (10+)
  {
    id: "z10",
    name: "Content Distribution Hub",
    state: "active",
    sprint_day: 0,
    deliverable: "Content distribution and delivery system",
    layer: "z",
    code: 10,
  },
  {
    id: "z11",
    name: "Analytics Engine",
    state: "live",
    sprint_day: 0,
    deliverable: "System analytics and performance monitoring",
    layer: "z",
    code: 11,
  },
  {
    id: "z12",
    name: "Security Framework",
    state: "built",
    sprint_day: 0,
    deliverable: "Comprehensive security and compliance system",
    layer: "z",
    code: 12,
  },
  {
    id: "z13",
    name: "Integration Hub",
    state: "sprint",
    sprint_day: 5,
    deliverable: "Third-party integrations and API management",
    layer: "z",
    code: 13,
    length_days: 21,
  },

  // X-Layer (Business/Brands) - ALL CORE (0-9) + 4 ACTIVE (10+)
  {
    id: "x0",
    name: "POS Core System",
    state: "draft",
    sprint_day: 0,
    deliverable: "Point of sale core system implementation",
    layer: "x",
    code: 0,
  },
  {
    id: "x1",
    name: "POS Dashboard",
    state: "built",
    sprint_day: 0,
    deliverable: "Administrative dashboard for POS management",
    layer: "x",
    code: 1,
  },
  {
    id: "x2",
    name: "Scaling Vault",
    state: "wip",
    sprint_day: 0,
    deliverable: "Scalable architecture documentation and templates",
    layer: "x",
    code: 2,
  },
  {
    id: "x3",
    name: "PRD Index",
    state: "stub",
    sprint_day: 0,
    deliverable: "Product requirements document repository",
    layer: "x",
    code: 3,
  },
  {
    id: "x4",
    name: "Roadmap Index",
    state: "draft",
    sprint_day: 0,
    deliverable: "Strategic roadmap planning and tracking",
    layer: "x",
    code: 4,
  },
  {
    id: "x5",
    name: "Execution Vault",
    state: "queued",
    sprint_day: 0,
    deliverable: "Project execution templates and workflows",
    layer: "x",
    code: 5,
  },
  {
    id: "x6",
    name: "Task Vault",
    state: "stub",
    sprint_day: 0,
    deliverable: "Task management and tracking system",
    layer: "x",
    code: 6,
  },
  {
    id: "x7",
    name: "Review Index",
    state: "stub",
    sprint_day: 0,
    deliverable: "Code and project review documentation",
    layer: "x",
    code: 7,
  },
  {
    id: "x8",
    name: "Knowledge Hub",
    state: "active",
    sprint_day: 0,
    deliverable: "Centralized knowledge management system",
    layer: "x",
    code: 8,
  },
  {
    id: "x9",
    name: "Automation Logic",
    state: "planned",
    sprint_day: 0,
    deliverable: "Business process automation framework",
    layer: "x",
    code: 9,
  },
  // X-Layer ACTIVE modules (10+)
  {
    id: "x10",
    name: "SSIG",
    state: "live",
    sprint_day: 0,
    deliverable: "SSIG brand and platform development",
    layer: "x",
    code: 10,
  },
  {
    id: "x11",
    name: "PapaBare",
    state: "live",
    sprint_day: 0,
    deliverable: "PapaBare project implementation",
    layer: "x",
    code: 11,
  },
  {
    id: "x12",
    name: "RustRaptor",
    state: "bootstrap",
    sprint_day: 0,
    deliverable: "RustRaptor development framework",
    layer: "x",
    code: 12,
  },
  {
    id: "x13",
    name: "Brand Identity",
    state: "sprint",
    sprint_day: 7,
    deliverable: "Complete brand guidelines and assets",
    layer: "x",
    code: 13,
    length_days: 14,
  },

  // Y-Layer (Personal/Life) - ALL CORE (0-9) + 4 ACTIVE (10+)
  {
    id: "y0",
    name: "HoS Life Core",
    state: "draft",
    sprint_day: 0,
    deliverable: "House of Self life management core system",
    layer: "y",
    code: 0,
  },
  {
    id: "y1",
    name: "HoS Dashboard",
    state: "built",
    sprint_day: 0,
    deliverable: "Personal life management dashboard",
    layer: "y",
    code: 1,
  },
  {
    id: "y2",
    name: "HoS Scaling Vault",
    state: "wip",
    sprint_day: 0,
    deliverable: "Personal growth and scaling templates",
    layer: "y",
    code: 2,
  },
  {
    id: "y3",
    name: "HoS PRD Index",
    state: "stub",
    sprint_day: 0,
    deliverable: "Personal development requirements documentation",
    layer: "y",
    code: 3,
  },
  {
    id: "y4",
    name: "HoS Roadmap Index",
    state: "draft",
    sprint_day: 0,
    deliverable: "Personal development roadmap and goals",
    layer: "y",
    code: 4,
  },
  {
    id: "y5",
    name: "HoS Execution Vault",
    state: "restore",
    sprint_day: 0,
    deliverable: "Personal execution templates and workflows",
    layer: "y",
    code: 5,
  },
  {
    id: "y6",
    name: "HoS Task Vault",
    state: "skeleton",
    sprint_day: 0,
    deliverable: "Personal task management system",
    layer: "y",
    code: 6,
  },
  {
    id: "y7",
    name: "HoS Review Index",
    state: "empty",
    sprint_day: 0,
    deliverable: "Personal review and reflection documentation",
    layer: "y",
    code: 7,
  },
  {
    id: "y8",
    name: "HoS Asset Bank",
    state: "live",
    sprint_day: 0,
    deliverable: "Personal asset and resource management",
    layer: "y",
    code: 8,
  },
  {
    id: "y9",
    name: "HoS Automation Logic",
    state: "blank",
    sprint_day: 0,
    deliverable: "Personal life automation framework",
    layer: "y",
    code: 9,
  },
  // Y-Layer ACTIVE modules (10+)
  {
    id: "y10",
    name: "Career Launchpad",
    state: "live",
    sprint_day: 0,
    deliverable: "Professional career development and networking",
    layer: "y",
    code: 10,
  },
  {
    id: "y11",
    name: "Fitness",
    state: "live",
    sprint_day: 0,
    deliverable: "Physical fitness and health optimization",
    layer: "y",
    code: 11,
  },
  {
    id: "y12",
    name: "Finance",
    state: "active",
    sprint_day: 0,
    deliverable: "Personal finance management and investment strategy",
    layer: "y",
    code: 12,
  },
  {
    id: "y13",
    name: "Time Management",
    state: "sprint",
    sprint_day: 3,
    deliverable: "Personal productivity and time optimization",
    layer: "y",
    code: 13,
    length_days: 14,
  },
]

const DEMO_TASKS: Task[] = [
  { id: "1", module_id: "z2", label: "Initialize command interface", done: false, priority: 1, state: "doing" },
  { id: "2", module_id: "z4", label: "Optimize execution engine", done: true, priority: 2, state: "done" },
  { id: "3", module_id: "z13", label: "Setup API gateway", done: false, priority: 1, state: "todo" },
  { id: "4", module_id: "x13", label: "Design brand guidelines", done: false, priority: 1, state: "todo" },
  { id: "5", module_id: "x10", label: "Update SSIG landing page", done: true, priority: 2, state: "done" },
  { id: "6", module_id: "y13", label: "Set up time tracking system", done: false, priority: 1, state: "todo" },
  { id: "7", module_id: "y12", label: "Review investment portfolio", done: false, priority: 2, state: "doing" },
]

const DEMO_HABITS: Habit[] = [
  {
    id: "1",
    name: "Code",
    cadence: "daily",
    streak: 7,
    quota: 1,
    today: true,
    last_check: dayjs().format("YYYY-MM-DD"),
    module_id: "z2",
  },
  {
    id: "2",
    name: "Read",
    cadence: "daily",
    streak: 3,
    quota: 1,
    today: false,
    last_check: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    module_id: "z7",
  },
  {
    id: "3",
    name: "Gym",
    cadence: "daily",
    streak: 12,
    quota: 1,
    today: true,
    last_check: dayjs().format("YYYY-MM-DD"),
    module_id: "y11",
  },
  {
    id: "4",
    name: "Med",
    cadence: "daily",
    streak: 5,
    quota: 1,
    today: false,
    last_check: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    module_id: "y13",
  },
  {
    id: "5",
    name: "Write",
    cadence: "daily",
    streak: 2,
    quota: 1,
    today: true,
    last_check: dayjs().format("YYYY-MM-DD"),
    module_id: "x13",
  },
]

const DEMO_ROUTINES: Routine[] = [
  {
    id: "r1",
    name: "Morning",
    cadence: "daily",
    quota: 1,
    tasks: [
      { id: "rt1", label: "Meditation 10min", done: false },
      { id: "rt2", label: "Journal 3 pages", done: true },
      { id: "rt3", label: "Review daily goals", done: false },
    ],
    owner_module: "y13",
  },
  {
    id: "r2",
    name: "Workout",
    cadence: "daily",
    quota: 1,
    tasks: [
      { id: "rt4", label: "Warm up 5min", done: true },
      { id: "rt5", label: "Strength training 45min", done: false },
      { id: "rt6", label: "Cool down stretch", done: false },
    ],
    owner_module: "y11",
  },
  {
    id: "r3",
    name: "Evening",
    cadence: "daily",
    quota: 1,
    tasks: [
      { id: "rt7", label: "Review day accomplishments", done: false },
      { id: "rt8", label: "Plan tomorrow priorities", done: false },
      { id: "rt9", label: "Read 30min", done: true },
    ],
    owner_module: "y13",
  },
]

// Helper function to get/set from localStorage
const getStoredLayer = (): "z" | "x" | "y" => {
  if (typeof window === "undefined") return "z"
  const stored = localStorage.getItem("runframe-active-layer")
  return (stored as "z" | "x" | "y") || "z"
}

const setStoredLayer = (layer: "z" | "x" | "y") => {
  if (typeof window !== "undefined") {
    localStorage.setItem("runframe-active-layer", layer)
  }
}

interface RunframeStore {
  modules: Module[]
  tasks: Task[]
  habits: Habit[]
  routines: Routine[]
  selectedModuleId: string | null
  selectedRoutineId: string | null
  activeLayer: "z" | "x" | "y"
  fetchInitial: () => Promise<void>
  fetchHabits: () => Promise<void>
  fetchRoutines: () => Promise<void>
  realtime: () => void
  setSelectedModule: (id: string | null) => void
  setSelectedRoutine: (id: string | null) => void
  setLayer: (layer: "z" | "x" | "y") => void
  addTask: (label: string, module_id: string) => Promise<void>
  toggleTask: (id: string, done: boolean) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  toggleHabit: (id: string) => Promise<void>
  addSprint: (moduleId: string, deliverable: string, lengthDays: number) => Promise<void>
  updateTaskState: (id: string, state: "todo" | "doing" | "done") => Promise<void>
  toggleRoutineTask: (routineId: string, taskId: string) => void
  completeRoutine: (routineId: string) => void
}

export const useRunframeStore = create<RunframeStore>((set, get) => ({
  modules: [] as Module[],
  tasks: [] as Task[],
  habits: [] as Habit[],
  routines: [] as Routine[],
  selectedModuleId: null as string | null,
  selectedRoutineId: null as string | null,
  activeLayer: getStoredLayer(),

  fetchInitial: async () => {
    console.log("🔄 Fetching initial data...")
    console.log("Supabase available:", !!supabase)

    // Always set demo data first as fallback
    set({ modules: DEMO_MODULES, tasks: DEMO_TASKS, habits: DEMO_HABITS, routines: DEMO_ROUTINES })

    if (!supabase) {
      console.log("📦 Using demo data (no Supabase)")
      return
    }

    try {
      console.log("🗄️ Attempting to fetch from Supabase...")

      // Try to fetch modules with error handling
      const { data: mods, error: modsError } = await supabase.from("modules").select("*")

      if (modsError) {
        console.log("⚠️ Database table not found or accessible:", modsError.message)
        console.log("📦 Continuing with demo data")
        return
      }

      // Try to fetch tasks with error handling
      const { data: tks, error: tasksError } = await supabase.from("tasks").select("*")

      if (tasksError) {
        console.log("⚠️ Tasks table error:", tasksError.message)
        // Continue with modules data but demo tasks
        set({ modules: mods ?? DEMO_MODULES })
        return
      }

      console.log("📊 Fetched modules:", mods?.length || 0)
      console.log("📋 Fetched tasks:", tks?.length || 0)

      // Only update if we have actual data
      if (mods && mods.length > 0) {
        set({ modules: mods, tasks: tks ?? [] })
        get().fetchHabits()
        get().fetchRoutines()
      } else {
        console.log("⚠️ No modules in database, keeping demo data")
      }
    } catch (error) {
      console.log("❌ Database connection failed:", error)
      console.log("📦 Using demo data as fallback")
      // Demo data is already set at the beginning
    }
  },

  fetchHabits: async () => {
    if (!supabase) {
      return // Demo habits already set in fetchInitial
    }

    try {
      const { data: habits, error } = await supabase.from("habits").select("*")

      if (error) {
        console.log("⚠️ Habits table error:", error.message)
        return // Keep demo habits
      }

      if (habits && habits.length > 0) {
        set({ habits })
      }
    } catch (error) {
      console.log("❌ Habits fetch failed:", error)
      // Keep demo habits
    }
  },

  fetchRoutines: async () => {
    if (!supabase) {
      return // Demo routines already set in fetchInitial
    }

    try {
      const { data: routines, error } = await supabase.from("routines").select("*")

      if (error) {
        console.log("⚠️ Routines table error:", error.message)
        return // Keep demo routines
      }

      if (routines && routines.length > 0) {
        set({ routines })
      }
    } catch (error) {
      console.log("❌ Routines fetch failed:", error)
      // Keep demo routines
    }
  },

  realtime: () => {
    if (!supabase) {
      return
    }

    supabase
      .channel("mods")
      .on("postgres_changes", { event: "*", schema: "public", table: "modules" }, ({ new: row }) =>
        set((state) => ({
          modules: state.modules.map((m) => (m.id === (row as Module).id ? (row as Module) : m)),
        })),
      )
      .subscribe()

    supabase
      .channel("tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => get().fetchInitial())
      .subscribe()

    supabase
      .channel("habits")
      .on("postgres_changes", { event: "*", schema: "public", table: "habits" }, () => get().fetchHabits())
      .subscribe()

    supabase
      .channel("routines")
      .on("postgres_changes", { event: "*", schema: "public", table: "routines" }, () => get().fetchRoutines())
      .subscribe()
  },

  setSelectedModule: (id: string | null) => {
    // Close routine drawer when opening module drawer
    set({ selectedModuleId: id, selectedRoutineId: null })
  },

  setSelectedRoutine: (id: string | null) => {
    // Close module drawer when opening routine drawer
    set({ selectedRoutineId: id, selectedModuleId: null })
  },

  setLayer: (layer: "z" | "x" | "y") => {
    setStoredLayer(layer)
    set({ activeLayer: layer })
  },

  addTask: async (label: string, module_id: string) => {
    if (!supabase) {
      // Demo mode - add to local state
      const newTask: Task = {
        id: Date.now().toString(),
        module_id,
        label,
        done: false,
        priority: get().tasks.filter((t) => t.module_id === module_id).length + 1,
        state: "todo",
      }
      set((state) => ({ tasks: [...state.tasks, newTask] }))
      return
    }

    await supabase.from("tasks").insert({ label, module_id, state: "todo", done: false })
    get().fetchInitial()
  },

  toggleTask: async (id: string, done: boolean) => {
    if (!supabase) {
      // Demo mode - update local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !done } : t)),
      }))
      return
    }

    await supabase.from("tasks").update({ done }).eq("id", id)
    get().fetchInitial()
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    if (!supabase) {
      // Demo mode - update local state
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }))
      return
    }

    await supabase.from("tasks").update(updates).eq("id", id)
    get().fetchInitial()
  },

  toggleHabit: async (id: string) => {
    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(30)
    }

    const today = dayjs().format("YYYY-MM-DD")
    const habit = get().habits.find((h) => h.id === id)
    if (!habit) return

    const wasCompletedToday = habit.today || dayjs(habit.last_check).isSame(dayjs(), "day")
    const newStreak = wasCompletedToday ? Math.max(0, habit.streak - 1) : habit.streak + 1
    const newToday = !wasCompletedToday

    if (!supabase) {
      // Demo mode - update local state
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                streak: newStreak,
                today: newToday,
                last_check: newToday ? today : h.last_check,
              }
            : h,
        ),
      }))
      return
    }

    await supabase
      .from("habits")
      .update({
        streak: newStreak,
        last_check: newToday ? today : null,
      })
      .eq("id", id)

    get().fetchHabits()
  },

  addSprint: async (moduleId: string, deliverable: string, lengthDays: number) => {
    if (!supabase) {
      // Demo mode - update local state
      set((state) => ({
        modules: state.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                state: "sprint",
                sprint_day: 1,
                deliverable,
                length_days: lengthDays,
              }
            : m,
        ),
      }))
      return
    }

    await supabase
      .from("modules")
      .update({
        state: "sprint",
        sprint_day: 1,
        deliverable,
        length_days: lengthDays,
      })
      .eq("id", moduleId)

    get().fetchInitial()
  },

  updateTaskState: async (id: string, state: "todo" | "doing" | "done") => {
    if (!supabase) {
      // Demo mode - update local state
      set((storeState) => ({
        tasks: storeState.tasks.map((t) => (t.id === id ? { ...t, state, done: state === "done" } : t)),
      }))
      return
    }

    await supabase
      .from("tasks")
      .update({
        state,
        done: state === "done",
      })
      .eq("id", id)
    get().fetchInitial()
  },

  toggleRoutineTask: (routineId: string, taskId: string) => {
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              tasks: routine.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
            }
          : routine,
      ),
    }))
  },

  completeRoutine: (routineId: string) => {
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              tasks: routine.tasks.map((task) => ({ ...task, done: true })),
            }
          : routine,
      ),
    }))
  },
}))

export type { Module, Task, Habit, Routine }
