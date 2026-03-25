import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Verifica se as credenciais são placeholders ou válidas
export const hasValidSupabaseConfig = url !== 'https://placeholder.supabase.co' && url !== ''

export const supabase = createClient(url, anonKey)
