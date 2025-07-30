# RunFrame Core ⚡

A seductive execution OS built with Next.js, featuring a dark aesthetic and smooth animations.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Seed database (run once after setup)
pnpm seed
\`\`\`

## 🗂️ Project Structure

\`\`\`
/app
  /layout.tsx              # Global dark layout + Poppins
  /page.tsx                # 🏠 Modules Grid
  /arena/page.tsx          # 3D Arena (stub)
  /settings/page.tsx       # ⚙️ Settings & profile
/components
  ModuleTile.tsx           # Animated module cards
  ExecutionDrawer.tsx      # Slide-over drawer
  CommandOrb.tsx           # Floating command input
  Sidebar.tsx              # Navigation sidebar
  LayerButton.tsx          # Layer control buttons
  KanbanBoard.tsx          # Drag & drop task board
/store
  useRunframeStore.ts      # Zustand state management
/lib
  supabaseClient.ts        # Database client
/scripts
  seedModules.ts           # Database seeding script
/app/api/command/route.ts  # OpenAI tools endpoint
\`\`\`

## 🎨 Design System

### Colors
- **Signal**: `#7000FF` - Primary brand color
- **Panel**: `#1A1A1A` - UI panels
- **Background**: `#000000` - Main background
- **Tile States**:
  - Idle: `#4B5563`
  - Sprint: `#7000FF`
  - Drifted: `#D97706`
  - Locked: `#7C3AED`
  - WIP: `#F59E0B`
  - Built: `#10B981`
  - Partial: `#8B5CF6`
  - Stub: `#6B7280`
  - Spare: `#374151`

### Typography
- **Display**: Poppins (headings)
- **Body**: Inter (content)

## 🔧 Environment Setup

Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
\`\`\`

## 📊 Database Schema

Run this SQL in your Supabase SQL editor:

\`\`\`sql
-- Create modules table
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT CHECK (state IN ('idle', 'sprint', 'drifted', 'locked', 'wip', 'built', 'partial', 'stub', 'spare')) DEFAULT 'idle',
  sprint_day INTEGER DEFAULT 0,
  deliverable TEXT NOT NULL,
  layer TEXT CHECK (layer IN ('z', 'x', 'y')) NOT NULL,
  code INTEGER NOT NULL,
  length_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(layer, code)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 1,
  state TEXT CHECK (state IN ('todo', 'doing', 'done')) DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cadence TEXT DEFAULT 'daily',
  streak INTEGER DEFAULT 0,
  last_check DATE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE modules;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
\`\`\`

## 🌱 Database Seeding

After setting up your Supabase database, run the seeding script to populate with the substrate module structure:

\`\`\`bash
pnpm seed
\`\`\`

This will populate your database with:
- **Z-Layer (Strategy)**: 11 core system modules (codes 0-10)
- **X-Layer (Brands)**: Business and brand modules
- **Y-Layer (Personal)**: Personal development modules

### Module Structure

#### Z-Layer (Strategy/Core)
- `#00` System Core (locked)
- `#01` Identity Engine (locked)  
- `#02` Command Center (wip)
- `#03` Relationship Engine (CRM) (stub)
- `#04` Execution Logic (built)
- `#05` Rhythm + System Sync (partial)
- `#06` General Consequence 🪖 (stub)
- `#07` Context & Memory Engine (stub)
- `#08` Template Repository (locked)
- `#09` Buffer (spare)
- `#10` Content Distribution Hub (stub)

#### Collapse Logic
- **CORE collapsed**: Shows only `code === 0` (System Core)
- **ACTIVE collapsed**: Shows only `code === 10` (Content Distribution Hub)

## 🤖 OpenAI Functions

The system supports these AI functions:

- `start_sprint(module_id, deliverable, length_days)`
- `log_progress(module_id, note)`
- `recalibrate(module_id)`

## 📱 Responsive Design

- **Desktop**: Sidebar (16vw) + Main content
- **Mobile**: Collapsible top bar + Full-width content
- **Tablet**: Adaptive grid layouts

## 🎭 Animations

- **Module Tiles**: Hover scale + Sprint pulse effect
- **Execution Drawer**: Slide-over from right with proper scrolling
- **Command Orb**: Expand/collapse animation
- **Layer Buttons**: Smooth hover states
- **Kanban Board**: Drag & drop with visual feedback

## 🚀 Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

## 🔮 Future Features

- [ ] React Three Fiber 3D Arena
- [ ] Advanced AI command processing
- [ ] Real-time collaboration
- [ ] Module templates
- [ ] Export/import functionality

---

Built with ❤️ using Next.js 15, Tailwind CSS, and Framer Motion.
\`\`\`

Finally, let's add the seed script to package.json:
