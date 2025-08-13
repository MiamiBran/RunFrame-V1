-- Create modules table
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT CHECK (state IN ('idle', 'sprint', 'drifted', 'locked', 'wip', 'built', 'partial', 'stub', 'spare', 'draft', 'queued', 'active', 'planned', 'live', 'bootstrap', 'concept', 'placeholder', 'restore', 'skeleton', 'empty', 'blank', 'archive')) DEFAULT 'idle',
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
  quota INTEGER DEFAULT 1,
  last_check DATE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create routines table
CREATE TABLE routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cadence TEXT DEFAULT 'daily',
  quota INTEGER DEFAULT 1,
  tasks JSONB, -- Storing tasks as a JSON array
  owner_module UUID REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity table
CREATE TABLE activity (
  id BIGSERIAL PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocks table (for calendar time-blocking)
CREATE TABLE blocks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE modules;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE routines;
ALTER PUBLICATION supabase_realtime ADD TABLE activity;
ALTER PUBLICATION supabase_realtime ADD TABLE blocks;
