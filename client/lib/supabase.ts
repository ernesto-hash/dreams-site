import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "http://localhost"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder"

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase env variables are missing — running in offline/prerender mode")
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)
