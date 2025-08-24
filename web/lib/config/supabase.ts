import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create server-side Supabase client with service role key for database operations
export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create client-side Supabase client for browser usage
export const supabaseClient = createClient(
  supabaseUrl, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
)

// Database table names as constants
export const TABLES = {
  USERS: 'users',
  CUSTODIAL_WALLETS: 'custodial_wallets',
  TRANSACTIONS: 'transactions'
} as const

// Helper function to set user context for RLS policies
export const setUserContext = async (phone: string | number) => {
  const { error } = await supabaseServer.rpc('set_config', {
    setting_name: 'app.current_user_phone',
    setting_value: phone,
    is_local: true
  })
  
  if (error) {
    console.error('Error setting user context:', error)
  }
}