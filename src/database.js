import "dotenv/config"
import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing from the .env file.")
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is missing from .env")
}

export const database = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)