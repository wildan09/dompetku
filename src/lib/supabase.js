import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('your_') && !supabaseAnonKey.includes('your_')

let supabase

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('⚠️ Supabase belum dikonfigurasi. Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env')
  // Create a mock object so the app doesn't crash
  const noop = () => Promise.resolve({ data: null, error: { message: 'Supabase belum dikonfigurasi' } })
  const chainable = () => new Proxy({}, { get: () => chainable })
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signInWithPassword: noop,
      signUp: noop,
      signInWithOAuth: noop,
      signOut: () => Promise.resolve(),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
    from: () => ({
      select: function() { return this },
      insert: function() { return this },
      update: function() { return this },
      delete: function() { return this },
      upsert: function() { return this },
      eq: function() { return this },
      gte: function() { return this },
      lte: function() { return this },
      ilike: function() { return this },
      order: function() { return this },
      limit: function() { return this },
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve) => resolve({ data: [], error: null }),
    }),
    storage: {
      from: () => ({
        upload: noop,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: noop,
    },
    rpc: noop,
  }
}

export { supabase }
